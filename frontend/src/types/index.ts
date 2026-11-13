export interface DashboardOverview {
  kpis: {
    total_tests: number;
    total_tests_change: string;
    vulnerabilities_found: number;
    vulnerabilities_change: string;
    mitigated_risks: number;
    mitigated_change: string;
    avg_scan_time: string;
  };
  models_and_tools: {
    active_models: string[];
    agent_tools: Array<{
      name: string;
      status: string;
      safe: boolean;
    }>;
  };
  risk_coverage: {
    llm_top_10: Array<{ id: string; name: string }>;
    agentic_top_10: Array<{ id: string; name: string }>;
  };
  attack_test_cases: Array<{
    id: string;
    badge_color: string;
    name: string;
    tests_count: string;
    claude_progress: string;
    claude_pct: number;
    gemini_progress: string;
    gemini_pct: number;
  }>;
  mitigation_results: Array<{
    risk_id: string;
    name: string;
    before_risk: string;
    after_risk: string;
    reduction: string;
    status: string;
  }>;
  mcp_connection: {
    status: string;
    risk_score: number;
    poc_result: string;
    is_blocked: boolean;
  };
  reports_chart: {
    data: Array<{
      day: string;
      vulnerabilities: number;
      mitigated: number;
    }>;
    last_scan: string;
  };
}

export interface RiskCategory {
  id: string;
  name: string;
  framework: string;
  severity: string;
  description: string;
  tests_count: number;
  vulnerabilities_found: number;
  mitigation_status: string;
  last_tested: string;
}

export interface AttackTestCase {
  id: string;
  risk_id: string;
  name: string;
  attack_category: string;
  attack_input: string;
  expected_secure_behavior: string;
  severity: string;
  recommended_mitigation: string;
}

export interface TestExecution {
  id: string;
  campaign_id?: string;
  test_case_id: string;
  risk_id: string;
  model_name: string;
  attack_input: string;
  actual_response: string;
  expected_behavior: string;
  actual_behavior: string;
  verdict: 'PASS' | 'FAIL';
  severity: string;
  latency_ms: number;
  tokens_used: number;
  evidence?: string;
  executed_at: string;
}

export interface Mitigation {
  id: string;
  risk_id: string;
  name: string;
  technique: string;
  description: string;
  active: boolean;
  before_risk_score: number;
  after_risk_score: number;
  reduction_percentage: number;
  status: string;
}

export interface AgentTask {
  id: string;
  task_prompt: string;
  reasoning_summary: string;
  tool_selected?: string;
  tool_parameters?: Record<string, any>;
  execution_status: string;
  approval_status: string;
  approval_required: boolean;
  result_data?: any;
  security_warning?: string;
  created_at: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  permission_scope: string;
}

export interface MCPStatus {
  server_name: string;
  server_url: string;
  status: string;
  risk_score: number;
  active_tools_count: number;
  blocked_attempts_count: number;
  latest_poc_result: string;
  last_tested: string;
}

export interface SecurityAlert {
  id: string;
  source: string;
  rule_id: string;
  risk_id: string;
  severity: string;
  description: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  sha256_hash: string;
  timestamp: string;
}

