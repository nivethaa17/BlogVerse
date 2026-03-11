import mongoose, { Document } from 'mongoose';
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
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.model.d.ts.map