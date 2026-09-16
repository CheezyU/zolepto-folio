import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: AdminUser | null;
  demoUser: { email: string; displayName: string } | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInDemoAdmin: (email?: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_SESSION_KEY = 'zolepto_admin_session';
const ADMIN_CREDENTIALS_KEY = 'zolepto_admin_credentials';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const isConfigured = true; // GitHub + Vercel native architecture

  useEffect(() => {
    // Sync session across tabs
    const handleStorage = () => {
      try {
        const stored = localStorage.getItem(ADMIN_SESSION_KEY);
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleSignInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      // Retrieve stored credentials or initialize first-time admin
      const storedCredsRaw = localStorage.getItem(ADMIN_CREDENTIALS_KEY);
      let valid = false;

      if (storedCredsRaw) {
        const creds = JSON.parse(storedCredsRaw);
        if (creds.email.toLowerCase() === email.trim().toLowerCase() && creds.password === pass) {
          valid = true;
        }
      } else {
        // First-time setup: accept admin or store password
        localStorage.setItem(
          ADMIN_CREDENTIALS_KEY,
          JSON.stringify({ email: email.trim(), password: pass })
        );
        valid = true;
      }

      if (!valid) {
        throw new Error('Access Denied');
      }

      const adminUser: AdminUser = {
        uid: `admin-${Date.now()}`,
        email: email.trim(),
        displayName: 'Zolepto Admin',
      };

      setUser(adminUser);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
      window.dispatchEvent(new Event('storage'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      localStorage.setItem(
        ADMIN_CREDENTIALS_KEY,
        JSON.stringify({ email: email.trim(), password: pass })
      );

      const adminUser: AdminUser = {
        uid: `admin-${Date.now()}`,
        email: email.trim(),
        displayName: 'Zolepto Admin',
      };

      setUser(adminUser);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
      window.dispatchEvent(new Event('storage'));
    } finally {
      setLoading(false);
    }
  };

  const signInDemoAdmin = (customEmail?: string) => {
    const adminUser: AdminUser = {
      uid: 'demo-admin-zolepto',
      email: customEmail || 'zolepto@gmail.com',
      displayName: 'Zolepto (Admin)',
    };
    setUser(adminUser);
    try {
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSignInWithGoogle = async () => {
    signInDemoAdmin();
  };

  const handleLogout = async () => {
    setUser(null);
    try {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.warn(e);
    }
  };

  const demoUser = user ? { email: user.email || 'zolepto@gmail.com', displayName: user.displayName || 'Admin' } : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        demoUser,
        loading,
        isConfigured,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        signInDemoAdmin,
        logout: handleLogout,
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
