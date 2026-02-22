import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import usersData from '../data/users.json';
import type { User, Role } from '../types';

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('vms_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  const login = (email: string, password: string): { success: boolean; message: string } => {
    const users = usersData as User[];
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _pw, ...safeUser } = found;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const u = safeUser as any as User;
      setUser(u);
      localStorage.setItem('vms_user', JSON.stringify(u));
      localStorage.setItem('vms_role', u.role);
      return { success: true, message: 'Login successful' };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vms_user');
    localStorage.removeItem('vms_role');
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role ?? null,
      isAuthenticated: !!user,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
