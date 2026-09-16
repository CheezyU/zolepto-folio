import React, { useState } from 'react';
import { Lock, ArrowLeft, ShieldAlert, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginProps {
  onBackToPortfolio: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPortfolio }) => {
  const { verifyCredentials, failedAttempts, isLockedOut, lockoutRemainingSeconds, loading } =
    useAuth();

  // Inputs are completely blank with no pre-filled text or revealing placeholders
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;
    setError(null);

    const res = await verifyCredentials(email, password);
    if (!res.success) {
      setError(res.error || 'Access Denied: Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-zinc-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-zinc-700 selection:text-white">
      {/* Ambient background styling */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Return Button */}
        <button
          id="back-to-portfolio-btn"
          type="button"
          onClick={onBackToPortfolio}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-white transition-colors mb-6 cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Return to Site</span>
        </button>

        {/* Minimalist Studio Crest */}
        <div className="text-center space-y-3">
          <div className="w-13 h-13 rounded-2xl bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center mx-auto shadow-xl">
            <Lock className="w-5 h-5 text-zinc-300" />
          </div>

          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Studio Access
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              Authorized personnel only
            </p>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="mt-7 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/90 py-8 px-6 sm:px-8 rounded-3xl shadow-2xl space-y-6">
          {/* Rate-limit Lockout Warning */}
          {isLockedOut && (
            <div
              id="admin-lockout-banner"
              className="p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 flex items-start gap-3"
            >
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-300 font-mono">
                  Security Lockout Active
                </p>
                <p className="text-xs text-red-300/90 leading-relaxed">
                  Too many consecutive failed attempts. System is temporarily frozen.
                </p>
                <div className="font-mono text-sm font-bold text-red-400 pt-1">
                  Cooldown: {lockoutRemainingSeconds}s remaining
                </div>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {error && !isLockedOut && (
            <div
              id="admin-login-error"
              className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-300 flex items-start gap-2.5 text-xs font-mono"
            >
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{error}</p>
                {failedAttempts > 0 && failedAttempts < 5 && (
                  <p className="text-[11px] text-red-400/80 mt-0.5">
                    {5 - failedAttempts} attempt(s) remaining before security lockout.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Simple Email & Password Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder=""
                required
                disabled={isLockedOut}
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white font-mono placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder=""
                  required
                  disabled={isLockedOut}
                  autoComplete="current-password"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors disabled:opacity-50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Hide' : 'Show'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={loading || isLockedOut || !email || !password}
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs font-mono uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-lg mt-3 flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4 text-zinc-950" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <p className="text-[10px] font-mono text-zinc-600">
              Encrypted Session • Rate-Limiting Protection Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
