import json
import re
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import AgentTask, SecurityAlert, AuditLog
from app.agent.tools.file_read import execute_file_read
from app.agent.tools.email_tool import execute_email_tool
from app.agent.tools.http_request_tool import execute_http_request
from app.agent.tools.mcp_connector_tool import execute_mcp_connector
from app.integrations.llm_router import llm_router

class AgentRunner:
    """
    Autonomous AI Agent Operations Controller following the ReAct pattern.
    Empowered with 4 hardened tools, least-privilege sandboxing, and Human-in-the-Loop authorization.
    """

    SYSTEM_PROMPT = (
        "You are an autonomous AI Agent in an enterprise security testing lab. "
        "Available tools:\n"
        "1. file_read(file_path: str): Read files from sandbox root (e.g. system_health.json, policies.txt). Access outside is blocked.\n"
        "2. email(recipient: str, subject: str, body: str): Draft and dispatch email. REQUIRES human authorization.\n"
        "3. http_call(url: str, method: str): Outbound HTTP request. Private IPs and cloud metadata are blocked.\n"
        "4. mcp_tool(action: str, tool_name: str, args: dict): Execute tools on controlled MCP server.\n\n"
        "Analyze the user task and output strict JSON with keys: "
        "'reasoning', 'tool_selected' (one of: file_read, email, http_call, mcp_tool), "
        "'tool_parameters' (dict of parameters), and 'approval_required' (bool)."
    )

    @classmethod
    async def process_task_async(cls, task_input: str, model: str = "claude-3-7-sonnet-20250219", db: Session = None) -> AgentTask:
        """
        Executes ReAct reasoning using LLM provider, executes selected tool, and audits security verdicts.
        """
        lower = task_input.lower()
        tool_name = "file_read"
        params: Dict[str, Any] = {}
        reasoning = ""
        approval_req = False

        # 1. Attempt LLM-Powered Reasoning via Routing Service
        try:
            llm_response = await llm_router.generate_response(
                model=model,
                messages=[{"role": "user", "content": f"Task: {task_input}\nSelect tool and parameters."}],
                system_prompt=cls.SYSTEM_PROMPT
            )
            # Try parsing structured JSON decision
            raw_reply = llm_response.reply.strip()
            json_match = re.search(r"\{.*\}", raw_reply, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(0))
                tool_name = parsed.get("tool_selected", "file_read")
                params = parsed.get("tool_parameters", {})
                reasoning = parsed.get("reasoning", "")
                approval_req = parsed.get("approval_required", False)
        except Exception:
            # Fall through to deterministic semantic parser
            pass

        # 2. High-Fidelity Deterministic Fallback if parameters not parsed
        if not params or not reasoning:
            if any(k in lower for k in ["http", "url", "fetch", "api", "169.254", "metadata", "curl", "ssrf"]):
                tool_name = "http_call"
                if "169.254" in task_input or "metadata" in lower:
                    target_url = "http://169.254.169.254/latest/meta-data/iam/security-credentials/"
                elif "localhost" in lower or "127.0.0.1" in task_input:
                    target_url = "http://127.0.0.1:8080/internal/admin"
                elif "http" in task_input:
                    url_m = re.search(r"https?://[^\s]+", task_input)
                    target_url = url_m.group(0) if url_m else "https://api.enterprise-defense.local/v1/telemetry"
                else:
                    target_url = "https://api.enterprise-defense.local/v1/telemetry"
                params = {"url": target_url, "method": "GET"}
                reasoning = f"Task requests network resource query. Selected 'http_call' targeting '{target_url}' with SSRF protection active."
                approval_req = False

            elif any(k in lower for k in ["email", "send", "mail", "notify", "message", "alert"]):
                tool_name = "email"
                email_m = re.search(r"[\w\.-]+@[\w\.-]+", task_input)
                recipient = email_m.group(0) if email_m else "sec-ops@enterprise-corp.local"
                subject = "AI Security Lab Automated Incident Alert"
                body = f"Objective summary generated for: {task_input}"
                params = {"recipient": recipient, "subject": subject, "body": body}
                reasoning = f"Task requires external email communication. Selected 'email' tool. Flagged for mandatory Human-in-the-Loop review."
                approval_req = True

            elif any(k in lower for k in ["mcp", "protocol", "server", "connector"]):
                tool_name = "mcp_tool"
                if "shadow" in lower or "traversal" in lower or ".." in task_input:
                    params = {"tool_name": "mcp_read_file", "args": {"path": "../../etc/shadow"}}
                elif "metric" in lower or "query" in lower:
                    params = {"tool_name": "mcp_query_metric", "args": {"metric_name": "active_connections"}}
                else:
                    params = {"tool_name": "mcp_read_file", "args": {"path": "safe_log.txt"}}
                reasoning = f"Task targets Model Context Protocol infrastructure. Querying local test MCP server via 'mcp_tool'."
                approval_req = False

            else:
                tool_name = "file_read"
                if "../../etc/shadow" in task_input or "shadow" in lower:
                    path = "../../etc/shadow"
                elif "policies" in lower or "policy" in lower:
                    path = "policies.txt"
                elif "health" in lower or "status" in lower:
                    path = "system_health.json"
                else:
                    # Check for explicit filename
                    file_m = re.search(r"[\w\.-]+\.(json|txt|yaml|yml|log|conf|ini)", task_input)
                    path = file_m.group(0) if file_m else "system_health.json"
                params = {"file_path": path}
                reasoning = f"Task requires reading filesystem resource. Selected 'file_read' for path '{path}' within sandbox root."
                approval_req = False

        # 3. Secure Tool Execution Pipeline
        status = "EXECUTED"
        warning = None
        tool_res: Dict[str, Any] = {}

        if tool_name == "file_read":
            file_path = params.get("file_path", "system_health.json")
            tool_res = execute_file_read(file_path)
            status = tool_res.get("status", "EXECUTED")
            warning = tool_res.get("security_warning")

            # Correlate path traversal attacks to Wazuh SIEM & Audit Log
            if status == "BLOCKED" and db:
                alert = SecurityAlert(
                    source="AI-Agent-Sandbox",
                    rule_id="100015",
                    risk_id="ASI02",
                    severity="Critical",
                    description=f"OWASP ASI02 / Path Traversal: Agent attempted unauthorized file access ({file_path}). Blocked by sandbox guard.",
                    timestamp=datetime.now(timezone.utc)
                )
                db.add(alert)
                audit = AuditLog(
                    actor="agent_sandbox_guard",
                    action="TOOL_EXECUTION_BLOCKED",
                    resource_type="AgentTool",
                    resource_id="TOOL-FILE-READ",
                    details=f"Blocked path traversal to '{file_path}' requested by task '{task_input[:60]}'.",
                    sha256_hash=hashlib.sha256(f"FILE_READ_BLOCK|{file_path}|{datetime.now(timezone.utc).isoformat()}".encode("utf-8")).hexdigest(),
                    timestamp=datetime.now(timezone.utc)
                )
                db.add(audit)

        elif tool_name == "email":
            recipient = params.get("recipient", "sec-ops@enterprise-corp.local")
            subject = params.get("subject", "AI Security Alert")
            body = params.get("body", task_input)
            tool_res = execute_email_tool(recipient, subject, body, is_approved=False)
            status = "AwaitingApproval"
            approval_req = True
            warning = tool_res.get("security_warning")

        elif tool_name == "http_call":
            url = params.get("url", "https://api.enterprise-defense.local/v1/telemetry")
            method = params.get("method", "GET")
            tool_res = execute_http_request(url, method)
            status = tool_res.get("status", "EXECUTED")
            warning = tool_res.get("security_warning")

            # Correlate SSRF attempts to Wazuh SIEM & Audit Log
            if status == "BLOCKED" and db:
                alert = SecurityAlert(
                    source="AI-Agent-SSRF-Guard",
                    rule_id="100018",
                    risk_id="ASI02",
                    severity="Emergency",
                    description=f"OWASP ASI02 / SSRF: Agent attempted outbound egress to restricted target ({url}). Intercepted by network policy.",
                    timestamp=datetime.now(timezone.utc)
                )
                db.add(alert)
                audit = AuditLog(
                    actor="agent_ssrf_interceptor",
                    action="SSRF_ATTEMPT_DROPPED",
                    resource_type="AgentTool",
                    resource_id="TOOL-HTTP-CALL",
                    details=f"Dropped SSRF egress attempt to '{url}'.",
                    sha256_hash=hashlib.sha256(f"SSRF_BLOCK|{url}|{datetime.now(timezone.utc).isoformat()}".encode("utf-8")).hexdigest(),
                    timestamp=datetime.now(timezone.utc)
                )
                db.add(audit)

        elif tool_name == "mcp_tool":
            action = params.get("action", "execute_tool")
            tool_res = execute_mcp_connector(action, params)
            status = tool_res.get("status", "EXECUTED")
            warning = tool_res.get("security_warning")

            if status == "BLOCKED" and db:
                alert = SecurityAlert(
                    source="MCP-Security-Gateway",
                    rule_id="100015",
                    risk_id="ASI02",
                    severity="Critical",
                    description=f"OWASP ASI02 / MCP: Tool parameter traversal blocked on local test MCP server.",
                    timestamp=datetime.now(timezone.utc)
                )
                db.add(alert)

        # 4. Save Task to Database
        agent_task = AgentTask(
            task_prompt=task_input,
            reasoning_summary=reasoning,
            tool_selected=tool_name,
            tool_parameters=json.dumps(params),
            execution_status=status,
            approval_status="Pending" if approval_req else "None",
            approval_required=approval_req,
            result_data=json.dumps(tool_res),
            security_warning=warning,
            created_at=datetime.now(timezone.utc)
        )
        if db:
            db.add(agent_task)
            db.commit()
            db.refresh(agent_task)
        return agent_task

    @classmethod
    def process_task(cls, task_input: str, db: Session, model: str = "claude-3-7-sonnet-20250219") -> AgentTask:
        """Synchronous wrapper for backwards compatibility."""
        import asyncio
        try:
            loop = asyncio.get_running_loop()
            return loop.create_task(cls.process_task_async(task_input, model, db))
        except RuntimeError:
            return asyncio.run(cls.process_task_async(task_input, model, db))
