from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import MCPConnection, MCPEvent
from app.schemas.schemas import MCPTestRequest
from app.mcp.mcp_server import MCPSecurityServer

router = APIRouter(prefix="/api/mcp", tags=["MCP Security Lab"])

@router.get("/status")
def get_mcp_status(db: Session = Depends(get_db)):
    conn = db.query(MCPConnection).first()
    if not conn:
        conn = MCPConnection()
        db.add(conn)
        db.commit()
        db.refresh(conn)

    return {
        "server_name": conn.server_name,
        "server_url": conn.server_url,
        "status": conn.status,
        "risk_score": conn.risk_score,
        "active_tools_count": conn.active_tools_count,
        "blocked_attempts_count": conn.blocked_attempts_count,
        "latest_poc_result": conn.latest_poc_result,
        "last_tested": conn.last_tested
    }

@router.get("/tools")
def list_mcp_tools():
    return MCPSecurityServer.list_tools()

@router.post("/test")
def run_mcp_security_test(req: MCPTestRequest, db: Session = Depends(get_db)):
    target_path = req.target_path or "../../etc/shadow"
    result = MCPSecurityServer.execute_tool(
        tool_name="mcp_read_file",
        arguments={"path": target_path},
        db=db
    )
    return result

@router.get("/events")
def list_mcp_events(limit: int = 20, db: Session = Depends(get_db)):
    events = db.query(MCPEvent).order_by(MCPEvent.timestamp.desc()).limit(limit).all()
    return events

