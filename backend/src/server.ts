import 'dotenv/config';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { createApp } from './app';
import { env } from './config/env';
import { connectRedis } from './config/redis';
import { initSocket } from './services/socket.service';
import type { AuthPayload } from './middleware/auth.middleware';
import { runMigrations } from './db/migrate';
import jwt from 'jsonwebtoken';

async function main() {
  console.log('Running database migrations...');
  await runMigrations();

  await connectRedis();

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new SocketServer(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as AuthPayload;
    socket.join(`user:${user.userId}`);

    socket.on('join:space', (spaceId: string) => {
      socket.join(`space:${spaceId}`);
    });

    socket.on('leave:space', (spaceId: string) => {
      socket.leave(`space:${spaceId}`);
    });
  });

  initSocket(io);

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
