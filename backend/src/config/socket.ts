import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';

let io: Server;

export const initializeSocket = (server: http.Server): Server => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    socket.join(`user:${userId}`);
    socket.on('join:blog', (blogId: string) => socket.join(`blog:${blogId}`));
    socket.on('leave:blog', (blogId: string) => socket.leave(`blog:${blogId}`));
    socket.on('disconnect', () => console.log(`User disconnected: ${userId}`));
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export const emitNotification = (userId: string, notification: object): void => {
  getIO().to(`user:${userId}`).emit('notification', notification);
};

export const emitToBlog = (blogId: string, event: string, data: object): void => {
  getIO().to(`blog:${blogId}`).emit(event, data);
};

// Emit to a specific user's room
export const emitToUser = (userId: string, event: string, data: object): void => {
  getIO().to(`user:${userId}`).emit(event, data);
};