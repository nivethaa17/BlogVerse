import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getComments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addComment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteComment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleCommentLike: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=comment.controller.d.ts.map