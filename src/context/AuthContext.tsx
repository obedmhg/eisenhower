import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api, User, Snapshot } from '../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, localState: Snapshot) => Promise<Snapshot>;
  login: (email: string, password: string, localState: Snapshot) => Promise<Snapshot>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.me()
      .then((res) => {
        if (!cancelled) setUser(res.user);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(async (email: string, password: string, localState: Snapshot) => {
    const res = await api.signup(email, password);
    setUser(res.user);
    const merged = await api.mergeState(localState);
    return merged;
  }, []);

  const login = useCallback(async (email: string, password: string, localState: Snapshot) => {
    const res = await api.login(email, password);
    setUser(res.user);
    const merged = await api.mergeState(localState);
    return merged;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
