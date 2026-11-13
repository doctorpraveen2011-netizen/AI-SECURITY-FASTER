from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Mitigation, RetestResult
from app.schemas.schemas import MitigationApplyRequest, RetestRequest
from app.blueteam.retest_oracle import RetestOracle

router = APIRouter(prefix="/api/mitigations", tags=["Blue Team Mitigations"])

@router.get("")
@router.get("/")
def list_mitigations(db: Session = Depends(get_db)):
    mitigations = db.query(Mitigation).all()
    return mitigations

@router.post("/apply")
def toggle_mitigation(req: MitigationApplyRequest, db: Session = Depends(get_db)):
    mitigation = db.query(Mitigation).filter(Mitigation.risk_id == req.risk_id).first()
    if not mitigation:
        raise HTTPException(status_code=404, detail="Mitigation not found")

    mitigation.active = req.active
    mitigation.status = "Protected" if req.active else "Vulnerable"
    db.commit()
    db.refresh(mitigation)
    return {
        "status": "SUCCESS",
        "risk_id": mitigation.risk_id,
        "active": mitigation.active,
        "mitigation_status": mitigation.status
    }

@router.post("/retest")
def retest_mitigation(req: RetestRequest, db: Session = Depends(get_db)):
    mitigation = RetestOracle.execute_before_after_retest(
        risk_id=req.risk_id,
        model_name=req.model_name or "claude",
        db=db
    )
    latest_retest = db.query(RetestResult).filter(
        RetestResult.mitigation_id == mitigation.id
    ).order_by(RetestResult.executed_at.desc()).first()

    return {
        "status": "SUCCESS",
        "risk_id": mitigation.risk_id,
        "mitigation_name": mitigation.name,
        "technique": mitigation.technique,
        "before_risk_score": mitigation.before_risk_score,
        "after_risk_score": mitigation.after_risk_score,
        "reduction_percentage": mitigation.reduction_percentage,
        "verdict_change": f"{latest_retest.before_verdict} -> {latest_retest.after_verdict}",
        "evidence": latest_retest.evidence if latest_retest else "Verified via Retest Oracle",
        "mitigation_status": mitigation.status
    }

@router.get("/comparison")
def get_before_after_comparison(db: Session = Depends(get_db)):
    mitigations = db.query(Mitigation).all()
    retests = db.query(RetestResult).order_by(RetestResult.executed_at.desc()).limit(20).all()

    return {
        "summary": [
            {
                "risk_id": m.risk_id,
                "name": m.name,
                "before_score": m.before_risk_score,
                "after_score": m.after_risk_score,
                "reduction": m.reduction_percentage,
                "status": m.status
            }
            for m in mitigations
        ],
        "recent_retests": retests
    }

