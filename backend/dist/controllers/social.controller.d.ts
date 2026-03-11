import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const toggleLike: (req: AuthRequest, res: Response) => Promise<void>;
export declare const checkLike: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleBookmark: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getBookmarks: (req: AuthRequest, res: Response) => Promise<void>;
export declare const checkBookmark: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleFollow: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFollowers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFollowing: (req: AuthRequest, res: Response) => Promise<void>;
export declare const checkFollow: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=social.controller.d.ts.map