import React, { createContext, useContext, useEffect, useState } from 'react';
import { verifyTotpCode, generateTotpSecret, generateBackupCodes, buildOtpAuthUri } from '../lib/totp';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  authenticatedWith2FA: boolean;
  loginTimestamp: number;
}

export interface TwoFactorSettings {
  enabled: boolean;
  secret: string;
  backupCodes: string[];
  setupCompleted: boolean;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  twoFactorSettings: TwoFactorSettings;
  failedAttempts: number;
  isLockedOut: boolean;
  lockoutRemainingSeconds: number;
  primaryAdminEmail: string;
  verifyPrimaryCredentials: (email: string, pass: string) => Promise<{ success: boolean; requires2FA: boolean; error?: string }>;
  completeTwoFactorLogin: (code: string) => Promise<{ success: boolean; error?: string }>;
  setMasterPassword: (newPass: string) => Promise<boolean>;
  regenerateTwoFactorSecret: () => { secret: string; uri: string; backupCodes: string[] };
  confirmTwoFactorActivation: (testCode: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Security Storage Keys
const ADMIN_SESSION_KEY = 'zolepto_admin_session';
const ADMIN_CREDENTIALS_KEY = 'zolepto_admin_master_password';
const ADMIN_2FA_KEY = 'zolepto_admin_2fa_config';
const FAILED_ATTEMPTS_KEY = 'zolepto_admin_failed_attempts';
const LOCKOUT_UNTIL_KEY = 'zolepto_admin_lockout_until';

// The single exclusive authorized key email specified by user
export const STRICT_ADMIN_EMAIL = 'zelopte@gmail.com';
export const DEFAULT_MASTER_PASSWORD = 'Zelopte2026!';
const DEFAULT_2FA_SECRET = 'JBSWY3DPEHPK3PXP'; // Base32 default initial seed

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!stored) return null;
      const parsed: AdminUser = JSON.parse(stored);
      // Auto-expire session after 12 hours of inactivity
      const twelveHoursMs = 12 * 60 * 60 * 1000;
      if (Date.now() - parsed.loginTimestamp > twelveHoursMs) {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const count = localStorage.getItem(FAILED_ATTEMPTS_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState(0);

  // Temporary holding state between Step 1 (password) and Step 2 (2FA)
  const [pendingUserEmail, setPendingUserEmail] = useState<string | null>(null);

  // 2FA Configuration
  const [twoFactorSettings, setTwoFactorSettings] = useState<TwoFactorSettings>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_2FA_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      enabled: true,
      secret: DEFAULT_2FA_SECRET,
      backupCodes: ['ZLP-749102', 'ZLP-831940', 'ZLP-610294', 'ZLP-950218', 'ZLP-420915'],
      setupCompleted: true,
    };
  });

  // Check lockout on mount and tick countdown
  useEffect(() => {
    const checkLockout = () => {
      try {
        const lockoutUntil = localStorage.getItem(LOCKOUT_UNTIL_KEY);
        if (lockoutUntil) {
          const diff = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 1000);
          if (diff > 0) {
            setLockoutRemainingSeconds(diff);
          } else {
            setLockoutRemainingSeconds(0);
            localStorage.removeItem(LOCKOUT_UNTIL_KEY);
            localStorage.removeItem(FAILED_ATTEMPTS_KEY);
            setFailedAttempts(0);
          }
        }
      } catch {
        // ignore
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const recordFailedAttempt = () => {
    const next = failedAttempts + 1;
    setFailedAttempts(next);
    localStorage.setItem(FAILED_ATTEMPTS_KEY, next.toString());

    // Lockout for 5 minutes after 5 failed attempts
    if (next >= 5) {
      const lockoutTimestamp = Date.now() + 5 * 60 * 1000;
      localStorage.setItem(LOCKOUT_UNTIL_KEY, lockoutTimestamp.toString());
      setLockoutRemainingSeconds(300);
    }
  };

  const resetFailedAttempts = () => {
    setFailedAttempts(0);
    setLockoutRemainingSeconds(0);
    localStorage.removeItem(FAILED_ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_UNTIL_KEY);
  };

  /**
   * Step 1: Verify Email and Master Password
   */
  const verifyPrimaryCredentials = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; requires2FA: boolean; error?: string }> => {
    if (lockoutRemainingSeconds > 0) {
      return {
        success: false,
        requires2FA: false,
        error: `Security Lockout Active. Please wait ${lockoutRemainingSeconds}s before retrying.`,
      };
    }

    setLoading(true);
    try {
      const normalizedInput = email.trim().toLowerCase();
      // Only zelopte@gmail.com (and zolepto@gmail.com) authorized as requested by user
      const isAuthorizedEmail =
        normalizedInput === STRICT_ADMIN_EMAIL.toLowerCase() ||
        normalizedInput === 'zolepto@gmail.com';

      if (!isAuthorizedEmail) {
        recordFailedAttempt();
        return { success: false, requires2FA: false, error: 'Access Denied: Unauthorized Account' };
      }

      // Check master password
      const savedPass = localStorage.getItem(ADMIN_CREDENTIALS_KEY) || DEFAULT_MASTER_PASSWORD;
      if (pass !== savedPass) {
        recordFailedAttempt();
        return { success: false, requires2FA: false, error: 'Access Denied: Invalid Master Password' };
      }

      // Password matches! Proceed to 2FA
      setPendingUserEmail(normalizedInput);
      return { success: true, requires2FA: twoFactorSettings.enabled };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Complete 2FA Verification (TOTP code or Emergency Backup Code)
   */
  const completeTwoFactorLogin = async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!pendingUserEmail) {
      return { success: false, error: 'Authentication session expired. Please re-enter your password.' };
    }

    if (lockoutRemainingSeconds > 0) {
      return {
        success: false,
        error: `Security Lockout Active. Please wait ${lockoutRemainingSeconds}s before retrying.`,
      };
    }

    setLoading(true);
    try {
      const cleaned = code.trim().toUpperCase();

      // 1. Check if it's an emergency backup code
      if (twoFactorSettings.backupCodes.includes(cleaned)) {
        // Consume backup code
        const updatedCodes = twoFactorSettings.backupCodes.filter((c) => c !== cleaned);
        const updatedSettings = { ...twoFactorSettings, backupCodes: updatedCodes };
        setTwoFactorSettings(updatedSettings);
        localStorage.setItem(ADMIN_2FA_KEY, JSON.stringify(updatedSettings));

        finishLogin(pendingUserEmail);
        return { success: true };
      }

      // 2. Check 6-digit TOTP code against Authenticator
      const isValidTotp = await verifyTotpCode(twoFactorSettings.secret, cleaned);
      if (!isValidTotp) {
        recordFailedAttempt();
        return { success: false, error: 'Invalid 2FA Verification Code. Check Google Authenticator or use a Backup Code.' };
      }

      finishLogin(pendingUserEmail);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const finishLogin = (email: string) => {
    resetFailedAttempts();
    setPendingUserEmail(null);

    const adminUser: AdminUser = {
      uid: 'admin-zolepto-master',
      email: STRICT_ADMIN_EMAIL,
      displayName: 'Zolepto Master Director',
      authenticatedWith2FA: true,
      loginTimestamp: Date.now(),
    };

    setUser(adminUser);
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
    window.dispatchEvent(new Event('storage'));
  };

  const setMasterPassword = async (newPass: string): Promise<boolean> => {
    if (!newPass || newPass.length < 8) return false;
    localStorage.setItem(ADMIN_CREDENTIALS_KEY, newPass);
    return true;
  };

  const regenerateTwoFactorSecret = () => {
    const newSecret = generateTotpSecret(20);
    const newBackupCodes = generateBackupCodes();
    const uri = buildOtpAuthUri(newSecret, STRICT_ADMIN_EMAIL, 'Zolepto Studio');
    return { secret: newSecret, uri, backupCodes: newBackupCodes };
  };

  const confirmTwoFactorActivation = async (testCode: string): Promise<boolean> => {
    const isValid = await verifyTotpCode(twoFactorSettings.secret, testCode);
    if (!isValid) return false;

    const updated: TwoFactorSettings = {
      ...twoFactorSettings,
      setupCompleted: true,
      enabled: true,
    };
    setTwoFactorSettings(updated);
    localStorage.setItem(ADMIN_2FA_KEY, JSON.stringify(updated));
    return true;
  };

  const logout = () => {
    setUser(null);
    setPendingUserEmail(null);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        twoFactorSettings,
        failedAttempts,
        isLockedOut: lockoutRemainingSeconds > 0,
        lockoutRemainingSeconds,
        primaryAdminEmail: STRICT_ADMIN_EMAIL,
        verifyPrimaryCredentials,
        completeTwoFactorLogin,
        setMasterPassword,
        regenerateTwoFactorSecret,
        confirmTwoFactorActivation,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
