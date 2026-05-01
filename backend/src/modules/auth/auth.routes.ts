import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../middleware/async.middleware';
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

authRouter.post('/register', validate(RegisterSchema), asyncHandler(register));
authRouter.post('/login', validate(LoginSchema), asyncHandler(login));
authRouter.post('/refresh', asyncHandler(refresh));
authRouter.post('/logout', asyncHandler(logout));
authRouter.post('/forgot-password', validate(ForgotPasswordSchema), asyncHandler(forgotPassword));
authRouter.post('/reset-password', validate(ResetPasswordSchema), asyncHandler(resetPassword));
