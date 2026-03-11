import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const togglePrivacy: (req: AuthRequest, res: Response) => Promise<void>;
export declare const uploadAvatar: (req: AuthRequest, res: Response) => Promise<void>;
export declare const searchUsers: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map