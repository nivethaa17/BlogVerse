"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.googleAuthComplete = exports.googleAuth = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const User_model_1 = require("../models/User.model");
const Analytics_model_1 = require("../models/Analytics.model");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['reader', 'writer', 'both']),
    preferences: zod_1.z.array(zod_1.z.string()).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const register = async (req, res) => {
    const data = registerSchema.parse(req.body);
    const existingUser = await User_model_1.User.findOne({ email: data.email });
    if (existingUser)
        throw new errorHandler_1.AppError('Email already registered', 409);
    const user = await User_model_1.User.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        preferences: data.preferences || [],
        isVerified: true, // Skip email verification for now
    });
    // Initialize analytics
    await Analytics_model_1.ReaderAnalytics.create({ user: user._id });
    if (data.role === 'writer' || data.role === 'both') {
        await Analytics_model_1.WriterAnalytics.create({ user: user._id });
    }
    const token = generateToken(user._id.toString());
    res.status(201).json({ success: true, token, user });
};
exports.register = register;
const login = async (req, res) => {
    const data = loginSchema.parse(req.body);
    const user = await User_model_1.User.findOne({ email: data.email }).select('+password');
    if (!user || !user.password)
        throw new errorHandler_1.AppError('Invalid credentials', 401);
    const isMatch = await user.comparePassword(data.password);
    if (!isMatch)
        throw new errorHandler_1.AppError('Invalid credentials', 401);
    const token = generateToken(user._id.toString());
    res.json({ success: true, token, user });
};
exports.login = login;
const googleAuth = async (req, res) => {
    const { idToken } = req.body;
    if (!idToken)
        throw new errorHandler_1.AppError('Google ID token required', 400);
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email)
        throw new errorHandler_1.AppError('Invalid Google token', 400);
    let user = await User_model_1.User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });
    if (!user) {
        // New user - return flag to select role
        res.json({
            success: true,
            requiresRoleSelection: true,
            googleData: {
                googleId: payload.sub,
                name: payload.name,
                email: payload.email,
                avatar: payload.picture,
            },
        });
        return;
    }
    if (!user.googleId) {
        user.googleId = payload.sub;
        await user.save();
    }
    const token = generateToken(user._id.toString());
    res.json({ success: true, token, user });
};
exports.googleAuth = googleAuth;
const googleAuthComplete = async (req, res) => {
    const { googleId, name, email, avatar, role, preferences } = req.body;
    const user = await User_model_1.User.create({
        name,
        email,
        googleId,
        avatar,
        role,
        preferences: preferences || [],
        isVerified: true,
    });
    await Analytics_model_1.ReaderAnalytics.create({ user: user._id });
    if (role === 'writer' || role === 'both') {
        await Analytics_model_1.WriterAnalytics.create({ user: user._id });
    }
    const token = generateToken(user._id.toString());
    res.status(201).json({ success: true, token, user });
};
exports.googleAuthComplete = googleAuthComplete;
const getMe = async (req, res) => {
    const user = await User_model_1.User.findById(req.user._id);
    res.json({ success: true, user });
};
exports.getMe = getMe;
//# sourceMappingURL=auth.controller.js.map