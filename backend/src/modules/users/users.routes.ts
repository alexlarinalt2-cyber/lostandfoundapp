import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../middleware/async.middleware';
import { UpdateUserSchema } from '@laf/shared';
import { getMe, updateMe, getMyClaims } from './users.controller';

export const usersRouter = Router();

usersRouter.use(authenticate);
usersRouter.get('/me', asyncHandler(getMe));
usersRouter.patch('/me', validate(UpdateUserSchema), asyncHandler(updateMe));
usersRouter.get('/me/claims', asyncHandler(getMyClaims));
