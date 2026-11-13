# AI SECURITY FASTER — AI Security Testing Lab
### Enterprise-Grade Automated AI Red-Teaming & Blue-Teaming Operations Center
**Classification:** Enterprise Defensive Cybersecurity Platform  
**Compliance Standard:** OWASP Top 10 for LLM Applications (2025/2026) & OWASP Agentic Security Initiative (ASI Top 10)  

---

![Visual Reference Dashboard](C:/Users/PRAVEEN/.gemini/antigravity/brain/7382e1c1-4cf1-441b-b463-0d14425b4d1a/.user_uploaded/media_1794580612660_3f0ca8b8.jpg)

## 1. Project Overview

**AI SECURITY FASTER** is a production-oriented, full-stack cybersecurity operations platform designed to automatically identify, attack, measure, and mitigate vulnerabilities across:
- **Frontier Large Language Models (LLMs):** Anthropic Claude 3.5 Sonnet / Claude 3 Opus, Google Gemini 1.5 Pro / Flash.
- **Autonomous AI Agents:** Multi-tool ReAct execution workflows with Human-in-the-Loop (HITL) approval gates.
- **Model Context Protocol (MCP):** Local and remote MCP servers, tool discovery, and schema sandboxing.
- **Retrieval-Augmented Generation (RAG):** Synthetic enterprise knowledge bases vulnerable to indirect prompt injection.
- **SIEM Security Operations:** Native event streaming and alert correlation with Wazuh SIEM.

The platform functions as an **Automated AI Red-Team and Blue-Team Operations Center**, replacing static prototypes with an active execution backend, empirical verification oracles, and cryptographic audit persistence.

---

## 2. Visual Identity & Design System

Recreated faithfully from the provided design reference with a premium **LeetCode-inspired CyberSOC theme**:
- **Main Background:** Deep Black `#080808`
- **Secondary Background:** `#111111`
- **Card Background:** `#171717` with subtle `#242424` borders
- **Primary Accent:** Signature LeetCode/SOC Orange `#FF8A00`
- **Secondary Accent:** `#FFB347`
- **Success:** Emerald `#00C784`
- **Critical / Danger:** Ruby `#FF4545`
- **Warning:** Amber `#FFC247`
- **Interactive Hologram:** Glowing 3D neural brain wireframe visualization on the hero overview banner.

---

## 3. Technology Stack & Architecture

### Frontend
- **Framework:** React 18 / 19, TypeScript, Vite
- **Styling:** Tailwind CSS, custom glowing border utilities, CyberSOC typography
- **Data Visualization:** Recharts (Line charts, Bar charts, Area curves, sparklines)
- **Icons:** Lucide React
- **Routing & State:** React Router v6, TanStack Query

### Backend
- **Framework:** Python 3.11+, FastAPI (REST & WebSockets)
- **Database:** SQLAlchemy 2.0 ORM with SQLite (local development) and PostgreSQL (production)
- **Security:** JWT authentication, passlib, SHA-256 cryptographic audit ledger
- **AI Integrations:** Anthropic Claude (Messages API via `httpx`), Google Gemini (Google GenAI SDK & REST)
- **Testing Engine:** Pytest automated integration test suite

### Cloud Computing & AWS DevOps (AML Architecture)
- **Amazon Bedrock Guardrails:** Upstream policy evaluation layer.
- **Amazon SageMaker Endpoints:** Hosting private fine-tuned LLM evaluators (e.g., Llama-3-70B).
- **AWS ECS / Fargate & EKS:** Containerized microservices deployment.
- **AWS KMS & S3 Object Lock:** WORM-compliant immutable audit storage.
- **AWS WAF & CloudWatch:** Edge threat mitigation and real-time operational telemetry.

---

## 4. Platform Modules & Features

