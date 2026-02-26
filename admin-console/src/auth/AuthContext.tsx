import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getUserInfo, login as apiLogin } from '../api/api';
import type { UserInfo } from '../types';

const ADMIN_ROLES = ['ROLE_ADMIN', 'ROLE_USER_ADMIN'];

function isAdmin(roles: string[] | undefined): boolean {
  if (!roles || !roles.length) return false;
  return roles.some((r) => ADMIN_ROLES.includes(r));
}

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAdmin: boolean;
  loading: boolean;
  checked: boolean;
}

const defaultState: AuthState = {
  user: null,
  token: null,
  isAdmin: false,
  loading: false,
  checked: false,
};

const AuthContext = createContext<{
  auth: AuthState;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(defaultState);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setAuth((a) => ({ ...a, checked: true, user: null, token: null, isAdmin: false }));
      return;
    }
    try {
      const res = await getUserInfo();
      const data = res.data?.data as UserInfo | undefined;
      const roles = data?.roles ?? [];
      setAuth({
        user: data ?? null,
        token,
        isAdmin: isAdmin(roles),
        loading: false,
        checked: true,
      });
    } catch {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setAuth({ ...defaultState, checked: true });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser) as UserInfo;
        const admin = isAdmin(user.roles);
        setAuth({ user, token, isAdmin: admin, loading: false, checked: true });
        refreshUser();
        return;
      } catch {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
    setAuth((a) => ({ ...a, checked: true }));
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      setAuth((a) => ({ ...a, loading: true }));
      try {
        const res = await apiLogin(email, password);
        const data = res.data?.data;
        if (!res.data?.success || !data?.token || !data?.userInfo) {
          return { ok: false, message: res.data?.message || 'Login failed' };
        }
        const user = data.userInfo as UserInfo;
        if (!isAdmin(user.roles)) {
          return { ok: false, message: 'Access denied. Admin role required.' };
        }
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(user));
        setAuth({
          user,
          token: data.token,
          isAdmin: true,
          loading: false,
          checked: true,
        });
        return { ok: true };
      } catch (e: unknown) {
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
        setAuth((a) => ({ ...a, loading: false }));
        return { ok: false, message: msg };
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAuth({ ...defaultState, checked: true });
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
