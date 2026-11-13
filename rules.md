# SECURITY & OPERATIONAL RULES (RULES.MD)
## AI SECURITY FASTER — Governance, Safety & Engineering Guardrails
**Document Identifier:** AGY-SEC-RULE-2026-V1  
**Classification:** Confidential / Enterprise Defensive Standards  

---

## 1. Core Engineering & Platform Rules

### RULE-01: Zero Host Contamination & Sandbox Enforcement
- **Mandate:** No untrusted input, user payload, or model-generated script shall ever be executed directly on the host operating system.
- **Implementation:**
  - File tool operations must be strictly bounded to `<PROJECT_ROOT>/backend/data/sandbox/` using canonical path validation (`os.path.realpath`).
  - Any path containing `..`, `~`, `%2e%2e`, null bytes, or absolute drive letters outside the sandbox root must trigger an immediate `SECURITY_EXCEPTION` (HTTP 403) and log an `AUDIT_EVENT`.
  - Python `eval()`, `exec()`, `os.system()`, or `subprocess.Popen` with untrusted inputs are strictly prohibited across the entire codebase.

### RULE-02: Strict Separation of Red-Team Testing & Live Weaponization
- **Mandate:** All red-teaming test cases must be defensive safety benchmarks designed to assess model guardrails, canary leakage, and tool safety using synthetic enterprise data only.
- **Implementation:**
  - Fictional data only: All employee names, credit card numbers, email addresses, and API credentials must follow synthetic test formats (e.g., `SEC-CANARY-ALPHA-9942`, `user@synthetic-corp.local`).
  - No targeting of external unauthorized third-party infrastructure. All HTTP requests in test suites must target local mock endpoints or authorized test endpoints.

### RULE-03: API Key & Credential Isolation
- **Mandate:** Never expose Anthropic API keys (`ANTHROPIC_API_KEY`), Google Gemini API keys (`GEMINI_API_KEY`), JWT secrets, or database credentials to the client/frontend.
- **Implementation:**
  - All model calls and external API interactions must route through the FastAPI backend.
  - The frontend only receives sanitized model output, token counts, and latency statistics.
  - Settings page inputs for API keys must be masked (`••••••••••••`), transmitted over HTTPS/encrypted payloads, and stored securely in backend environment variables or encrypted database vaults.

---

## 2. Agentic Tool Execution & Human-in-the-Loop (HITL) Rules

### RULE-04: Tool Permission Tiers & Mandatory Approval
- **Tier 1 (Read-Only / Benign):**
  - Examples: `file_read` (within sandbox), `mcp_list_tools`, `search_knowledge_base`.
  - Policy: Automated execution permitted with audit logging.
- **Tier 2 (Egress / State Modification):**
  - Examples: `http_request` (outbound call), `mcp_execute_tool`.
  - Policy: Automated execution allowed only if destination domain is in the approved allowlist (`ALLOWLISTED_DOMAINS`). Otherwise requires HITL approval.
- **Tier 3 (High-Impact / Irreversible):**
  - Examples: `email_send` (external dispatch), `file_delete`, `database_write`, `role_change`.
  - Policy: **Mandatory Human-in-the-Loop (HITL) cryptographic approval token required.** The agent must halt in state `AWAITING_APPROVAL` until a user explicitly approves or rejects the action via the UI modal.

### RULE-05: Server-Side Request Forgery (SSRF) Blocklist
- The `http_request` tool must validate target URLs against:
  - IPv4 Loopback: `127.0.0.0/8`
  - IPv6 Loopback: `::1`
  - Cloud Instance Metadata: `169.254.169.254` (AWS, GCP, Azure, OpenStack)
  - RFC 1918 Private Ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
  - Localhost aliases: `localhost`, `*.localhost`, `0.0.0.0`
- Any attempt to query these destinations must immediately terminate the tool execution, record an `ASI02_SSRF_DETECTED` alert, and forward the incident to Wazuh SIEM.

---

## 3. Red Team & Blue Team Verification Rules

### RULE-06: Verifiable Empirical Retesting
- **Mandate:** A vulnerability cannot be marked as "Mitigated" purely because a defensive checkbox or middleware flag was toggled.
- **Implementation:**
  - A risk state changes from `VULNERABLE` to `MITIGATED` only when the exact same attack scenario is re-executed through the mitigated pipeline and passes the automated verification oracle.
  - The platform must store both the `baseline_result` (before) and `mitigated_result` (after), recording:
    - Verbatim prompt input
    - Baseline raw response
    - Mitigated raw response
    - Latency before & after
    - Risk score reduction percentage

### RULE-07: Minimum Testing Coverage Floor
- To guarantee statistical validity for enterprise audits:
  - 10 Required Risk Categories must be maintained (5 OWASP LLM + 5 OWASP ASI).
  - Each category must contain at least 3 distinct, non-trivial test scenarios.
  - Both Claude and Gemini must be independently evaluated for every test case.
  - Minimum execution floor per campaign = **10 risks × 3 test cases × 2 models = 60 executions**.

---

## 4. MCP (Model Context Protocol) Security Rules

### RULE-08: MCP Protocol Schema & Capability Boundaries
- Every MCP test server endpoint must enforce:
  1. Strict JSON-Schema parameter validation before dispatching to handlers.
  2. Scope isolation: Tools exposed to the agent cannot inherit broader OS process permissions than the MCP server itself.
  3. Sanitized error messages: Path traversal and permission errors must return generic access denial responses without leaking internal filesystem hierarchies or stack traces.

---

## 5. Audit & Compliance Rules

### RULE-09: Immutable Audit Logging
- Every user action, test execution, agent approval, and configuration change must generate a cryptographically verifiable audit log entry containing:
  - Timestamp (ISO 8601 UTC)
  - Actor ID / Username / IP Address
  - Event Type & Target Resource
  - SHA-256 Hash of Request/Response payloads
  - Correlation ID linking frontend action to backend async tasks

### RULE-10: Clean Fallback & Graceful Offline Degradation
- If external model APIs (Claude or Gemini) are unconfigured or rate-limited:
  - The system must clearly mark the provider status as `Simulated / Sandbox Test Mode`.
  - The platform must never present fake live API statistics as verified frontier model responses.
  - Realistic, deterministic benchmark responses must be supplied for local QA and offline demonstration.

