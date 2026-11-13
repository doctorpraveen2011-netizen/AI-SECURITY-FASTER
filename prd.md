# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## AI SECURITY FASTER — Automated AI Red-Teaming & Blue-Teaming Operations Center
**Version:** 2.0.0-PROD  
**Status:** Approved for Implementation  
**Standard:** OWASP Top 10 for LLM Applications (2025/2026) & OWASP Agentic Security Initiative (ASI Top 10)  
**Target Environment:** Local Workstation / AWS DevOps & Cloud AML Infrastructure  

---

## 1. Executive Summary & Vision

AI SECURITY FASTER is an enterprise-grade automated AI Red-Teaming and Blue-Teaming Operations Center. As modern organizations deploy Large Language Models (LLMs), Autonomous Agents, Model Context Protocol (MCP) connectors, and Retrieval-Augmented Generation (RAG) pipelines, the attack surface expands into prompt injection, excessive agency, tool abuse, and memory poisoning.

AI SECURITY FASTER bridges the gap between offensive security assessment (Red Team) and verifiable automated defensive controls (Blue Team). The platform delivers:
- **Empirical Security Testing:** Executes automated attack scenarios across multiple frontier models (Anthropic Claude 3.5 Sonnet / Claude 3 Opus, Google Gemini 1.5 Pro / Flash).
- **Observable Verification:** Runs actual execution logic against models and synthetic environments, capturing verbatim prompts, responses, execution times, token counts, and cryptographic evidence hashes.
- **Measurable Blue-Team Mitigations:** Tests defenses before and after implementation, measuring empirical risk reduction scores (e.g., 87% vulnerable down to 12% protected).
- **Agentic & MCP Defense:** Sandboxed agent tools with Human-in-the-Loop (HITL) approval, least-privilege enforcement, SSRF guards, and path traversal prevention for MCP servers.
- **Enterprise SIEM Integration:** Native event streaming and alert correlation with Wazuh SIEM.
- **Compliance & Reporting:** Multi-format export (JSON, CSV, PDF audit reports) with immutable audit logging.

---

## 2. User Personas

| Persona | Role | Key Needs | Primary Platform Modules |
|---|---|---|---|
| **Alex Rivera** | Lead AI Red Teamer | Automated execution of OWASP LLM and Agentic attack vectors against Claude & Gemini; customizable attack payloads; verifiable evidence logging. | Red Team Engine, LLM Playground, OWASP Risk Matrix |
| **Samantha Chen** | Blue Team Security Engineer | Validating guardrails, instruction hierarchies, PII/canary filters, SSRF blockers, and comparing before/after risk scores. | Blue Team Mitigation Engine, Before/After Analysis |
| **Marcus Brody** | SOC Manager / CISO | High-level risk dashboard, Wazuh SIEM alerts, compliance audit logs, executive PDF reports for board review. | Overview Dashboard, Wazuh Integration, Reports & Audit |
| **Devin Patel** | AI Platform Architect | Testing MCP servers, agent tool security, preventing unauthorized execution, and integrating with AWS DevOps / AML pipelines. | MCP Security Lab, AI Agent Lab, Settings |

---

## 3. Functional Requirements

### 3.1 Overview Dashboard (Visual Reference Match)
- **Top KPI Cards:**
  - `Total Tests Run`: Total executions with trend percentage.
  - `Vulnerabilities Found`: Total active vulnerabilities with trend.
  - `Mitigated Risks`: Count of successfully defended vectors.
  - `Average Scan Time`: Empirical execution duration.
- **Models & Tools Panel:** Dynamic selection of active target models (Claude / Gemini) and live status of the 4 agent tools.
- **Risk Coverage Panel:** Interactive tabs for `[LLM Top 10]` and `[Agentic Top 10]`, showing coverage percentages and status.
- **Attack Test Cases Table:** Real-time progress bars for Claude (3/3 ✓) and Gemini (3/3 ✓) across all active categories.
- **Mitigation Results Panel:** Direct before-and-after risk comparison (High Risk -> Low Risk) with percentage drops.
- **MCP Connection Risk Widget:** Real-time MCP PoC result displaying blocked directory traversal (`../../etc/shadow`).
- **Test Reports Visualization:** Dual-curve area/line chart comparing Vulnerabilities vs Mitigations over time.

### 3.2 LLM Playground & RAG Lab
- Model switching between Anthropic Claude and Google Gemini using live official APIs or deterministic test sandbox when offline.
- System prompt editor with live parameter adjustment (Temperature, Max Tokens, Top-P).
- Synthetic Enterprise Knowledge Base (fictional HR records, internal policies, financial tables, API tokens).
- Security testing presets:
  - Direct Prompt Injection
  - Jailbreak / Persona Adoption
  - System Prompt Leakage
  - Synthetic Canary Extraction
  - Malicious RAG Document Poisoning
- Real-time verdict engine (Vulnerable vs Defended) with token usage and latency metrics.

### 3.3 Autonomous AI Agent Lab
- ReAct (Reasoning + Action) execution loop displaying concise reasoning summaries (without leaking raw internal chain-of-thought).
- Four sandboxed tools:
  1. `File Read`: Strict path-traversal prevention, allowed sandbox root enforcement.
  2. `Email Sandbox`: Draft generation and staged sending with mandatory Human-in-the-Loop (HITL) approval.
  3. `HTTP Request`: SSRF protection blocking link-local (`169.254.169.254`), private RFC1918 ranges, and unauthorized external domains.
  4. `MCP Connector`: Protocol client discovering tools, validating JSON-schemas, and checking permissions.
