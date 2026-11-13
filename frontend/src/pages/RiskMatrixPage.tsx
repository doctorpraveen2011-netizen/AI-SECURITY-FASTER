import React, { useState, useEffect } from 'react';
import { Layers, Shield, AlertTriangle, CheckCircle2, ChevronRight, Play, Wrench } from 'lucide-react';
import { fetchRiskCategories, fetchRiskDetail, retestMitigation } from '../services/api';
import { RiskCategory } from '../types';

export const RiskMatrixPage: React.FC = () => {
  const [risks, setRisks] = useState<RiskCategory[]>([]);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [riskDetail, setRiskDetail] = useState<any | null>(null);
  const [isRetesting, setIsRetesting] = useState(false);

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    try {
      const data = await fetchRiskCategories();
      setRisks(data);
      if (data.length > 0 && !selectedRiskId) {
        handleSelectRisk(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectRisk = async (id: string) => {
    setSelectedRiskId(id);
    try {
      const detail = await fetchRiskDetail(id);
      setRiskDetail(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetest = async () => {
    if (!selectedRiskId || isRetesting) return;
    setIsRetesting(true);
    try {
      await retestMitigation(selectedRiskId, 'claude');
      await handleSelectRisk(selectedRiskId);
      await loadRisks();
    } catch (err: any) {
      alert(`Retest failed: ${err.message}`);
    } finally {
      setIsRetesting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-[#1c1c1c] pb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#FF8A00]" />
          OWASP Top 10 & Agentic Risk Matrix (2026 Taxonomy)
        </h1>
        <p className="text-xs text-[#888888] mt-1">
          Formal threat registry tracking vulnerability rates, test cases, and active mitigation postures across LLMs and AI Agents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Risk Categories List (5 cols) */}
        <div className="lg:col-span-5 bg-[#171717] border border-[#242424] rounded-xl overflow-hidden p-4 space-y-3">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Active Risk Catalog ({risks.length})
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {risks.map((r) => (
              <div
                key={r.id}
                onClick={() => handleSelectRisk(r.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedRiskId === r.id
                    ? 'bg-[#22180c] border-[#FF8A00]'
                    : 'bg-[#121212] border-[#222222] hover:border-[#333333]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#FF8A00]/20 text-[#FF8A00] border border-[#FF8A00]/30">
                      {r.id}
                    </span>
                    <span className="text-xs font-bold text-white">{r.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold ${
                    r.severity === 'Critical' ? 'text-[#FF4545]' : 'text-[#FFC247]'
                  }`}>
                    {r.severity}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1e1e1e] text-[11px] text-[#777777] font-mono">
                  <span>Tests: {r.tests_count}</span>
                  <span className={r.vulnerabilities_found > 0 ? 'text-[#FF4545]' : 'text-[#00C784]'}>
                    Vulns: {r.vulnerabilities_found}
                  </span>
                  <span className="text-[#00C784] font-semibold">{r.mitigation_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Risk Detailed Breakdown & Mitigations (7 cols) */}
        <div className="lg:col-span-7 bg-[#171717] border border-[#242424] rounded-xl p-5 space-y-5">
          {riskDetail ? (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-[#FF8A00]">{riskDetail.id}</span>
                    <h2 className="text-base font-bold text-white">{riskDetail.name}</h2>
                  </div>
                  <div className="text-[11px] text-[#777777] font-mono mt-0.5">{riskDetail.framework}</div>
                </div>

                <button
                  onClick={handleRetest}
                  disabled={isRetesting}
                  className="px-4 py-2 bg-[#FF8A00] hover:bg-[#E06D00] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>{isRetesting ? 'Verifying Defense...' : 'Run Retest'}</span>
                </button>
              </div>

              {/* Description */}
              <div className="p-3 bg-[#111111] border border-[#222222] rounded-lg text-xs text-[#A3A3A3] leading-relaxed">
                {riskDetail.description}
              </div>

              {/* Active Mitigation Card */}
              {riskDetail.mitigation && (
                <div className="p-4 bg-[#0d1a12] border border-[#00C784]/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#00C784]">
                      <Shield className="w-4 h-4" />
                      <span>{riskDetail.mitigation.name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00C784]/20 text-[#00C784]">
                      {riskDetail.mitigation.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#B0B0B0]">
                    <strong>Technique:</strong> {riskDetail.mitigation.technique}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono pt-1">
                    <span className="text-[#FF6B6B]">Before: {riskDetail.mitigation.before_risk_score}%</span>
                    <span className="text-[#666666]">→</span>
                    <span className="text-[#00C784]">After: {riskDetail.mitigation.after_risk_score}%</span>
                    <span className="text-[#FFB347]">Reduction: {riskDetail.mitigation.reduction_percentage}%</span>
                  </div>
                </div>
              )}

              {/* Attack Scenarios List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Configured Attack Test Scenarios ({riskDetail.test_cases?.length || 0})
                </div>

                <div className="space-y-2">
                  {riskDetail.test_cases?.map((tc: any) => (
                    <div key={tc.id} className="p-3 bg-[#121212] border border-[#222222] rounded-lg space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{tc.name}</span>
                        <span className="text-[10px] font-mono text-[#888888]">{tc.id}</span>
                      </div>
                      <div className="text-[11px] text-[#A3A3A3] font-mono">
                        <span className="text-[#666666]">Payload: </span>
                        {tc.attack_input}
                      </div>
                      <div className="text-[11px] text-[#00C784] font-mono">
                        <span className="text-[#666666]">Expected: </span>
                        {tc.expected_secure_behavior}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-xs text-[#666666]">
              Select a risk category from the list to view test cases and mitigation posture.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

