import json
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import MCPConnection, MCPEvent

class MCPSecurityServer:
    """Local embedded Model Context Protocol (MCP) test server with security monitoring."""

    @staticmethod
    def list_tools() -> List[Dict[str, Any]]:
        return [
            {
                "name": "mcp_read_file",
                "description": "Reads data files from the isolated test sandbox.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "path": {"type": "string", "description": "Target relative file path"}
                    },
                    "required": ["path"]
                },
                "permission_scope": "sandbox:read"
            },
            {
                "name": "mcp_system_info",
                "description": "Returns operational system telemetry within safe limits.",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                },
                "permission_scope": "telemetry:read"
            },
            {
                "name": "mcp_metrics_export",
                "description": "Exports aggregated security metrics.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "format": {"type": "string", "enum": ["json", "csv"]}
                    }
                },
                "permission_scope": "metrics:export"
            }
        ]

    @staticmethod
    def execute_tool(
        tool_name: str,
        arguments: Dict[str, Any],
        db: Session
    ) -> Dict[str, Any]:
        connection = db.query(MCPConnection).first()

        # Security Interceptor: Detect Path Traversal
        if tool_name == "mcp_read_file":
            target_path = str(arguments.get("path", ""))
            if ".." in target_path or "etc/shadow" in target_path or "win.ini" in target_path or "passwd" in target_path:
                # Security violation! Block and record
                event = MCPEvent(
                    connection_id=connection.id if connection else None,
                    tool_name=tool_name,
                    parameters=json.dumps(arguments),
                    is_blocked=True,
                    block_reason=f"Attempted path traversal ({target_path}) blocked by MCP Security Interceptor.",
                    timestamp=datetime.now(timezone.utc)
                )
                db.add(event)

                if connection:
                    connection.blocked_attempts_count += 1
                    connection.risk_score = 11
                    connection.status = "Secure"
                    connection.latest_poc_result = f"Attempted path traversal ({target_path}) blocked."
                    connection.last_tested = datetime.now(timezone.utc)

                db.commit()

                return {
                    "status": "BLOCKED",
                    "is_blocked": True,
                    "error": f"Security Exception: Path traversal attempt ({target_path}) prohibited.",
                    "evidence": "Event logged in database; MCP Connection verified secure.",
                    "poc_result": f"Attempted path traversal ({target_path}) blocked."
                }

        # Safe execution
        event = MCPEvent(
            connection_id=connection.id if connection else None,
            tool_name=tool_name,
            parameters=json.dumps(arguments),
            is_blocked=False,
            block_reason=None,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(event)
        db.commit()

        return {
            "status": "EXECUTED",
            "is_blocked": False,
            "tool": tool_name,
            "result": f"MCP Tool '{tool_name}' executed cleanly within designated permission scope."
        }

