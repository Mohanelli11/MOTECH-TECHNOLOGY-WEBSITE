import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState } from
'react';
import { api } from '../lib/accessControl';
import type { User } from '../types/store';

type AuthValue = {
  user: User | null;
  /** True while the saved sign-in is being restored (shared accounts only). */
  loading: boolean;
  isAdmin: boolean;
  refresh: () => void;
  login: (email: string, password: string) => Promise<User>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    company: string;
    phone: string;
  }) => Promise<User | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<User | null>(() => api.currentUser());
  const [loading, setLoading] = useState<boolean>(() => api.isRemote());

  // Restore the saved sign-in from the shared accounts database, and follow it signing out.
  useEffect(() => {
    let cancelled = false;
    api.
    init().
    then((u) => {
      if (!cancelled) setUser(u);
    }).
    catch(() => {
      if (!cancelled) setUser(api.currentUser());
    }).
    finally(() => {
      if (!cancelled) setLoading(false);
    });
    const off = api.onSignedOut(() => setUser(null));
    return () => {
      cancelled = true;
      off();
    };
  }, []);

  const refresh = useCallback(() => setUser(api.currentUser()), []);

  const login = useCallback(async (email: string, password: string) => {
    const next = await api.login(email, password);
    setUser(next);
    return next;
  }, []);

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      company: string;
      phone: string;
    }) => {
      const next = await api.register(input);
      if (next) setUser(next);
      return next;
    },
    []
  );

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      refresh,
      login,
      register,
      logout
    }),
    [user, loading, refresh, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}