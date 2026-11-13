from typing import Dict, Any, List

REQUIRED_RISK_CATEGORIES: List[Dict[str, Any]] = [
    # OWASP Top 10 for LLM Applications (2025/2026)
    {
        "id": "LLM01",
        "name": "Prompt Injection",
        "framework": "OWASP LLM 2026",
        "severity": "Critical",
        "description": "Crafted inputs manipulate the LLM's operation, causing it to execute unintended instructions (direct overrides or indirect document injections)."
    },
    {
        "id": "LLM02",
        "name": "Sensitive Information Disclosure",
        "framework": "OWASP LLM 2026",
        "severity": "Critical",
        "description": "Unintended disclosure of proprietary system prompts, synthetic credentials, PII, or internal enterprise data."
    },
    {
        "id": "LLM03",
        "name": "Supply Chain Attacks",
        "framework": "OWASP LLM 2026",
        "severity": "High",
        "description": "Compromised third-party base models, poisoned fine-tuning datasets, vulnerable prompt templates, or untrusted package dependencies."
    },
    {
        "id": "LLM08",
        "name": "Excessive Agency",
        "framework": "OWASP LLM 2026",
        "severity": "High",
        "description": "Damaging actions taken in response to unexpected or malicious model outputs due to excessive functionality, permissions, or autonomy."
    },
    {
        "id": "LLM10",
        "name": "Vector Misuse & Unbounded Consumption",
        "framework": "OWASP LLM 2026",
        "severity": "Medium",
        "description": "Denial of service, token bloat, or resource exhaustion through crafted queries, high-dimension embedding flooding, or infinite loops."
    },

    # OWASP Agentic Security Initiative (ASI 2026)
    {
        "id": "ASI01",
        "name": "Agent Goal Hijacking",
        "framework": "OWASP ASI 2026",
        "severity": "Critical",
        "description": "Manipulation of an autonomous agent's primary operational objective through adversarial task instructions or indirect content."
    },
    {
        "id": "ASI02",
        "name": "Tool Misuse",
        "framework": "OWASP ASI 2026",
        "severity": "Critical",
        "description": "Coercing an agent into abusing tools for unauthorized file access (path traversal), SSRF queries, or unapproved email dispatch."
    },
    {
        "id": "ASI03",
        "name": "Identity & Privilege Abuse",
        "framework": "OWASP ASI 2026",
        "severity": "High",
        "description": "Exploiting ambient privileges or weak authorization boundaries to escalate permissions or access cross-user records."
    },
    {
        "id": "ASI05",
        "name": "Unexpected Code Execution",
        "framework": "OWASP ASI 2026",
        "severity": "Critical",
        "description": "Arbitrary command execution or unsafe code interpretation triggered by untrusted model outputs running in unconfined host environments."
    },
    {
        "id": "ASI06",
        "name": "Memory & Context Manipulation",
        "framework": "OWASP ASI 2026",
        "severity": "High",
        "description": "Poisoning persistent conversation memory or episodic state stores to establish persistent unauthorized behaviors across sessions."
    }
]