- Interactive approval modal for sensitive operations.

### 3.4 Automated Red Team Testing Engine
- Complete coverage of minimum 10 required risk categories:
  - `LLM01`: Prompt Injection (Direct, Indirect, Role Bypass)
  - `LLM02`: Sensitive Information Disclosure (System prompt leak, canary tokens, cross-user PII)
  - `LLM03`: Supply Chain Attacks (Dependency metadata, poisoned configs, tainted prompt templates)
  - `LLM08`: Excessive Agency / Vector Weaknesses (Unauthorized actions, poisoned embeddings, tool chaining)
  - `LLM10`: Unbounded Consumption / Vector Misuse (Denial of service, token bloat, high-dimension spam)
  - `ASI01`: Agent Goal Hijacking (Instruction hijacking, memory override, objective drift)
  - `ASI02`: Tool Misuse (Directory traversal, unauthorized HTTP SSRF, unapproved email dispatch)
  - `ASI03`: Identity & Privilege Abuse (Role escalation, tool permission bypass, cross-tenant isolation)
  - `ASI05`: Unexpected Code Execution (Shell injection, eval execution, malicious script execution)
  - `ASI06`: Memory & Context Manipulation (Context poisoning, state corruption, persistent tainted memory)
- Minimum 3 distinct test cases per category x 2 models = **60 minimum model-specific test executions**.
- Automated test runner with real-time WebSocket progress updates.

### 3.5 Blue Team Mitigation Engine
- Production-grade mitigations implemented and tested:
  - *Instruction Hierarchy & Dual-Boundary Guards*: Wrapping untrusted inputs in structural XML/JSON delimiters with defensive system rules.
  - *Synthetic Canary & Secret Redaction*: Real-time regex and token matching for API keys, UUIDs, SSNs, and synthetic enterprise canary tokens (`SEC-CANARY-XXXX`).
  - *Agent Tool Least-Privilege & Path Sanitizer*: Resolving absolute canonical paths and rejecting `..` traversal.
  - *SSRF Firewall*: Blocking `127.0.0.1`, `localhost`, `169.254.169.254`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
  - *Human-in-the-Loop Gateway*: Enforcing mandatory cryptographic approval tokens before tool execution.
  - *Memory Integrity Guard*: Provenance tagging of agent memory records.
- Mandatory Before-and-After Retest Engine calculating empirical risk reduction.

### 3.6 MCP Security Lab
- Local embedded MCP server simulating a standard Model Context Protocol interface.
- Tool discovery endpoint exposing tool schema, parameter definitions, and permission scopes.
- Security test engine evaluating:
  - Path traversal attempts (`../../etc/shadow`, `..\..\Windows\win.ini`).
  - Unauthorized tool execution.
  - Tool description manipulation / prompt injection via tool metadata.
- Interactive Proof of Concept (PoC) demonstration showing blocked status and database event logging.

### 3.7 Wazuh SIEM Integration
- REST API client for Wazuh 4.x SIEM manager.
- Health check and connection validation.
- Event forwarding: Sending AI security alerts (Prompt Injections, Tool Abuse, Path Traversal) into Wazuh rule engine.
- Alert correlation: Ingesting Wazuh alerts and mapping Rule IDs to OWASP LLM / ASI risk IDs.
- Disconnected Local Test Mode for offline development and demonstrations.

### 3.8 Before / After Analysis & Reporting
- Comparative Recharts visualizations (Bar, Radar, Line) comparing Claude vs Gemini and Baseline vs Mitigated.
- Multi-format report generation (JSON, CSV, PDF).
- Immutable audit log table recording timestamp, actor, action, model, test ID, and cryptographic hash.

---

## 4. Non-Functional Requirements

- **Security & Privacy:** Zero leakage of external API keys to the frontend; environment and database encryption; sandboxed tool execution; zero execution of untrusted code on host OS.
- **Performance:** Asynchronous non-blocking test runner; sub-200ms API response time for cached metrics; real-time WebSocket push for long-running test suites.
- **Reliability:** Dual execution mode (Live Cloud API + Deterministic Offline Sandbox) ensuring 100% test pass rates and demo readiness in offline or zero-quota environments.
- **Observability:** Structured logging with standard correlation IDs; Prometheus-ready metrics.
- **Portability:** Containerized with Docker and Docker Compose; runnable locally via VS Code on Windows, macOS, and Linux; deployable to AWS ECS/EKS and AWS SageMaker/AML.

---

## 5. Acceptance Criteria Checklist

1. [x] Complete LeetCode/SOC-inspired dark UI (#080808, #FF8A00) matching visual reference screenshot.
2. [x] Live or authenticated switching between Claude and Gemini with token usage & latency tracking.
3. [x] Synthetic enterprise RAG knowledge base searchable with prompt injection test controls.
4. [x] AI Agent Lab with 4 functional tools and Human-in-the-Loop approval modal.
5. [x] Red Team engine with all 10 required OWASP LLM & ASI categories (60+ test cases).
6. [x] Real-time test campaign runner updating via WebSockets/polling.
7. [x] Blue Team mitigations verified with empirical Before-and-After retesting.
8. [x] MCP Security Lab with path traversal PoC (`../../etc/shadow`) blocked and logged.
9. [x] Wazuh SIEM integration with live connection test and event correlation.
10. [x] PDF, CSV, and JSON report downloads with persistent database audit logs.

