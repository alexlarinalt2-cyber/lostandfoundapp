import type { Server } from 'socket.io';

let io: Server;

export function initSocket(server: Server) {
  io = server;
}

export function emitToSpace(spaceId: string, event: string, data: unknown) {
  io?.to(`space:${spaceId}`).emit(event, data);
}

export function emitToUser(userId: string, event: string, data: unknown) {
  io?.to(`user:${userId}`).emit(event, data);
}
