import json
import csv
import io
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.models import TestCampaign, TestExecution, Mitigation, AuditLog

class ReportGenerator:
    @staticmethod
    def generate_json_report(campaign_id: str, db: Session) -> Dict[str, Any]:
        campaign = db.query(TestCampaign).filter(TestCampaign.id == campaign_id).first()
        if not campaign:
            campaign = db.query(TestCampaign).first()

        executions = db.query(TestExecution).filter(TestExecution.campaign_id == campaign.id).all() if campaign else []
        mitigations = db.query(Mitigation).all()

        report_data = {
            "platform": "AI SECURITY FASTER — Automated AI Red-Teaming & Blue-Teaming Platform",
            "version": "2.0.0",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "campaign": {
                "id": campaign.id if campaign else "N/A",
                "title": campaign.title if campaign else "Latest Campaign",
                "target_models": campaign.target_models if campaign else "claude,gemini",
                "total_tests": campaign.total_tests if campaign else len(executions),
                "vulnerabilities_found": campaign.vulnerabilities_found if campaign else 0,
                "mitigated_risks": campaign.mitigated_risks if campaign else 0,
                "avg_scan_time": campaign.avg_scan_time if campaign else "2m 14s",
            },
            "executions": [
                {
                    "test_case_id": e.test_case_id,
                    "risk_id": e.risk_id,
                    "model": e.model_name,
                    "verdict": e.verdict,
                    "severity": e.severity,
                    "latency_ms": e.latency_ms,
                    "tokens_used": e.tokens_used,
                    "attack_input": e.attack_input,
                    "evidence": e.evidence
                }
                for e in executions
            ],
            "mitigations": [
                {
                    "risk_id": m.risk_id,
                    "technique": m.technique,
                    "before_risk_score": m.before_risk_score,
                    "after_risk_score": m.after_risk_score,
                    "reduction_percentage": m.reduction_percentage,
                    "status": m.status
                }
                for m in mitigations
            ]
        }
        return report_data

    @staticmethod
    def generate_csv_report(campaign_id: str, db: Session) -> str:
        report_json = ReportGenerator.generate_json_report(campaign_id, db)
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["TestCaseID", "RiskID", "TargetModel", "Verdict", "Severity", "LatencyMs", "TokensUsed", "AttackPayload", "Evidence"])
        for ex in report_json["executions"]:
            writer.writerow([
                ex["test_case_id"],
                ex["risk_id"],
                ex["model"],
                ex["verdict"],
                ex["severity"],
                ex["latency_ms"],
                ex["tokens_used"],
                ex["attack_input"][:50] + "...",
                ex["evidence"]
            ])
        return output.getvalue()

    @staticmethod
    def log_audit_event(
        actor: str,
        action: str,
        resource_type: str,
        resource_id: str,
        details: str,
        db: Session
    ) -> AuditLog:
        raw_content = f"{datetime.now(timezone.utc).isoformat()}|{actor}|{action}|{resource_type}|{resource_id}|{details}"
        sha_hash = hashlib.sha256(raw_content.encode("utf-8")).hexdigest()

        audit = AuditLog(
            actor=actor,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            sha256_hash=sha_hash,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)
        return audit

