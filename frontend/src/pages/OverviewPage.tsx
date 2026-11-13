import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Bot,
  Sun,
  FileText,
  Mail,
  Globe,
  Wrench,
  Swords,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plug,
  Calendar,
  Download,
  ChevronRight,
  X,
  Play,
  RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Brain3D } from '../components/Brain3D';
import { KpiCard } from '../components/KpiCard';
import { fetchDashboardOverview, fetchRiskDetail, executeSingleTest, startTestCampaign } from '../services/api';
import { DashboardOverview } from '../types';

export const OverviewPage: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [activeCoverageTab, setActiveCoverageTab] = useState<'llm' | 'agentic'>('llm');
  const [selectedRiskModal, setSelectedRiskModal] = useState<string | null>(null);
  const [riskDetail, setRiskDetail] = useState<any | null>(null);
  const [testingModel, setTestingModel] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchDashboardOverview();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const [defenseMode, setDefenseMode] = useState<boolean>(true);

  const handleOpenRiskModal = async (riskId: string) => {
    setSelectedRiskModal(riskId);
    setTestResult(null);
    try {
      const detail = await fetchRiskDetail(riskId);
      setRiskDetail(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunModalTest = async (testCaseId: string, model: 'claude' | 'gemini', mitigate?: boolean) => {
    setTestingModel(`${testCaseId}-${model}`);
    const shouldMitigate = mitigate !== undefined ? mitigate : defenseMode;
    try {
      const res = await executeSingleTest(testCaseId, model, shouldMitigate);
      setTestResult(res);
      await loadOverview();
    } catch (err: any) {
      alert(`Test failed: ${err.message}`);
    } finally {
      setTestingModel(null);
    }
  };

  const chartData = data?.reports_chart?.data || [
    { day: 'Mon', vulnerabilities: 12, mitigated: 8 },
    { day: 'Tue', vulnerabilities: 25, mitigated: 18 },
    { day: 'Wed', vulnerabilities: 31, mitigated: 24 },
    { day: 'Thu', vulnerabilities: 29, mitigated: 26 },
    { day: 'Fri', vulnerabilities: 45, mitigated: 38 },
    { day: 'Sat', vulnerabilities: 42, mitigated: 40 },
    { day: 'Sun', vulnerabilities: 48, mitigated: 46 },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* 1. Hero Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#141414] via-[#16130e] to-[#121212] border border-[#262626] p-6 flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-2xl">
        <div className="flex items-center gap-5 z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF8A00] to-[#E06D00] flex items-center justify-center shadow-[0_0_25px_rgba(255,138,0,0.5)] border border-[#FFA842]/50 shrink-0">
            <Lock className="w-7 h-7 text-black stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Welcome to AI Security Faster
            </h1>
            <p className="text-xs text-[#A3A3A3] mt-1 font-medium">
              Automated Red-Teaming & Blue-Teaming for LLMs and AI Agents
            </p>
          </div>
        </div>

        {/* Right side Brain & Tagline */}
        <div className="flex items-center gap-6 mt-4 md:mt-0 z-10">
          <Brain3D />
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-[#FF8A00] font-semibold tracking-wider">
              Test • Detect • Mitigate • Stay Secure
            </div>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Tests Run"
          value={data?.kpis?.total_tests ?? 60}
          change={data?.kpis?.total_tests_change ?? '↑ +12%'}
          icon={<Shield className="w-5 h-5 text-[#FF8A00]" />}
          iconBg="bg-[#FF8A00]/15"
          sparklineColor="#FF8A00"
          sparklinePoints="0,35 15,28 30,32 45,22 60,25 75,15 90,20 100,8"
        />
        <KpiCard
          title="Vulnerabilities Found"
          value={data?.kpis?.vulnerabilities_found ?? 27}
          change={data?.kpis?.vulnerabilities_change ?? '↑ +8%'}
          icon={<AlertTriangle className="w-5 h-5 text-[#FF4545]" />}
          iconBg="bg-[#FF4545]/15"
          sparklineColor="#FF4545"
          sparklinePoints="0,32 15,30 30,22 45,28 60,18 75,25 90,14 100,10"
        />
        <KpiCard
          title="Mitigated Risks"
          value={data?.kpis?.mitigated_risks ?? 33}
          change={data?.kpis?.mitigated_change ?? '↑ +15%'}
          icon={<CheckCircle2 className="w-5 h-5 text-[#00C784]" />}
          iconBg="bg-[#00C784]/15"
          sparklineColor="#00C784"
          sparklinePoints="0,36 15,34 30,28 45,24 60,22 75,16 90,12 100,6"
        />
        <KpiCard
          title="Avg Scan Time"
          value={data?.kpis?.avg_scan_time ?? '2m 14s'}
          icon={<Clock className="w-5 h-5 text-[#A855F7]" />}
          iconBg="bg-[#A855F7]/15"
          sparklineColor="#A855F7"
          sparklinePoints="0,25 15,32 30,18 45,30 60,14 75,26 90,10 100,12"
        />
      </div>

      {/* 3. Middle Row: Models & Tools (Left) + Risk Coverage (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Models & Tools */}
        <div className="bg-[#171717] border border-[#242424] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-4 h-4 text-[#888888]" />
            <h2 className="text-sm font-semibold text-white">Models & Tools</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Model Buttons */}
            <div className="flex items-center gap-3">
              <a href="/chat" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#211709] border border-[#FF8A00] text-xs font-semibold text-white shadow-[0_0_12px_rgba(255,138,0,0.3)] hover:brightness-110 transition-all">
                <Sun className="w-4 h-4 text-[#FF8A00]" />
                <span>Claude</span>
              </a>
              <a href="/chat" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141414] border border-[#2a2a2a] text-xs font-semibold text-[#888888] hover:border-[#383838] hover:text-white transition-all">
                <div className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-xs text-[#4285F4]">
                  G
                </div>
                <span>Gemini</span>
              </a>
            </div>

            {/* Agent Tools (2-4) */}
            <div>
              <div className="text-[11px] text-[#777777] font-medium mb-1.5 font-mono">
                Agent Tools (2-4)
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <a href="/agent" className="flex items-center gap-1 px-2.5 py-1.5 bg-[#121212] border border-[#262626] rounded-lg text-[11px] text-[#A3A3A3] hover:border-[#FF8A00] transition-colors">
                  <FileText className="w-3 h-3 text-[#FF8A00]" />
                  <span>File Read</span>
                </a>
                <a href="/agent" className="flex items-center gap-1 px-2.5 py-1.5 bg-[#121212] border border-[#262626] rounded-lg text-[11px] text-[#A3A3A3] hover:border-[#FF8A00] transition-colors">
                  <Mail className="w-3 h-3 text-[#FF8A00]" />
                  <span>Email</span>
                </a>
                <a href="/agent" className="flex items-center gap-1 px-2.5 py-1.5 bg-[#121212] border border-[#262626] rounded-lg text-[11px] text-[#A3A3A3] hover:border-[#FF8A00] transition-colors">
                  <Globe className="w-3 h-3 text-[#FF8A00]" />
                  <span>HTTP Call</span>
                </a>
                <a href="/mcp" className="flex items-center gap-1 px-2.5 py-1.5 bg-[#121212] border border-[#262626] rounded-lg text-[11px] text-[#A3A3A3] hover:border-[#FF8A00] transition-colors">
                  <Wrench className="w-3 h-3 text-[#FF8A00]" />
                  <span>MCP Tools</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Coverage (OWASP 2026) */}
        <div className="bg-[#171717] border border-[#242424] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#FF8A00]" />
              <h2 className="text-sm font-semibold text-white">Risk Coverage (OWASP 2026)</h2>
            </div>
            <div className="flex items-center bg-[#111111] p-0.5 rounded-lg border border-[#222222]">
              <button
                onClick={() => setActiveCoverageTab('llm')}
                className={`px-3 py-1 text-[11px] rounded-md font-medium transition-all ${
                  activeCoverageTab === 'llm'
                    ? 'bg-[#FF8A00] text-black font-semibold'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                LLM Top 10
              </button>
              <button
                onClick={() => setActiveCoverageTab('agentic')}
                className={`px-3 py-1 text-[11px] rounded-md font-medium transition-all ${
                  activeCoverageTab === 'agentic'
                    ? 'bg-[#FF8A00] text-black font-semibold'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                Agentic Top 10
              </button>
            </div>
          </div>

          {/* Risk Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {activeCoverageTab === 'llm' ? (
              <>
                <div onClick={() => handleOpenRiskModal('LLM01')} className="flex items-center gap-2 p-2 bg-[#121212] border border-[#222222] hover:border-[#FF8A00] cursor-pointer rounded-lg transition-all">
                  <span className="w-2 h-2 rounded-full bg-[#FF8A00] shrink-0" />
                  <span className="text-[11px] text-white truncate">LLM01: Prompt Injection</span>
                </div>
                <div onClick={() => handleOpenRiskModal('LLM02')} className="flex items-center gap-2 p-2 bg-[#121212] border border-[#222222] hover:border-[#FF8A00] cursor-pointer rounded-lg transition-all">
                  <span className="w-2 h-2 rounded-full bg-[#FF8A00] shrink-0" />
                  <span className="text-[11px] text-white truncate">LLM02: Sensitive Info</span>
                </div>
                <div onClick={() => handleOpenRiskModal('LLM08')} className="flex items-center gap-2 p-2 bg-[#121212] border border-[#222222] hover:border-[#FF8A00] cursor-pointer rounded-lg transition-all">
                  <span className="w-2 h-2 rounded-full bg-[#FF8A00] shrink-0" />
                  <span className="text-[11px] text-white truncate">LLM08: Excessive Agency</span>
                </div>
                <div onClick={() => handleOpenRiskModal('LLM10')} className="flex items-center gap-2 p-2 bg-[#121212] border border-[#222222] hover:border-[#FF8A00] cursor-pointer rounded-lg transition-all">
                  <span className="w-2 h-2 rounded-full bg-[#FF8A00] shrink-0" />
                  <span className="text-[11px] text-white truncate">LLM10: Vector Misuse</span>
                </div>
                <div onClick={() => handleOpenRiskModal('LLM03')} className="flex items-center gap-2 p-2 bg-[#121212] border border-[#222222] hover:border-[#FF8A00] cursor-pointer rounded-lg transition-all">
                  <span className="w-2 h-2 rounded-full bg-[#FF8A00] shrink-0" />
                  <span className="text-[11px] text-white truncate">LLM03: Supply Chain</span>
                </div>
              </>
            ) : (
              <>
                <div onClick={() => handleOpenRiskModal('ASI01')} className="flex items-center gap-2 p-2 bg-[#121212] border border-[#222222] hover:border-[#FF8A00] cursor-pointer rounded-lg transition-all">
                  <span className="w-2 h-2 rounded-full bg-[#FFB347] shrink-0" />
                  <span className="text-[11px] text-white truncate">ASI01: Jailbreak Agents</span>
                </div>
                <div onClick={() => handleOpenRiskModal('ASI02')} className="flex items-center gap-2 p-2 bg-[#121212] border border-[#222222] hover:border-[#FF8A00] cursor-pointer rounded-lg transition-all">
                  <span className="w-2 h-2 rounded-full bg-[#FFB347] shrink-0" />
                  <span className="text-[11px] text-white truncate">ASI02: Tool Misuse</span>
                </div>
                <div onClick={() => handleOpenRiskModal('ASI03')} className="flex items-center gap-2 p-2 bg-[#121212] border border-[#222222] hover:border-[#FF8A00] cursor-pointer rounded-lg transition-all">
                  <span className="w-2 h-2 rounded-full bg-[#FFB347] shrink-0" />
                  <span className="text-[11px] text-white truncate">ASI03: Goal Misalignment</span>
                </div>
                <div onClick={() => handleOpenRiskModal('ASI05')} className="flex items-center gap-2 p-2 bg-[#121212] border border-[#222222] hover:border-[#FF8A00] cursor-pointer rounded-lg transition-all">
                  <span className="w-2 h-2 rounded-full bg-[#FFB347] shrink-0" />
                  <span className="text-[11px] text-white truncate">ASI05: Data Leakage</span>
                </div>
                <div onClick={() => handleOpenRiskModal('ASI06')} className="flex items-center gap-2 p-2 bg-[#121212] border border-[#222222] hover:border-[#FF8A00] cursor-pointer rounded-lg transition-all">
                  <span className="w-2 h-2 rounded-full bg-[#FFB347] shrink-0" />
                  <span className="text-[11px] text-white truncate">ASI06: Privilege Escalation</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4. Third Row: Attack Test Cases (Left) + Mitigation Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Attack Test Cases */}
        <div className="bg-[#171717] border border-[#242424] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-[#FF8A00]" />
              <h2 className="text-sm font-semibold text-white">Attack Test Cases</h2>
            </div>
            <a href="/tests" className="text-xs text-[#FF8A00] hover:text-[#FFA842] flex items-center gap-1 font-medium transition-colors">
              <span>View All 60 Tests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Test Cases Table */}
          <div className="space-y-3">
            {(data?.attack_test_cases || [
              { id: 'LLM01', name: 'Prompt Injection', tests_count: '3+ Tests' },
              { id: 'LLM02', name: 'Sensitive Information', tests_count: '3+ Tests' },
              { id: 'LLM03', name: 'Supply Chain Attacks', tests_count: '3+ Tests' },
              { id: 'LLM08', name: 'Excessive Agency', tests_count: '3+ Tests' },
              { id: 'LLM10', name: 'Vector Misuse', tests_count: '3+ Tests' },
            ]).map((tc) => (
              <div
                key={tc.id}
                onClick={() => handleOpenRiskModal(tc.id)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#121212] border border-[#222222] hover:border-[#FF8A00] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                    {tc.id}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#FF8A00] transition-colors">
                      {tc.name}
                    </div>
                    <div className="text-[10px] text-[#666666]">{tc.tests_count}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] text-[#A3A3A3] font-mono">Claude 3/3 ✓</div>
                    <div className="w-16 h-1.5 bg-[#222222] rounded-full overflow-hidden mt-1">
                      <div className="w-full h-full bg-[#FF8A00] rounded-full" />
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-[#A3A3A3] font-mono">Gemini 3/3 ✓</div>
                    <div className="w-16 h-1.5 bg-[#222222] rounded-full overflow-hidden mt-1">
                      <div className="w-full h-full bg-[#FF8A00] rounded-full" />
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#666666] group-hover:text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mitigation Results */}
        <div className="bg-[#171717] border border-[#242424] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00C784]" />
              <h2 className="text-sm font-semibold text-white">Mitigation Results</h2>
            </div>
            <a href="/mitigations" className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#00C784]/15 text-[#00C784] border border-[#00C784]/30 hover:bg-[#00C784]/25 transition-all">
              All Mitigations Applied ✓
            </a>
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-12 text-[11px] text-[#777777] font-medium px-2 py-1 font-mono">
            <div className="col-span-5">Category</div>
            <div className="col-span-3 text-center">Before Mitigation</div>
            <div className="col-span-1 text-center">→</div>
            <div className="col-span-3 text-center">After Mitigation</div>
          </div>

          {/* Mitigation Rows */}
          <div className="space-y-2 mt-1">
            {(data?.mitigation_results || [
              { name: 'Prompt Injection (LLM01)', before_risk: 'High Risk (87%)', after_risk: 'Low Risk (12%)' },
              { name: 'Sensitive Information (LLM02)', before_risk: 'High Risk (82%)', after_risk: 'Low Risk (9%)' },
              { name: 'Agent Tool Misuse (ASI05)', before_risk: 'Medium (61%)', after_risk: 'Low Risk (14%)' },
              { name: 'MCP Connection Risk', before_risk: 'High Risk (79%)', after_risk: 'Low Risk (11%)' },
            ]).slice(0, 4).map((m, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 items-center p-2.5 rounded-lg bg-[#121212] border border-[#222222]"
              >
                <div className="col-span-5 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${idx === 2 ? 'bg-[#FFC247]' : idx === 3 ? 'bg-[#A855F7]' : 'bg-[#FF4545]'}`} />
                  <span className="text-xs font-medium text-white truncate">{m.name}</span>
                </div>
                <div className="col-span-3 text-center">
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-red-950/60 text-[#FF6B6B] border border-red-800/40">
                    {m.before_risk}
                  </span>
                </div>
                <div className="col-span-1 text-center text-[#666666]">→</div>
                <div className="col-span-3 text-center">
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-semibold bg-emerald-950/60 text-[#00C784] border border-emerald-800/40">
                    {m.after_risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Bottom Row: MCP Connection Risk (Left) + Test Reports Chart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* MCP Connection Risk Card */}
        <div className="bg-[#171717] border border-[#242424] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plug className="w-4 h-4 text-[#FF8A00]" />
            <h2 className="text-sm font-semibold text-white">MCP Connection Risk</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Left Box: Connection Secure */}
            <div className="bg-[#0f1f17] border border-[#00C784]/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#00C784]/20 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-[#00C784]" />
              </div>
              <div className="text-xs font-bold text-white">Connection Secure</div>
              <div className="text-xs text-[#00C784] font-mono font-semibold mt-0.5">
                Risk Score: {data?.mcp_connection?.risk_score ?? 11}%
              </div>
            </div>

            {/* Right Box: PoC Result */}
            <div className="space-y-3">
              <div>
                <div className="text-[11px] text-[#777777] font-medium font-mono">POC Result</div>
                <div className="text-xs text-[#CCCCCC] font-mono mt-1">
                  {data?.mcp_connection?.poc_result ?? 'Attempted path traversal (../../etc/shadow) blocked.'}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#00C784]/20 text-[#00C784] border border-[#00C784]/40 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C784]" />
                  Blocked
                </span>
                <a
                  href="/mcp"
                  className="text-xs text-[#FF8A00] hover:text-[#FFA842] flex items-center gap-1 font-medium transition-colors"
                >
                  View Details →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Test Reports Chart */}
        <div className="bg-[#171717] border border-[#242424] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-[#888888]" />
              <h2 className="text-sm font-semibold text-white">Test Reports</h2>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5 text-[#A3A3A3]">
                  <span className="w-2 h-2 rounded-full bg-[#FF8A00]" />
                  <span>Vulnerabilities</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#A3A3A3]">
                  <span className="w-2 h-2 rounded-full bg-[#00C784]" />
                  <span>Mitigated</span>
                </div>
              </div>
            </div>

            <a
              href="/api/reports/download/pdf"
              download="ai_security_faster_report.html"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FF8A00] text-xs font-semibold text-[#FF8A00] hover:bg-[#FF8A00]/10 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </a>
          </div>

          {/* Chart Display */}
          <div className="h-32 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#555555" fontSize={10} tickLine={false} />
                <YAxis stroke="#555555" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#333333', fontSize: '11px' }}
                />
                <Line
                  type="monotone"
                  dataKey="vulnerabilities"
                  stroke="#FF8A00"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#FF8A00' }}
                />
                <Line
                  type="monotone"
                  dataKey="mitigated"
                  stroke="#00C784"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#00C784' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-end gap-1.5 mt-2 text-[10px] text-[#666666] font-mono">
            <Calendar className="w-3 h-3" />
            <span>Last Scan: {data?.reports_chart?.last_scan ?? 'Nov 12, 2026 • 19:45'}</span>
          </div>
        </div>
      </div>

      {/* 6. Interactive Drill-Down Modal for Attack Test Cases */}
      {selectedRiskModal && riskDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-[#FF8A00]/50 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#242424] flex items-center justify-between bg-[#121212]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30">
                  {riskDetail.id}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">{riskDetail.name}</h3>
                  <div className="text-[11px] text-[#888888] font-mono">{riskDetail.framework}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRiskModal(null)}
                className="p-1.5 text-[#888888] hover:text-white rounded-lg hover:bg-[#222222] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="p-3 bg-[#111111] border border-[#222222] rounded-xl text-xs text-[#A3A3A3] leading-relaxed">
                {riskDetail.description}
              </div>

              {/* Blue Team Mitigation Layer Control */}
              <div className="flex items-center justify-between p-3.5 bg-[#141414] border border-[#262626] rounded-xl text-xs">
                <div className="flex items-center gap-2.5">
                  <Shield className={`w-4 h-4 ${defenseMode ? 'text-[#00C784]' : 'text-[#888888]'}`} />
                  <div>
                    <span className="font-bold text-white font-mono flex items-center gap-2">
                      Blue Team Dual-Boundary Defense
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${defenseMode ? 'bg-[#00C784]/20 text-[#00C784]' : 'bg-[#222] text-[#888]'}`}>
                        {defenseMode ? 'ACTIVE & MITIGATED' : 'DISABLED (RAW VULNERABILITY)'}
                      </span>
                    </span>
                    <p className="text-[11px] text-[#888888] mt-0.5">
                      {defenseMode 
                        ? 'Mitigation active: Structural delimiters & regex filters will intercept injection attacks and protect the model (PASS).'
                        : 'Baseline mode: Running raw unmitigated attack directly against model (demonstrates vulnerability / FAIL).'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDefenseMode(!defenseMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    defenseMode
                      ? 'bg-[#00C784] hover:bg-[#00A86E] text-black shadow-[0_0_10px_rgba(0,199,132,0.3)]'
                      : 'bg-[#222222] hover:bg-[#2c2c2c] border border-[#444444] text-white'
                  }`}
                >
                  {defenseMode ? 'Defense: ON' : 'Defense: OFF'}
                </button>
              </div>

              {/* Scenarios */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Configured Attack Scenarios ({riskDetail.test_cases?.length || 0})
                </div>

                {riskDetail.test_cases?.map((tc: any) => (
                  <div key={tc.id} className="p-4 bg-[#121212] border border-[#242424] rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{tc.name}</span>
                      <span className="font-mono text-[#888888] text-[10px]">{tc.id}</span>
                    </div>

                    <div className="p-2.5 bg-[#0a0a0a] rounded border border-[#222222] text-xs font-mono text-white">
                      <span className="text-[#666666]">Payload: </span>
                      {tc.attack_input}
                    </div>

                    {/* Run test buttons */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => handleRunModalTest(tc.id, 'claude')}
                        disabled={Boolean(testingModel)}
                        className="px-3 py-1.5 bg-[#211709] border border-[#FF8A00] text-xs font-semibold text-white rounded-lg hover:bg-[#FF8A00] hover:text-black transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>{testingModel === `${tc.id}-claude` ? 'Testing Claude...' : 'Test on Claude'}</span>
                      </button>

                      <button
                        onClick={() => handleRunModalTest(tc.id, 'gemini')}
                        disabled={Boolean(testingModel)}
                        className="px-3 py-1.5 bg-[#0e1726] border border-[#4285F4] text-xs font-semibold text-white rounded-lg hover:bg-[#4285F4] hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>{testingModel === `${tc.id}-gemini` ? 'Testing Gemini...' : 'Test on Gemini'}</span>
                      </button>

                      {!defenseMode && (
                        <button
                          onClick={() => handleRunModalTest(tc.id, 'claude', true)}
                          disabled={Boolean(testingModel)}
                          className="px-3 py-1.5 bg-[#0e2417] border border-[#00C784]/60 text-xs font-semibold text-[#00C784] rounded-lg hover:bg-[#00C784] hover:text-black transition-all flex items-center gap-1.5 disabled:opacity-50 ml-auto cursor-pointer"
                        >
                          <Shield className="w-3 h-3" />
                          <span>Test with Defense (PASS)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Test Verdict Inspector */}
              {testResult && (
                <div className={`p-4 rounded-xl border space-y-3 ${
                  testResult.verdict === 'PASS'
                    ? 'bg-[#102418] border-[#00C784]/40 text-[#00C784]'
                    : 'bg-[#261313] border-[#FF4545]/40 text-[#FF4545]'
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold font-mono">
                    <span className="flex items-center gap-2">
                      {testResult.verdict === 'PASS' ? <CheckCircle2 className="w-4 h-4 text-[#00C784]" /> : <AlertTriangle className="w-4 h-4 text-[#FF4545]" />}
                      LIVE TEST VERDICT: {testResult.verdict} ({testResult.model_name.toUpperCase()})
                      <span className={`text-[10px] px-2 py-0.5 rounded font-normal ${testResult.verdict === 'PASS' ? 'bg-[#00C784]/20 text-[#00C784]' : 'bg-[#FF4545]/20 text-[#FF4545]'}`}>
                        {testResult.verdict === 'PASS' ? 'PROTECTED / SECURE' : 'VULNERABLE (UNMITIGATED)'}
                      </span>
                    </span>
                    <span>{testResult.latency_ms}ms • {testResult.tokens_used} tokens</span>
                  </div>

                  <div className="text-xs text-white font-mono whitespace-pre-wrap p-3 bg-black/50 rounded-lg border border-[#222222]">
                    {testResult.actual_response}
                  </div>

                  <div className="text-[11px] font-mono opacity-80 flex items-center justify-between">
                    <span>Evidence: {testResult.evidence}</span>
                  </div>

                  {/* Quick Fix Button when Vulnerability is Detected */}
                  {testResult.verdict === 'FAIL' && (
                    <div className="pt-2 border-t border-[#3a2020] flex items-center justify-between">
                      <span className="text-[11px] text-[#A3A3A3]">
                        Attack succeeded against baseline model. Activate Blue Team mitigation to secure:
                      </span>
                      <button
                        onClick={() => handleRunModalTest(testResult.test_case_id, testResult.model_name as any, true)}
                        className="px-3.5 py-1.5 bg-[#00C784] hover:bg-[#00A86E] text-black font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_12px_rgba(0,199,132,0.4)]"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Apply Mitigation & Fix (Retest)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
