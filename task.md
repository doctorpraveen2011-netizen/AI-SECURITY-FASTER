# GRANULAR DEVELOPMENT TASKS (TASK.MD)
## AI SECURITY FASTER — Implementation Roadmap & Execution Checklist
**Target Completion:** 100% Fully Functional Full-Stack Platform  
**Tracking Status:** In Progress  

---

## Phase 1: Foundation & Architecture Setup
- [x] Create project documentation (`prd.md`, `rules.md`, `system-architecture.md`, `design.md`, `task.md`, `research.md`, `README.md`).
- [x] Configure backend project layout (`backend/app/...`).
- [x] Initialize FastAPI application with CORS, exception handlers, and security middleware.
- [x] Implement SQLAlchemy 2.0 database models and SQLite/PostgreSQL configuration.
- [x] Seed database with initial OWASP LLM & ASI risk categories, test cases, and default mitigations.
- [x] Implement JWT authentication and RBAC endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).

## Phase 2: Frontier LLM Integration & Playground
- [x] Build Anthropic Claude integration adapter with official message headers and token counter.
- [x] Build Google Gemini integration adapter with official GenAI client.
- [x] Build deterministic simulation test runner for offline/zero-quota environments.
- [x] Implement synthetic enterprise RAG knowledge base (fictional HR, finances, API secrets).
- [x] Build LLM Playground backend endpoints (`/api/models`, `/api/models/configure`, `/api/models/chat`).
- [x] Build Playground frontend with dynamic model switcher, system prompt editor, temperature slider, and security attack presets.

## Phase 3: Autonomous AI Agent Lab & Sandboxed Tools
- [x] Implement ReAct agent execution loop with concise reasoning summaries.
- [x] Build Sandboxed Tool 1: `File Read` with strict path traversal prevention (`../../etc/shadow`).
- [x] Build Sandboxed Tool 2: `Email Dispatch` with sandbox draft generation and Human-in-the-Loop gate.
- [x] Build Sandboxed Tool 3: `HTTP Request` with full SSRF protection against private IP spaces and metadata services (`169.254.169.254`).
- [x] Build Sandboxed Tool 4: `MCP Connector` for interacting with local test server.
- [x] Build Human-in-the-Loop approval modal and state transitions (`AWAITING_APPROVAL` -> `APPROVED` / `REJECTED`).
- [x] Expose Agent endpoints (`/api/agent/tasks`, `/api/agent/tools/execute`, `/api/agent/approvals`).

## Phase 4: Automated Red Team Testing Engine
- [x] Implement 10 required risk categories (LLM01, LLM02, LLM03, LLM08, LLM10, ASI01, ASI02, ASI03, ASI05, ASI06).
- [x] Author minimum 3 distinct test scenarios per category (30 distinct test cases).
- [x] Implement test campaign orchestrator executing all 30 test cases against both Claude and Gemini (**60 executions minimum**).
- [x] Capture verbatim prompts, raw responses, latencies, tokens used, pass/fail verdicts, and cryptographic hashes.
- [x] Build WebSocket / SSE streaming for real-time live test progress updates.
- [x] Expose Red Team endpoints (`/api/tests/campaigns`, `/api/tests/execute`, `/api/tests/results`).

## Phase 5: Blue Team Mitigation Engine & Retesting
- [x] Implement active mitigation mechanisms:
  - Instruction Hierarchy & Structural XML Wrapping (Prompt Injection defense).
  - Synthetic Canary & PII Redactor (Sensitive Data defense).
  - Path Normalizer & Sandbox Boundary Enforcer (Tool Misuse defense).
  - SSRF Filter & Private IP Blocker (Tool Misuse defense).
  - Tool Allowlist & Cryptographic HITL Token (Excessive Agency & Privilege Abuse).
  - Memory Provenance Verifier (Memory Poisoning defense).
- [x] Implement Before-and-After Retest Engine:
  - Run baseline attack -> capture vulnerable response.
  - Apply active mitigation -> run identical attack.
  - Calculate empirical reduction percentage (e.g. 87% down to 12%).
- [x] Expose Mitigation endpoints (`/api/mitigations`, `/api/mitigations/apply`, `/api/mitigations/retest`).

## Phase 6: Model Context Protocol (MCP) Security Lab
- [x] Implement local standalone MCP test server with JSON-RPC interface.
- [x] Implement MCP tool discovery, schema inspection, and permission scopes.
- [x] Implement Path Traversal Proof of Concept (PoC) attacking `../../etc/shadow`.
- [x] Implement MCP security guard blocking traversal and logging incident to database.
- [x] Expose MCP endpoints (`/api/mcp/connect`, `/api/mcp/tools`, `/api/mcp/test`, `/api/mcp/events`).

## Phase 7: Wazuh SIEM Integration
- [x] Implement Wazuh REST API client (Manager port 55000) with authentication token caching.
- [x] Implement Rule Mapper translating AI events into Wazuh alert format.
- [x] Implement Alert Ingestion engine retrieving real-time security alerts.
- [x] Implement Local Disconnected Mode with synthetic SIEM event streaming for isolated testing.
- [x] Expose Wazuh endpoints (`/api/wazuh/connect`, `/api/wazuh/status`, `/api/wazuh/alerts`).

## Phase 8: Multi-Format Reporting & Audit Ledger
- [x] Implement PDF report generator with executive summary and test breakdown.
- [x] Implement CSV report exporter for data science and compliance pipelines.
- [x] Implement JSON report exporter for CI/CD integrations.
- [x] Build immutable audit log ledger with SHA-256 integrity hashes.
- [x] Expose Report endpoints (`/api/reports`, `/api/reports/generate`, `/api/reports/{id}/download`).

## Phase 9: LeetCode/SOC Frontend UI & Visual Fidelity
- [x] Build App shell with responsive sidebar, top search, model pills, and avatar.
- [x] Recreate exact Overview Dashboard matching `media_1794580612660_3f0ca8b8.jpg`:
  - 4 KPI cards with sparklines.
  - Models & Tools card with Claude/Gemini and 4 agent tools.
  - Risk Coverage (OWASP 2026) with `LLM Top 10` and `Agentic Top 10` tabs.
  - Attack Test Cases table with model progress bars (Claude 3/3 ✓, Gemini 3/3 ✓).
  - Mitigation Results panel with before/after risk scores.
  - MCP Connection Risk widget with blocked PoC result.
  - Test Reports chart with dual curves and Download Report button.
- [x] Build dedicated pages for LLM Playground, AI Agent Lab, Attack Tests, OWASP Risk Matrix, MCP Lab, Mitigations, Before/After Analysis, Wazuh Integration, Reports & Audit, and Settings.
- [x] Connect frontend directly to FastAPI backend APIs.

