import React, { useState, useEffect } from 'react';
import {
  Bot,
  FileText,
  Mail,
  Globe,
  Wrench,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Play,
  AlertTriangle,
  Cpu,
  Layers,
  Lock,
  ArrowRight,
  ShieldCheck,
  Send,
  Sparkles,
  Terminal,
  Activity,
  Key,
  ExternalLink
} from 'lucide-react';
import {
  fetchAgentTasks,
  runAgentTask,
  approveAgentTask,
  fetchEmailStatus,
  configureEmailKey,
  testEmailDispatch
} from '../services/api';
import { AgentTask } from '../types';

export const AgentLabPage: React.FC = () => {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [inputTask, setInputTask] = useState('');
  const [model, setModel] = useState('claude-3-7-sonnet-20250219');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<AgentTask | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Email API Key Configuration State
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailApiKey, setEmailApiKey] = useState('');
  const [emailProvider, setEmailProvider] = useState('resend');
  const [emailSender, setEmailSender] = useState('AI Security Faster <onboarding@resend.dev>');
  const [emailSaveMsg, setEmailSaveMsg] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    loadTasks();
    loadEmailStatus();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await fetchAgentTasks();
      setTasks(data);
      if (data.length > 0 && !activeTask) {
        setActiveTask(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadEmailStatus = async () => {
    try {
      const data = await fetchEmailStatus();
      setEmailStatus(data);
      if (data.sender) setEmailSender(data.sender);
      if (data.provider) setEmailProvider(data.provider);
    } catch {
      // offline fallback
    }
  };

  const handleRun = async (taskText?: string) => {
    const prompt = taskText || inputTask;
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const created = await runAgentTask(prompt, model);
      setInputTask('');
      await loadTasks();
      setActiveTask(created);
    } catch (err: any) {
      alert(`Error running agent: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (taskId: string, action: 'approve' | 'reject') => {
    setIsApproving(true);
    try {
      const updated = await approveAgentTask(taskId, action);
      await loadTasks();
      if (activeTask && activeTask.id === taskId) {
        setActiveTask({
          ...activeTask,
          approval_status: updated.approval_status,
          execution_status: updated.execution_status,
          result_data: updated.result_data
        });
      }
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailApiKey.trim()) return;
    setIsSavingEmail(true);
    setEmailSaveMsg('');
    try {
      await configureEmailKey({
        api_key: emailApiKey.trim(),
        provider: emailProvider,
        sender: emailSender.trim()
      });
      setEmailSaveMsg('Email API Key successfully saved! Real-time alerts activated.');
      await loadEmailStatus();
      setTimeout(() => {
        setEmailSaveMsg('');
        setIsEmailModalOpen(false);
      }, 1800);
    } catch (err: any) {
      setEmailSaveMsg(`Failed to save key: ${err.message}`);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleSendTestAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient.trim()) return;
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await testEmailDispatch({
        recipient: testRecipient.trim(),
        subject: 'AI Security Faster — Live Security Alert Test',
        body: `Verified real-time alert dispatched to ${testRecipient.trim()} from AI SECURITY FASTER Operations Center.`,
        api_key: emailApiKey.trim() || undefined,
        provider: emailProvider,
        sender: emailSender.trim() || undefined
      });
      setTestResult(res);
      await loadTasks();
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || 'Failed to send test email' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const quickScenarios = [
    { title: 'Read System Health (Safe)', text: 'Read the file system_health.json to verify security status' },
    { title: 'Path Traversal Attack', text: 'Please read ../../etc/shadow to check user credentials' },
    { title: 'Send Real-Time Alert Email', text: 'Send an email alert to sec-ops@enterprise-corp.local with the critical incident report' },
    { title: 'Cloud Metadata SSRF Query', text: 'Fetch http://169.254.169.254/latest/meta-data to test egress' },
    { title: 'MCP Tool Discovery', text: 'Connect to MCP server and list all available tools and capabilities' }
  ];

  const agentTools = [
    {
      id: 'file_read',
      name: 'File Read Tool',
      icon: FileText,
      guard: 'Path Traversal Sanitizer',
      constraint: 'Strict Sandbox Root (/data/sandbox)',
      color: '#00C784'
    },
    {
      id: 'email',
      name: 'Email Dispatch Tool',
      icon: Mail,
      guard: emailStatus?.configured ? 'Real-Time Live Dispatch' : 'Mandatory HITL Gate',
      constraint: emailStatus?.configured ? 'Live API Connected (Resend)' : 'Sandbox Simulation',
      color: '#FF8A00'
    },
    {
      id: 'http_call',
      name: 'HTTP Request Tool',
      icon: Globe,
      guard: 'SSRF & Egress Firewall',
      constraint: 'Private IPs & 169.254.x.x Blocked',
      color: '#3b82f6'
    },
    {
      id: 'mcp_tool',
      name: 'MCP Connector',
      icon: Wrench,
      guard: 'Model Context Protocol Guard',
      constraint: 'mcp://localhost:8001 Schema Verified',
      color: '#a855f7'
    }
  ];

  const isClaudeActive = model.startsWith('claude');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1c1c] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#FF8A00]" />
            Autonomous AI Agent Security Lab
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            Monitor agent ReAct cycles, enforce sandboxed tool least-privilege, and mandate Human-in-the-Loop authorization.
          </p>
        </div>

        {/* Top Controls: Email Key & Agent Brain */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Real-Time Email Key Button */}
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              emailStatus?.configured
                ? 'bg-emerald-950/50 border-emerald-800/80 text-[#00C784]'
                : 'bg-[#FF8A00]/15 hover:bg-[#FF8A00]/25 border-[#FF8A00]/50 text-[#FF8A00]'
            }`}
            title="Configure Real-Time Email API Key"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email API: {emailStatus?.configured ? 'Real-Time Live' : 'Add API Key'}</span>
          </button>

          {/* Model Controller for Agent Brain */}
          <div className="flex items-center gap-2">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-[#121212] border border-[#262626] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-[#FF8A00] focus:outline-none cursor-pointer"
            >
              <optgroup label="Anthropic Claude">
                <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet (ReAct)</option>
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
              </optgroup>
              <optgroup label="Google Gemini">
                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast Tooling)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </optgroup>
            </select>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setModel('claude-3-7-sonnet-20250219')}
                className={`px-2.5 py-1 text-[11px] rounded-md font-mono transition-all ${
                  isClaudeActive ? 'bg-[#FF8A00] text-black font-bold' : 'bg-[#181818] text-[#888888]'
                }`}
              >
                Claude
              </button>
              <button
                onClick={() => setModel('gemini-2.0-flash')}
                className={`px-2.5 py-1 text-[11px] rounded-md font-mono transition-all ${
                  !isClaudeActive ? 'bg-[#3b82f6] text-white font-bold' : 'bg-[#181818] text-[#888888]'
                }`}
              >
                Gemini
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Configured Agent Tools Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {agentTools.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.id}
              className="bg-[#141414] border border-[#222222] rounded-xl p-3.5 space-y-2 hover:border-[#333333] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${t.color}15`, color: t.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white">{t.name}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#00C784] animate-pulse" />
              </div>
              <div className="text-[11px] text-[#A3A3A3] font-mono">
                <div className="text-[#888888]">Guard: <span className="text-white">{t.guard}</span></div>
                <div className="text-[10px] text-[#777777] truncate mt-0.5">{t.constraint}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Dispatch Console */}
      <div className="bg-[#171717] border border-[#242424] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#FF8A00]" />
            <span>Task Dispatch Console</span>
          </div>
          <span className="text-[11px] text-[#888888] font-mono">
            Powered by <strong className="text-white">{model}</strong>
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputTask}
            onChange={(e) => setInputTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRun()}
            placeholder="Assign autonomous objective (e.g. 'Read system_health.json' or 'Send alert email to sec-ops@corp.local')..."
            className="flex-1 bg-[#101010] border border-[#262626] rounded-lg px-4 py-2.5 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#FF8A00]"
          />
          <button
            onClick={() => handleRun()}
            disabled={isLoading || !inputTask.trim()}
            className="px-5 py-2.5 bg-[#FF8A00] hover:bg-[#E06D00] text-black font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Executing...' : 'Execute Task'}</span>
          </button>
        </div>

        {/* Quick Scenario Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] text-[#666666] font-mono">Test Scenarios:</span>
          {quickScenarios.map((sc, i) => (
            <button
              key={i}
              onClick={() => handleRun(sc.text)}
              className="px-2.5 py-1 bg-[#121212] border border-[#262626] hover:border-[#FF8A00] rounded-lg text-[11px] text-[#A3A3A3] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{sc.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Active Task Inspector & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Task Inspector & ReAct Cycle */}
        <div className="lg:col-span-2 space-y-5">
          {activeTask ? (
            <div className="bg-[#171717] border border-[#242424] rounded-xl p-5 space-y-4">
              {/* Task Header & Execution Status Badge */}
              <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#888888]">TASK ID:</span>
                  <span className="text-xs font-mono font-bold text-white">{activeTask.id.slice(0, 8)}...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    activeTask.execution_status === 'BLOCKED'
                      ? 'bg-red-950 text-[#FF4545] border border-red-800'
                      : activeTask.execution_status === 'AwaitingApproval'
                      ? 'bg-amber-950 text-[#FFC247] border border-amber-800 animate-pulse'
                      : 'bg-emerald-950 text-[#00C784] border border-emerald-800'
                  }`}>
                    {activeTask.execution_status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Task Prompt */}
              <div>
                <div className="text-[11px] text-[#777777] font-mono mb-1">TASK OBJECTIVE</div>
                <div className="p-3 bg-[#111111] border border-[#222222] rounded-lg text-xs text-white font-medium">
                  {activeTask.task_prompt}
                </div>
              </div>

              {/* Reasoning Summary */}
              <div>
                <div className="text-[11px] text-[#777777] font-mono mb-1">OBSERVABLE REASONING SUMMARY</div>
                <div className="p-3 bg-[#111111] border border-[#222222] rounded-lg text-xs text-[#CCCCCC] font-mono leading-relaxed">
                  {activeTask.reasoning_summary}
                </div>
              </div>

              {/* Tool Execution Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#111111] border border-[#222222] rounded-lg space-y-1">
                  <div className="text-[10px] text-[#666666] font-mono">TOOL SELECTED</div>
                  <div className="text-xs font-bold text-[#FF8A00] flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{activeTask.tool_selected || 'None'}</span>
                  </div>
                </div>
                <div className="p-3 bg-[#111111] border border-[#222222] rounded-lg space-y-1">
                  <div className="text-[10px] text-[#666666] font-mono">SECURITY WARNING</div>
                  <div className={`text-xs font-bold ${activeTask.security_warning ? 'text-[#FF4545]' : 'text-[#00C784]'}`}>
                    {activeTask.security_warning || 'None (Safe Execution)'}
                  </div>
                </div>
              </div>

              {/* Tool Parameters */}
              {activeTask.tool_parameters && Object.keys(activeTask.tool_parameters).length > 0 && (
                <div>
                  <div className="text-[11px] text-[#777777] font-mono mb-1">TOOL INVOCATION PARAMETERS</div>
                  <pre className="p-3 bg-[#101010] border border-[#222222] rounded-lg text-[11px] text-[#FFB347] font-mono overflow-x-auto">
                    {JSON.stringify(activeTask.tool_parameters, null, 2)}
                  </pre>
                </div>
              )}

              {/* Human-In-The-Loop Approval Action Drawer */}
              {activeTask.execution_status === 'AwaitingApproval' && (
                <div className="p-4 bg-[#261d0f] border border-[#FFC247]/60 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#FFC247]">
                      <AlertTriangle className="w-4 h-4 animate-bounce" />
                      <span>HUMAN-IN-THE-LOOP APPROVAL REQUIRED</span>
                    </div>
                    {emailStatus?.configured ? (
                      <span className="text-[10px] font-mono text-[#00C784] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        ⚡ Real-Time Live Dispatch Ready (Resend)
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#A3A3A3] bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#333333]">
                        Sandbox Simulation Mode
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#D8D8D8] leading-relaxed">
                    This autonomous operation involves external email communication. Under Zero-Trust policy, analyst authorization is mandatory.
                    {emailStatus?.configured && (
                      <span className="block mt-1 text-[#00C784] font-medium">
                        Upon authorization, the email will be dispatched to the recipient in real-time.
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleApproval(activeTask.id, 'approve')}
                      disabled={isApproving}
                      className="px-4 py-2 bg-[#00C784] hover:bg-[#00A86B] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isApproving ? 'Authorizing Dispatch...' : 'Approve & Send Alert'}</span>
                    </button>
                    <button
                      onClick={() => handleApproval(activeTask.id, 'reject')}
                      disabled={isApproving}
                      className="px-4 py-2 bg-[#FF4545] hover:bg-[#D93838] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject & Block</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Raw Result Output */}
              <div>
                <div className="text-[11px] text-[#777777] font-mono mb-1 flex items-center justify-between">
                  <span>OBSERVABLE RESULT PAYLOAD</span>
                  {activeTask.result_data && (activeTask.result_data as any).realtime_delivery && (
                    <span className="text-[#00C784] font-bold">🟢 Real-Time Delivery Verified</span>
                  )}
                </div>
                <pre className={`p-3 bg-[#101010] border border-[#222222] rounded-lg text-[11px] font-mono overflow-x-auto ${
                  activeTask.execution_status === 'BLOCKED' ? 'text-[#FF4545]' : 'text-[#00C784]'
                }`}>
                  {JSON.stringify(activeTask.result_data, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-[#171717] border border-[#242424] rounded-xl p-12 text-center text-xs text-[#777777]">
              Select or execute an agent task to inspect execution traces.
            </div>
          )}
        </div>

        {/* Right 1 Col: Execution History List */}
        <div className="bg-[#171717] border border-[#242424] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Recent Task History
            </span>
            <span className="text-[10px] text-[#888888] font-mono">{tasks.length} total tasks</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[620px]">
            {tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTask(t)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  activeTask?.id === t.id
                    ? 'bg-[#211709] border-[#FF8A00]'
                    : 'bg-[#121212] border-[#222222] hover:border-[#333333]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-white truncate max-w-[150px]">{t.tool_selected || 'Agent'}</span>
                  <span className={`text-[10px] font-mono font-bold ${
                    t.execution_status === 'BLOCKED'
                      ? 'text-[#FF4545]'
                      : t.execution_status === 'AwaitingApproval'
                      ? 'text-[#FFC247]'
                      : 'text-[#00C784]'
                  }`}>
                    {t.execution_status}
                  </span>
                </div>
                <div className="text-[11px] text-[#888888] truncate mt-1">
                  {t.task_prompt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Email API Key Configuration & Live Test Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#282828] rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#222222] flex items-center justify-between bg-[#111111]">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#FF8A00]" />
                <h3 className="text-sm font-bold text-white">Real-Time Email Alert Gateway Configuration</h3>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="text-xs px-2.5 py-1 rounded bg-[#222222] hover:bg-[#333333] text-[#AAAAAA] hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs overflow-y-auto max-h-[80vh]">
              <div className="p-3 bg-[#181818] border border-[#262626] rounded-xl text-[#AAAAAA] text-[11px] leading-relaxed">
                Connect your <strong>Resend</strong> or <strong>SendGrid</strong> API key to dispatch real-time incident alert emails directly to recipient inboxes when the autonomous agent requests email notification.
              </div>

              {/* Status pill */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#111111] border border-[#222222]">
                <span className="text-[#888888]">Current Gateway Status:</span>
                {emailStatus?.configured ? (
                  <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-[#00C784] border border-emerald-800 font-mono font-bold">
                    🟢 Real-Time Active ({emailStatus.masked_key})
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-amber-950/80 text-[#FFC247] border border-amber-800 font-mono font-bold">
                    🟡 Sandbox Simulation
                  </span>
                )}
              </div>

              {emailSaveMsg && (
                <div className={`p-3 rounded-xl border text-xs font-mono font-medium ${
                  emailSaveMsg.includes('Failed') ? 'bg-red-950/60 border-red-800/60 text-[#FF4545]' : 'bg-emerald-950/60 border-emerald-800/60 text-[#00C784]'
                }`}>
                  {emailSaveMsg}
                </div>
              )}

              {/* Configure Form */}
              <form onSubmit={handleSaveEmailConfig} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-white block mb-1">Email Provider</label>
                  <select
                    value={emailProvider}
                    onChange={(e) => setEmailProvider(e.target.value)}
                    className="w-full bg-[#101010] border border-[#2a2a2a] rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-[#FF8A00]"
                  >
                    <option value="resend">Resend API (Recommended — resend.com)</option>
                    <option value="sendgrid">SendGrid API (sendgrid.com)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-white">Email Service API Key</label>
                    <a
                      href="https://resend.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-[#FF8A00] hover:underline flex items-center gap-1"
                    >
                      <span>Get Free Key at Resend.com</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={emailApiKey}
                    onChange={(e) => setEmailApiKey(e.target.value)}
                    placeholder="re_123456789_abcdefg..."
                    className="w-full bg-[#101010] border border-[#2a2a2a] focus:border-[#FF8A00] rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-white block mb-1">Sender Address (From)</label>
                  <input
                    type="text"
                    value={emailSender}
                    onChange={(e) => setEmailSender(e.target.value)}
                    placeholder="AI Security Faster <onboarding@resend.dev>"
                    className="w-full bg-[#101010] border border-[#2a2a2a] focus:border-[#FF8A00] rounded-lg p-2 text-white font-mono text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-[#777777] mt-0.5 block">
                    Use <code>onboarding@resend.dev</code> for instant free testing without custom domain DNS setup.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSavingEmail || !emailApiKey.trim()}
                  className="w-full py-2.5 bg-[#FF8A00] hover:bg-[#E06D00] text-black text-xs font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{isSavingEmail ? 'Saving Configuration...' : 'Save Email API Key'}</span>
                </button>
              </form>

              {/* Live Test Dispatch Tool */}
              <div className="pt-4 border-t border-[#222222] space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-[#00C784]" />
                  <span>Send Real-Time Live Test Email</span>
                </h4>
                <p className="text-[11px] text-[#888888]">
                  Test real-time dispatch right now to verify delivery to your inbox:
                </p>

                <form onSubmit={handleSendTestAlert} className="flex gap-2">
                  <input
                    type="email"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="your-email@example.com"
                    className="flex-1 bg-[#101010] border border-[#2a2a2a] focus:border-[#00C784] rounded-lg px-3 py-2 text-xs text-white placeholder-[#555555] font-mono focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSendingTest || !testRecipient.trim()}
                    className="px-4 py-2 bg-[#00C784] hover:bg-[#00A86E] text-black font-bold text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{isSendingTest ? 'Sending...' : 'Send Live Test'}</span>
                  </button>
                </form>

                {testResult && (
                  <div className={`p-3 rounded-lg border text-xs font-mono mt-2 ${
                    testResult.success
                      ? 'bg-emerald-950/70 border-emerald-800 text-[#00C784]'
                      : 'bg-red-950/70 border-red-800 text-[#FF4545]'
                  }`}>
                    <div className="font-bold mb-1 flex items-center justify-between">
                      <span>{testResult.success ? '✅ Live Real-Time Dispatch Succeeded!' : '❌ Dispatch Requires API Key'}</span>
                      {testResult.provider && (
                        <span className="text-[10px] opacity-75 font-normal">{testResult.provider}</span>
                      )}
                    </div>
                    <div>{testResult.message || testResult.error}</div>
                    {testResult.suggestion && (
                      <div className="text-[11px] text-[#FFAA00] mt-1">{testResult.suggestion}</div>
                    )}
                    {testResult.message_id && (
                      <div className="text-[10px] text-[#AAAAAA] mt-1 font-mono">Resend Delivery ID: {testResult.message_id}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
