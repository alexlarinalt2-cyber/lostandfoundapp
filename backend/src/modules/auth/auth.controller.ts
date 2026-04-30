import type { Request, Response } from 'express';
import * as authService from './auth.service';
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '@laf/shared';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body as RegisterInput);
  res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTS);
  res.status(201).json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body as LoginInput);
  res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTS);
  res.json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies[REFRESH_COOKIE] as string | undefined;
  if (!token) return res.status(401).json({ success: false, error: { message: 'No refresh token' } });
  const result = await authService.refreshTokens(token);
  res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTS);
  res.json({ success: true, data: { accessToken: result.accessToken } });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies[REFRESH_COOKIE] as string | undefined;
  if (token) await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE);
  res.json({ success: true, data: null });
}

export async function forgotPassword(req: Request, res: Response) {
  await authService.forgotPassword(req.body as ForgotPasswordInput);
  res.json({ success: true, data: { message: 'If that email exists, a reset link has been sent.' } });
}

export async function resetPassword(req: Request, res: Response) {
  await authService.resetPassword(req.body as ResetPasswordInput);
  res.json({ success: true, data: { message: 'Password reset successfully.' } });
}
