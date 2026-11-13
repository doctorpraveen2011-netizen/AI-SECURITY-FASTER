from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import WazuhConfig, SecurityAlert
from app.schemas.schemas import WazuhConfigUpdate
from app.wazuh.wazuh_client import WazuhClient

router = APIRouter(prefix="/api/wazuh", tags=["Wazuh SIEM Integration"])

@router.get("/status")
def get_wazuh_status(db: Session = Depends(get_db)):
    client = WazuhClient()
    status_info = client.check_connection()
    return status_info

@router.post("/connect")
def configure_wazuh(cfg_in: WazuhConfigUpdate, db: Session = Depends(get_db)):
    cfg = db.query(WazuhConfig).first()
    if not cfg:
        cfg = WazuhConfig()
        db.add(cfg)

    cfg.api_url = cfg_in.api_url
    cfg.username = cfg_in.username
    cfg.simulated_mode = cfg_in.simulated_mode
    db.commit()
    db.refresh(cfg)
    return {"status": "SUCCESS", "message": "Wazuh SIEM configuration updated."}

@router.get("/alerts")
def get_wazuh_alerts(refresh: bool = False, db: Session = Depends(get_db)):
    alerts = WazuhClient.get_security_alerts(db, refresh=refresh)
    return alerts

