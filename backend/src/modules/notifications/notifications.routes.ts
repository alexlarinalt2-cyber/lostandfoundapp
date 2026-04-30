import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { listNotifications, markRead, markAllRead } from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);
notificationsRouter.get('/', listNotifications);
notificationsRouter.patch('/read-all', markAllRead);
notificationsRouter.patch('/:id/read', markRead);
