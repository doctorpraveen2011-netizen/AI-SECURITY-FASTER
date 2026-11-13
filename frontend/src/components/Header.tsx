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

  const isClaude = selectedModel.includes('claude');

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

        {/* Right Controls matching media_1794580612660_3f0ca8b8.jpg */}
        <div className="flex items-center gap-3">
          {/* Claude Model Pill */}
          <div className="relative">
            <button
              onClick={() => onSelectModel && onSelectModel('claude-3-7-sonnet-20250219')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isClaude
                  ? 'bg-[#1b1208] border border-[#FF8A00] text-white shadow-[0_0_12px_rgba(255,138,0,0.35)]'
                  : 'bg-[#141414] border border-[#242424] text-[#888888] hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-[#FF8A00]" />
              <span>Claude 3.7</span>
              <ChevronDown className="w-3 h-3 text-[#777777]" />
            </button>
          </div>

          {/* Gemini Model Pill */}
          <div className="relative">
            <button
              onClick={() => onSelectModel && onSelectModel('gemini-2.0-flash')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !isClaude
                  ? 'bg-[#0f172a] border border-[#0284C7] text-white shadow-[0_0_12px_rgba(2,132,199,0.35)]'
                  : 'bg-[#141414] border border-[#242424] text-[#888888] hover:text-white'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-[#4285F4] flex items-center justify-center text-[9px] font-bold text-white">
                G
              </div>
              <span>Gemini 2.5</span>
              <ChevronDown className="w-3 h-3 text-[#777777]" />
            </button>
          </div>

          {/* Quick API Key Modal Trigger */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141414] border border-[#222222] hover:border-[#FF8A00] rounded-lg text-xs font-medium text-[#A3A3A3] hover:text-white transition-colors"
            title="Configure Official API Keys"
          >
            <Key className="w-3 h-3 text-[#FF8A00]" />
            <span className="hidden md:inline text-[11px]">API Keys</span>
          </button>

          {/* System Online Status */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1912] border border-[#00C784]/30 rounded-full text-xs text-[#00C784]">
            <span className="w-2 h-2 rounded-full bg-[#00C784] animate-pulse" />
            <span className="font-mono text-[11px] hidden sm:inline">System Online</span>
          </div>

          {/* Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-[#1c1c1c] border border-[#333333] flex items-center justify-center text-xs font-bold text-white hover:border-[#FF8A00] cursor-pointer transition-colors shadow-inner">
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
              Enter your official API keys to enable 100% live frontier model queries across all cybersecurity features.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#888888] font-mono block mb-1">Anthropic API Key (Claude)</label>
                <input
                  type="password"
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg p-2 text-white font-mono placeholder-[#444444] focus:outline-none focus:border-[#FF8A00]"
                />
              </div>

              <div>
                <label className="text-[#888888] font-mono block mb-1">Google Gemini API Key</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg p-2 text-white font-mono placeholder-[#444444] focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div>
                <label className="text-[#888888] font-mono block mb-1">
                  Resend API Key (Real-Time Email Alert Gateway)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={emailKey}
                    onChange={(e) => setEmailKey(e.target.value)}
                    placeholder="re_..."
                    className="w-full bg-[#121212] border border-[#2a2a2a] rounded-lg p-2 text-white font-mono placeholder-[#444444] focus:outline-none focus:border-[#00C784]"
                  />
                  {emailConfigured && (
                    <span className="text-[11px] text-[#00C784] font-mono shrink-0 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            {saveStatus === 'SUCCESS' && (
              <div className="flex items-center gap-2 text-xs text-[#00C784] bg-[#0e2417] p-2.5 rounded-lg border border-[#00C784]/30">
                <CheckCircle2 className="w-4 h-4" />
                <span>Keys successfully saved to environment!</span>
              </div>
            )}

            {saveStatus === 'ERROR' && (
              <div className="flex items-center gap-2 text-xs text-[#FF4545] bg-[#261010] p-2.5 rounded-lg border border-[#FF4545]/30">
                <AlertCircle className="w-4 h-4" />
                <span>Failed to save credentials. Please try again.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#242424]">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 bg-[#222222] hover:bg-[#2a2a2a] text-xs font-semibold text-white rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleSaveKeys}
                className="px-4 py-2 bg-[#FF8A00] hover:bg-[#E06D00] text-xs font-bold text-black rounded-lg transition-colors flex items-center gap-1.5"
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
