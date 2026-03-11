import { Server } from 'socket.io';
import http from 'http';
export declare const initializeSocket: (server: http.Server) => Server;
export declare const getIO: () => Server;
export declare const emitNotification: (userId: string, notification: object) => void;
export declare const emitToBlog: (blogId: string, event: string, data: object) => void;
export declare const emitToUser: (userId: string, event: string, data: object) => void;
//# sourceMappingURL=socket.d.ts.map