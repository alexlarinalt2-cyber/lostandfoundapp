import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env';
import { redis } from '../../config/redis';
import * as usersRepo from '../users/users.repository';
import { sendPasswordResetEmail } from '../../services/email.service';
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '@laf/shared';

const REFRESH_PREFIX = 'refresh:';
const RESET_PREFIX = 'reset:';

function signAccess(userId: string, email: string, role: string) {
  return jwt.sign({ userId, email, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

async function signRefresh(userId: string) {
  const token = crypto.randomBytes(40).toString('hex');
  await redis.set(`${REFRESH_PREFIX}${token}`, userId, { EX: 7 * 24 * 3600 });
  return token;
}

export async function register(input: RegisterInput) {
  const existing = await usersRepo.findByEmail(input.email);
  if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });

  const cost = process.env.NODE_ENV === 'test' ? 4 : 12;
  const passwordHash = await bcrypt.hash(input.password, cost);
  const user = await usersRepo.create({ email: input.email, passwordHash, displayName: input.displayName });

  const accessToken = signAccess(user.id, user.email, user.role);
  const refreshToken = await signRefresh(user.id);
  return { user, accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  const user = await usersRepo.findByEmail(input.email);
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const valid = await bcrypt.compare(input.password, user.password_hash);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const accessToken = signAccess(user.id, user.email, user.role);
  const refreshToken = await signRefresh(user.id);
  return { user: usersRepo.toPublic(user), accessToken, refreshToken };
}

export async function refreshTokens(token: string) {
  const userId = await redis.get(`${REFRESH_PREFIX}${token}`);
  if (!userId) throw Object.assign(new Error('Invalid refresh token'), { status: 401 });

  await redis.del(`${REFRESH_PREFIX}${token}`);
  const user = await usersRepo.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 401 });

  const accessToken = signAccess(user.id, user.email, user.role);
  const refreshToken = await signRefresh(user.id);
  return { accessToken, refreshToken };
}

export async function logout(token: string) {
  await redis.del(`${REFRESH_PREFIX}${token}`);
}

export async function forgotPassword({ email }: ForgotPasswordInput) {
  const user = await usersRepo.findByEmail(email);
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  await redis.set(`${RESET_PREFIX}${token}`, user.id, { EX: 3600 });
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetUrl);
}

export async function resetPassword({ token, password }: ResetPasswordInput) {
  const userId = await redis.get(`${RESET_PREFIX}${token}`);
  if (!userId) throw Object.assign(new Error('Invalid or expired reset token'), { status: 400 });

  const cost = process.env.NODE_ENV === 'test' ? 4 : 12;
  const passwordHash = await bcrypt.hash(password, cost);
  await usersRepo.updatePassword(userId, passwordHash);
  await redis.del(`${RESET_PREFIX}${token}`);
}
