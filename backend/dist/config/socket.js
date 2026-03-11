"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToUser = exports.emitToBlog = exports.emitNotification = exports.getIO = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let io;
const initializeSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token)
            return next(new Error('Authentication required'));
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.userId;
        socket.join(`user:${userId}`);
        socket.on('join:blog', (blogId) => socket.join(`blog:${blogId}`));
        socket.on('leave:blog', (blogId) => socket.leave(`blog:${blogId}`));
        socket.on('disconnect', () => console.log(`User disconnected: ${userId}`));
    });
    return io;
};
exports.initializeSocket = initializeSocket;
const getIO = () => {
    if (!io)
        throw new Error('Socket.io not initialized');
    return io;
};
exports.getIO = getIO;
const emitNotification = (userId, notification) => {
    (0, exports.getIO)().to(`user:${userId}`).emit('notification', notification);
};
exports.emitNotification = emitNotification;
const emitToBlog = (blogId, event, data) => {
    (0, exports.getIO)().to(`blog:${blogId}`).emit(event, data);
};
exports.emitToBlog = emitToBlog;
// Emit to a specific user's room
const emitToUser = (userId, event, data) => {
    (0, exports.getIO)().to(`user:${userId}`).emit(event, data);
};
exports.emitToUser = emitToUser;
//# sourceMappingURL=socket.js.map