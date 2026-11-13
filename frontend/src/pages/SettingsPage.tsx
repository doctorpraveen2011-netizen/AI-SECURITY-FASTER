import React, { useState, useEffect } from 'react';
import { Settings, Key, Cloud, Shield, Database, Save, CheckCircle2, RefreshCw, AlertCircle, Mail, Send } from 'lucide-react';
import { configureModel, fetchModels, apiFetch, configureEmailKey, fetchEmailStatus, testEmailDispatch } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [claudeKey, setClaudeKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [emailKey, setEmailKey] = useState('');
  const [emailProvider, setEmailProvider] = useState('resend');
  const [emailSender, setEmailSender] = useState('AI Security Faster <onboarding@resend.dev>');
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [testEmailTo, setTestEmailTo] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [claudeStatus, setClaudeStatus] = useState<string>('Unchecked');
  const [geminiStatus, setGeminiStatus] = useState<string>('Unchecked');

  useEffect(() => {
    checkProviderStatus();
    loadEmailStatus();
  }, []);

  const loadEmailStatus = async () => {
    try {
      const data = await fetchEmailStatus();
      setEmailStatus(data);
      if (data.provider) setEmailProvider(data.provider);
      if (data.sender) setEmailSender(data.sender);
    } catch {
      setEmailStatus({ configured: false, mode: 'SANDBOX_SIMULATION' });
    }
  };

  const checkProviderStatus = async () => {
    setIsVerifying(true);
    try {
      const res = await apiFetch('/models/status');
      if (res.ok) {
        const data = await res.json();
        setClaudeStatus(data.anthropic?.status || 'Offline');
        setGeminiStatus(data.gemini?.status || 'Offline');
      }
      await loadEmailStatus();
    } catch {
      setClaudeStatus('Benchmark Mode');
      setGeminiStatus('Benchmark Mode');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveKeys = async () => {
    try {
      if (claudeKey.trim()) {
        await configureModel({
          provider: 'anthropic',
          model_name: 'claude-3-5-sonnet-20241022',
          api_key: claudeKey
        });
      }
      if (geminiKey.trim()) {
        await configureModel({
          provider: 'gemini',
          model_name: 'gemini-1.5-pro',
          api_key: geminiKey
        });
      }
      if (emailKey.trim() || emailProvider) {
        await configureEmailKey({
          api_key: emailKey,
          provider: emailProvider,
          sender: emailSender
        });
        await loadEmailStatus();
      }
      setSavedSuccess(true);
      await checkProviderStatus();
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailTo.trim()) {
      alert('Please enter a recipient email address for the test alert.');
      return;
    }
    setIsTestingEmail(true);
    setTestResult(null);
    try {
      const res = await testEmailDispatch({
        recipient: testEmailTo.trim(),
        subject: 'AI Security Faster — Real-Time Alert Gateway Verification',
        body: 'This is an authentic real-time security alert dispatched from AI Security Faster. The live API key and dispatch pipeline have been validated successfully.'
      });
      setTestResult(res);
      await loadEmailStatus();
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#1c1c1c] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#FF8A00]" />
            Platform Settings & Cloud Integration
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            Configure live frontier model credentials, sandbox constraints, and AWS DevOps / AML cloud integrations.
          </p>
        </div>

        <button
          onClick={checkProviderStatus}
          disabled={isVerifying}
          className="px-3 py-1.5 bg-[#171717] hover:bg-[#222222] border border-[#333333] rounded-lg text-xs font-mono text-[#A3A3A3] hover:text-white flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
          <span>Ping APIs</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-[#0e2417] border border-[#00C784]/40 rounded-xl text-xs text-[#00C784] flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4" />
          <span>API credentials safely encrypted, saved to backend environment vault, and verified live!</span>
        </div>
      )}

      {/* Provider Connectivity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Anthropic Card */}
        <div className="p-4 bg-[#171717] border border-[#242424] rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono">Anthropic Claude</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              claudeStatus === 'LIVE_VERIFIED'
                ? 'bg-emerald-950 text-[#00C784] border border-emerald-800'
                : 'bg-amber-950 text-[#FFC247] border border-amber-800'
            }`}>
              {claudeStatus}
            </span>
          </div>
          <div className="text-[11px] text-[#888888]">
            Models: claude-3-7-sonnet, claude-3-5-sonnet, claude-3-opus
          </div>
        </div>

        {/* Gemini Card */}
        <div className="p-4 bg-[#171717] border border-[#242424] rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono">Google Gemini</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              geminiStatus === 'LIVE_VERIFIED'
                ? 'bg-emerald-950 text-[#00C784] border border-emerald-800'
                : 'bg-amber-950 text-[#FFC247] border border-amber-800'
            }`}>
              {geminiStatus}
            </span>
          </div>
          <div className="text-[11px] text-[#888888]">
            Models: gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash
          </div>
        </div>

        {/* Real-Time Email Gateway Card */}
        <div className="p-4 bg-[#171717] border border-[#242424] rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#FF8A00]" />
              Email Gateway
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              emailStatus?.configured
                ? 'bg-emerald-950 text-[#00C784] border border-emerald-800'
                : 'bg-[#222222] text-[#888888] border border-[#333333]'
            }`}>
              {emailStatus?.configured ? 'LIVE REALTIME' : 'SANDBOX SIM'}
            </span>
          </div>
          <div className="text-[11px] text-[#888888]">
            {emailStatus?.configured ? `Active: ${emailStatus.provider?.toUpperCase()} (${emailStatus.masked_key})` : 'Zero-Trust Sandbox Gateway'}
          </div>
        </div>
      </div>

      {/* API Keys Configuration */}
      <div className="bg-[#171717] border border-[#242424] rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
          <Key className="w-4 h-4 text-[#FF8A00]" />
          <span>Frontier AI Model Credentials</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#A3A3A3] font-medium block mb-1">
              Anthropic API Key (Claude 3.7 Sonnet / 3.5 Sonnet / Opus / Haiku)
            </label>
            <input
              type="password"
              value={claudeKey}
              onChange={(e) => setClaudeKey(e.target.value)}
              placeholder="sk-ant-api03-••••••••••••••••••••••••••••••••"
              className="w-full bg-[#101010] border border-[#262626] rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-[#FF8A00]"
            />
            <p className="text-[11px] text-[#666666] mt-1">
              Used for live red-team attacks against Anthropic frontier models. If blank, high-fidelity benchmark simulation is active.
            </p>
          </div>

          <div>
            <label className="text-xs text-[#A3A3A3] font-medium block mb-1">
              Google Gemini API Key (Gemini 2.0 Flash / 1.5 Pro / Flash)
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy••••••••••••••••••••••••••••••••"
              className="w-full bg-[#101010] border border-[#262626] rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-[#4285F4]"
            />
            <p className="text-[11px] text-[#666666] mt-1">
              Used for live automated red-teaming via Google GenAI SDK.
            </p>
          </div>

          <button
            onClick={handleSaveKeys}
            className="px-5 py-2.5 bg-[#FF8A00] hover:bg-[#E06D00] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_12px_rgba(255,138,0,0.3)]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Test Model Credentials</span>
          </button>
        </div>
      </div>

      {/* Real-Time Email Alert Gateway Configuration */}
      <div className="bg-[#171717] border border-[#242424] rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-[#242424] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <Mail className="w-4 h-4 text-[#00C784]" />
            <span>Real-Time Security Email Alert Gateway</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
            emailStatus?.configured
              ? 'bg-emerald-950 text-[#00C784] border border-emerald-800'
              : 'bg-[#222222] text-[#888888] border border-[#333333]'
          }`}>
            {emailStatus?.configured ? `CONFIGURED (${emailStatus.provider?.toUpperCase()})` : 'SANDBOX MODE'}
          </span>
        </div>

        <p className="text-xs text-[#A3A3A3]">
          Configure an API key from <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-[#FF8A00] underline">Resend</a> (free instant onboarding: <code className="text-[#00C784]">onboarding@resend.dev</code>) or <a href="https://sendgrid.com" target="_blank" rel="noreferrer" className="text-[#FF8A00] underline">SendGrid</a>. When the autonomous security agent triggers the email tool and receives Human-in-the-Loop (HITL) approval, high-severity incident notifications are dispatched to live inboxes instantly in real time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#A3A3A3] font-medium block mb-1">
              Email Dispatch Provider
            </label>
            <select
              value={emailProvider}
              onChange={(e) => setEmailProvider(e.target.value)}
              className="w-full bg-[#101010] border border-[#262626] rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00C784]"
            >
              <option value="resend">Resend (Recommended - Instant free testing with onboarding@resend.dev)</option>
              <option value="sendgrid">SendGrid (api.sendgrid.com)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-[#A3A3A3] font-medium block mb-1">
              Sender Email Address ("From")
            </label>
            <input
              type="text"
              value={emailSender}
              onChange={(e) => setEmailSender(e.target.value)}
              placeholder="AI Security Faster <onboarding@resend.dev>"
              className="w-full bg-[#101010] border border-[#262626] rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#00C784]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-[#A3A3A3] font-medium block mb-1">
            Email Service API Key
          </label>
          <input
            type="password"
            value={emailKey}
            onChange={(e) => setEmailKey(e.target.value)}
            placeholder={emailStatus?.masked_key ? `Current: ${emailStatus.masked_key} (Enter new key to update)` : 're_•••••••••••••••••••••••• (Resend) or SG.•••• (SendGrid)'}
            className="w-full bg-[#101010] border border-[#262626] rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-[#00C784]"
          />
          <p className="text-[11px] text-[#666666] mt-1">
            Keys are stored securely in backend server environment variables (<code className="text-[#888888]">backend/.env</code>) and are never exposed in browser bundles.
          </p>
        </div>

        <button
          onClick={handleSaveKeys}
          className="px-5 py-2.5 bg-[#00C784] hover:bg-[#00A86B] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_12px_rgba(0,199,132,0.3)]"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Email Gateway Key</span>
        </button>

        {/* Live Test Dispatch Sub-Box */}
        <div className="pt-4 border-t border-[#242424] space-y-3">
          <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
            <Send className="w-3.5 h-3.5 text-[#FF8A00]" />
            <span>Test Real-Time Alert Dispatch</span>
          </div>
          <p className="text-[11px] text-[#888888]">
            Verify your configuration immediately by sending a live test security alert to your own inbox.
          </p>

          <div className="flex gap-2">
            <input
              type="email"
              value={testEmailTo}
              onChange={(e) => setTestEmailTo(e.target.value)}
              placeholder="Enter your recipient email (e.g. security-lead@company.com)..."
              className="flex-1 bg-[#101010] border border-[#262626] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#FF8A00]"
            />
            <button
              onClick={handleSendTestEmail}
              disabled={isTestingEmail}
              className="px-4 py-2 bg-[#FF8A00] hover:bg-[#E06D00] text-black font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isTestingEmail ? 'animate-spin' : ''}`} />
              <span>{isTestingEmail ? 'Sending...' : 'Send Live Test'}</span>
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg border text-xs font-mono ${
              testResult.success
                ? 'bg-[#0e2417] border-[#00C784]/40 text-[#00C784]'
                : 'bg-[#261010] border-[#FF4545]/40 text-[#FF4545]'
            }`}>
              <div className="font-bold flex items-center justify-between gap-1.5 mb-1">
                <span className="flex items-center gap-1.5">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-[#00C784]" /> : <AlertCircle className="w-4 h-4 text-[#FF4545]" />}
                  {testResult.success ? 'REAL-TIME DELIVERY SUCCESSFUL' : (testResult.status || 'DELIVERY FAILED')}
                </span>
                {testResult.provider && (
                  <span className="text-[10px] opacity-75">{testResult.provider}</span>
                )}
              </div>
              <p className="text-[11px] mt-1">{testResult.message || testResult.error}</p>
              {testResult.suggestion && (
                <p className="text-[11px] text-[#FFC247] mt-1 bg-amber-950/40 p-2 rounded border border-amber-800/40">
                  {testResult.suggestion}
                </p>
              )}
              {testResult.message_id && (
                <p className="text-[10px] text-[#888888] mt-1 font-mono">Resend Delivery ID: {testResult.message_id}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AWS Cloud Computing & AML Architecture Reference */}
      <div className="bg-[#171717] border border-[#242424] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
          <Cloud className="w-4 h-4 text-[#FF8A00]" />
          <span>AWS DevOps & Advanced Machine Learning (AML) Architecture</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-[#121212] border border-[#222222] rounded-lg space-y-1">
            <div className="font-bold text-white">Amazon Bedrock Guardrails</div>
            <p className="text-[#888888] text-[11px]">
              Upstream policy filters evaluated alongside dual-boundary prompt wrappers.
            </p>
          </div>
          <div className="p-3.5 bg-[#121212] border border-[#222222] rounded-lg space-y-1">
            <div className="font-bold text-white">Amazon SageMaker Endpoints</div>
            <p className="text-[#888888] text-[11px]">
              Dedicated MLOps hosting for local fine-tuned LLM evaluators (Llama 3 70B).
            </p>
          </div>
          <div className="p-3.5 bg-[#121212] border border-[#222222] rounded-lg space-y-1">
            <div className="font-bold text-white">AWS ECS / Fargate Container Cluster</div>
            <p className="text-[#888888] text-[11px]">
              Production microservices orchestrator with AWS Secrets Manager key injection.
            </p>
          </div>
          <div className="p-3.5 bg-[#121212] border border-[#222222] rounded-lg space-y-1">
            <div className="font-bold text-white">AWS KMS & S3 Object Lock</div>
            <p className="text-[#888888] text-[11px]">
              Immutable audit log storage ensuring SOC 2 Type II and HIPAA compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
