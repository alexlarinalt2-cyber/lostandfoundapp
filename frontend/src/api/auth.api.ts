import { apiClient } from './client';
import type { RegisterInput, LoginInput } from '@laf/shared';
import type { AuthResponse } from '@laf/shared';

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/register', input);
  return data.data;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/login', input);
  return data.data;
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export async function refreshToken(): Promise<string> {
  const { data } = await apiClient.post('/auth/refresh');
  return data.data.accessToken;
}

export async function forgotPassword(email: string) {
  await apiClient.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string) {
  await apiClient.post('/auth/reset-password', { token, password });
}
