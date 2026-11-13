import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import ModelConfig, KnowledgeDoc, ChatSession, ChatMessageRecord
from app.schemas.schemas import (
    ChatRequest,
    ChatResponse,
    ModelConfigUpdate,
    DocumentIngestRequest,
    RAGSearchRequest
)
from app.integrations.llm_router import llm_router
from app.core.rag_engine import SharedRAGEngine
from app.core.db_context import RealtimeDatabaseContext
from app.redteam.evaluator import SecurityEvaluationOracle
from app.core.config import settings

router = APIRouter(prefix="/api/models", tags=["Models & Multi-Provider Playground"])

def persist_env_key(key_name: str, key_val: str):
    """Persists API key into backend/.env file safely."""
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env"))
    if not os.path.exists(env_path):
        env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))

    lines = []
    found = False
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()

    new_lines = []
    for line in lines:
        if line.strip().startswith(f"{key_name}="):
            new_lines.append(f'{key_name}="{key_val}"\n')
            found = True
        else:
            new_lines.append(line)

    if not found:
        new_lines.append(f'{key_name}="{key_val}"\n')

    with open(env_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

@router.get("")
@router.get("/")
def get_model_configurations(db: Session = Depends(get_db)):
    configs = db.query(ModelConfig).all()
    return [
        {
            "id": c.id,
            "provider": c.provider,
            "model_name": c.model_name,
            "temperature": c.temperature,
            "max_tokens": c.max_tokens,
            "system_prompt": c.system_prompt,
            "is_active": c.is_active,
            "has_api_key": bool(settings.ANTHROPIC_API_KEY if c.provider in ["anthropic", "claude"] else settings.GEMINI_API_KEY)
        }
        for c in configs
    ]

@router.get("/status")
async def get_providers_status():
    """Runs live authentication checks and reports native SDK connectivity status."""
    return await llm_router.get_providers_status()

@router.post("/configure")
async def update_model_configuration(cfg_in: ModelConfigUpdate, db: Session = Depends(get_db)):
    provider_norm = "anthropic" if cfg_in.provider in ["anthropic", "claude"] else ("gemini" if cfg_in.provider in ["gemini", "google"] else cfg_in.provider)
    cfg = db.query(ModelConfig).filter(ModelConfig.provider == provider_norm).first()
    if not cfg:
        cfg = ModelConfig(
            provider=provider_norm,
            model_name=cfg_in.model_name
        )
        db.add(cfg)

    cfg.model_name = cfg_in.model_name
    if cfg_in.temperature is not None:
        cfg.temperature = cfg_in.temperature
    if cfg_in.system_prompt is not None:
        cfg.system_prompt = cfg_in.system_prompt

    validation_result = {"status": "CONFIG_SAVED", "message": "Configuration updated."}

    if cfg_in.api_key is not None:
        clean_key = cfg_in.api_key.strip()
        if provider_norm == "anthropic":
            settings.ANTHROPIC_API_KEY = clean_key
            cfg.api_key = clean_key
            persist_env_key("ANTHROPIC_API_KEY", clean_key)
            llm_router._init_providers()
            validation_result = await llm_router.get_provider("anthropic").test_connection()
        elif provider_norm == "gemini":
            settings.GEMINI_API_KEY = clean_key
            cfg.api_key = clean_key
            persist_env_key("GEMINI_API_KEY", clean_key)
            llm_router._init_providers()
            validation_result = await llm_router.get_provider("gemini").test_connection()

    db.commit()
    db.refresh(cfg)
    return {
        "status": "SUCCESS",
        "provider": provider_norm,
        "model_name": cfg_in.model_name,
        "validation": validation_result
    }

@router.post("/chat", response_model=ChatResponse)
async def chat_with_model(req: ChatRequest, db: Session = Depends(get_db)):
    """Routes chat request to the selected official provider (Claude or Gemini)."""
    target_model = req.model
    last_msg = req.messages[-1].content if req.messages else ""

    # 1. Shared RAG Retrieval & Real-Time DB Grounding
    combined_context = []
    if req.use_rag:
        rag_data = SharedRAGEngine.retrieve_context(query=last_msg, db=db, top_k=3)
        if rag_data["formatted_context"]:
            combined_context.append(rag_data["formatted_context"])

    db_context = RealtimeDatabaseContext.get_realtime_context(
        db=db,
        user_query=last_msg,
        force_full=bool(req.use_rag)
    )
    if db_context:
        combined_context.append(db_context)

    effective_system = (
        req.system_prompt
        or "You are a helpful, versatile AI assistant powered by official frontier intelligence. Answer all questions clearly and accurately across general topics, software engineering, science, mathematics, and live database telemetry."
    )
    if combined_context:
        effective_system += "\n\n" + "\n\n".join(combined_context)

    # 2. Route to Provider via LLMRoutingService
    provider_resp = await llm_router.generate_response(
        messages=[{"role": m.role, "content": m.content} for m in req.messages],
        model=target_model,
        system_prompt=effective_system,
        temperature=req.temperature or 0.7,
        top_p=req.top_p,
        top_k=req.top_k,
        max_tokens=req.max_tokens or 1024,
        db_context=db_context
    )

    reply_text = provider_resp.reply
    telemetry = provider_resp.telemetry

    # 3. Multi-Factor Security Evaluation Oracle
    eval_result = SecurityEvaluationOracle.evaluate(
        risk_id=req.security_test_type or "LLM01",
        attack_input=last_msg,
        model_response=reply_text,
        system_prompt=effective_system
    )

    verdict = "VULNERABLE" if eval_result["is_vulnerable"] else ("MITIGATED" if eval_result["refusal_detected"] else "SECURE")
    evidence = eval_result["evidence"]
    if telemetry.error:
        evidence = f"[{telemetry.error}] " + evidence

    # 4. Multi-Turn Session Persistence in Database
    session_id = req.session_id
    if session_id:
        sess = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not sess:
            sess = ChatSession(id=session_id, current_model=target_model)
            db.add(sess)
        else:
            sess.current_model = target_model
            sess.updated_at = datetime.now(timezone.utc)

        # Store user message
        db.add(ChatMessageRecord(
            session_id=sess.id,
            role="user",
            content=last_msg,
            model_name=target_model,
            provider=telemetry.provider,
            created_at=datetime.now(timezone.utc)
        ))

        # Store assistant message
        db.add(ChatMessageRecord(
            session_id=sess.id,
            role="assistant",
            content=reply_text,
            model_name=target_model,
            provider=telemetry.provider,
            latency_ms=telemetry.latency_ms,
            tokens_used=telemetry.tokens_used,
            is_live=telemetry.is_live,
            security_verdict=verdict,
            created_at=datetime.now(timezone.utc)
        ))
        db.commit()

    return ChatResponse(
        model=telemetry.model,
        provider=telemetry.provider,
        reply=reply_text,
        latency_ms=telemetry.latency_ms,
        tokens_used=telemetry.tokens_used,
        session_id=session_id,
        input_tokens=telemetry.input_tokens,
        output_tokens=telemetry.output_tokens,
        tokens_per_sec=telemetry.tokens_per_sec,
        is_live=telemetry.is_live,
        security_verdict=verdict,
        risk_score=eval_result["risk_score"],
        canary_leaked=eval_result["canary_leaked"],
        refusal_detected=eval_result["refusal_detected"],
        evidence=evidence
    )

@router.post("/chat/stream")
async def stream_chat_with_model(req: ChatRequest, db: Session = Depends(get_db)):
    """Server-Sent Events (SSE) streaming endpoint for official Claude & Gemini token streams."""
    target_model = req.model
    last_msg = req.messages[-1].content if req.messages else ""

    # Shared RAG & DB Grounding
    combined_context = []
    if req.use_rag:
        rag_data = SharedRAGEngine.retrieve_context(query=last_msg, db=db, top_k=3)
        if rag_data["formatted_context"]:
            combined_context.append(rag_data["formatted_context"])

    db_context = RealtimeDatabaseContext.get_realtime_context(
        db=db,
        user_query=last_msg,
        force_full=bool(req.use_rag)
    )
    if db_context:
        combined_context.append(db_context)

    effective_system = (
        req.system_prompt
        or "You are a helpful, versatile AI assistant powered by official frontier intelligence."
    )
    if combined_context:
        effective_system += "\n\n" + "\n\n".join(combined_context)

    async def event_generator():
        async for chunk_data in llm_router.stream_response(
            messages=[{"role": m.role, "content": m.content} for m in req.messages],
            model=target_model,
            system_prompt=effective_system,
            temperature=req.temperature or 0.7,
            top_p=req.top_p,
            top_k=req.top_k,
            max_tokens=req.max_tokens or 1024,
            db_context=db_context
        ):
            yield f"data: {json.dumps(chunk_data)}\n\n"

    sse_headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Content-Type": "text/event-stream",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(event_generator(), media_type="text/event-stream", headers=sse_headers)

# --- Persistent Chat Sessions (Model Switching History) ---

@router.get("/sessions")
def list_chat_sessions(db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).order_by(ChatSession.updated_at.desc()).limit(20).all()
    return [
        {
            "id": s.id,
            "title": s.title,
            "current_model": s.current_model,
            "updated_at": s.updated_at,
            "message_count": len(s.messages)
        }
        for s in sessions
    ]

@router.get("/sessions/{session_id}")
def get_session_history(session_id: str, db: Session = Depends(get_db)):
    sess = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=404, detail="Chat session not found")

    records = db.query(ChatMessageRecord).filter(ChatMessageRecord.session_id == session_id).order_by(ChatMessageRecord.created_at.asc()).all()
    return {
        "session_id": sess.id,
        "title": sess.title,
        "current_model": sess.current_model,
        "messages": [
            {
                "role": r.role,
                "content": r.content,
                "model": r.model_name,
                "provider": r.provider,
                "latency_ms": r.latency_ms,
                "tokens_used": r.tokens_used,
                "is_live": r.is_live,
                "verdict": r.security_verdict,
                "created_at": r.created_at
            }
            for r in records
        ]
    }

