import React, { useState, useEffect } from 'react';
import { Wrench, Plug, CheckCircle2, ShieldAlert, Play, Database, FileText } from 'lucide-react';
import { fetchMcpStatus, fetchMcpTools, testMcpPoC, fetchMcpEvents } from '../services/api';
import { MCPStatus, MCPTool } from '../types';

export const McpLabPage: React.FC = () => {
  const [status, setStatus] = useState<MCPStatus | null>(null);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [testPath, setTestPath] = useState('../../etc/shadow');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [s, t, e] = await Promise.all([
        fetchMcpStatus(),
        fetchMcpTools(),
        fetchMcpEvents()
      ]);
      setStatus(s);
      setTools(t);
      setEvents(e);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunPoC = async () => {
    setIsTesting(true);
    try {
      const res = await testMcpPoC(testPath);
      setTestResult(res);
      await loadData();
    } catch (err: any) {
      alert(`MCP test failed: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-[#1c1c1c] pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-[#FF8A00]" />
          Model Context Protocol (MCP) Security Lab
        </h1>
        <p className="text-xs text-[#888888] mt-1">
          Simulate enterprise MCP servers, discover schema boundaries, and verify path traversal & unauthorized tool invocation defenses.
        </p>
      </div>

      {/* Top Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#171717] border border-[#242424] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00C784]/15 flex items-center justify-center shrink-0">
            <Plug className="w-6 h-6 text-[#00C784]" />
          </div>
          <div>
            <div className="text-xs text-[#888888] font-mono">CONNECTION STATUS</div>
            <div className="text-base font-bold text-white mt-0.5">{status?.status ?? 'Secure'}</div>
            <div className="text-[11px] text-[#00C784] font-mono mt-0.5">mcp://localhost:8001</div>
          </div>
        </div>

        <div className="bg-[#171717] border border-[#242424] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF8A00]/15 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#FF8A00]" />
          </div>
          <div>
            <div className="text-xs text-[#888888] font-mono">MCP RISK SCORE</div>
            <div className="text-2xl font-bold font-mono text-[#00C784] mt-0.5">
              {status?.risk_score ?? 11}%
            </div>
            <div className="text-[11px] text-[#888888]">Minimal residual exposure</div>
          </div>
        </div>

        <div className="bg-[#171717] border border-[#242424] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF4545]/15 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-[#FF4545]" />
          </div>
          <div>
            <div className="text-xs text-[#888888] font-mono">BLOCKED ATTEMPTS</div>
            <div className="text-2xl font-bold font-mono text-[#FF4545] mt-0.5">
              {status?.blocked_attempts_count ?? 1}
            </div>
            <div className="text-[11px] text-[#888888]">Path traversal intercepted</div>
          </div>
        </div>
      </div>

      {/* Interactive PoC Runner Card */}
      <div className="bg-[#171717] border border-[#242424] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#FF8A00]" />
            <h2 className="text-sm font-bold text-white">Interactive MCP Security Proof of Concept (PoC)</h2>
          </div>
          <span className="text-[11px] font-mono text-[#00C784] bg-[#00C784]/15 px-2.5 py-0.5 rounded-full border border-[#00C784]/30">
            Active Security Guard
          </span>
        </div>

        <p className="text-xs text-[#A3A3A3] leading-relaxed">
          The MCP client discovers available tools on the test server and attempts an unauthorized filesystem read outside the sandbox boundary. The server-side security interceptor must detect the path traversal, terminate the call, and log the event.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={testPath}
            onChange={(e) => setTestPath(e.target.value)}
            placeholder="../../etc/shadow"
            className="flex-1 bg-[#101010] border border-[#262626] rounded-lg px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#FF8A00]"
          />
          <button
            onClick={handleRunPoC}
            disabled={isTesting}
            className="px-5 py-2 bg-[#FF8A00] hover:bg-[#E06D00] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>{isTesting ? 'Testing Guard...' : 'Execute Path Traversal PoC'}</span>
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-xl border mt-3 ${
            testResult.is_blocked
              ? 'bg-[#15241b] border-[#00C784]/40 text-[#00C784]'
              : 'bg-[#291414] border-[#FF4545]/40 text-[#FF4545]'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold font-mono">
              <span>STATUS: {testResult.status}</span>
              <span>{testResult.is_blocked ? 'SECURITY INTERCEPTOR ACTIVE' : 'FAIL'}</span>
            </div>
            <div className="text-xs text-[#E0E0E0] font-mono mt-2">
              {testResult.poc_result || testResult.error}
            </div>
            <div className="text-[11px] text-[#A3A3A3] font-mono mt-1">
              Evidence: {testResult.evidence}
            </div>
          </div>
        )}
      </div>

      {/* Discovered Tools & Recent Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tools Discovered */}
        <div className="bg-[#171717] border border-[#242424] rounded-xl p-5 space-y-4">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Discovered MCP Server Tools ({tools.length})
          </div>
          <div className="space-y-3">
            {tools.map((t, idx) => (
              <div key={idx} className="p-3 bg-[#111111] border border-[#222222] rounded-lg space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#FF8A00]">{t.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#222222] text-[#A3A3A3]">
                    {t.permission_scope}
                  </span>
                </div>
                <div className="text-xs text-[#888888]">{t.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Audit Events */}
        <div className="bg-[#171717] border border-[#242424] rounded-xl p-5 space-y-4">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            MCP Protocol Security Audit Log ({events.length})
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {events.map((ev, idx) => (
              <div key={idx} className="p-3 bg-[#111111] border border-[#222222] rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-white font-bold">{ev.tool_name}</span>
                  <span className={`text-[10px] font-bold ${ev.is_blocked ? 'text-[#00C784]' : 'text-[#888888]'}`}>
                    {ev.is_blocked ? 'BLOCKED' : 'EXECUTED'}
                  </span>
                </div>
                <div className="text-[11px] text-[#A3A3A3] font-mono truncate">{ev.block_reason || 'Normal tool call'}</div>
                <div className="text-[10px] text-[#666666] font-mono">{ev.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

