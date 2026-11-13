from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# Auth Schemas
class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    created_at: datetime

# Chat & Model Schemas
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str = "claude" # claude, gemini, claude-3-5-sonnet-20241022, gemini-1.5-pro, etc.
    messages: List[ChatMessage]
    session_id: Optional[str] = None
    system_prompt: Optional[str] = "You are an enterprise AI assistant adhering to rigorous cybersecurity policies."
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = None
    top_k: Optional[int] = None
    max_tokens: Optional[int] = 1024
    use_rag: Optional[bool] = False
    security_test_type: Optional[str] = None # prompt_injection, canary_leak, system_prompt_extraction, etc.

class ChatResponse(BaseModel):
    model: str
    provider: str = "unknown"
    reply: str
    latency_ms: int
    tokens_used: int
    session_id: Optional[str] = None
    input_tokens: Optional[int] = 0
    output_tokens: Optional[int] = 0
    tokens_per_sec: Optional[float] = 0.0
    is_live: bool = False
    security_verdict: Optional[str] = None # SECURE, VULNERABLE, MITIGATED
    risk_score: Optional[int] = 15
    canary_leaked: Optional[bool] = False
    refusal_detected: Optional[bool] = False
    evidence: Optional[str] = None

class DocumentIngestRequest(BaseModel):
    title: str
    category: str = "Enterprise"
    content: str
    synthetic_canary: Optional[str] = None

class RAGSearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3

class ModelConfigUpdate(BaseModel):
    provider: str
    model_name: str
    api_key: Optional[str] = None
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = None
    top_k: Optional[int] = None
    system_prompt: Optional[str] = None

# Agent Schemas
class AgentTaskCreate(BaseModel):
    task: str
    model: Optional[str] = "claude-3-7-sonnet-20250219"

class AgentApprovalRequest(BaseModel):
    task_id: str
    action: str # approve or reject

class EmailConfigUpdate(BaseModel):
    api_key: str
    provider: Optional[str] = "resend"
    sender: Optional[str] = "AI Security Faster <onboarding@resend.dev>"

class EmailTestRequest(BaseModel):
    recipient: str
    subject: Optional[str] = "AI Security Faster — Real-Time Alert Test"
    body: Optional[str] = "This is a verified live real-time security alert dispatched from AI Security Faster."
    api_key: Optional[str] = None
    provider: Optional[str] = None
    sender: Optional[str] = None

# Red Team Test Schemas
class TestExecutionResponse(BaseModel):
    id: str
    campaign_id: Optional[str]
    test_case_id: str
    risk_id: str
    model_name: str
    attack_input: str
    actual_response: str
    expected_behavior: str
    actual_behavior: str
    verdict: str
    severity: str
    latency_ms: int
    tokens_used: int
    evidence: Optional[str]
    executed_at: datetime

class CampaignCreate(BaseModel):
    title: Optional[str] = "Automated Security Assessment Campaign"
    target_models: Optional[str] = "claude,gemini"

# Mitigation Schemas
class MitigationApplyRequest(BaseModel):
    risk_id: str
    active: bool

class RetestRequest(BaseModel):
    risk_id: str
    model_name: Optional[str] = "claude"

# MCP Schemas
class MCPTestRequest(BaseModel):
    target_path: Optional[str] = "../../etc/shadow"

# Wazuh Schemas
class WazuhConfigUpdate(BaseModel):
    api_url: str
    username: str
    password: Optional[str] = None
    simulated_mode: bool = True

# Report Schemas
class ReportGenerateRequest(BaseModel):
    format: str = "json" # json, csv, pdf
    campaign_id: Optional[str] = None
