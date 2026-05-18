import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/async.middleware';
import { getConversationByClaim, listMessages, sendMessage } from './conversations.controller';

export const conversationsRouter = Router();
conversationsRouter.use(authenticate);
conversationsRouter.get('/by-claim/:claimId', asyncHandler(getConversationByClaim));
conversationsRouter.get('/:convId/messages', asyncHandler(listMessages));
conversationsRouter.post('/:convId/messages', asyncHandler(sendMessage));
