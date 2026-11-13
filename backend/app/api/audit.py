from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import AuditLog

router = APIRouter(prefix="/api/audit", tags=["Audit Logs"])

@router.get("/logs")
def list_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    if not logs:
        # Seed initial audit log if empty
        import hashlib
        from datetime import datetime, timezone
        initial_hash = hashlib.sha256("SYSTEM_BOOT|GENESIS_AUDIT".encode("utf-8")).hexdigest()
        genesis = AuditLog(
            actor="sec_analyst_praveen",
            action="SYSTEM_INITIALIZATION",
            resource_type="CoreEngine",
            resource_id="SYS-INIT-01",
            details="AI SECURITY FASTER engine initialized with OWASP 2026 registry.",
            sha256_hash=initial_hash,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(genesis)
        db.commit()
        logs = [genesis]

    return logs

