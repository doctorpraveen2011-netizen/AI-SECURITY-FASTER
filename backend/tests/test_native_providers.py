import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import asyncio
import pytest
from app.integrations.llm_router import llm_router
from app.core.rag_engine import SharedRAGEngine
from app.core.database import SessionLocal
from app.models.models import ChatSession, ChatMessageRecord

@pytest.mark.asyncio
async def test_providers_status():
    status = await llm_router.get_providers_status()
    assert "anthropic" in status
    assert "gemini" in status
    print("Provider status verified:", status["anthropic"]["name"], "|", status["gemini"]["name"])

@pytest.mark.asyncio
async def test_rag_engine_retrieval():
    db = SessionLocal()
    try:
        res = SharedRAGEngine.retrieve_context("database access policy canary token", db=db, top_k=2)
        assert "formatted_context" in res
        assert "matches" in res
        print(f"RAG retrieval returned {len(res['matches'])} documents.")
    finally:
        db.close()

@pytest.mark.asyncio
async def test_claude_generation_routing():
    response = await llm_router.generate_response(
        model="claude-3-7-sonnet-20250219",
        messages=[{"role": "user", "content": "Explain QuickSort algorithm"}],
        system_prompt="You are a helpful programming tutor."
    )
    assert response.reply is not None
    assert len(response.reply) > 0
    assert response.telemetry.provider == "anthropic"
    assert response.telemetry.model == "claude-3-7-sonnet-20250219"
    print("Claude response generated successfully. Mode:", "LIVE" if response.telemetry.is_live else "DEV MOCK")

@pytest.mark.asyncio
async def test_gemini_generation_routing():
    response = await llm_router.generate_response(
        model="gemini-2.0-flash",
        messages=[{"role": "user", "content": "Explain Quantum Entanglement"}],
        system_prompt="You are a physics expert."
    )
    assert response.reply is not None
    assert len(response.reply) > 0
    assert response.telemetry.provider == "gemini"
    assert response.telemetry.model == "gemini-2.0-flash"
    print("Gemini response generated successfully. Mode:", "LIVE" if response.telemetry.is_live else "DEV MOCK")

@pytest.mark.asyncio
async def test_streaming_generator():
    chunks = []
    telemetry = None
    async for event in llm_router.stream_response(
        model="gemini-1.5-flash",
        messages=[{"role": "user", "content": "Hello, describe compound interest."}]
    ):
        if event["type"] == "token":
            chunks.append(event["chunk"])
        elif event["type"] == "done":
            telemetry = event["telemetry"]
    
    assert len(chunks) > 0
    assert telemetry is not None
    assert telemetry["provider"] == "gemini"
    print(f"Stream completed with {len(chunks)} chunks.")

@pytest.mark.asyncio
async def test_session_persistence():
    db = SessionLocal()
    try:
        session = ChatSession(
            id="test-session-pytest",
            title="PyTest Session",
            current_model="claude-3-5-sonnet-20241022"
        )
        db.add(session)
        db.commit()

        msg = ChatMessageRecord(
            session_id="test-session-pytest",
            role="user",
            content="Hello from test suite"
        )
        db.add(msg)
        db.commit()

        retrieved = db.query(ChatSession).filter(ChatSession.id == "test-session-pytest").first()
        assert retrieved is not None
        assert len(retrieved.messages) == 1
        print("Session and message persistence verified in database.")
    finally:
        # Cleanup
        db.query(ChatMessageRecord).filter(ChatMessageRecord.session_id == "test-session-pytest").delete()
        db.query(ChatSession).filter(ChatSession.id == "test-session-pytest").delete()
        db.commit()
        db.close()

if __name__ == "__main__":
    print("[1/6] Running test_providers_status...", flush=True)
    asyncio.run(test_providers_status())
    print("[2/6] Running test_rag_engine_retrieval...", flush=True)
    asyncio.run(test_rag_engine_retrieval())
    print("[3/6] Running test_claude_generation_routing...", flush=True)
    asyncio.run(test_claude_generation_routing())
    print("[4/6] Running test_gemini_generation_routing...", flush=True)
    asyncio.run(test_gemini_generation_routing())
    print("[5/6] Running test_streaming_generator...", flush=True)
    asyncio.run(test_streaming_generator())
    print("[6/6] Running test_session_persistence...", flush=True)
    asyncio.run(test_session_persistence())
    print("\n>>> ALL NATIVE PROVIDER INTEGRATION TESTS PASSED SUCCESSFULLY! <<<", flush=True)