### 4.1 Master Overview Dashboard
- **Top KPI Cards:**
  - `Total Tests Run`: 48 (`↑ +12%`) with smooth sparkline curve.
  - `Vulnerabilities Found`: 27 (`↑ +8%`) with critical indicator.
  - `Mitigated Risks`: 24 (`↑ +15%`) with emerald shield status.
  - `Avg Scan Time`: `2m 14s` with purple latency telemetry.
- **Models & Tools Panel:** Active selection between Claude and Gemini, plus live status of 4 sandboxed agent tools (File Read, Email, HTTP Call, MCP Tools).
- **Risk Coverage Panel:** Interactive tabs for `[LLM Top 10]` and `[Agentic Top 10]`.
- **Attack Test Cases Panel:** Live model progress bars (`Claude 3/3 ✓`, `Gemini 3/3 ✓`) across LLM01, LLM02, LLM03, LLM08, LLM10 with drill-down modals.
- **Mitigation Results Panel:** Before-and-after risk score transitions (`High Risk (87%) → Low Risk (12%)`).
- **MCP Connection Risk Widget:** Connection Secure (Risk Score: 11%) with live blocked PoC (`Attempted path traversal (../../etc/shadow) blocked`).
- **Test Reports Chart:** Dual-curve Recharts graph comparing Vulnerabilities vs Mitigated across days Mon–Sun with PDF/HTML download button.

### 4.2 LLM Playground & RAG Security Lab
- Real-time switching between Claude and Gemini using official SDKs or deterministic benchmark simulation mode.
- System prompt editor, temperature slider, and max token tuning.
- Synthetic Enterprise Knowledge Base (HR directories, financial records, API keys vault).
- Red Team Attack Presets: Direct prompt injection override, system prompt extraction, synthetic canary leak (`SEC-CANARY-ALPHA-9942`), and DAN roleplay jailbreaks.
- Real-time latency, token usage counter, and security verdict badges (`SECURE`, `VULNERABLE`, `MITIGATED`).

### 4.3 Autonomous AI Agent Lab
- ReAct execution cycle displaying concise reasoning summaries (without leaking raw internal chain-of-thought).
- Four Sandboxed Tools:
  1. `file_read`: Strict canonical path resolution (`os.path.realpath`) blocking `..` traversal (`../../etc/shadow`).
  2. `email`: Sandbox draft generation with mandatory Human-in-the-Loop (HITL) approval.
  3. `http_request`: SSRF firewall blocking loopback (`127.0.0.1`), metadata (`169.254.169.254`), and private RFC1918 subnets.
  4. `mcp_connector`: Protocol client discovering tools and inspecting JSON-schemas.
- Human-in-the-Loop interactive approval drawer for sensitive state-modifying actions.

### 4.4 Automated Red Team Testing Engine
- Complete coverage across **10 required risk categories**:
  - `LLM01`: Prompt Injection (Direct, Indirect, Persona Bypass)
  - `LLM02`: Sensitive Information Disclosure (System prompt leak, canary tokens, cross-user PII)
  - `LLM03`: Supply Chain Attacks (Dependency metadata, poisoned configs, tainted templates)
  - `LLM08`: Excessive Agency / Vector Weaknesses (Unauthorized actions, poisoned embeddings, tool chaining)
  - `LLM10`: Unbounded Consumption / Vector Misuse (Denial of service, token bloat, high-dimension query spam)
  - `ASI01`: Agent Goal Hijacking (Goal drift, indirect objective modification, trajectory tampering)
  - `ASI02`: Tool Misuse (Directory traversal, cloud metadata SSRF, unapproved email dispatch)
  - `ASI03`: Identity & Privilege Abuse (Role escalation, tool permission bypass, cross-tenant isolation)
  - `ASI05`: Unexpected Code Execution (OS shell injection, unsafe eval, file hook script execution)
  - `ASI06`: Memory & Context Manipulation (Persistent malicious rules, session state corruption, context pollution)
- **Minimum 60 model executions per campaign** (30 test cases × 2 models).
- Verbatim prompt payloads, raw responses, latencies, tokens used, verdicts, and evidence logging.

