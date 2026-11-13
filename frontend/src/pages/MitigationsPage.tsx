import React, { useState, useEffect } from 'react';
import { ShieldCheck, Play, CheckCircle2, AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import { fetchMitigations, toggleMitigation, retestMitigation } from '../services/api';
import { Mitigation } from '../types';

export const MitigationsPage: React.FC = () => {
  const [mitigations, setMitigations] = useState<Mitigation[]>([]);
  const [retestingId, setRetestingId] = useState<string | null>(null);

  useEffect(() => {
    loadMitigations();
  }, []);

  const loadMitigations = async () => {
    try {
      const data = await fetchMitigations();
      setMitigations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (riskId: string, current: boolean) => {
    try {
      await toggleMitigation(riskId, !current);
      await loadMitigations();
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  const handleRetest = async (riskId: string) => {
    setRetestingId(riskId);
    try {
      await retestMitigation(riskId, 'claude');
      await loadMitigations();
    } catch (err: any) {
      alert(`Retest failed: ${err.message}`);
    } finally {
      setRetestingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-[#1c1c1c] pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#00C784]" />
          Blue Team Mitigation Engine & Verification
        </h1>
        <p className="text-xs text-[#888888] mt-1">
          Apply empirical defense layers, verify input/output guardrails, and compute measurable risk reduction scores through automated retests.
        </p>
      </div>

      {/* Mitigation Defense Cards */}
      <div className="space-y-4">
        {mitigations.map((m) => (
          <div
            key={m.id}
            className="bg-[#171717] border border-[#242424] hover:border-[#333333] rounded-xl p-5 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00C784]/15 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-[#00C784]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#FF8A00]">{m.risk_id}</span>
                    <h2 className="text-sm font-bold text-white">{m.name}</h2>
                  </div>
                  <div className="text-[11px] text-[#777777] font-mono mt-0.5">{m.technique}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Active Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#888888] font-mono">Active Defense:</span>
                  <input
                    type="checkbox"
                    checked={m.active}
                    onChange={() => handleToggle(m.risk_id, m.active)}
                    className="w-4 h-4 accent-[#00C784] rounded cursor-pointer"
                  />
                </div>

                {/* Retest Button */}
                <button
                  onClick={() => handleRetest(m.risk_id)}
                  disabled={retestingId === m.risk_id}
                  className="px-3.5 py-1.5 bg-[#FF8A00] hover:bg-[#E06D00] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${retestingId === m.risk_id ? 'animate-spin' : ''}`} />
                  <span>{retestingId === m.risk_id ? 'Retesting...' : 'Empirical Retest'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              {m.description}
            </p>

            {/* Empirical Risk Reduction Scoreboard */}
            <div className="flex items-center gap-6 pt-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#121212] border border-[#222222] flex items-center gap-2">
                <span className="text-[#888888]">Baseline Risk:</span>
                <span className="text-[#FF4545] font-bold">{m.before_risk_score}%</span>
              </div>
              <span className="text-[#666666]">→</span>
              <div className="p-2.5 rounded-lg bg-[#121212] border border-[#222222] flex items-center gap-2">
                <span className="text-[#888888]">Mitigated Risk:</span>
                <span className="text-[#00C784] font-bold">{m.after_risk_score}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#121212] border border-[#222222] flex items-center gap-2">
                <span className="text-[#888888]">Empirical Reduction:</span>
                <span className="text-[#FFB347] font-bold">{m.reduction_percentage}%</span>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#00C784]/20 text-[#00C784] border border-[#00C784]/30">
                  {m.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

