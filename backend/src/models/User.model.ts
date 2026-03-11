import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'reader' | 'writer' | 'both';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  preferences: string[];
  googleId?: string;
  isVerified: boolean;
  isPublic: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  followersCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6 },
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: 500, default: '' },
    role: { type: String, enum: ['reader', 'writer', 'both'], default: 'reader' },
    preferences: [{ type: String }],
    googleId: { type: String, sparse: true },
    isVerified: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.twoFactorSecret;
  return user;
};

export const User = mongoose.model<IUser>('User', userSchema);
