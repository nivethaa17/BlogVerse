"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.optionalAuthenticate = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = require("../models/User.model");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_model_1.User.findById(decoded.userId).select('-password -twoFactorSecret');
        if (!user) {
            res.status(401).json({ success: false, message: 'User not found' });
            return;
        }
        req.user = user;
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
// Does NOT require auth — attaches user if valid token present, continues either way
const optionalAuthenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await User_model_1.User.findById(decoded.userId).select('-password -twoFactorSecret');
            if (user)
                req.user = user;
        }
    }
    catch {
        // Invalid token — continue without user, no error thrown
    }
    next();
};
exports.optionalAuthenticate = optionalAuthenticate;
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const userRole = req.user.role;
        const hasRole = roles.some((role) => {
            if (role === 'writer')
                return userRole === 'writer' || userRole === 'both';
            if (role === 'reader')
                return userRole === 'reader' || userRole === 'both';
            return userRole === role;
        });
        if (!hasRole) {
            res.status(403).json({ success: false, message: `Access restricted to: ${roles.join(', ')}` });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.middleware.js.map