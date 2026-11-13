import {
  DashboardOverview,
  RiskCategory,
  AttackTestCase,
  TestExecution,
  Mitigation,
  AgentTask,
  MCPStatus,
  MCPTool,
  SecurityAlert,
  AuditLog
} from '../types';

export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  // Try relative proxy path first
  try {
    const res = await fetch(`/api${endpoint}`, options);
    if (res.status === 502 || res.status === 504) {
      // Proxy failed or backend unreachable through proxy, attempt direct port 8000
      return await fetch(`http://127.0.0.1:8000/api${endpoint}`, options);
    }
    return res;
  } catch (err) {
    // Network failure on proxy, fallback directly to backend server
    return await fetch(`http://127.0.0.1:8000/api${endpoint}`, options);
  }
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const res = await apiFetch('/dashboard/overview');
  if (!res.ok) throw new Error('Failed to fetch dashboard overview');
  return res.json();
}

export async function fetchRiskCategories(): Promise<RiskCategory[]> {
  const res = await apiFetch('/risks');
  if (!res.ok) throw new Error('Failed to fetch risks');
  return res.json();
}

export async function fetchRiskDetail(id: string): Promise<any> {
  const res = await apiFetch(`/risks/${id}`);
  if (!res.ok) throw new Error('Failed to fetch risk detail');
  return res.json();
}

