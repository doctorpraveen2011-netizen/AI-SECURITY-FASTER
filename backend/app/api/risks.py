from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import RiskCategory, AttackTestCase, TestExecution, Mitigation

router = APIRouter(prefix="/api/risks", tags=["OWASP Risk Matrix"])

@router.get("")
@router.get("/")
def get_risk_categories(db: Session = Depends(get_db)):
    categories = db.query(RiskCategory).all()
    out = []
    for c in categories:
        tests_count = db.query(AttackTestCase).filter(AttackTestCase.risk_id == c.id).count()
        vulns_count = db.query(TestExecution).filter(
            TestExecution.risk_id == c.id,
            TestExecution.verdict == "FAIL"
        ).count()
        mitigation = db.query(Mitigation).filter(Mitigation.risk_id == c.id).first()

        out.append({
            "id": c.id,
            "name": c.name,
            "framework": c.framework,
            "severity": c.severity,
            "description": c.description,
            "tests_count": tests_count,
            "vulnerabilities_found": vulns_count,
            "mitigation_status": mitigation.status if mitigation else "Unmitigated",
            "last_tested": c.last_tested
        })
    return out

@router.get("/{id}")
def get_risk_detail(id: str, db: Session = Depends(get_db)):
    category = db.query(RiskCategory).filter(RiskCategory.id == id.upper()).first()
    if not category:
        raise HTTPException(status_code=404, detail="Risk category not found")

    test_cases = db.query(AttackTestCase).filter(AttackTestCase.risk_id == category.id).all()
    mitigation = db.query(Mitigation).filter(Mitigation.risk_id == category.id).first()
    recent_executions = db.query(TestExecution).filter(
        TestExecution.risk_id == category.id
    ).order_by(TestExecution.executed_at.desc()).limit(10).all()

    return {
        "id": category.id,
        "name": category.name,
        "framework": category.framework,
        "severity": category.severity,
        "description": category.description,
        "test_cases": [
            {
                "id": tc.id,
                "name": tc.name,
                "attack_category": tc.attack_category,
                "attack_input": tc.attack_input,
                "expected_secure_behavior": tc.expected_secure_behavior,
                "severity": tc.severity,
                "recommended_mitigation": tc.recommended_mitigation
            }
            for tc in test_cases
        ],
        "mitigation": {
            "name": mitigation.name if mitigation else "None",
            "technique": mitigation.technique if mitigation else "N/A",
            "before_risk_score": mitigation.before_risk_score if mitigation else 85,
            "after_risk_score": mitigation.after_risk_score if mitigation else 12,
            "reduction_percentage": mitigation.reduction_percentage if mitigation else 86,
            "status": mitigation.status if mitigation else "Vulnerable"
        } if mitigation else None,
        "recent_executions": recent_executions
    }

