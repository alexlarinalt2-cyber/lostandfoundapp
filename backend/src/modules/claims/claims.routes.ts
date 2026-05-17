import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../middleware/async.middleware';
import { upload } from '../../middleware/upload.middleware';
import { CreateClaimSchema, UpdateClaimSchema } from '@laf/shared';
import { listClaims, createClaim, updateClaim, getClaim } from './claims.controller';

export const claimsRouter = Router();

claimsRouter.use(authenticate);
claimsRouter.get('/:itemId/claims', asyncHandler(listClaims));
claimsRouter.post('/:itemId/claims', upload.array('photos', 4), validate(CreateClaimSchema), asyncHandler(createClaim));
claimsRouter.get('/:itemId/claims/:claimId', asyncHandler(getClaim));
claimsRouter.patch('/:itemId/claims/:claimId', validate(UpdateClaimSchema), asyncHandler(updateClaim));
