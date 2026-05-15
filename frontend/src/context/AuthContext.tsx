import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { setAccessToken, apiClient } from '../api/client';
import * as authApi from '../api/auth.api';
import type { User, RegisterInput, LoginInput } from '@laf/shared';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi
      .refreshToken()
      .then((token) => {
        setAccessToken(token);
        return apiClient.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.data);
      })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(input: LoginInput) {
    const res = await authApi.login(input);
    setAccessToken(res.accessToken);
    setUser(res.user);
  }

  async function register(input: RegisterInput) {
    const res = await authApi.register(input);
    setAccessToken(res.accessToken);
    setUser(res.user);
  }

  async function logout() {
    await authApi.logout();
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
