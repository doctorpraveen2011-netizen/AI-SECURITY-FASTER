import React, { useState, useEffect } from 'react';
import { Boxes, ShieldAlert, CheckCircle2, Server, RefreshCw } from 'lucide-react';
import { fetchWazuhStatus, fetchWazuhAlerts } from '../services/api';
import { SecurityAlert } from '../types';

export const WazuhPage: React.FC = () => {
  const [status, setStatus] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadWazuhData();
  }, []);

  const loadWazuhData = async (refresh: boolean = false) => {
    setIsRefreshing(true);
    try {
      const [s, a] = await Promise.all([
        fetchWazuhStatus(),
        fetchWazuhAlerts(refresh)
      ]);
      setStatus(s);
      setAlerts(a);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diffSec < 60) return { relative: 'Just now', full: date.toLocaleTimeString(), isRecent: true };
      if (diffSec < 3600) return { relative: `${Math.floor(diffSec / 60)}m ago`, full: date.toLocaleTimeString(), isRecent: true };
      return { relative: `${Math.floor(diffSec / 3600)}h ago`, full: date.toLocaleString(), isRecent: false };
    } catch {
      return { relative: ts, full: ts, isRecent: false };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1c1c] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#FF8A00]" />
            Wazuh SIEM & Security Operations Integration
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            Correlate frontier LLM red-team events, tool abuse attempts, and MCP path traversals into the enterprise Wazuh SIEM rule hierarchy.
          </p>
        </div>

        <button
          onClick={() => loadWazuhData(true)}
          disabled={isRefreshing}
          className="px-4 py-2 bg-[#FF8A00] hover:bg-[#E06D00] text-black font-bold text-xs rounded-lg flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(255,138,0,0.35)] cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing Live SIEM...' : 'Refresh SIEM Feeds (Ingest Live)'}</span>
        </button>
      </div>

      {/* Connection Health Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#171717] border border-[#242424] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00C784]/15 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#00C784]" />
          </div>
          <div>
            <div className="text-xs text-[#888888] font-mono">SIEM STATUS</div>
            <div className="text-sm font-bold text-[#00C784] mt-0.5">{status?.status ?? 'Online'}</div>
            <div className="text-[11px] text-[#777777] font-mono">{status?.mode ?? 'Isolated Local Mode'}</div>
          </div>
        </div>

        <div className="bg-[#171717] border border-[#242424] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF8A00]/15 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6 text-[#FF8A00]" />
          </div>
          <div>
            <div className="text-xs text-[#888888] font-mono">MANAGER VERSION</div>
            <div className="text-sm font-bold text-white mt-0.5">{status?.version ?? '4.8.0'}</div>
            <div className="text-[11px] text-[#777777] font-mono">{status?.api_url ?? 'https://localhost:55000'}</div>
          </div>
        </div>

        <div className="bg-[#171717] border border-[#242424] rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FF4545]/15 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-[#FF4545]" />
          </div>
          <div>
            <div className="text-xs text-[#888888] font-mono">CORRELATED ALERTS</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">{alerts.length}</div>
            <div className="text-[11px] text-[#FF4545]">Active security detections</div>
          </div>
        </div>
      </div>

      {/* Correlated Alerts Stream */}
      <div className="bg-[#171717] border border-[#242424] rounded-xl p-5 space-y-4">
        <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
          Live AI Security Incident Feed (Wazuh Ingest)
        </div>

        <div className="space-y-3">
          {alerts.map((al) => {
            const timeInfo = formatTimestamp(al.timestamp);
            return (
              <div
                key={al.id}
                className="p-3.5 bg-[#121212] border border-[#222222] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF8A00]/20 text-[#FF8A00]">
                      Rule {al.rule_id}
                    </span>
                    <span className="font-bold text-white">{al.risk_id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      al.severity === 'Emergency' || al.severity === 'Critical'
                        ? 'text-[#FF4545] bg-red-950/70 border border-red-800'
                        : 'text-[#FFC247] bg-amber-950/70 border border-amber-800'
                    }`}>
                      {al.severity}
                    </span>
                    {timeInfo.isRecent && (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#00C784] bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00C784]" />
                        LIVE INGEST
                      </span>
                    )}
                  </div>
                  <div className="text-[#CCCCCC]">{al.description}</div>
                </div>

                <div className="text-right text-[11px] font-mono shrink-0">
                  <div className="text-white font-semibold">{timeInfo.relative}</div>
                  <div className="text-[10px] text-[#666666]">{timeInfo.full}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

