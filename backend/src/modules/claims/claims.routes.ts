import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../middleware/async.middleware';
import { CreateClaimSchema, UpdateClaimSchema } from '@laf/shared';
import { listClaims, createClaim, updateClaim } from './claims.controller';

export const claimsRouter = Router();

claimsRouter.use(authenticate);
claimsRouter.get('/:itemId/claims', asyncHandler(listClaims));
claimsRouter.post('/:itemId/claims', validate(CreateClaimSchema), asyncHandler(createClaim));
claimsRouter.patch('/:itemId/claims/:claimId', validate(UpdateClaimSchema), asyncHandler(updateClaim));
