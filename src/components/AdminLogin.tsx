import React, { useState, useEffect } from 'react';
import {
  Lock,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Smartphone,
  Eye,
  EyeOff,
  Copy,
  Check,
  LifeBuoy,
  RefreshCw,
} from 'lucide-react';
import { useAuth, STRICT_ADMIN_EMAIL, DEFAULT_MASTER_PASSWORD } from '../context/AuthContext';
import { getTotpRemainingSeconds, generateTotpCode } from '../lib/totp';

interface AdminLoginProps {
  onBackToPortfolio: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPortfolio }) => {
  const {
    verifyPrimaryCredentials,
    completeTwoFactorLogin,
    twoFactorSettings,
    failedAttempts,
    isLockedOut,
    lockoutRemainingSeconds,
    loading,
  } = useAuth();

  // Step 1: Password stage, Step 2: 2FA TOTP stage
  const [step, setStep] = useState<'credentials' | 'two_factor'>('credentials');
  const [email, setEmail] = useState(STRICT_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [show2FaAssistant, setShow2FaAssistant] = useState(false);
  const [simulatedLiveCode, setSimulatedLiveCode] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);

  // Live TOTP clock ticker for setup assistant
  useEffect(() => {
    let timer: number;
    const updateTick = async () => {
      setSecondsRemaining(getTotpRemainingSeconds());
      if (twoFactorSettings.secret) {
        try {
          const code = await generateTotpCode(twoFactorSettings.secret);
          setSimulatedLiveCode(code);
        } catch {
          // ignore
        }
      }
    };

    updateTick();
    timer = window.setInterval(updateTick, 1000);
    return () => clearInterval(timer);
  }, [twoFactorSettings.secret]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;
    setError(null);

    const res = await verifyPrimaryCredentials(email, password);
    if (!res.success) {
      setError(res.error || 'Access Denied: Invalid credentials');
      return;
    }

    if (res.requires2FA) {
      setStep('two_factor');
    }
  };

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;
    setError(null);

    if (!twoFactorCode.trim()) {
      setError('Please enter your 6-digit Authenticator code or a Backup code.');
      return;
    }

    const res = await completeTwoFactorLogin(twoFactorCode.trim());
    if (!res.success) {
      setError(res.error || 'Invalid 2FA code. Please try again.');
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(twoFactorSettings.secret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleUseSimulatedCode = () => {
    if (simulatedLiveCode) {
      setTwoFactorCode(simulatedLiveCode);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-zinc-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-zinc-700 selection:text-white">
      {/* Subtle architectural ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Back Link */}
        <button
          id="back-to-portfolio-btn"
          type="button"
          onClick={onBackToPortfolio}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors mb-6 cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Return to Public Site</span>
        </button>

        {/* Security Crest Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700/80 text-white flex items-center justify-center mx-auto shadow-xl relative">
            <Lock className="w-6 h-6 text-zinc-200" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Hardened Studio Gate</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Director Master Access
            </h1>
            <p className="text-xs text-zinc-400 font-normal mt-1">
              Restricted to verified keyholder{' '}
              <span className="font-mono text-zinc-200 font-semibold">{STRICT_ADMIN_EMAIL}</span>
            </p>
          </div>
        </div>

        {/* Security Enclosure Card */}
        <div className="mt-7 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 py-8 px-6 sm:px-8 rounded-3xl shadow-2xl space-y-6">
          {/* Lockout Warning Banner */}
          {isLockedOut && (
            <div
              id="admin-lockout-banner"
              className="p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 flex items-start gap-3"
            >
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-300">
                  Security Lockout Active
                </p>
                <p className="text-xs text-red-300/90 leading-relaxed">
                  Too many consecutive failed attempts. System is frozen for protection.
                </p>
                <div className="font-mono text-sm font-bold text-red-400 pt-1">
                  Cooldown: {lockoutRemainingSeconds}s remaining
                </div>
              </div>
            </div>
          )}

          {/* Standard Error Notice */}
          {error && !isLockedOut && (
            <div
              id="admin-login-error"
              className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-300 flex items-start gap-2.5"
            >
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold">{error}</p>
                {failedAttempts > 0 && failedAttempts < 5 && (
                  <p className="text-[11px] text-red-400/80 mt-0.5">
                    Security warning: {5 - failedAttempts} attempt(s) remaining before security lockout.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================= STEP 1: CREDENTIALS ================= */}
          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5"
                >
                  Authorized Master Key Email
                </label>
                <div className="relative">
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={STRICT_ADMIN_EMAIL}
                    required
                    disabled={isLockedOut}
                    autoComplete="email"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors disabled:opacity-50"
                  />
                  <div className="absolute right-3 top-2.5 pointer-events-none">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      Key
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Only <span className="text-zinc-400 font-mono">{STRICT_ADMIN_EMAIL}</span> possesses administrative privileges.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-mono uppercase tracking-wider text-zinc-400"
                  >
                    Master Password
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Default: {DEFAULT_MASTER_PASSWORD}
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter master password"
                    required
                    disabled={isLockedOut}
                    autoComplete="current-password"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors disabled:opacity-50 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="admin-verify-password-btn"
                type="submit"
                disabled={loading || isLockedOut || !password}
                className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-lg mt-2 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-zinc-950" />
                <span>{loading ? 'Verifying Key...' : 'Verify & Proceed to 2FA'}</span>
              </button>
            </form>
          )}

          {/* ================= STEP 2: TWO-FACTOR AUTHENTICATION ================= */}
          {step === 'two_factor' && (
            <form onSubmit={handleTwoFactorSubmit} className="space-y-5 animate-in fade-in duration-200">
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white">2FA Challenge Required</p>
                  <p className="text-[11px] text-zinc-400 truncate">
                    Enter the 6-digit code from Google Authenticator or your backup code.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="two-factor-code"
                    className="block text-xs font-mono uppercase tracking-wider text-zinc-300"
                  >
                    6-Digit Authenticator Code
                  </label>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Window: {secondsRemaining}s
                  </span>
                </div>
                <input
                  id="two-factor-code"
                  type="text"
                  maxLength={10}
                  value={twoFactorCode}
                  onChange={(e) => {
                    setTwoFactorCode(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="000 000 or ZLP-XXXXXX"
                  required
                  autoFocus
                  disabled={isLockedOut}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700 text-center font-mono text-xl tracking-[0.25em] text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  id="admin-submit-2fa-btn"
                  type="submit"
                  disabled={loading || isLockedOut || !twoFactorCode.trim()}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-zinc-950" />
                  <span>{loading ? 'Authenticating 2FA...' : 'Authorize Master Session'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('credentials');
                    setError(null);
                  }}
                  className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors py-1 cursor-pointer"
                >
                  ← Back to Password
                </button>
              </div>

              {/* Instant 2FA Setup Helper & Emergency Backup Drawer */}
              <div className="pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setShow2FaAssistant(!show2FaAssistant)}
                  className="w-full flex items-center justify-between text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <LifeBuoy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>View Authenticator Key & Emergency Backup Codes</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {show2FaAssistant ? '▲ Hide' : '▼ Reveal'}
                  </span>
                </button>

                {show2FaAssistant && (
                  <div className="mt-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3.5 text-left text-xs animate-in fade-in">
                    <div>
                      <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                        Google Authenticator Setup Key
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-emerald-400 tracking-wider flex-1 select-all">
                          {twoFactorSettings.secret}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs transition-colors cursor-pointer flex items-center gap-1"
                          title="Copy Secret Key"
                        >
                          {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Add account in Google Authenticator or Apple Passwords using this manual key.
                      </p>
                    </div>

                    {/* Live generated code for instant convenience */}
                    <div className="pt-2 border-t border-zinc-900">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-mono text-zinc-400">
                          Current Active TOTP (Live):
                        </p>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Expires in {secondsRemaining}s
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white tracking-widest px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
                          {simulatedLiveCode || 'Generating...'}
                        </span>
                        <button
                          type="button"
                          onClick={handleUseSimulatedCode}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Auto-Fill Code</span>
                        </button>
                      </div>
                    </div>

                    {/* Emergency Backup Codes */}
                    <div className="pt-2 border-t border-zinc-900">
                      <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                        Emergency One-Time Recovery Codes:
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                        {twoFactorSettings.backupCodes.map((code) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => setTwoFactorCode(code)}
                            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 text-left transition-colors cursor-pointer"
                            title="Click to use this recovery code"
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">
                        Click any backup code to fill it if your authenticator device is unavailable.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* Security Disclaimer */}
          <div className="pt-2 text-center">
            <p className="text-[10px] font-mono text-zinc-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              <span>TLS End-to-End Encrypted • Hardware & TOTP Enforced</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
