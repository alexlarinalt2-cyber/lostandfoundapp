import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../middleware/async.middleware';
import { CreateSpaceSchema, JoinSpaceSchema, UpdateSpaceSchema, UpdateMemberRoleSchema } from '@laf/shared';
import {
  listSpaces,
  createSpace,
  joinSpace,
  getSpace,
  updateSpace,
  listMembers,
  updateMemberRole,
  removeMember,
  leaveSpace,
  deleteSpace,
} from './spaces.controller';

export const spacesRouter = Router();

spacesRouter.use(authenticate);
spacesRouter.get('/', asyncHandler(listSpaces));
spacesRouter.post('/', validate(CreateSpaceSchema), asyncHandler(createSpace));
spacesRouter.post('/join', validate(JoinSpaceSchema), asyncHandler(joinSpace));
spacesRouter.get('/:id', asyncHandler(getSpace));
spacesRouter.patch('/:id', validate(UpdateSpaceSchema), asyncHandler(updateSpace));
spacesRouter.get('/:id/members', asyncHandler(listMembers));
spacesRouter.patch('/:id/members/:userId', validate(UpdateMemberRoleSchema), asyncHandler(updateMemberRole));
spacesRouter.delete('/:id/members/:userId', asyncHandler(removeMember));
spacesRouter.delete('/:id/leave', asyncHandler(leaveSpace));
spacesRouter.delete('/:id', asyncHandler(deleteSpace));
