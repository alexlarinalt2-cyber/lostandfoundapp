import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { UpdateUserSchema } from '@laf/shared';
import { getMe, updateMe, getMyClaims } from './users.controller';

export const usersRouter = Router();

usersRouter.use(authenticate);
usersRouter.get('/me', getMe);
usersRouter.patch('/me', validate(UpdateUserSchema), updateMe);
usersRouter.get('/me/claims', getMyClaims);
