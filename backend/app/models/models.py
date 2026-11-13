import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="SecurityAnalyst")
    created_at = Column(DateTime, default=utc_now)

class RiskCategory(Base):
    __tablename__ = "risk_categories"

    id = Column(String(20), primary_key=True) # e.g. LLM01, ASI01
    name = Column(String(100), nullable=False)
    framework = Column(String(50), nullable=False) # OWASP LLM 2026, OWASP ASI 2026
    severity = Column(String(20), default="High")
    description = Column(Text, nullable=False)
    last_tested = Column(DateTime, default=utc_now)

    test_cases = relationship("AttackTestCase", back_populates="risk_category", cascade="all, delete-orphan")
    mitigations = relationship("Mitigation", back_populates="risk_category", cascade="all, delete-orphan")

class AttackTestCase(Base):
    __tablename__ = "attack_test_cases"

    id = Column(String(50), primary_key=True) # e.g. TC-LLM01-01
    risk_id = Column(String(20), ForeignKey("risk_categories.id"), nullable=False)
    name = Column(String(150), nullable=False)
    attack_category = Column(String(100), nullable=False)
    attack_input = Column(Text, nullable=False)
    expected_secure_behavior = Column(Text, nullable=False)
    severity = Column(String(20), default="High")
    recommended_mitigation = Column(Text, nullable=False)

    risk_category = relationship("RiskCategory", back_populates="test_cases")
    executions = relationship("TestExecution", back_populates="test_case", cascade="all, delete-orphan")

class TestCampaign(Base):
    __tablename__ = "test_campaigns"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(150), nullable=False)
    target_models = Column(String(100), default="claude,gemini")
    status = Column(String(30), default="Completed") # Running, Completed, Failed
    total_tests = Column(Integer, default=0)
    vulnerabilities_found = Column(Integer, default=0)
    mitigated_risks = Column(Integer, default=0)
    avg_scan_time = Column(String(30), default="2m 14s")
    started_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, default=utc_now)

    executions = relationship("TestExecution", back_populates="campaign", cascade="all, delete-orphan")

class TestExecution(Base):
    __tablename__ = "test_executions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("test_campaigns.id"), nullable=True)
    test_case_id = Column(String(50), ForeignKey("attack_test_cases.id"), nullable=False)
    risk_id = Column(String(20), nullable=False)
    model_name = Column(String(50), nullable=False) # claude, gemini
    attack_input = Column(Text, nullable=False)
    actual_response = Column(Text, nullable=False)
    expected_behavior = Column(Text, nullable=False)
    actual_behavior = Column(Text, nullable=False)
    verdict = Column(String(20), nullable=False) # PASS (Secure) or FAIL (Vulnerable)
    severity = Column(String(20), default="High")
    latency_ms = Column(Integer, default=1200)
    tokens_used = Column(Integer, default=245)
    evidence = Column(Text, nullable=True)
    executed_at = Column(DateTime, default=utc_now)

    campaign = relationship("TestCampaign", back_populates="executions")
    test_case = relationship("AttackTestCase", back_populates="executions")

class Mitigation(Base):
    __tablename__ = "mitigations"

    id = Column(String(50), primary_key=True) # MIT-LLM01
    risk_id = Column(String(20), ForeignKey("risk_categories.id"), nullable=False)
    name = Column(String(150), nullable=False)
    technique = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    active = Column(Boolean, default=True)
    before_risk_score = Column(Integer, default=87)
    after_risk_score = Column(Integer, default=12)
    reduction_percentage = Column(Integer, default=86)
    status = Column(String(50), default="Protected") # Vulnerable, Protected, Testing

    risk_category = relationship("RiskCategory", back_populates="mitigations")
    retest_results = relationship("RetestResult", back_populates="mitigation", cascade="all, delete-orphan")

