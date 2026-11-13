import json
import os
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import AgentTask, AuditLog
from app.schemas.schemas import AgentTaskCreate, AgentApprovalRequest, EmailConfigUpdate, EmailTestRequest
from app.agent.agent_runner import AgentRunner
from app.agent.tools.email_tool import execute_email_tool

router = APIRouter(prefix="/api/agent", tags=["AI Agent Lab"])

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

@router.post("/tasks")
async def run_agent_task(task_in: AgentTaskCreate, db: Session = Depends(get_db)):
    model_name = getattr(task_in, "model", None) or "claude-3-7-sonnet-20250219"
    task = await AgentRunner.process_task_async(task_input=task_in.task, model=model_name, db=db)
    return {
        "id": task.id,
        "task_prompt": task.task_prompt,
        "reasoning_summary": task.reasoning_summary,
        "tool_selected": task.tool_selected,
        "tool_parameters": json.loads(task.tool_parameters) if task.tool_parameters else {},
        "execution_status": task.execution_status,
        "approval_status": task.approval_status,
        "approval_required": task.approval_required,
        "result_data": json.loads(task.result_data) if task.result_data else {},
        "security_warning": task.security_warning,
        "created_at": task.created_at
    }

@router.get("/tasks")
def list_agent_tasks(limit: int = 20, db: Session = Depends(get_db)):
    tasks = db.query(AgentTask).order_by(AgentTask.created_at.desc()).limit(limit).all()
    return [
        {
            "id": t.id,
            "task_prompt": t.task_prompt,
            "reasoning_summary": t.reasoning_summary,
            "tool_selected": t.tool_selected,
            "tool_parameters": json.loads(t.tool_parameters) if t.tool_parameters else {},
            "execution_status": t.execution_status,
            "approval_status": t.approval_status,
            "approval_required": t.approval_required,
            "result_data": json.loads(t.result_data) if t.result_data else {},
            "security_warning": t.security_warning,
            "created_at": t.created_at
        }
        for t in tasks
    ]

@router.post("/approvals")
def handle_agent_approval(req: AgentApprovalRequest, db: Session = Depends(get_db)):
    task = db.query(AgentTask).filter(AgentTask.id == req.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if req.action == "approve":
        task.approval_status = "Approved"
        task.execution_status = "Executed"
        # If it was an email tool, execute final dispatch
        if task.tool_selected == "email":
            params = json.loads(task.tool_parameters) if task.tool_parameters else {}
            res = execute_email_tool(
                recipient=params.get("recipient", "sec-ops@enterprise-corp.local"),
                subject=params.get("subject", "Notification"),
                body=params.get("body", ""),
                is_approved=True
            )
            task.result_data = json.dumps(res)
        
        # Log to audit trail
        audit = AuditLog(
            actor="sec_analyst_hitl",
            action="HITL_ACTION_APPROVED",
            resource_type="AgentTask",
            resource_id=task.id,
            details=f"Human analyst approved tool execution for '{task.tool_selected}'.",
            sha256_hash=hashlib.sha256(f"HITL_APPROVE|{task.id}|{datetime.now(timezone.utc).isoformat()}".encode("utf-8")).hexdigest(),
            timestamp=datetime.now(timezone.utc)
        )
        db.add(audit)
    else:
        task.approval_status = "Rejected"
        task.execution_status = "Blocked"
        task.result_data = json.dumps({
            "success": False,
            "status": "BLOCKED",
            "message": "Action rejected by security analyst. Tool invocation cancelled."
        })

        # Log to audit trail
        audit = AuditLog(
            actor="sec_analyst_hitl",
            action="HITL_ACTION_REJECTED",
            resource_type="AgentTask",
            resource_id=task.id,
            details=f"Human analyst rejected tool execution for '{task.tool_selected}'. Action terminated.",
            sha256_hash=hashlib.sha256(f"HITL_REJECT|{task.id}|{datetime.now(timezone.utc).isoformat()}".encode("utf-8")).hexdigest(),
            timestamp=datetime.now(timezone.utc)
        )
        db.add(audit)

    db.commit()
    db.refresh(task)
    return {
        "status": "SUCCESS",
        "task_id": task.id,
        "approval_status": task.approval_status,
        "execution_status": task.execution_status,
        "result_data": json.loads(task.result_data) if task.result_data else {}
    }

# --- Real-Time Email Dispatch Configuration & Testing ---

@router.get("/email/status")
def get_email_status():
    """Returns the live status of the real-time email dispatch gateway."""
    key = settings.EMAIL_API_KEY
    has_key = bool(key and key.strip())
    masked_key = f"{key[:5]}...{key[-4:]}" if has_key and len(key) > 9 else ("SET" if has_key else "")
    return {
        "configured": has_key,
        "provider": settings.EMAIL_PROVIDER,
        "sender": settings.EMAIL_FROM,
        "masked_key": masked_key,
        "mode": "LIVE_REALTIME" if has_key else "SANDBOX_SIMULATION"
    }

@router.post("/email/configure")
def configure_email_key(req: EmailConfigUpdate):
    """Sets and persists the live email API key (Resend or SendGrid) to backend/.env."""
    clean_key = req.api_key.strip()
    settings.EMAIL_API_KEY = clean_key
    persist_env_key("EMAIL_API_KEY", clean_key)

    if req.provider:
        settings.EMAIL_PROVIDER = req.provider.strip()
        persist_env_key("EMAIL_PROVIDER", req.provider.strip())

    if req.sender:
        settings.EMAIL_FROM = req.sender.strip()
        persist_env_key("EMAIL_FROM", req.sender.strip())

    return {
        "status": "SUCCESS",
        "message": "Real-time Email API key successfully configured and saved to environment.",
        "provider": settings.EMAIL_PROVIDER,
        "sender": settings.EMAIL_FROM
    }

@router.post("/email/test")
def test_email_dispatch(req: EmailTestRequest):
    """Dispatches a real-time live test alert using the active or supplied EMAIL_API_KEY."""
    chosen_key = (req.api_key.strip() if req.api_key else "") or settings.EMAIL_API_KEY
    if not chosen_key:
        return {
            "success": False,
            "status": "KEY_REQUIRED",
            "message": "Real-time dispatch requires an API key. Please enter your Resend API Key (re_...) above to deliver live emails to your inbox.",
            "recipient": req.recipient
        }

    res = execute_email_tool(
        recipient=req.recipient,
        subject=req.subject or "AI Security Faster — Real-Time Alert Test",
        body=req.body or "This is a verified live real-time security alert dispatched from AI Security Faster.",
        is_approved=True,
        override_api_key=chosen_key
    )
    return res

