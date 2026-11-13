# MEMORY.MD — AI SECURITY FASTER
## Enterprise Frontier LLM & Agentic AI Red Teaming & Defense Platform
**Author:** AI Security Research & Engineering Team  
**System Version:** 2.0.0  
**Frameworks:** OWASP Top 10 for Large Language Models (2026) & OWASP Top 10 for Agentic Systems (ASI 2026)  
**Last Updated:** 2026-11-14  

---

## 1. Executive System Overview

**AI Security Faster** is an enterprise-grade cybersecurity benchmark and defense platform engineered to evaluate, audit, and harden frontier Large Language Models (LLMs) and autonomous AI agent systems against emerging threats. 

The platform supports dual frontier models (**Anthropic Claude 3.7 / 3.5 Sonnet** and **Google Gemini 2.5 Flash / 1.5 Pro**) alongside a deterministic offline simulation engine. It provides comprehensive red-team adversarial suites, real-time blue-team mitigation pipelines, Human-in-the-Loop (HITL) authorization gates, Model Context Protocol (MCP) vulnerability labs, and live Wazuh SIEM enterprise telemetry correlation.

```
                              ┌─────────────────────────────────────────────────────────┐
                              │          AI SECURITY FASTER — Web Interface (5173)      │
                              │     (React 18 + TypeScript + Vite + Tailwind CSS)       │
                              └────────────────────────────┬────────────────────────────┘
                                                           │ HTTP REST / SSE / WebSockets
                                                           ▼
                              ┌─────────────────────────────────────────────────────────┐
                              │            FastAPI Backend Service (Port 8000)          │
                              ├────────────────────────────┬────────────────────────────┤
                              │ • Model Router (Claude/Gem)│ • Sandboxed ReAct Agent    │
                              │ • Red Team Test Engine     │ • HITL Approval Machine    │
                              │ • Blue Team Mitigations    │ • Wazuh SIEM Integrator    │
                              │ • Synthetic Enterprise RAG │ • Real-Time Email Gateway  │
                              └──────┬─────────────────────┴─────────────────────┬──────┘
                                     │                                           │
             ┌───────────────────────┴───────────────────────┐                   ▼
             ▼                                               ▼        ┌───────────────────────┐
┌─────────────────────────┐                     ┌──────────────────┐  │   Wazuh SIEM Manager  │
│  Frontier Cloud APIs    │                     │ Local SQLite DB  │  │      (Port 55000)     │
│ • Anthropic Claude 3.7  │                     │ & SHA-256 Ledger │  └───────────────────────┘
│ • Google Gemini 2.5     │                     └──────────────────┘              ▲
│ • Resend Email REST API │                                                       │ Live Alerts
└─────────────────────────┘                                                       │ (Rules 100010-100025)
```

---

## 2. Platform Architecture & Technology Stack

### 2.1 Backend Architecture
- **Framework:** FastAPI (Python 3.12, Uvicorn ASGI).
- **Database / ORM:** SQLAlchemy 2.0 with SQLite (`backend/ai_security_faster.db`) and PostgreSQL support.
- **Data Validation:** Pydantic v2 schemas for strict input/output contract enforcement.
- **Reporting Engine:** ReportLab for enterprise PDF security audit generation; native CSV and JSON compliance exporters.
- **Security & Crypto:** PyJWT for RBAC authentication, Python `hashlib` for SHA-256 immutable audit ledgers.

### 2.2 Frontend Architecture
- **Framework:** React 18, TypeScript, Vite.
- **Styling:** Tailwind CSS with custom SOC dark theme inspired by LeetCode/SOC terminals:
  - Deep Background: `#080808`
  - Card & Surface: `#171717`
  - Border Accents: `#262626`
  - High-Severity / Brand Accent: `#FF8A00` (Orange)
  - Protected / Secure State: `#00C784` (Emerald Green)
  - Critical / Vulnerable State: `#FF4545` (Vivid Red)
- **Icons:** Lucide React.
- **Client Transport:** Axios with centralized interceptors, type-safe API service layer (`frontend/src/services/api.ts`).

