import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { spacesRouter } from './modules/spaces/spaces.routes';
import { itemsRouter } from './modules/items/items.routes';
import { claimsRouter } from './modules/claims/claims.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok' } });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/spaces', spacesRouter);
  app.use('/api/spaces', itemsRouter);
  app.use('/api/items', claimsRouter);
  app.use('/api/notifications', notificationsRouter);

  app.use(errorHandler);

  return app;
}
