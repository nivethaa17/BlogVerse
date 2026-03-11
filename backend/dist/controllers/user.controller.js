"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = exports.uploadAvatar = exports.togglePrivacy = exports.updateProfile = exports.getProfile = void 0;
const User_model_1 = require("../models/User.model");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    bio: zod_1.z.string().max(500).optional(),
    preferences: zod_1.z.array(zod_1.z.string()).optional(),
    role: zod_1.z.enum(['reader', 'writer', 'both']).optional(),
    isPublic: zod_1.z.boolean().optional(),
});
const getProfile = async (req, res) => {
    const targetId = req.params.userId || req.user._id;
    const user = await User_model_1.User.findById(targetId);
    if (!user)
        throw new errorHandler_1.AppError('User not found', 404);
    // If private profile and not the owner, block access
    const isOwner = req.user?._id.toString() === user._id.toString();
    if (!user.isPublic && !isOwner) {
        throw new errorHandler_1.AppError('This profile is private', 403);
    }
    res.json({ success: true, user });
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    const data = updateProfileSchema.parse(req.body);
    const user = await User_model_1.User.findByIdAndUpdate(req.user._id, data, { new: true });
    res.json({ success: true, user });
};
exports.updateProfile = updateProfile;
const togglePrivacy = async (req, res) => {
    const user = await User_model_1.User.findById(req.user._id);
    if (!user)
        throw new errorHandler_1.AppError('User not found', 404);
    user.isPublic = !user.isPublic;
    await user.save();
    res.json({
        success: true,
        isPublic: user.isPublic,
        message: user.isPublic ? 'Profile is now public' : 'Profile is now private',
    });
};
exports.togglePrivacy = togglePrivacy;
const uploadAvatar = async (req, res) => {
    if (!req.file)
        throw new errorHandler_1.AppError('No file uploaded', 400);
    const result = await new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.upload_stream({ folder: 'blogify/avatars', transformation: [{ width: 200, height: 200, crop: 'fill' }] }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result);
        }).end(req.file.buffer);
    });
    const user = await User_model_1.User.findByIdAndUpdate(req.user._id, { avatar: result.secure_url }, { new: true });
    res.json({ success: true, user });
};
exports.uploadAvatar = uploadAvatar;
const searchUsers = async (req, res) => {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q)
        throw new errorHandler_1.AppError('Search query required', 400);
    const users = await User_model_1.User.find({
        $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
        ],
        role: { $in: ['writer', 'both'] },
        isPublic: true, // Only show public users in search
    })
        .select('name avatar bio followersCount role isPublic')
        .skip((+page - 1) * +limit)
        .limit(+limit);
    res.json({ success: true, users });
};
exports.searchUsers = searchUsers;
//# sourceMappingURL=user.controller.js.map