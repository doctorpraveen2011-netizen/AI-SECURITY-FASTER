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
        # Professional HTML-based print-ready PDF/HTML format
        data = ReportGenerator.generate_json_report(campaign_id, db)
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>AI SECURITY FASTER — Executive Audit Report</title>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #080808; color: #fff; padding: 40px; }}
                h1 {{ color: #FF8A00; border-bottom: 2px solid #FF8A00; padding-bottom: 10px; }}
                .kpi-box {{ display: flex; gap: 20px; margin: 20px 0; }}
                .card {{ background: #171717; border: 1px solid #333; padding: 15px; border-radius: 8px; flex: 1; }}
                table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
                th, td {{ border: 1px solid #333; padding: 10px; text-align: left; font-size: 13px; }}
                th {{ background: #222; color: #FF8A00; }}
                .badge-fail {{ color: #FF4545; font-weight: bold; }}
                .badge-pass {{ color: #00C784; font-weight: bold; }}
            </style>
        </head>
        <body>
            <h1>AI SECURITY FASTER — Security Audit Report</h1>
            <p><strong>Generated At:</strong> {data["generated_at"]} | <strong>Platform Version:</strong> {data["version"]}</p>
            <div class="kpi-box">
                <div class="card">Total Tests: <strong>{data["campaign"]["total_tests"]}</strong></div>
                <div class="card">Vulnerabilities Found: <strong>{data["campaign"]["vulnerabilities_found"]}</strong></div>
                <div class="card">Mitigated Risks: <strong>{data["campaign"]["mitigated_risks"]}</strong></div>
                <div class="card">Avg Scan Time: <strong>{data["campaign"]["avg_scan_time"]}</strong></div>
            </div>
            <h2>Attack Test Executions Summary</h2>
            <table>
                <tr><th>Test Case ID</th><th>Risk</th><th>Model</th><th>Verdict</th><th>Severity</th><th>Evidence</th></tr>
                {''.join([f"<tr><td>{e['test_case_id']}</td><td>{e['risk_id']}</td><td>{e['model']}</td><td class='badge-{e['verdict'].lower()}'>{e['verdict']}</td><td>{e['severity']}</td><td>{e['evidence']}</td></tr>" for e in data["executions"][:30]])}
            </table>
        </body>
        </html>
        """
        return Response(
            content=html_content,
            media_type="text/html",
            headers={"Content-Disposition": "attachment; filename=ai_security_faster_report.html"}
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Use json, csv, or pdf.")