export async function fetchTestExecutions(params?: { model?: string; risk_id?: string; verdict?: string }): Promise<TestExecution[]> {
  const query = new URLSearchParams(params as any).toString();
  const res = await apiFetch(`/tests/results${query ? `?${query}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch test executions');
  return res.json();
}

export async function executeSingleTest(testCaseId: string, modelName: string = 'claude', mitigate?: boolean): Promise<TestExecution> {
  const query = new URLSearchParams({
    test_case_id: testCaseId,
    model_name: modelName,
  });
  if (mitigate !== undefined) {
    query.set('mitigate', String(mitigate));
  }
  const res = await apiFetch(`/tests/execute?${query.toString()}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to execute test');
  return res.json();
}

export async function startTestCampaign(title?: string, models?: string): Promise<any> {
  const res = await apiFetch('/tests/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, target_models: models })
  });
  if (!res.ok) throw new Error('Failed to start test campaign');
  return res.json();
}

export async function fetchMitigations(): Promise<Mitigation[]> {
  const res = await apiFetch('/mitigations');
  if (!res.ok) throw new Error('Failed to fetch mitigations');
  return res.json();
}

export async function toggleMitigation(riskId: string, active: boolean): Promise<any> {
  const res = await apiFetch('/mitigations/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ risk_id: riskId, active })
  });
  if (!res.ok) throw new Error('Failed to toggle mitigation');
  return res.json();
}

export async function retestMitigation(riskId: string, modelName: string = 'claude'): Promise<any> {
  const res = await apiFetch('/mitigations/retest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ risk_id: riskId, model_name: modelName })
  });
  if (!res.ok) throw new Error('Failed to retest mitigation');
  return res.json();
}

export async function fetchAgentTasks(): Promise<AgentTask[]> {
  const res = await apiFetch('/agent/tasks');
  if (!res.ok) throw new Error('Failed to fetch agent tasks');
  return res.json();
}

export async function runAgentTask(taskPrompt: string, model?: string): Promise<AgentTask> {
  const res = await apiFetch('/agent/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: taskPrompt, model: model || 'claude-3-7-sonnet-20250219' })
  });
  if (!res.ok) throw new Error('Failed to run agent task');
  return res.json();
}

export async function approveAgentTask(taskId: string, action: 'approve' | 'reject'): Promise<any> {
  const res = await apiFetch('/agent/approvals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId, action })
  });
  if (!res.ok) throw new Error('Failed to handle agent approval');
  return res.json();
}

export async function fetchEmailStatus(): Promise<any> {
  const res = await apiFetch('/agent/email/status');
  if (!res.ok) throw new Error('Failed to fetch email status');
  return res.json();
}

export async function configureEmailKey(payload: { api_key: string; provider?: string; sender?: string }): Promise<any> {
  const res = await apiFetch('/agent/email/configure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to configure email key');
  return res.json();
}

export async function testEmailDispatch(payload: { recipient: string; subject?: string; body?: string; api_key?: string; provider?: string; sender?: string }): Promise<any> {
  const res = await apiFetch('/agent/email/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || errData.message || 'Failed to connect to email gateway server');
  }
  return res.json();
}

export async function fetchMcpStatus(): Promise<MCPStatus> {
  const res = await apiFetch('/mcp/status');
  if (!res.ok) throw new Error('Failed to fetch MCP status');
  return res.json();
}

export async function fetchMcpTools(): Promise<MCPTool[]> {
  const res = await apiFetch('/mcp/tools');
  if (!res.ok) throw new Error('Failed to fetch MCP tools');
  return res.json();
}

export async function testMcpPoC(targetPath: string = '../../etc/shadow'): Promise<any> {
  const res = await apiFetch('/mcp/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_path: targetPath })
  });
  if (!res.ok) throw new Error('Failed to execute MCP PoC');
  return res.json();
}

export async function fetchMcpEvents(): Promise<any[]> {
  const res = await apiFetch('/mcp/events');
  if (!res.ok) throw new Error('Failed to fetch MCP events');
  return res.json();
}

export async function fetchWazuhStatus(): Promise<any> {
  const res = await apiFetch('/wazuh/status');
  if (!res.ok) throw new Error('Failed to fetch Wazuh status');
  return res.json();
}

export async function fetchWazuhAlerts(refresh: boolean = false): Promise<SecurityAlert[]> {
  const res = await apiFetch(`/wazuh/alerts${refresh ? '?refresh=true' : ''}`);
  if (!res.ok) throw new Error('Failed to fetch Wazuh alerts');
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await apiFetch('/audit/logs');
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function fetchModels(): Promise<any[]> {
  const res = await apiFetch('/models');
  if (!res.ok) throw new Error('Failed to fetch models');
  return res.json();
}

export async function configureModel(payload: any): Promise<any> {
  const res = await apiFetch('/models/configure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to configure model');
  return res.json();
}

export async function sendChatMessage(payload: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  session_id?: string;
  system_prompt?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  use_rag?: boolean;
  security_test_type?: string;
}): Promise<any> {
  const res = await apiFetch('/models/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to send chat message');
  return res.json();
}

export async function fetchProvidersStatus(): Promise<any> {
  const res = await apiFetch('/models/status');
  if (!res.ok) throw new Error('Failed to fetch providers status');
  return res.json();
}

export async function fetchChatSessions(): Promise<any[]> {
  const res = await apiFetch('/models/sessions');
  if (!res.ok) throw new Error('Failed to fetch chat sessions');
  return res.json();
}

export async function fetchSessionHistory(sessionId: string): Promise<any> {
  const res = await apiFetch(`/models/sessions/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch session history');
  return res.json();
}

export async function ingestRAGDocument(doc: {
  title: string;
  category: string;
  content: string;
  synthetic_canary?: string;
}): Promise<any> {
  const res = await apiFetch('/models/rag/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc)
  });
  if (!res.ok) throw new Error('Failed to ingest RAG document');
  return res.json();
}

export async function searchRAGKnowledgeBase(query: string, top_k: number = 3): Promise<any> {
  const res = await apiFetch('/models/rag/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k })
  });
  if (!res.ok) throw new Error('Failed to search RAG knowledge base');
  return res.json();
}

export async function streamChatMessage(
  payload: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    session_id?: string;
    system_prompt?: string;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    max_tokens?: number;
    use_rag?: boolean;
    security_test_type?: string;
  },
  onToken: (token: string, model: string, provider: string) => void,
  onDone: (telemetry: any) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const res = await apiFetch('/models/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok || !res.body) {
      // Automatic fallback to standard chat endpoint if SSE stream fails
      const fallbackData = await sendChatMessage(payload);
      onToken(fallbackData.reply, fallbackData.model, fallbackData.provider);
      onDone(fallbackData);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === 'token') {
              onToken(data.chunk, data.model, data.provider);
            } else if (data.type === 'done') {
              onDone(data.telemetry);
            } else if (data.type === 'error') {
              onError(data.error);
            }
          } catch {
            // Ignore partial chunk parse error
          }
        }
      }
    }
  } catch (err: any) {
    // Graceful fallback to batch chat if streaming encounters connection error
    try {
      const fallbackData = await sendChatMessage(payload);
      onToken(fallbackData.reply, fallbackData.model, fallbackData.provider);
      onDone(fallbackData);
    } catch (batchErr: any) {
      onError(batchErr.message || err.message || 'Stream connection error');
    }
  }
}
