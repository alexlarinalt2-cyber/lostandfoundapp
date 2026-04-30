import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { CreateClaimSchema, UpdateClaimSchema } from '@laf/shared';
import { listClaims, createClaim, updateClaim } from './claims.controller';

export const claimsRouter = Router();

claimsRouter.use(authenticate);
claimsRouter.get('/:itemId/claims', listClaims);
claimsRouter.post('/:itemId/claims', validate(CreateClaimSchema), createClaim);
claimsRouter.patch('/:itemId/claims/:claimId', validate(UpdateClaimSchema), updateClaim);