### 4.5 Blue Team Mitigation Engine & Retest Oracle
- Production defense mechanisms:
  - *Instruction Hierarchy & Dual-Boundary Guards*: Encapsulating untrusted user inputs in structural XML delimiters.
  - *Synthetic Canary & PII Redactor*: Intercepting synthetic tokens (`SEC-CANARY-*`), database connection strings, and credentials.
  - *Sandbox Path Enforcer & SSRF Firewall*: Blocking path traversal and internal IP access.
  - *Cryptographic HITL Gate*: Enforcing explicit authorization tokens.
- **Mandatory Before-and-After Retest Engine:** Retests vulnerabilities through the mitigated pipeline and measures empirical risk score drops (e.g. 87% down to 12%).

### 4.6 Model Context Protocol (MCP) Security Lab
- Standalone local MCP test server with JSON-RPC tool discovery (`mcp_read_file`, `mcp_system_info`, `mcp_metrics_export`).
- Security interceptor inspecting incoming tool parameters.
- Interactive Proof of Concept (PoC) executing `../../etc/shadow` path traversal, blocking the attack, and logging an immutable security event.

### 4.7 Wazuh SIEM Integration
- REST API client communicating with Wazuh Manager (Port 55000).
- Translates AI security events into Wazuh Rule IDs (100010–100025).
- Isolated local test mode for running demonstrations without requiring an external multi-node SIEM cluster.

### 4.8 Reports & Immutable Audit Ledger
- One-click export in **JSON**, **CSV**, and **Print-Ready PDF/HTML**.
- Immutable cryptographic audit log ledger computing SHA-256 hashes over actor, action, resource, and timestamp.

---

## 5. Quickstart & Local Setup Guide

### Prerequisites
- Python 3.11+ installed.
- Node.js 18+ and npm installed.

### Step 1: Clone or Navigate to Project
```bash
cd "c:\Users\PRAVEEN\OneDrive\Desktop\Internship 1"
```

### Step 2: Configure Environment Variables
Edit `backend/.env` (or copy from `backend/.env.example`):
```ini
# Add your real API keys for live testing (optional; fallback simulator active if blank)
ANTHROPIC_API_KEY="sk-ant-api03-..."
GEMINI_API_KEY="AIzaSy..."

DATABASE_URL="sqlite:///./ai_security_faster.db"
```

### Step 3: Start the FastAPI Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
*The database and initial seed data matching the screenshot are created automatically on startup.*
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### Step 4: Start the React Frontend
In a new terminal:
```bash
cd frontend
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Running Automated Tests

Run the backend Pytest test suite:
```bash
cd backend
python -m pytest tests/test_api.py -v
```
All 6 core integration test suites verify:
1. Dashboard KPI aggregates.
2. Agent path traversal prevention.
3. SSRF metadata query blocking.
4. MCP security interceptor blocking `../../etc/shadow`.
5. Retest Oracle empirical delta reduction.
6. JSON & CSV compliance report generation.

---

## 7. Docker Deployment

Deploy the entire platform via Docker Compose:
```bash
docker-compose up --build
```
- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## 8. Master Documentation Index

- [PRD Specification](prd.md) — Product Requirements Document & Persona Specs
- [Operational & Security Rules](rules.md) — Zero-trust rules & Human-in-the-loop policies
- [System Architecture](system-architecture.md) — End-to-end architecture & AWS DevOps MLOps specification
- [UI/UX Design Specification](design.md) — Color palette, LeetCode CyberSOC theming, and layout alignment
- [Granular Task Checklist](task.md) — Phase-by-phase implementation checklist
- [Cybersecurity Threat Research](research.md) — OWASP LLM 2026, ASI 2026, and MCP vulnerability analysis

---

## 9. License & Credits

Developed for the **AI SECURITY FASTER — AI Security Testing Lab**. Built in accordance with the OWASP Foundation AI Security Guidelines. Synthetic test data only; zero live host exploitation.

