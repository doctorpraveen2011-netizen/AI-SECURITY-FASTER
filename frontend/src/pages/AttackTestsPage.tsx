import React, { useState, useEffect } from 'react';
import { Swords, Play, Filter, CheckCircle2, AlertTriangle, Shield, Clock, Hash, Zap, RefreshCw } from 'lucide-react';
import { fetchTestExecutions, startTestCampaign, executeSingleTest } from '../services/api';
import { TestExecution } from '../types';

export const AttackTestsPage: React.FC = () => {
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('all');
  const [selectedExecution, setSelectedExecution] = useState<TestExecution | null>(null);
  const [isRunningCampaign, setIsRunningCampaign] = useState(false);
  const [isExecutingSingle, setIsExecutingSingle] = useState(false);

  useEffect(() => {
    loadExecutions();
  }, [selectedModel, selectedVerdict]);

  const loadExecutions = async () => {
    const params: any = {};
    if (selectedModel !== 'all') params.model = selectedModel;
    if (selectedVerdict !== 'all') params.verdict = selectedVerdict;
    try {
      const data = await fetchTestExecutions(params);
      setExecutions(data);
      if (data.length > 0 && !selectedExecution) {
        setSelectedExecution(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLaunchCampaign = async () => {
    setIsRunningCampaign(true);
    try {
      await startTestCampaign('Full OWASP LLM & Agentic Security Benchmark', 'claude,gemini');
      await loadExecutions();
    } catch (err: any) {
      alert(`Campaign error: ${err.message}`);
    } finally {
      setIsRunningCampaign(false);
    }
  };

  const handleRetestSelected = async (targetModel: string) => {
    if (!selectedExecution || isExecutingSingle) return;
    setIsExecutingSingle(true);
    try {
      const res = await executeSingleTest(selectedExecution.test_case_id, targetModel);
      setSelectedExecution(res);
      await loadExecutions();
    } catch (err: any) {
      alert(`Execution failed: ${err.message}`);
    } finally {
      setIsExecutingSingle(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Campaign Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1c1c] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#FF8A00]" />
            Red Team Automated Testing Engine
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            Execute automated adversarial campaigns across Claude & Gemini (minimum 60 model executions per campaign).
          </p>
        </div>

        <button
          onClick={handleLaunchCampaign}
          disabled={isRunningCampaign}
          className="px-5 py-2.5 bg-[#FF8A00] hover:bg-[#E06D00] text-black font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(255,138,0,0.35)] transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>{isRunningCampaign ? 'Executing 60+ Attack Scenarios...' : 'Launch Full Campaign (60 Tests)'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-[#171717] border border-[#242424] rounded-xl p-3 flex-wrap">
        <Filter className="w-4 h-4 text-[#777777]" />
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#888888] font-mono">Target Model:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-[#101010] border border-[#2a2a2a] rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Models (Claude & Gemini)</option>
            <option value="claude">Claude Only</option>
            <option value="gemini">Gemini Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#888888] font-mono">Verdict:</span>
          <select
            value={selectedVerdict}
            onChange={(e) => setSelectedVerdict(e.target.value)}
            className="bg-[#101010] border border-[#2a2a2a] rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="FAIL">Vulnerable (FAIL)</option>
            <option value="PASS">Defended (PASS)</option>
          </select>
        </div>

        <div className="ml-auto text-xs font-mono text-[#888888]">
          Total Executions: <span className="text-white font-bold">{executions.length}</span>
        </div>
      </div>

      {/* Grid: Executions Table & Detailed Verbatim Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#171717] border border-[#242424] rounded-xl overflow-hidden">
          <div className="max-h-[620px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121212] border-b border-[#222222] text-[#777777] font-mono uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="p-3">Risk ID</th>
                  <th className="p-3">Test Case</th>
                  <th className="p-3">Model</th>
                  <th className="p-3 text-center">Verdict</th>
                  <th className="p-3 text-right">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {executions.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelectedExecution(e)}
                    className={`cursor-pointer transition-colors ${
                      selectedExecution?.id === e.id ? 'bg-[#22180c]' : 'hover:bg-[#151515]'
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-[#FF8A00]">{e.risk_id}</td>
                    <td className="p-3 text-white truncate max-w-[180px]">{e.test_case_id}</td>
                    <td className="p-3 font-mono capitalize text-[#A3A3A3]">{e.model_name}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        e.verdict === 'PASS'
                          ? 'bg-emerald-950/70 text-[#00C784] border border-emerald-800/40'
                          : 'bg-red-950/70 text-[#FF4545] border border-red-800/40'
                      }`}>
                        {e.verdict}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-[#888888]">{e.latency_ms}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Detailed Verbatim Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-[#171717] border border-[#242424] rounded-xl p-5 space-y-4">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[#222222] pb-3 flex items-center justify-between">
            <span>Observable Evidence Inspector</span>
            {selectedExecution && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                selectedExecution.verdict === 'PASS' ? 'text-[#00C784]' : 'text-[#FF4545]'
              }`}>
                VERDICT: {selectedExecution.verdict}
              </span>
            )}
          </div>

          {selectedExecution ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-[#121212] rounded border border-[#222222]">
                  <span className="text-[#666666]">RISK: </span>
                  <span className="text-[#FF8A00] font-bold">{selectedExecution.risk_id}</span>
                </div>
                <div className="p-2 bg-[#121212] rounded border border-[#222222]">
                  <span className="text-[#666666]">MODEL: </span>
                  <span className="text-white capitalize font-bold">{selectedExecution.model_name}</span>
                </div>
              </div>

              {/* Retest Controls for this test case */}
              <div className="flex items-center gap-2 p-2.5 bg-[#121212] border border-[#262626] rounded-xl">
                <span className="text-[11px] text-[#888888] font-mono">Live Retest:</span>
                <button
                  onClick={() => handleRetestSelected('claude')}
                  disabled={isExecutingSingle}
                  className="px-2.5 py-1 bg-[#211709] border border-[#FF8A00] text-[11px] font-bold text-white rounded hover:bg-[#FF8A00] hover:text-black transition-all disabled:opacity-50"
                >
                  Test on Claude
                </button>
                <button
                  onClick={() => handleRetestSelected('gemini')}
                  disabled={isExecutingSingle}
                  className="px-2.5 py-1 bg-[#0d1624] border border-[#4285F4] text-[11px] font-bold text-white rounded hover:bg-[#4285F4] hover:text-white transition-all disabled:opacity-50"
                >
                  Test on Gemini
                </button>
              </div>

              {/* Attack Input */}
              <div>
                <div className="text-[10px] text-[#666666] font-mono mb-1">ATTACK INPUT (PAYLOAD)</div>
                <div className="p-3 bg-[#101010] border border-[#262626] rounded-lg text-white font-mono leading-relaxed">
                  {selectedExecution.attack_input}
                </div>
              </div>

              {/* Actual Model Output */}
              <div>
                <div className="text-[10px] text-[#666666] font-mono mb-1">ACTUAL MODEL RESPONSE</div>
                <div className="p-3 bg-[#101010] border border-[#262626] rounded-lg text-[#CCCCCC] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedExecution.actual_response}
                </div>
              </div>

              {/* Evidence & Telemetry */}
              <div className="space-y-1.5">
                <div className="text-[10px] text-[#666666] font-mono">EVIDENCE & BEHAVIORAL VERDICT</div>
                <div className="p-3 bg-[#131b14] border border-[#00C784]/30 rounded-lg text-xs text-[#00C784] font-mono">
                  {selectedExecution.evidence || selectedExecution.actual_behavior}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#666666] px-1">
                  <span>Latency: {selectedExecution.latency_ms}ms</span>
                  <span>Tokens: {selectedExecution.tokens_used}</span>
                  <span>Severity: {selectedExecution.severity}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-[#666666] text-xs">
              Select an execution row from the table to inspect verbatim prompt evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
