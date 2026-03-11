import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.model';
import { ReaderAnalytics, WriterAnalytics } from '../models/Analytics.model';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['reader', 'writer', 'both']),
  preferences: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  const data = registerSchema.parse(req.body);

  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) throw new AppError('Email already registered', 409);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    preferences: data.preferences || [],
    isVerified: true, // Skip email verification for now
  });

  // Initialize analytics
  await ReaderAnalytics.create({ user: user._id });
  if (data.role === 'writer' || data.role === 'both') {
    await WriterAnalytics.create({ user: user._id });
  }

  const token = generateToken(user._id.toString());
  res.status(201).json({ success: true, token, user });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const data = loginSchema.parse(req.body);

  const user = await User.findOne({ email: data.email }).select('+password');
  if (!user || !user.password) throw new AppError('Invalid credentials', 401);

  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) throw new AppError('Invalid credentials', 401);

  const token = generateToken(user._id.toString());
  res.json({ success: true, token, user });
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;
  if (!idToken) throw new AppError('Google ID token required', 400);

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) throw new AppError('Invalid Google token', 400);

  let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });

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

export const googleAuthComplete = async (req: Request, res: Response): Promise<void> => {
  const { googleId, name, email, avatar, role, preferences } = req.body;

  const user = await User.create({
    name,
    email,
    googleId,
    avatar,
    role,
    preferences: preferences || [],
    isVerified: true,
  });

  await ReaderAnalytics.create({ user: user._id });
  if (role === 'writer' || role === 'both') {
    await WriterAnalytics.create({ user: user._id });
  }

  const token = generateToken(user._id.toString());
  res.status(201).json({ success: true, token, user });
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};
