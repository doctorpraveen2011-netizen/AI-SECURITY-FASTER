import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Sun, Key, CheckCircle2, AlertCircle, X, Save, Mail } from 'lucide-react';
import { configureModel, configureEmailKey, fetchEmailStatus } from '../services/api';

interface HeaderProps {
  selectedModel?: string;
  onSelectModel?: (model: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ selectedModel = 'claude-3-5-sonnet-20241022', onSelectModel }) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [claudeKey, setClaudeKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [emailKey, setEmailKey] = useState('');
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchEmailStatus().then(st => {
      if (st && st.configured) {
        setEmailConfigured(true);
      }
    }).catch(() => {});
  }, []);

  const modelOptions = [
    { id: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet', provider: 'claude' },
    { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', provider: 'claude' },
    { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus', provider: 'claude' },
    { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', provider: 'claude' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', provider: 'gemini' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'gemini' },
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'gemini' },
  ];

  const handleSaveKeys = async () => {
    try {
      if (claudeKey.trim()) {
        await configureModel({ provider: 'anthropic', model_name: 'claude-3-5-sonnet-20241022', api_key: claudeKey });
      }
      if (geminiKey.trim()) {
        await configureModel({ provider: 'gemini', model_name: 'gemini-1.5-pro', api_key: geminiKey });
      }
      if (emailKey.trim()) {
        await configureEmailKey({ api_key: emailKey });
        setEmailConfigured(true);
      }
      setSaveStatus('SUCCESS');
      setTimeout(() => {
        setSaveStatus(null);
        setShowKeyModal(false);
      }, 1500);
    } catch (err: any) {
      setSaveStatus('ERROR');
    }
  };

  return (
    <>
      <header className="h-16 bg-[#080808] border-b border-[#1c1c1c] px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Search Bar */}
        <div className="relative w-80 sm:w-96">
          <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search attacks, risks, or results..."
            className="w-full bg-[#121212] border border-[#222222] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#FF8A00] transition-colors"
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Frontier Model Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel && onSelectModel(e.target.value)}
              className="bg-[#141414] border border-[#262626] hover:border-[#FF8A00] text-xs font-semibold text-white py-1.5 px-3 rounded-lg focus:outline-none cursor-pointer font-mono"
            >
              <optgroup label="Anthropic Frontier Models">
                <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet</option>
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
              </optgroup>
              <optgroup label="Google Frontier Models">
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              </optgroup>
            </select>
          </div>

          {/* Quick API Key Modal Trigger */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] border border-[#222222] hover:border-[#FF8A00] rounded-lg text-xs font-medium text-[#A3A3A3] hover:text-white transition-colors"
            title="Configure Official API Keys"
          >
            <Key className="w-3.5 h-3.5 text-[#FF8A00]" />
            <span className="hidden sm:inline">API Keys</span>
          </button>

          {/* System Online Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0f1912] border border-[#00C784]/30 rounded-lg text-xs text-[#00C784]">
            <span className="w-2 h-2 rounded-full bg-[#00C784] animate-pulse" />
            <span className="font-mono text-[11px] hidden sm:inline">System Online</span>
          </div>

          {/* Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-[#333333] flex items-center justify-center text-xs font-bold text-white hover:border-[#FF8A00] cursor-pointer transition-colors">
            P
          </div>
        </div>
      </header>

      {/* Quick API Keys Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-[#FF8A00]/50 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#242424] pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#FF8A00]" />
                <h3 className="text-sm font-bold text-white">Official Frontier AI Credentials</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="p-1 text-[#888888] hover:text-white rounded-lg hover:bg-[#222222]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#A3A3A3]">
              Enter your official API keys to enable 100% live frontier model queries across all 11 cybersecurity features.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#888888] font-mono block mb-1">Anthropic API Key (Claude)</label>
                <input
                  type="password"
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                  placeholder="sk-ant-api03-••••••••••••••••••••"
                  className="w-full bg-[#101010] border border-[#282828] rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#FF8A00]"
                />
              </div>

              <div>
                <label className="text-[#888888] font-mono block mb-1">Google Gemini API Key (Gemini)</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy••••••••••••••••••••"
                  className="w-full bg-[#101010] border border-[#282828] rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#888888] font-mono flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#FF8A00]" />
                    Real-Time Email Alert API Key (Resend / SendGrid)
                  </label>
                  {emailConfigured && (
                    <span className="text-[10px] text-[#00C784] font-mono font-bold bg-[#0e2417] px-1.5 py-0.5 rounded border border-[#00C784]/30">
                      LIVE ACTIVE
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  value={emailKey}
                  onChange={(e) => setEmailKey(e.target.value)}
                  placeholder="re_•••••••••••••••••••• (Resend) or SG.•••• (SendGrid)"
                  className="w-full bg-[#101010] border border-[#282828] rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-[#00C784]"
                />
                <span className="text-[10px] text-[#666666] mt-1 block">
                  Enables autonomous agent to dispatch real email alerts to real-world recipient inboxes upon HITL approval.
                </span>
              </div>
            </div>

            {saveStatus === 'SUCCESS' && (
              <div className="p-2.5 bg-[#0e2417] border border-[#00C784]/40 rounded-lg text-xs text-[#00C784] font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Credentials safely encrypted and saved.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#242424]">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 bg-[#222222] text-[#888888] hover:text-white text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKeys}
                className="px-5 py-2 bg-[#FF8A00] hover:bg-[#E06D00] text-black font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,138,0,0.3)]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Credentials</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
