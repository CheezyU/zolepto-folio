import React, { useState } from 'react';
import { Lock, ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginProps {
  onBackToPortfolio: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPortfolio }) => {
  const { signInWithEmail, signUpWithEmail, isConfigured, signInDemoAdmin } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Access Denied');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: unknown) {
      console.warn('Login attempt failed:', err);
      setError('Access Denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back Link */}
        <button
          onClick={onBackToPortfolio}
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-900 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portfolio</span>
        </button>

        {/* Brand & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Admin Access
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-normal">
            Private management portal for Zolepto portfolio
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-white border border-zinc-200 py-8 px-6 sm:px-10 rounded-3xl shadow-sm space-y-6">
          {/* Clean 'Access Denied' Error Notice */}
          {error && (
            <div
              id="admin-login-error"
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 transition-all"
            >
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">{error}</p>
                <p className="text-[11px] text-red-600 mt-0.5">
                  Invalid email or password. Please verify credentials or set up your account.
                </p>
              </div>
            </div>
          )}

          {/* Simple Email + Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="zolepto@gmail.com"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-900 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-700"
                >
                  Password
                </label>
              </div>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••••••"
                required
                minLength={6}
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-zinc-900 transition-colors"
              />
            </div>

            <button
              id="admin-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-sm mt-2"
            >
              {loading
                ? 'Authenticating...'
                : isSignUp
                ? 'Register & Access Dashboard'
                : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Toggle between Sign In and Account Setup */}
          <div className="pt-2 text-center border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="hover:text-zinc-900 underline underline-offset-2 cursor-pointer font-mono"
            >
              {isSignUp ? 'Already have an admin account? Sign in' : 'First-time setup? Register admin'}
            </button>

            <button
              type="button"
              onClick={() => signInDemoAdmin(email || 'zolepto@gmail.com')}
              className="text-zinc-400 hover:text-zinc-700 font-mono text-[11px] cursor-pointer"
            >
              Quick Demo Access
            </button>
          </div>
        </div>

        {/* Security architecture note */}
        <p className="mt-6 text-center text-[11px] font-mono text-zinc-400">
          GitHub & Vercel Architecture • Authorized Admin Only
        </p>
      </div>
    </div>
  );
};
