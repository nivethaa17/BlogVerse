import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/store/auth.store';

let socket: Socket | null = null;

export const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return;
    }

    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling'],
      });
    }

    socketRef.current = socket;

    return () => {};
  }, [isAuthenticated, token]);

  const joinBlog = useCallback((blogId: string) => {
    socket?.emit('join:blog', blogId);
  }, []);

  const leaveBlog = useCallback((blogId: string) => {
    socket?.emit('leave:blog', blogId);
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socket?.on(event, handler);
    return () => { socket?.off(event, handler); };
  }, []);

  const onNewComment = (callback: (comment: any) => void) => {
  if (!socket) return;
  socket.on('new:comment', callback);
  return () => socket.off('new:comment', callback);
};

  return { socket: socketRef.current, joinBlog, leaveBlog, on, onNewComment };
};
