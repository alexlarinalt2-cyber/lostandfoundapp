import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
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
} from './spaces.controller';

export const spacesRouter = Router();

spacesRouter.use(authenticate);
spacesRouter.get('/', listSpaces);
spacesRouter.post('/', validate(CreateSpaceSchema), createSpace);
spacesRouter.post('/join', validate(JoinSpaceSchema), joinSpace);
spacesRouter.get('/:id', getSpace);
spacesRouter.patch('/:id', validate(UpdateSpaceSchema), updateSpace);
spacesRouter.get('/:id/members', listMembers);
spacesRouter.patch('/:id/members/:userId', validate(UpdateMemberRoleSchema), updateMemberRole);
spacesRouter.delete('/:id/members/:userId', removeMember);