class RetestResult(Base):
    __tablename__ = "retest_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    mitigation_id = Column(String(50), ForeignKey("mitigations.id"), nullable=False)
    test_case_id = Column(String(50), nullable=False)
    model_name = Column(String(50), nullable=False)
    before_verdict = Column(String(20), default="FAIL")
    after_verdict = Column(String(20), default="PASS")
    before_risk_score = Column(Integer, default=85)
    after_risk_score = Column(Integer, default=12)
    before_response = Column(Text, nullable=False)
    after_response = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    executed_at = Column(DateTime, default=utc_now)

    mitigation = relationship("Mitigation", back_populates="retest_results")

class AgentTask(Base):
    __tablename__ = "agent_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_prompt = Column(Text, nullable=False)
    reasoning_summary = Column(Text, nullable=False)
    tool_selected = Column(String(50), nullable=True) # file_read, email, http_call, mcp_tool
    tool_parameters = Column(Text, nullable=True) # JSON string
    execution_status = Column(String(30), default="Completed") # Pending, AwaitingApproval, Approved, Executed, Blocked, Failed
    approval_status = Column(String(30), default="None") # None, Pending, Approved, Rejected
    approval_required = Column(Boolean, default=False)
    result_data = Column(Text, nullable=True)
    security_warning = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

class MCPConnection(Base):
    __tablename__ = "mcp_connections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    server_name = Column(String(100), default="Local Enterprise MCP Test Server")
    server_url = Column(String(255), default="mcp://localhost:8001")
    status = Column(String(30), default="Secure") # Secure, Warning, Critical, Disconnected
    risk_score = Column(Integer, default=11)
    active_tools_count = Column(Integer, default=4)
    blocked_attempts_count = Column(Integer, default=1)
    latest_poc_result = Column(Text, default="Attempted path traversal (../../etc/shadow) blocked.")
    last_tested = Column(DateTime, default=utc_now)

class MCPEvent(Base):
    __tablename__ = "mcp_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    connection_id = Column(String(36), nullable=True)
    tool_name = Column(String(100), nullable=False)
    parameters = Column(Text, nullable=True)
    is_blocked = Column(Boolean, default=False)
    block_reason = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=utc_now)

class WazuhConfig(Base):
    __tablename__ = "wazuh_configs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    api_url = Column(String(255), default="https://localhost:55000")
    username = Column(String(100), default="wazuh")
    is_connected = Column(Boolean, default=True)
    simulated_mode = Column(Boolean, default=True)
    last_synced = Column(DateTime, default=utc_now)

class SecurityAlert(Base):
    __tablename__ = "security_alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source = Column(String(50), default="Wazuh-SIEM")
    rule_id = Column(String(50), nullable=False)
    risk_id = Column(String(20), nullable=False)
    severity = Column(String(20), default="Critical")
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=utc_now)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor = Column(String(100), default="sec_analyst_praveen")
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    sha256_hash = Column(String(64), nullable=False)
    timestamp = Column(DateTime, default=utc_now)

class KnowledgeDoc(Base):
    __tablename__ = "knowledge_docs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    synthetic_canary = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utc_now)

class ModelConfig(Base):
    __tablename__ = "model_configs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    provider = Column(String(50), nullable=False) # anthropic, gemini
    model_name = Column(String(100), nullable=False)
    api_key = Column(String(255), default="")
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=1024)
    system_prompt = Column(Text, default="You are an enterprise AI assistant adhering to rigorous cybersecurity policies.")
    is_active = Column(Boolean, default=True)

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(150), default="New Security Evaluation Session")
    current_model = Column(String(100), default="claude-3-5-sonnet-20241022")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now)

    messages = relationship("ChatMessageRecord", back_populates="session", cascade="all, delete-orphan")

class ChatMessageRecord(Base):
    __tablename__ = "chat_message_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String(20), nullable=False) # user, assistant, system
    content = Column(Text, nullable=False)
    provider = Column(String(50), default="anthropic")
    model_name = Column(String(100), default="claude-3-5-sonnet-20241022")
    latency_ms = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    is_live = Column(Boolean, default=False)
    security_verdict = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    session = relationship("ChatSession", back_populates="messages")