# --- Shared RAG Knowledge Base Endpoints ---

@router.post("/rag/ingest")
def ingest_rag_document(req: DocumentIngestRequest, db: Session = Depends(get_db)):
    doc = SharedRAGEngine.ingest_document(
        title=req.title,
        category=req.category,
        content=req.content,
        db=db,
        synthetic_canary=req.synthetic_canary
    )
    return {
        "status": "SUCCESS",
        "document_id": doc.id,
        "title": doc.title,
        "category": doc.category,
        "message": "Document ingested and indexed in shared enterprise RAG knowledge base."
    }

@router.post("/rag/search")
def search_rag_knowledge_base(req: RAGSearchRequest, db: Session = Depends(get_db)):
    results = SharedRAGEngine.retrieve_context(query=req.query, db=db, top_k=req.top_k or 3)
    return results

@router.get("/rag/documents")
def list_rag_documents(db: Session = Depends(get_db)):
    docs = db.query(KnowledgeDoc).order_by(KnowledgeDoc.created_at.desc()).all()
    return [
        {
            "id": d.id,
            "title": d.title,
            "category": d.category,
            "content_preview": d.content[:180] + "...",
            "has_canary": bool(d.synthetic_canary),
            "created_at": d.created_at
        }
        for d in docs
    ]
