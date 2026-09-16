import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  loginTimestamp: number;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  failedAttempts: number;
  isLockedOut: boolean;
  lockoutRemainingSeconds: number;
  primaryAdminEmail: string;
  verifyCredentials: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  setMasterPassword: (newPass: string) => Promise<boolean>;
  logout: () => void;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Security Storage Keys
const ADMIN_SESSION_KEY = 'zolepto_admin_session';
const ADMIN_CREDENTIALS_KEY = 'zolepto_admin_master_password';
const FAILED_ATTEMPTS_KEY = 'zolepto_admin_failed_attempts';
const LOCKOUT_UNTIL_KEY = 'zolepto_admin_lockout_until';

// The single exclusive authorized key email engraved in local system
export const STRICT_ADMIN_EMAIL = 'cheddarc19@gmail.com';
export const DEFAULT_MASTER_PASSWORD = 'Zelopte2026!';

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
   * Verify Email and Master Password
   * Engraved: cheddarc19@gmail.com and Zelopte2026!
   */
  const verifyCredentials = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (lockoutRemainingSeconds > 0) {
      return {
        success: false,
        error: `Security Lockout Active. Please wait ${lockoutRemainingSeconds}s before retrying.`,
      };
    }

    setLoading(true);
    try {
      const normalizedInput = email.trim().toLowerCase();
      const isAuthorizedEmail = normalizedInput === STRICT_ADMIN_EMAIL.toLowerCase();

      // Check master password
      const savedPass = localStorage.getItem(ADMIN_CREDENTIALS_KEY) || DEFAULT_MASTER_PASSWORD;
      const isPasswordValid = pass === savedPass;

      if (!isAuthorizedEmail || !isPasswordValid) {
        recordFailedAttempt();
        return { success: false, error: 'Access Denied: Invalid credentials' };
      }

      // Credentials verified! Login directly without 2FA
      finishLogin();
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const finishLogin = () => {
    resetFailedAttempts();

    const adminUser: AdminUser = {
      uid: 'admin-zolepto-master',
      email: STRICT_ADMIN_EMAIL,
      displayName: 'Zolepto Master Director',
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        failedAttempts,
        isLockedOut: lockoutRemainingSeconds > 0,
        lockoutRemainingSeconds,
        primaryAdminEmail: STRICT_ADMIN_EMAIL,
        verifyCredentials,
        setMasterPassword,
        logout,
        isConfigured: true,
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
