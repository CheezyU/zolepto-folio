import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth, STRICT_ADMIN_EMAIL } from '../../context/AuthContext';
import { SecurityLogEntry } from '../../types';

interface SecurityTabProps {
  auditLogs: SecurityLogEntry[];
  onRefreshLogs: () => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({ auditLogs, onRefreshLogs }) => {
  const {
    twoFactorSettings,
    regenerateTwoFactorSecret,
    setMasterPassword,
    primaryAdminEmail,
  } = useAuth();

  const [copiedKey, setCopiedKey] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(twoFactorSettings.secret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 8) {
      setPasswordStatus({
        type: 'error',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'Passwords do not match.',
      });
      return;
    }

    const success = await setMasterPassword(newPassword);
    if (success) {
      setPasswordStatus({
        type: 'success',
        message: 'Master password successfully updated!',
      });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordStatus({
        type: 'error',
        message: 'Failed to update password.',
      });
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold text-zinc-900">
          Security & Access Hardening
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Master authentication perimeter, TOTP 2FA parameters, and security audit log.
        </p>
      </div>

      {/* Access Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200">
          <span className="text-[11px] font-mono text-zinc-400 block">AUTHORIZED MASTER KEY</span>
          <p className="text-base font-bold text-zinc-900 mt-1">{primaryAdminEmail}</p>
          <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Single Authorized Owner</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200">
          <span className="text-[11px] font-mono text-zinc-400 block">TWO-FACTOR (2FA)</span>
          <p className="text-base font-bold text-emerald-600 mt-1">RFC 6238 TOTP Active</p>
          <p className="text-xs text-zinc-500 mt-0.5">Google Authenticator Enforced</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200">
          <span className="text-[11px] font-mono text-zinc-400 block">LOCKOUT PROTECTION</span>
          <p className="text-base font-bold text-zinc-900 mt-1">5-Attempt Rate Limiter</p>
          <p className="text-xs text-zinc-500 mt-0.5">Auto-freezes on brute-force</p>
        </div>
      </div>

      {/* Two-Factor Authentication (2FA) Management Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-zinc-900">
                Two-Factor Authentication (TOTP 2FA)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Compatible with Google Authenticator, 1Password, Microsoft Authenticator, and Apple Passwords.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-700 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>ARMED</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
          <p className="text-xs font-mono text-zinc-600 uppercase tracking-wider">
            Your Authenticator Secret Key (Base32)
          </p>
          <div className="flex items-center gap-3">
            <code className="px-3 py-2 rounded-xl bg-white border border-zinc-200 font-mono text-sm text-zinc-900 tracking-wider flex-1 select-all font-semibold">
              {twoFactorSettings.secret}
            </code>
            <button
              type="button"
              onClick={handleCopyKey}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>
          <p className="text-[11px] text-zinc-500">
            Open Google Authenticator → Tap <strong>+</strong> → Select <strong>Enter a setup key</strong> → Set Account Name to <em>Zolepto Studio</em> and paste this key.
          </p>
        </div>

        {/* Emergency Backup Codes Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-700 font-semibold">
              Emergency One-Time Recovery Codes ({twoFactorSettings.backupCodes.length} remaining)
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
            {twoFactorSettings.backupCodes.map((code) => (
              <div
                key={code}
                className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-center select-all font-semibold"
              >
                {code}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500">
            Keep these emergency codes safe. Each code can be entered into the 2FA login screen if your phone is unavailable.
          </p>
        </div>
      </div>

      {/* Change Master Password Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-6">
        <div>
          <h3 className="font-display font-bold text-lg text-zinc-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-zinc-900" />
            <span>Update Master Admin Password</span>
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Choose a strong custom password for your administrator account.
          </p>
        </div>

        {passwordStatus && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              passwordStatus.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {passwordStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{passwordStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1">
              New Master Password (Min. 8 chars)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new master password"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-900"
                title={showPassword ? 'Hide' : 'Show'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-700 mb-1">
              Confirm New Master Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new master password"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-900"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Update Master Password
          </button>
        </form>
      </div>

      {/* Security Audit Trail Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-base text-zinc-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Security Audit Log (Recent Operations)</span>
          </h3>
          <button
            onClick={onRefreshLogs}
            className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900"
            title="Refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs font-mono text-zinc-400">No security events recorded yet.</p>
        ) : (
          <div className="divide-y divide-zinc-100 max-h-80 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-zinc-900">{log.action}</span>
                  {log.details && (
                    <span className="text-zinc-400 ml-2 font-mono text-[11px]">
                      ({log.details})
                    </span>
                  )}
                </div>
                <span className="font-mono text-zinc-400 text-[11px] shrink-0">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
