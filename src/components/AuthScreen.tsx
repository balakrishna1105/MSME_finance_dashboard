import React, { useState } from 'react';
import { UserAccount, ActiveScreen } from '../types';

interface AuthScreenProps {
  onAuthenticate: (user: UserAccount, targetScreen?: ActiveScreen) => void;
  availableUsers: UserAccount[];
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthenticate,
  availableUsers
}) => {
  const [selectedUser, setSelectedUser] = useState<UserAccount>(availableUsers[0]);
  const [email, setEmail] = useState<string>('s.jenkins@azad-ai.io');
  const [password, setPassword] = useState<string>('••••••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authStepText, setAuthStepText] = useState<string>('Authenticate & Open Workspace');
  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);

  const showToast = (title: string, message: string) => {
    setFeedback({ title, message });
    setTimeout(() => {
      setFeedback(null);
    }, 3800);
  };

  const handleSelectDemoProfile = (user: UserAccount) => {
    setSelectedUser(user);
    setEmail(user.email);
    setPassword('••••••••••••••••');
    showToast(
      `Profile Selected: ${user.name}`,
      `Populated credentials for ${user.role} (${user.department}). Ready for cryptographic handshake.`
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    setAuthStepText('Negotiating WebAuthn Challenge...');

    setTimeout(() => {
      setAuthStepText('Identity Handshake Verified');
      showToast(
        'Authentication Successful',
        `Cryptographic challenge validated. Routing token to Document Workspace AP-South-1...`
      );

      setTimeout(() => {
        setIsAuthenticating(false);
        onAuthenticate(selectedUser, 'dashboard');
      }, 1200);
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] relative flex flex-col justify-between selection:bg-[#3198dc] selection:text-[#002c47] overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#93ccff]/5 rounded-full blur-[140px]"></div>
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#0053db]/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-[#3f4850]/20">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#3198dc] flex items-center justify-center text-[#002c47] shadow-sm">
              <span className="material-symbols-outlined text-[16px]">token</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-lg tracking-tight text-[#dae2fd] uppercase font-sans">
                AZAD
              </span>
              <span className="font-mono text-xs text-[#93ccff] tracking-widest">
                DOC_INTEL
              </span>
            </div>
          </div>

          {/* Compliance Indicators */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171f33] text-[#bfc7d2] font-mono text-[11px] border border-[#3f4850]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#93ccff] animate-pulse"></span>
              <span>FEDRAMP_READY</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#171f33] text-[#bfc7d2] font-mono text-[11px] border border-[#3f4850]/40">
              <span className="material-symbols-outlined text-[14px] text-[#7bd0ff]">verified_user</span>
              <span>SOC2_TYPE_II</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dual Card Layout */}
      <main className="relative z-10 w-full flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch justify-center gap-6 my-auto">
          {/* Left: Authentication Central Card */}
          <div className="flex-1 w-full max-w-xl mx-auto bg-[#171f33] rounded-xl shadow-2xl relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 border border-[#3f4850]/40">
            {/* Ambient Corner Blurs */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-[#3198dc]/15 rounded-full blur-3xl"></div>
            <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-[#009bd1]/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-6">
              {/* Header Context */}
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#222a3d] text-[#7bd0ff] font-mono text-xs mb-3 border border-[#3f4850]/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7bd0ff] animate-ping"></span>
                  <span>ENTERPRISE GATEWAY • v2.4.9</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#dae2fd]">
                  Sign in to Azad
                </h1>
                <p className="text-sm text-[#bfc7d2] mt-1.5 leading-relaxed">
                  Access your day-wise extraction ledgers, human-in-the-loop review queue, and active schema models.
                </p>
              </div>

              {/* SSO Identity Providers */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      showToast('Okta SSO Initialized', 'Connecting with Enterprise Okta IdP (azad-okta-prod)...');
                      setTimeout(handleSubmit, 600);
                    }}
                    className="flex items-center justify-center gap-2 bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] py-2 px-3 rounded text-xs transition-colors border border-[#3f4850]/40"
                    type="button"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#3198dc] flex items-center justify-center text-[#002c47] text-[10px] font-bold">
                      O
                    </span>
                    <span className="truncate">Okta SSO</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast('Google WS Initialized', 'Connecting with Google Workspace Enterprise Directory...');
                      setTimeout(handleSubmit, 600);
                    }}
                    className="flex items-center justify-center gap-2 bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] py-2 px-3 rounded text-xs transition-colors border border-[#3f4850]/40"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#7bd0ff]">cloud_done</span>
                    <span className="truncate">Google WS</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast('Azure SAML Initialized', 'Negotiating Azure Entra ID SAML 2.0 assertion...');
                      setTimeout(handleSubmit, 600);
                    }}
                    className="flex items-center justify-center gap-2 bg-[#222a3d] hover:bg-[#2d3449] text-[#dae2fd] py-2 px-3 rounded text-xs transition-colors border border-[#3f4850]/40"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#b4c5ff]">domain</span>
                    <span className="truncate">Azure SAML</span>
                  </button>
                </div>
              </div>

              {/* Micro-Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="w-full h-px bg-[#2d3449]"></div>
                <span className="absolute px-3 bg-[#171f33] font-mono text-[10px] text-[#89929b] uppercase tracking-wider">
                  Or enterprise credentials
                </span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[11px] text-[#bfc7d2]" htmlFor="work-email">
                      WORK EMAIL
                    </label>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#7bd0ff]">
                      <span className="material-symbols-outlined text-[12px]">verified</span> AZAD-AI.IO
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#89929b] pointer-events-none">
                      alternate_email
                    </span>
                    <input
                      id="work-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#131b2e] text-[#dae2fd] text-sm pl-10 pr-3 py-2.5 rounded focus:bg-[#060e20] focus:outline-none focus:ring-1 focus:ring-[#93ccff] transition-colors border border-[#3f4850]/40 font-mono shadow-inner"
                      placeholder="s.jenkins@azad-ai.io"
                      type="email"
                      required
                    />
                  </div>
                </div>

                {/* Password / Key */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[11px] text-[#bfc7d2]" htmlFor="work-password">
                      SECURITY KEY / PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => showToast('Recovery Triggered', 'WebAuthn reset link dispatched to enterprise security liaison.')}
                      className="text-xs text-[#93ccff] hover:underline"
                    >
                      Forgot key?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[18px] text-[#89929b] pointer-events-none">
                      encrypted
                    </span>
                    <input
                      id="work-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#131b2e] text-[#dae2fd] text-sm pl-10 pr-10 py-2.5 rounded focus:bg-[#060e20] focus:outline-none focus:ring-1 focus:ring-[#93ccff] transition-colors border border-[#3f4850]/40 font-mono shadow-inner tracking-widest"
                      type={showPassword ? 'text' : 'password'}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#89929b] hover:text-[#dae2fd] flex items-center justify-center p-1"
                      aria-label="Toggle password view"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Hardware Token & Checkbox */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="accent-[#93ccff] w-4 h-4 rounded bg-[#131b2e] cursor-pointer"
                    />
                    <span className="text-xs text-[#bfc7d2]">Remember workstation (30d)</span>
                  </label>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#222a3d] text-[#bfc7d2] font-mono text-[10px] border border-[#3f4850]/30">
                    <span className="material-symbols-outlined text-[14px] text-[#93ccff]">key</span>
                    <span>FIDO2 / WEBAUTHN READY</span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full bg-[#3198dc] hover:bg-[#009bd1] text-[#002c47] font-semibold text-sm py-2.5 px-4 rounded transition-all flex items-center justify-center gap-2 shadow-lg group relative overflow-hidden disabled:opacity-75 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                    {isAuthenticating ? 'sync' : 'login'}
                  </span>
                  <span>{authStepText}</span>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#002c47]/20 font-mono text-[11px] text-[#002c47] ml-2">
                    ↵ Enter
                  </kbd>
                </button>
              </form>

              {/* Compliance Mini-Bar */}
              <div className="flex items-center justify-between gap-1 pt-2 text-[#89929b] font-mono text-[10px] uppercase border-t border-[#3f4850]/20">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#7bd0ff]">check_circle</span>
                  <span>2FA ENFORCED</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#93ccff]">shield_lock</span>
                  <span>SOC-2 TYPE II</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#b4c5ff]">health_and_safety</span>
                  <span>HIPAA AUDITED</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Directory Switcher */}
            <div className="relative z-10 mt-6 pt-3 bg-[#131b2e] p-3 rounded-lg border border-[#3f4850]/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-[#89929b] uppercase tracking-wider">
                  Demo Directory Quick-Select
                </span>
                <span className="font-mono text-[10px] text-[#7bd0ff]">MOCK_AUTH_ACTIVE</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {availableUsers.slice(0, 3).map((usr) => {
                  const isSelected = selectedUser.id === usr.id;
                  return (
                    <button
                      key={usr.id}
                      type="button"
                      onClick={() => handleSelectDemoProfile(usr)}
                      className={`text-left p-2 rounded transition-colors flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-[#222a3d] border-[#93ccff]/50'
                          : 'bg-[#171f33] border-transparent hover:bg-[#222a3d]'
                      }`}
                    >
                      <div className="w-6 h-6 rounded bg-[#93ccff]/20 text-[#93ccff] flex items-center justify-center font-mono text-[11px] font-semibold shrink-0">
                        {usr.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-[#dae2fd] font-medium truncate">{usr.name}</p>
                        <p className="font-mono text-[10px] text-[#89929b] truncate">{usr.roleTag}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Live Orchestration & Telemetry Panel */}
          <div className="flex-1 w-full max-w-xl mx-auto flex flex-col justify-between gap-4">
            {/* Top Micro Stats / Node Telemetry Grid */}
            <div className="bg-[#171f33] rounded-xl p-5 sm:p-6 shadow-lg relative overflow-hidden space-y-4 border border-[#3f4850]/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#93ccff] animate-pulse"></span>
                  <span className="text-sm font-semibold text-[#dae2fd]">Cluster Telemetry</span>
                </div>
                <span className="font-mono text-xs text-[#93ccff] px-2 py-0.5 rounded bg-[#222a3d] border border-[#3f4850]/40">
                  AP-SOUTH-1 (MUMBAI)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#131b2e] p-3 rounded space-y-1 border border-[#3f4850]/30">
                  <span className="font-mono text-[10px] text-[#89929b] block uppercase">
                    DAILY PIPELINE VOL
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-semibold text-[#dae2fd] font-mono">1.48M</span>
                    <span className="font-mono text-xs text-[#7bd0ff] font-semibold">+12.4%</span>
                  </div>
                  <span className="text-xs text-[#bfc7d2]">Ledger pages verified</span>
                </div>

                <div className="bg-[#131b2e] p-3 rounded space-y-1 border border-[#3f4850]/30">
                  <span className="font-mono text-[10px] text-[#89929b] block uppercase">
                    SYSTEM SLA
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-semibold text-[#7bd0ff] font-mono">99.98%</span>
                    <span className="material-symbols-outlined text-[16px] text-[#7bd0ff]">check_circle</span>
                  </div>
                  <span className="text-xs text-[#bfc7d2]">Zero dropped packets</span>
                </div>
              </div>

              {/* In-flight OCR Model Run Stream */}
              <div className="bg-[#131b2e] p-3 rounded space-y-2 border border-[#3f4850]/30">
                <div className="flex items-center justify-between text-[#bfc7d2] font-mono text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#93ccff]">model_training</span>
                    <span>ACTIVE MODEL WEIGHT</span>
                  </div>
                  <span className="text-[#7bd0ff]">Llama-Vision-OCR-70B-FP8</span>
                </div>

                {/* SVG Latency Curve */}
                <div className="w-full pt-1">
                  <div className="flex items-center justify-between font-mono text-[10px] text-[#89929b] mb-1">
                    <span>LATENCY VARIANCE (LAST 60 SEC)</span>
                    <span className="text-[#dae2fd] font-semibold">18.2ms avg</span>
                  </div>
                  <svg className="w-full h-10 text-[#93ccff]" fill="none" viewBox="0 0 300 40">
                    <path
                      d="M0 25 L30 22 L60 27 L90 15 L120 18 L150 12 L180 20 L210 14 L240 10 L270 16 L300 12"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.75"
                    />
                    <path
                      d="M0 25 L30 22 L60 27 L90 15 L120 18 L150 12 L180 20 L210 14 L240 10 L270 16 L300 12 L300 40 L0 40 Z"
                      fill="currentColor"
                      fillOpacity="0.08"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Realtime Ingestion Ledger Live View Card */}
            <div className="bg-[#171f33] rounded-xl p-5 sm:p-6 shadow-lg relative flex flex-col justify-between flex-1 space-y-4 border border-[#3f4850]/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#7bd0ff]">find_in_page</span>
                  <span className="text-sm font-semibold text-[#dae2fd]">Ingestion Ledger Live View</span>
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#222a3d] text-[#89929b] border border-[#3f4850]/30">
                  STREAM #8841-B
                </span>
              </div>

              {/* Sample Document Extraction Card */}
              <div className="bg-[#131b2e] rounded p-3 space-y-2 border border-[#3f4850]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#7bd0ff]"></span>
                    <span className="font-mono text-xs text-[#dae2fd] font-medium truncate">
                      DERIVATIVE_ISDA_MASTER_v4.PDF
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#7bd0ff] bg-[#7bd0ff]/10 px-1.5 py-0.5 rounded border border-[#7bd0ff]/20">
                    CONF 99.4%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1">
                  <div className="p-2 rounded bg-[#171f33] text-[#bfc7d2] border border-[#3f4850]/20">
                    <span className="text-[#89929b] block text-[9px] uppercase tracking-wider">
                      Entity A (Counterparty)
                    </span>
                    <span className="text-[#dae2fd] truncate block font-medium">MORGAN CHASE CORP</span>
                  </div>
                  <div className="p-2 rounded bg-[#171f33] text-[#bfc7d2] border border-[#3f4850]/20">
                    <span className="text-[#89929b] block text-[9px] uppercase tracking-wider">
                      Notional Amount
                    </span>
                    <span className="text-[#7bd0ff] truncate block font-semibold">$450,000,000.00</span>
                  </div>
                  <div className="p-2 rounded bg-[#171f33] text-[#bfc7d2] border border-[#3f4850]/20">
                    <span className="text-[#89929b] block text-[9px] uppercase tracking-wider">
                      Governing Law
                    </span>
                    <span className="text-[#dae2fd] truncate block">New York State</span>
                  </div>
                  <div className="p-2 rounded bg-[#171f33] text-[#bfc7d2] border border-[#3f4850]/20">
                    <span className="text-[#89929b] block text-[9px] uppercase tracking-wider">
                      Termination Event
                    </span>
                    <span className="text-[#b4c5ff] truncate block">Clause 5.1(b) Met</span>
                  </div>
                </div>
              </div>

              {/* Infrastructure Visual Strip */}
              <div className="flex items-center justify-between gap-2 pt-1 text-[#89929b] font-mono text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">terminal</span>
                  <span>REST API v2.4</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  <span>AES-256-GCM</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">hub</span>
                  <span>K8S MULTI-REGION</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Notification Toast */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-xl bg-[#222a3d] border border-[#3f4850] text-[#dae2fd] shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] text-[#7bd0ff] shrink-0 mt-0.5">
              check_circle
            </span>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{feedback.title}</h4>
              <p className="text-xs text-[#bfc7d2] mt-0.5 leading-snug">{feedback.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-4 border-t border-[#3f4850]/20">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[#bfc7d2] text-xs">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="material-symbols-outlined text-[14px] text-[#89929b]">lock</span>
            <span>256-BIT ENCRYPTED ENTERPRISE GATEWAY</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button
              onClick={() => showToast('Security Policy', 'SOC 2 Type II and FedRAMP high baseline enforced.')}
              className="hover:text-white transition-colors"
            >
              Security Policy
            </button>
            <button
              onClick={() => showToast('Audit Compliance', 'Immutable append-only ledger active with SHA-256 hashing.')}
              className="hover:text-white transition-colors"
            >
              Audit Compliance
            </button>
            <button
              onClick={() => showToast('System Status', 'All 8 cluster worker nodes operating at 100% capacity.')}
              className="hover:text-white transition-colors"
            >
              System Status
            </button>
            <span className="font-mono text-[10px] text-[#89929b]">© 2025 AZAD PLATFORMS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
