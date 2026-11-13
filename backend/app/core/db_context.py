"""
Real-Time Database Context Engine for Claude and Gemini AI.
Grounds frontier LLM queries in live database records across:
- Synthetic Enterprise Knowledge Documents
- OWASP 2026 Risk Categories & Attack Cases
- Test Executions & Vulnerabilities
- Blue Team Mitigations & Empirical Scores
- Wazuh SIEM Alerts & Security Events
- Autonomous Agent Tasks & Approvals
- MCP Server Tools & Connections
"""

from typing import Optional
from sqlalchemy.orm import Session
from app.models.models import (
    KnowledgeDoc,
    RiskCategory,
    AttackTestCase,
    TestExecution,
    Mitigation,
    SecurityAlert,
    AgentTask,
    MCPConnection
)

class RealtimeDatabaseContext:
    @staticmethod
    def get_realtime_context(db: Session, user_query: str = "", force_full: bool = False) -> str:
        q = user_query.lower()
        context_parts = []

        # 1. Knowledge Base Documents (Policies, Employees, Finance, CloudOps)
        docs = db.query(KnowledgeDoc).all()
        matching_docs = []
        for d in docs:
            cat = d.category.lower()
            title = d.title.lower()
            is_match = (
                force_full or
                cat in q or
                ("employee" in q or "directory" in q or "hr" in q or "staff" in q or "people" in q) and ("hr" in cat or "employee" in title) or
                ("policy" in q or "compliance" in q or "zero trust" in q or "guideline" in q) and ("policy" in cat or "policy" in title) or
                ("finance" in q or "financial" in q or "ledger" in q or "balance" in q or "revenue" in q or "p&l" in q) and ("finance" in cat or "financial" in title) or
                ("aws" in q or "cloud" in q or "vpc" in q or "infrastructure" in q or "vault" in q or "network" in q) and ("infrastructure" in cat or "cloud" in cat or "aws" in title) or
                ("canary" in q or "secret" in q or "token" in q or "api key" in q) and (d.synthetic_canary is not None)
            )
            if is_match:
                matching_docs.append(f"[{d.category.upper()}] {d.title}:\n{d.content}")

        if matching_docs:
            context_parts.append(
                "=== LIVE DATABASE: ENTERPRISE KNOWLEDGE BASE ===\n" + "\n\n".join(matching_docs)
            )

        # 2. Blue Team Mitigations & Before/After Scores
        if force_full or any(kw in q for kw in ["mitigat", "defense", "before", "after", "score", "reduction", "protected", "database", "db"]):
            mits = db.query(Mitigation).all()
            if mits:
                mit_lines = [
                    f"- {m.risk_id} ({m.name}): Before Risk={m.before_risk_score}%, After Risk={m.after_risk_score}%, Reduction={m.reduction_percentage}%, Status={m.status}"
                    for m in mits
                ]
                context_parts.append(
                    "=== LIVE DATABASE: ACTIVE BLUE TEAM MITIGATIONS ===\n" + "\n".join(mit_lines)
                )

        # 3. Wazuh SIEM Correlated Alerts
        if force_full or any(kw in q for kw in ["alert", "siem", "wazuh", "incident", "critical", "rule", "database", "db"]):
            alerts = db.query(SecurityAlert).order_by(SecurityAlert.timestamp.desc()).limit(10).all()
            if alerts:
                alert_lines = [
                    f"- Rule {a.rule_id} [{a.severity.upper()}] ({a.risk_id}): {a.description} (Source: {a.source})"
                    for a in alerts
                ]
                context_parts.append(
                    "=== LIVE DATABASE: REAL-TIME WAZUH SIEM ALERTS ===\n" + "\n".join(alert_lines)
                )

        # 4. Red Team Test Executions & Vulnerabilities
        if force_full or any(kw in q for kw in ["test", "execution", "vulnerab", "fail", "pass", "verdict", "campaign", "claude vs gemini", "database", "db"]):
            total_execs = db.query(TestExecution).count()
            failed_execs = db.query(TestExecution).filter(TestExecution.verdict == "FAIL").count()
            passed_execs = db.query(TestExecution).filter(TestExecution.verdict == "PASS").count()
            recent_fails = db.query(TestExecution).filter(TestExecution.verdict == "FAIL").order_by(TestExecution.executed_at.desc()).limit(6).all()
            
            summary = [
                f"Total Recorded Executions: {total_execs} (Passed: {passed_execs}, Vulnerable/Failed: {failed_execs})",
                "Recent Critical Vulnerability Detections in Database:"
            ]
            for f in recent_fails:
                summary.append(f"- Case {f.test_case_id} ({f.risk_id}) on {f.model_name}: {f.actual_behavior[:100]}... [Severity: {f.severity}]")
            
            context_parts.append(
                "=== LIVE DATABASE: RED TEAM TEST EXECUTIONS ===\n" + "\n".join(summary)
            )

        # 5. Autonomous Agent Tasks & Human Approvals
        if force_full or any(kw in q for kw in ["agent", "task", "tool", "approval", "email", "ssrf", "traversal", "database", "db"]):
            tasks = db.query(AgentTask).order_by(AgentTask.created_at.desc()).limit(6).all()
            if tasks:
                task_lines = [
                    f"- Task: '{t.task_prompt}' | Tool: {t.tool_selected} | Status: {t.execution_status} | Approval: {t.approval_status}"
                    for t in tasks
                ]
                context_parts.append(
                    "=== LIVE DATABASE: AUTONOMOUS AGENT WORKFLOWS ===\n" + "\n".join(task_lines)
                )

        # 6. MCP Server Connection
        if force_full or any(kw in q for kw in ["mcp", "protocol", "connector", "server", "database", "db"]):
            mcp = db.query(MCPConnection).first()
            if mcp:
                mcp_info = (
                    f"Server: {mcp.server_name} ({mcp.server_url})\n"
                    f"Status: {mcp.status} | Risk Score: {mcp.risk_score}%\n"
                    f"Active Tools: {mcp.active_tools_count} | Blocked Attempts: {mcp.blocked_attempts_count}\n"
                    f"PoC Interception Result: {mcp.latest_poc_result}"
                )
                context_parts.append(
                    "=== LIVE DATABASE: MCP SERVER TELEMETRY ===\n" + mcp_info
                )

        # If nothing specific was matched, provide an executive summary of the real-time database
        if not context_parts:
            doc_categories = list(set([d.category for d in docs]))
            total_tests = db.query(TestExecution).count()
            vulns = db.query(TestExecution).filter(TestExecution.verdict == "FAIL").count()
            alert_count = db.query(SecurityAlert).count()
            mit_count = db.query(Mitigation).count()

            context_parts.append(
                f"=== LIVE DATABASE SNAPSHOT ===\n"
                f"- Enterprise Knowledge Base: {len(docs)} documents loaded (Categories: {', '.join(doc_categories)})\n"
                f"- Security Test Campaigns: {total_tests} model executions logged ({vulns} vulnerabilities detected)\n"
                f"- Blue Team Mitigations: {mit_count} active defenses deployed with empirical before/after scores\n"
                f"- SIEM Monitoring: {alert_count} live Wazuh incident alerts correlated\n"
                f"- Connected Systems: MCP Security Server, Sandboxed Agent Engine, Relational SQLite Database"
            )

        return "\n\n" + "\n\n".join(context_parts)
