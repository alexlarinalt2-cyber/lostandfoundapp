import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '@laf/shared';
import {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
} from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', validate(RegisterSchema), register);
authRouter.post('/login', validate(LoginSchema), login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.post('/forgot-password', validate(ForgotPasswordSchema), forgotPassword);
authRouter.post('/reset-password', validate(ResetPasswordSchema), resetPassword);