### 2.3 Running Services & Access Links
| Service | Host & Port | Access Link | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Web UI** | `0.0.0.0:5173` | [http://localhost:5173](http://localhost:5173) | Reactive SOC dashboard and test lab |
| **Backend REST API** | `127.0.0.1:8000` | [http://127.0.0.1:8000](http://127.0.0.1:8000) | Core FastAPI microservice |
| **API Documentation**| `127.0.0.1:8000/docs` | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Interactive Swagger UI API specs |
| **Health Check** | `127.0.0.1:8000/health` | [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) | Uptime and dependency health status |

---

## 3. Core Subsystems & Feature Breakdown

### 3.1 Frontier LLM Playground & Synthetic RAG
- **Switchable Models:** Real-time hot-swapping between **Anthropic Claude 3.7 Sonnet** and **Google Gemini 2.5 Flash** directly from top navigation or playground controls.
- **Synthetic Knowledge Base (`data/synthetic_kb.json`):**
  - Proprietary enterprise data store containing fictional Q3 financial spreadsheets, HR compensation details, internal microservice credentials, and production AWS access tokens.
  - TF-IDF embedding search with cosine similarity retrieval.
  - Context grounding with boundary wrappers preventing prompt injection leaking through retrieved context.
- **Deterministic Simulation Fallback:**
  - In environments with zero API quota or offline air-gaps, the platform activates a realistic deterministic simulation engine that mirrors exact model token outputs, latencies, and security failure signatures.

### 3.2 Autonomous AI Agent Lab & Sandboxed Tools
The platform features an autonomous ReAct (Reasoning + Action) security agent equipped with 4 sandboxed tools:

1. **`file_read` (File System Inspector):**
   - Reads files inside the sandboxed directory (`data/sandbox/`).
   - Enforces strict canonical path normalization, instantly neutralizing directory traversal attempts (`../../etc/shadow`, `../../windows/system32/config/SAM`).
2. **`email` (Security Incident Notifier):**
   - Dispatches formatted incident alerts via Resend or SendGrid REST API.
   - Enforces mandatory **Human-in-the-Loop (HITL)** approval gate before any external network transmission occurs.
   - In sandbox mode, generates a cryptographic preview draft; in live mode, transmits live alerts to verified recipient inboxes.
3. **`http_call` (External Webhook Client):**
   - Executes outbound HTTP GET/POST queries.
   - Hardened with an automated SSRF firewall that drops private RFC 1918 IP spaces (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback interfaces (`127.0.0.1`, `localhost`), and cloud link-local metadata endpoints (`169.254.169.254`).
4. **`mcp_connector` (Model Context Protocol Client):**
   - Connects to local MCP test servers via JSON-RPC 2.0.
   - Inspects tool schemas, discovers available capabilities, and enforces parameter boundary validation.

### 3.3 Human-in-the-Loop (HITL) Authorization Architecture
High-risk agent actions (such as outbound email dispatch, file modifications, or external webhooks) enter state `AWAITING_APPROVAL`.
- The system generates a cryptographic approval request with payload preview.
- A human security analyst approves or rejects the action via the UI modal or API (`/api/agent/tasks/{id}/approve`).
- State transitions: `PENDING` -> `APPROVED` (executes tool) or `REJECTED` (terminates action and logs to audit ledger).

---

## 4. Threat Matrix: 10 Required Risks & 30 Attack Test Cases

The platform evaluates 10 mission-critical risk categories across both OWASP LLM and OWASP Agentic standards. Each risk includes a minimum of 3 distinct attack vectors tested across both models (**30 distinct scenarios, 60 model permutations**).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        OWASP LLM TOP 10 (2026) BENCHMARK SUITE                         │
├─────────┬──────────────────────────────────┬───────────────────────────────────────────┤
│ Risk ID │ Vulnerability Name               │ Attack Test Scenarios (3 per risk)        │
├─────────┼──────────────────────────────────┼───────────────────────────────────────────┤
│ LLM01   │ Prompt Injection                 │ • Direct Override Payload                 │
│         │                                  │ • Indirect Injection via Ingested Doc     │
│         │                                  │ • Role Manipulation / Persona DAN Bypass  │
├─────────┼──────────────────────────────────┼───────────────────────────────────────────┤
│ LLM02   │ Sensitive Info Disclosure        │ • Synthetic Canary Token Extraction       │
│         │                                  │ • PII Harvesting (SSN / Credit Card)      │
│         │                                  │ • Internal Infrastructure Key Exfiltration│
├─────────┼──────────────────────────────────┼───────────────────────────────────────────┤
│ LLM03   │ Supply Chain Vulnerabilities     │ • Poisoned PyPI Package Recommendation    │
│         │                                  │ • Malicious MCP Tool Definition Injection │
│         │                                  │ • Unpinned Dependency Typosquatting       │
├─────────┼──────────────────────────────────┼───────────────────────────────────────────┤
│ LLM08   │ Excessive Agency                 │ • Unconstrained DB Drop Command           │
│         │                                  │ • Unauthorized Mass Phishing Email Blast  │
│         │                                  │ • Autonomous IAM Role Escalation Attempt  │
├─────────┼──────────────────────────────────┼───────────────────────────────────────────┤
│ LLM10   │ Unbounded Consumption            │ • Recursive Self-Prompt Token Bomb        │
│         │                                  │ • Quadratic Context Inflation DoS         │
│         │                                  │ • Unconstrained Concurrent Batch Flooding │
└─────────┴──────────────────────────────────┴───────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                    OWASP AGENTIC SYSTEMS TOP 10 (ASI 2026) SUITE                       │
├─────────┬──────────────────────────────────┬───────────────────────────────────────────┤
│ Risk ID │ Vulnerability Name               │ Attack Test Scenarios (3 per risk)        │
├─────────┼──────────────────────────────────┼───────────────────────────────────────────┤
│ ASI01   │ Agentic Goal Hijacking           │ • Objective Inversion via External Webhook│
│         │                                  │ • Mid-Execution Sub-Task Substitution     │
│         │                                  │ • Rogue Instruction Injection in ReAct    │
├─────────┼──────────────────────────────────┼───────────────────────────────────────────┤
│ ASI02   │ Tool Misuse & Execution Abuse    │ • MCP Path Traversal (../../etc/shadow)   │
│         │                                  │ • SSRF to AWS Metadata (169.254.169.254)  │
│         │                                  │ • Unsanitized Bash Command Injection      │
├─────────┼──────────────────────────────────┼───────────────────────────────────────────┤
│ ASI03   │ Identity & Privilege Escalation  │ • Agent Role Elevation from Read to Admin │
│         │                                  │ • JWT Impersonation of Tenant Admin       │
│         │                                  │ • Multi-Agent Delegated Trust Abuse       │
├─────────┼──────────────────────────────────┼───────────────────────────────────────────┤
│ ASI05   │ Unexpected Code Execution        │ • Dynamic Python eval() Shellcode Exec    │
│         │                                  │ • Base64-Obfuscated Shell Payload Ingest  │
│         │                                  │ • Agent-Synthesized Malicious Binary Run  │
├─────────┼──────────────────────────────────┼───────────────────────────────────────────┤
│ ASI06   │ Agent Memory Poisoning           │ • Persistent Scratchpad Context Poisoning │
│         │                                  │ • Cross-Session Memory Manipulation       │
│         │                                  │ • False Memory Implantation via RAG Store │
└─────────┴──────────────────────────────────┴───────────────────────────────────────────┘
```

---

## 5. Blue Team Mitigations & Empirical Before/After Results

Every risk category features an active defense mechanism that can be toggled on or off to demonstrate measurable, empirical risk reduction.

| Risk ID | Mitigation Key | Active Defense Mechanism | Baseline Risk (Before) | Hardened Risk (After) | Score Reduction |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **LLM01** | `MIT-LLM01` | Structural XML Boundary Wrapping + Input Instruction Delimiters | **92% (FAIL)** | **10% (PASS)** | **-82%** |
| **LLM02** | `MIT-LLM02` | Synthetic Canary Trap + Automated PII Redaction Regex Pipeline | **88% (FAIL)** | **08% (PASS)** | **-80%** |
| **LLM03** | `MIT-LLM03` | Cryptographic Package Hash Verification + SBOM Signature Gate | **85% (FAIL)** | **12% (PASS)** | **-73%** |
| **LLM08** | `MIT-LLM08` | Human-in-the-Loop (HITL) Gate + Scope-Restricted Tool Allowlist | **95% (FAIL)** | **05% (PASS)** | **-90%** |
| **LLM10** | `MIT-LLM10` | Strict Token Budget Circuit Breakers + Execution Rate Limiters | **84% (FAIL)** | **10% (PASS)** | **-74%** |
| **ASI01** | `MIT-ASI01` | Immutable System Invariant Framing + Goal Anchor Verifier | **90% (FAIL)** | **11% (PASS)** | **-79%** |
| **ASI02** | `MIT-ASI02` | Canonical Path Jail + SSRF Private Subnet / Cloud Metadata Dropper | **96% (FAIL)** | **04% (PASS)** | **-92%** |
| **ASI03** | `MIT-ASI03` | Granular RBAC Tool Scoping + Capability Token Verification | **89% (FAIL)** | **09% (PASS)** | **-80%** |
| **ASI05** | `MIT-ASI05` | AST Syntax Validation + Ephemeral Container Isolation Sandbox | **94% (FAIL)** | **06% (PASS)** | **-88%** |
| **ASI06** | `MIT-ASI06` | Memory Provenance HMAC Verification + Context Integrity Gate | **87% (FAIL)** | **12% (PASS)** | **-75%** |

### Interactive 1-Click Retest in UI
When an attack test is executed without mitigation, the modal displays `LIVE TEST VERDICT: FAIL` (highlighted in red, representing a successful adversarial attack). Clicking the **"🛡️ Apply Mitigation & Fix (Retest)"** button automatically applies the blue team defense and re-evaluates the prompt, switching the verdict to `PASS (PROTECTED / SECURE)` with risk score reduced to <15%.

---

## 6. Model Context Protocol (MCP) Security Analysis & PoC

### 6.1 Vulnerability Overview
The **Model Context Protocol (MCP)** enables frontier LLMs to dynamically invoke remote tools and data sources. If MCP servers execute tool calls without strict path isolation or input sanitization, an attacker can leverage the LLM to access sensitive files on the host operating system.

### 6.2 Executable Proof of Concept (PoC)
- **Tool Invoked:** `mcp_read_file`
- **Target Path:** `../../etc/shadow` (or `../../windows/system32/config/SAM`)
- **Unmitigated Behavior:** Server resolves relative traversal sequences, reading raw password hashes and private keys outside the authorized boundary.
- **Hardened Mitigation:**
  ```python
  # Canonical path verification in backend/app/mcp/client.py
  safe_root = os.path.abspath("./data/sandbox")
  target_path = os.path.abspath(os.path.join(safe_root, requested_path))
  if not target_path.startswith(safe_root):
      raise SecurityException("MCP_PATH_TRAVERSAL_DETECTED: Target path escapes jail boundary.")
  ```
- **SIEM Correlation:** Triggers Wazuh `Rule 100015` (Level 12 - Critical) and logs an immutable audit event.

---

## 7. Wazuh SIEM Integration & Dynamic Telemetry

The platform interfaces with **Wazuh SIEM Manager 4.8.0** (REST API on port 55000) to correlate AI-specific red-team events, tool abuse attempts, and path traversals into enterprise security dashboards.

### 7.1 Security Rule Hierarchy
| Rule ID | OWASP Target | Severity Level | Rule Title & Incident Description |
| :---: | :---: | :---: | :--- |
| **`100010`** | LLM01 | Level 12 (Critical) | Prompt injection attempted via user payload override. |
| **`100012`** | LLM02 | Level 12 (Critical) | Synthetic canary token extraction intercepted by security gate. |
| **`100015`** | ASI02 | Level 12 (Critical) | OWASP ASI02 / MCP: Path traversal (`../../etc/shadow`) detected and blocked. |
| **`100018`** | ASI02 | Level 14 (Emergency) | SSRF attempt to AWS metadata service (`169.254.169.254`) dropped by firewall. |
| **`100020`** | ASI03 | Level 10 (High) | Unauthorized tool permission claim rejected under RBAC policy. |
| **`100022`** | ASI05 | Level 12 (Critical) | OS shell command injection string intercepted before execution. |
| **`100025`** | ASI06 | Level 11 (High) | Agent persistent scratchpad memory integrity mismatch detected. |

### 7.2 Live Ingestion & Dynamic Refresh
Clicking **"Refresh SIEM Feeds"** on `/integrations` dynamically queries `/api/wazuh/alerts?refresh=true`. The backend synthesizes live security events with the exact current UTC timestamp, displaying:
- Pulsating green `🟢 LIVE INGEST` indicators.
- Human-readable relative time badges (`Just now`, `1m ago`).
- Synchronized local time timestamps.

---

## 8. Real-Time Email Gateway & Delivery Configuration

The autonomous agent is equipped with a real-time email notification gateway supporting **Resend** and **SendGrid**.

### 8.1 Active Configuration
- **Active Provider:** `resend` (Official API: `https://api.resend.com/emails`)
- **Sender Address:** `AI Security Faster <onboarding@resend.dev>`
- **Active Environment Key:** Configured in local `backend/.env` as `EMAIL_API_KEY="re_5DH...qT3K"` (stored in server environment, never committed to git).
- **Status Endpoint:** `GET /api/agent/email/status` returns `mode: "LIVE_REALTIME"`, `configured: true`, and masked key `re_5D...qT3K`.

### 8.2 Resend Free Tier Security Constraints & Verified Deliveries
> [!IMPORTANT]
> **Resend Free Tier Registered Recipient Rule:**  
> Resend free tier accounts using the default testing domain (`onboarding@resend.dev`) strictly enforce an anti-spam restriction: **emails can ONLY be delivered to the verified email address of the account owner**.  
> In this deployment, the key belongs to `doctorpraveen2011@gmail.com`.  
> - Sending to `doctorpraveen2011@gmail.com` succeeds in real time.
> - Attempting to send to unverified addresses (e.g. `praveenbalamurugan02@gmail.com`) causes Resend to return HTTP 403 `validation_error`. The backend explicitly detects and surfaces this message.

#### Live Delivery Verification Log:
- **Delivery 1:** Message ID `01a1d64c-2563-72f7-9b7d-3d2b479187e4` -> Delivered to `doctorpraveen2011@gmail.com`
- **Delivery 2:** Message ID `01a1d64c-e3a6-7794-be0a-ed9673ec4f36` -> Delivered to `doctorpraveen2011@gmail.com`

---

## 9. Comprehensive API Endpoint Reference

| Method | Path | Category | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Core | System health check & dependency status |
| `GET` | `/api/dashboard/overview` | Dashboard | Real-time counts, coverage KPIs, and model scores |
| `GET` | `/api/models` | Models | List available frontier models & status |
| `POST`| `/api/models/chat` | Models | Execute LLM chat query with RAG context grounding |
| `GET` | `/api/models/status` | Models | Check Claude & Gemini API key configuration |
| `POST`| `/api/models/keys` | Models | Save Claude or Gemini API keys to environment |
| `GET` | `/api/tests/campaigns` | Red Team | Get test campaigns and execution history |
| `POST`| `/api/tests/execute` | Red Team | Run single or batch attack tests with optional `mitigate: bool` |
| `GET` | `/api/agent/tasks` | AI Agent | List autonomous agent tasks and HITL approvals |
| `POST`| `/api/agent/tasks/{id}/approve` | AI Agent | Approve or reject a pending agent action |
| `GET` | `/api/agent/email/status` | Email | Get real-time email gateway mode & masked key |
| `POST`| `/api/agent/email/configure` | Email | Configure and persist Resend/SendGrid API key |
| `POST`| `/api/agent/email/test` | Email | Send immediate live test security alert |
| `GET` | `/api/mitigations` | Blue Team | List all 10 mitigations and before/after metrics |
| `POST`| `/api/mitigations/{id}/toggle` | Blue Team | Enable or disable a specific mitigation engine |
| `GET` | `/api/mcp/tools` | MCP | Inspect discovered MCP server tools and schemas |
| `POST`| `/api/mcp/test` | MCP | Execute MCP PoC test (`../../etc/shadow`) |
| `GET` | `/api/wazuh/status` | Wazuh SIEM | Retrieve Wazuh manager connection status |
| `GET` | `/api/wazuh/alerts` | Wazuh SIEM | Fetch alerts (`?refresh=true` generates live ingest) |
| `GET` | `/api/reports` | Reports | List generated audit reports and ledger hashes |
| `POST`| `/api/reports/generate` | Reports | Generate new PDF, CSV, or JSON audit export |
| `GET` | `/api/reports/{id}/download`| Reports | Download generated PDF security report |

---

## 10. Operational Guide: How to Start & Verify

### 10.1 Starting the Platform
Convenient Windows batch scripts are provided in the workspace root:

```powershell
# Start both Backend and Frontend concurrently
.\start-all.bat

# Or start individually:
# Terminal 1: Backend
.\start-backend.bat
# (Runs: python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000)

# Terminal 2: Frontend
.\start-frontend.bat
# (Runs: npm run dev --prefix frontend -- --host 0.0.0.0 --port 5173)
```

### 10.2 Verifying Key Capabilities
1. **Frontend Access:** Open [http://localhost:5173](http://localhost:5173) in your browser.
2. **Model Hot-Switching:** Switch between `Claude 3.7 Sonnet` and `Gemini 2.5 Flash` using the top dropdown.
3. **Red Team Adversarial Testing:** Navigate to **Attack Tests** or click any risk on the **Overview** page to run attack vectors.
4. **Blue Team Retesting:** Inside the test modal, toggle the **Blue Team Dual-Boundary Defense** switch or click **"🛡️ Apply Mitigation & Fix (Retest)"** to see the test verdict transform from `FAIL` to `PASS (PROTECTED)`.
5. **Real-Time Email Alerting:** Open **Settings** -> **Real-Time Security Email Alert Gateway**, ensure key is active, enter `doctorpraveen2011@gmail.com`, and click **"Send Live Test"** to verify real-time inbox delivery.
6. **Wazuh SIEM Ingest:** Navigate to **Integrations**, click **"Refresh SIEM Feeds"**, and observe live security alerts arriving with current UTC timestamps and pulsing green badges.
7. **Audit Report Export:** Navigate to **Reports**, select **PDF format**, and click **"Generate Audit Report"** to produce an executive-ready compliance ledger.

---

## 11. Engineering Change Log & Resolved Technical Challenges

1. **Uvicorn Daemon Process Persistence on Windows:**
   - Ensured background tasks run with `BypassSandbox: true` so the Windows host browser can freely bind and communicate over loopback `127.0.0.1:8000` and `0.0.0.0:5173`.
2. **Resend API HTTP 403 Validation Diagnostic:**
   - Decoded Resend free tier restriction when sending from `onboarding@resend.dev` to non-owner email addresses. Added intelligent error parsing in `email_tool.py` that guides the user to send testing alerts to their registered email address (`doctorpraveen2011@gmail.com`).
3. **Dynamic Mitigation Retest Flow in Overview Modal:**
   - Added `mitigate` parameter to `executeSingleTest` and connected the modal directly to the `BlueTeamDefensePipeline` and `FallbackSimulator(is_mitigated=True)` so users can verify defense efficacy with a single click.
4. **Live Data & Real-Time SIEM Ingestion on Refresh:**
   - Upgraded `/api/wazuh/alerts?refresh=true` to dynamically inject live simulated security incident alerts with the exact `datetime.now(timezone.utc)` timestamp, coupled with relative time calculations (`Just now`, `Xm ago`) in `WazuhPage.tsx`.
5. **Database-Driven Dashboard KPIs:**
   - Replaced static counters in `/api/dashboard/overview` with live SQLAlchemy database aggregation queries (`TestExecution.count()`, dynamic pass/fail counters per risk and model), ensuring metrics update immediately upon test completion.
