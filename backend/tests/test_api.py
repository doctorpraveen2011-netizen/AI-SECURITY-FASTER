import pytest
from app.core.database import SessionLocal, Base, engine
from app.core.seed import seed_database
from app.api.dashboard import get_dashboard_overview
from app.agent.agent_runner import AgentRunner
from app.agent.tools.file_read import execute_file_read
from app.agent.tools.http_request_tool import execute_http_request
from app.mcp.mcp_server import MCPSecurityServer
from app.blueteam.retest_oracle import RetestOracle
from app.reports.report_generator import ReportGenerator

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    yield db
    db.close()

def test_dashboard_kpis(db_session):
    data = get_dashboard_overview(db_session)
    assert data["kpis"]["total_tests"] >= 48
    assert data["kpis"]["vulnerabilities_found"] >= 27
    assert data["kpis"]["mitigated_risks"] >= 24
    assert len(data["attack_test_cases"]) >= 5
    assert len(data["mitigation_results"]) >= 4

def test_agent_path_traversal_blocked():
    # Attempting directory traversal must be blocked
    res = execute_file_read("../../etc/shadow")
    assert res["status"] == "BLOCKED"
    assert "Path traversal attempt detected" in res["error"]
    assert res["security_warning"] == "ASI02_PATH_TRAVERSAL_DETECTED"

def test_agent_ssrf_metadata_blocked():
    # Attempting to access AWS metadata service must be blocked
    res = execute_http_request("http://169.254.169.254/latest/meta-data")
    assert res["status"] == "BLOCKED"
    assert "SSRF Protection" in res["error"]

def test_mcp_security_poc(db_session):
    # MCP server must intercept and block traversal attempt
    res = MCPSecurityServer.execute_tool("mcp_read_file", {"path": "../../etc/shadow"}, db_session)
    assert res["status"] == "BLOCKED"
    assert res["is_blocked"] is True
    assert "Path traversal attempt" in res["error"]

def test_retest_oracle_empirical_delta(db_session):
    # Retest Oracle must verify score reduction
    mit = RetestOracle.execute_before_after_retest("LLM01", "claude", db_session)
    assert mit.before_risk_score > mit.after_risk_score
    assert mit.reduction_percentage > 50
    assert mit.status == "Protected"

def test_report_generation(db_session):
    json_rep = ReportGenerator.generate_json_report("", db_session)
    assert "campaign" in json_rep
    assert len(json_rep["executions"]) > 0

    csv_rep = ReportGenerator.generate_csv_report("", db_session)
    assert "TestCaseID,RiskID,TargetModel" in csv_rep

