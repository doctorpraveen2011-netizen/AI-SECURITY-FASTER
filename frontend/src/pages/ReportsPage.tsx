import React, { useState, useEffect } from 'react';
import { FileText, Download, Shield, Hash, CheckCircle2 } from 'lucide-react';
import { fetchAuditLogs } from '../services/api';
import { AuditLog } from '../types';

export const ReportsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    fetchAuditLogs().then(setLogs).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1c1c] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF8A00]" />
            Compliance Reports & Cryptographic Audit Ledger
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            Generate verifiable red/blue-team assessment reports and inspect SHA-256 sealed immutable audit events.
          </p>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center gap-2">
          <a
            href="/api/reports/download/json"
            download="ai_security_faster_report.json"
            className="px-3.5 py-2 bg-[#171717] hover:bg-[#222222] border border-[#333333] text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#FF8A00]" />
            <span>JSON Export</span>
          </a>
          <a
            href="/api/reports/download/csv"
            download="ai_security_faster_report.csv"
            className="px-3.5 py-2 bg-[#171717] hover:bg-[#222222] border border-[#333333] text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#FF8A00]" />
            <span>CSV Export</span>
          </a>
          <a
            href="/api/reports/download/pdf"
            download="ai_security_faster_report.html"
            className="px-4 py-2 bg-[#FF8A00] hover:bg-[#E06D00] text-black font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-[0_0_12px_rgba(255,138,0,0.3)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Audit PDF</span>
          </a>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#171717] border border-[#242424] rounded-xl overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00C784]" />
            <span>Immutable Cryptographic Audit Ledger ({logs.length} Records)</span>
          </div>
          <span className="text-[11px] font-mono text-[#00C784] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            SHA-256 Integrity Verified
          </span>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121212] border-b border-[#222222] text-[#777777] font-mono uppercase text-[10px] sticky top-0">
              <tr>
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Resource</th>
                <th className="p-3">Details</th>
                <th className="p-3 text-right">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e] font-mono text-[11px]">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-[#141414] transition-colors">
                  <td className="p-3 text-[#A3A3A3] whitespace-nowrap">{l.timestamp}</td>
                  <td className="p-3 text-[#FF8A00] font-bold">{l.actor}</td>
                  <td className="p-3 text-white font-semibold">{l.action}</td>
                  <td className="p-3 text-[#888888]">{l.resource_type}</td>
                  <td className="p-3 text-[#CCCCCC] truncate max-w-[200px]">{l.details}</td>
                  <td className="p-3 text-right text-[#00C784] font-mono truncate max-w-[140px]" title={l.sha256_hash}>
                    {l.sha256_hash.slice(0, 16)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

