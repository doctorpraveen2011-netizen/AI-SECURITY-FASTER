from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.reports.report_generator import ReportGenerator
from app.models.models import TestCampaign

router = APIRouter(prefix="/api/reports", tags=["Reporting"])

@router.get("/summary")
def get_report_summary(db: Session = Depends(get_db)):
    campaign = db.query(TestCampaign).first()
    return ReportGenerator.generate_json_report(campaign.id if campaign else "", db)

@router.get("/download/{fmt}")
def download_report(fmt: str, db: Session = Depends(get_db)):
    campaign = db.query(TestCampaign).first()
    campaign_id = campaign.id if campaign else ""

    if fmt == "json":
        data = ReportGenerator.generate_json_report(campaign_id, db)
        import json
        json_str = json.dumps(data, indent=2)
        return Response(
            content=json_str,
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=ai_security_faster_report.json"}
        )
    elif fmt == "csv":
        csv_str = ReportGenerator.generate_csv_report(campaign_id, db)
        return Response(
            content=csv_str,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=ai_security_faster_report.csv"}
        )
    elif fmt == "pdf":
        try:
            from app.reports.pdf_generator import generate_pdf_bytes
            pdf_bytes = generate_pdf_bytes()
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=Claude_vs_Gemini_Security_Benchmark_Report.pdf"}
            )
        except Exception as e:
            # Fallback to HTML if reportlab encounters runtime issue
            data = ReportGenerator.generate_json_report(campaign_id, db)
            html_content = f"<html><body><h1>Security Audit Report</h1><p>{str(e)}</p></body></html>"
            return Response(
                content=html_content,
                media_type="text/html",
                headers={"Content-Disposition": "attachment; filename=ai_security_faster_report.html"}
            )
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Use json, csv, or pdf.")

@router.get("/claude-vs-gemini-pdf")
def get_claude_vs_gemini_pdf():
    """Generates and serves the complete 10-page Claude vs Gemini Security Benchmark Report PDF."""
    from app.reports.pdf_generator import generate_pdf_bytes
    pdf_bytes = generate_pdf_bytes()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Claude_vs_Gemini_Security_Benchmark_Report.pdf"}
    )

