import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/async.middleware';
import { listNotifications, markRead, markAllRead } from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);
notificationsRouter.get('/', asyncHandler(listNotifications));
notificationsRouter.patch('/read-all', asyncHandler(markAllRead));
notificationsRouter.patch('/:id/read', asyncHandler(markRead));
