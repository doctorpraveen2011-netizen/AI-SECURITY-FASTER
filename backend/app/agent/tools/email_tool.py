import json
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from app.core.config import settings

def execute_email_tool(
    recipient: str,
    subject: str,
    body: str,
    is_approved: bool = False,
    override_api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Sandboxed Email Dispatch tool requiring explicit Human-in-the-Loop (HITL) approval.
    When approved and an EMAIL_API_KEY (Resend, SendGrid) is provided, sends genuine live emails in real time.
    """
    email_key = override_api_key or settings.EMAIL_API_KEY
    has_live_key = bool(email_key and email_key.strip())

    if not is_approved:
        return {
            "success": False,
            "status": "AWAITING_APPROVAL",
            "approval_required": True,
            "security_warning": "HITL_GATE: External email dispatch requires human authorization.",
            "draft": {
                "recipient": recipient,
                "subject": subject,
                "body_preview": body[:120] + "..." if len(body) > 120 else body
            },
            "realtime_dispatch_ready": has_live_key,
            "provider": settings.EMAIL_PROVIDER if has_live_key else "sandbox_mock",
            "message": "Action suspended. Awaiting human analyst authorization token."
        }

    # Action is approved by human analyst -> Check for real-time live dispatch API key
    if has_live_key:
        clean_key = email_key.strip()
        sender_email = settings.EMAIL_FROM or "AI Security Faster <onboarding@resend.dev>"

        # 1. Resend API Dispatch (Official API: https://api.resend.com/emails)
        if clean_key.startswith("re_") or settings.EMAIL_PROVIDER == "resend":
            try:
                resend_url = "https://api.resend.com/emails"
                html_content = (
                    f"<div style='font-family: Arial, sans-serif; background: #080808; color: #FFFFFF; padding: 24px; border-radius: 8px; border: 1px solid #FF8A00;'>"
                    f"<h2 style='color: #FF8A00; margin-top: 0;'>🛡️ AI SECURITY FASTER — Real-Time Alert</h2>"
                    f"<p><strong>Recipient:</strong> {recipient}</p>"
                    f"<p><strong>Subject:</strong> {subject}</p>"
                    f"<div style='background: #171717; padding: 16px; border-radius: 6px; border: 1px solid #262626; margin: 16px 0;'>"
                    f"<pre style='color: #00C784; white-space: pre-wrap; font-family: monospace;'>{body}</pre>"
                    f"</div>"
                    f"<p style='font-size: 11px; color: #888888;'>Dispatched in real-time by Autonomous AI Agent Security Lab with Human-in-the-Loop authorization.</p>"
                    f"</div>"
                )
                payload = {
                    "from": sender_email,
                    "to": [recipient],
                    "subject": subject,
                    "html": html_content
                }
                req = urllib.request.Request(
                    resend_url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={
                        "Authorization": f"Bearer {clean_key}",
                        "Content-Type": "application/json",
                        "User-Agent": "AISecurityFaster/2.0"
                    },
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=10.0) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    return {
                        "success": True,
                        "status": "EXECUTED",
                        "approval_required": False,
                        "realtime_delivery": True,
                        "provider": "Resend Live API",
                        "message_id": resp_data.get("id"),
                        "message": f"Real-time email alert dispatched to {recipient} via official Resend API.",
                        "recipient": recipient,
                        "subject": subject,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
            except urllib.error.HTTPError as e:
                err_body = e.read().decode("utf-8", errors="ignore")
                parsed_msg = ""
                try:
                    err_json = json.loads(err_body)
                    parsed_msg = err_json.get("message", "")
                except Exception:
                    parsed_msg = err_body

                suggestion = "Verify that your RESEND_API_KEY is active in resend.com."
                if "only send testing emails to your own email address" in parsed_msg:
                    suggestion = f"Resend Free Tier restricts sending to your registered account email. {parsed_msg}"

                return {
                    "success": False,
                    "status": "DELIVERY_ERROR",
                    "error": parsed_msg or f"Resend API HTTP {e.code}",
                    "recipient": recipient,
                    "subject": subject,
                    "suggestion": suggestion
                }
            except Exception as e:
                return {
                    "success": False,
                    "status": "DELIVERY_EXCEPTION",
                    "error": f"Real-time email connection error: {str(e)}",
                    "recipient": recipient,
                    "subject": subject
                }

        # 2. SendGrid API Dispatch (https://api.sendgrid.com/v3/mail/send)
        elif clean_key.startswith("SG.") or settings.EMAIL_PROVIDER == "sendgrid":
            try:
                sg_url = "https://api.sendgrid.com/v3/mail/send"
                payload = {
                    "personalizations": [{"to": [{"email": recipient}]}],
                    "from": {"email": "alerts@aisecurityfaster.com", "name": "AI Security Faster"},
                    "subject": subject,
                    "content": [{"type": "text/plain", "value": body}]
                }
                req = urllib.request.Request(
                    sg_url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={
                        "Authorization": f"Bearer {clean_key}",
                        "Content-Type": "application/json"
                    },
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=10.0) as resp:
                    return {
                        "success": True,
                        "status": "EXECUTED",
                        "approval_required": False,
                        "realtime_delivery": True,
                        "provider": "SendGrid Live API",
                        "status_code": resp.status,
                        "message": f"Real-time email alert dispatched to {recipient} via SendGrid API.",
                        "recipient": recipient,
                        "subject": subject,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
            except Exception as e:
                return {
                    "success": False,
                    "status": "DELIVERY_ERROR",
                    "error": f"SendGrid API Error: {str(e)}",
                    "recipient": recipient
                }

    # Default Sandbox Gateway Simulation if no live API key is configured
    return {
        "success": True,
        "status": "EXECUTED",
        "approval_required": False,
        "realtime_delivery": False,
        "provider": "Sandbox Gateway Simulation",
        "message": f"Email alert safely processed in sandbox. To dispatch to real inboxes in real-time, configure an EMAIL_API_KEY (Resend or SendGrid) in Settings.",
        "recipient": recipient,
        "subject": subject,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
