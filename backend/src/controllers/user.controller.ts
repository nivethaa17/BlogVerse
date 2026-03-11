import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  preferences: z.array(z.string()).optional(),
  role: z.enum(['reader', 'writer', 'both']).optional(),
  isPublic: z.boolean().optional(),
});

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const targetId = req.params.userId || req.user!._id;
  const user = await User.findById(targetId);
  if (!user) throw new AppError('User not found', 404);

  // If private profile and not the owner, block access
  const isOwner = req.user?._id.toString() === user._id.toString();
  if (!user.isPublic && !isOwner) {
    throw new AppError('This profile is private', 403);
  }

  res.json({ success: true, user });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = updateProfileSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(req.user!._id, data, { new: true });
  res.json({ success: true, user });
};

export const togglePrivacy = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user!._id);
  if (!user) throw new AppError('User not found', 404);

  user.isPublic = !user.isPublic;
  await user.save();

  res.json({
    success: true,
    isPublic: user.isPublic,
    message: user.isPublic ? 'Profile is now public' : 'Profile is now private',
  });
};

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const result = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'blogify/avatars', transformation: [{ width: 200, height: 200, crop: 'fill' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(req.file!.buffer);
  });

  const user = await User.findByIdAndUpdate(req.user!._id, { avatar: result.secure_url }, { new: true });
  res.json({ success: true, user });
};

export const searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { q, page = 1, limit = 10 } = req.query;
  if (!q) throw new AppError('Search query required', 400);

  const users = await User.find({
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
