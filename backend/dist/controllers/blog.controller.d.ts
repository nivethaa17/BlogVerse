import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const createBlog: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getBlogs: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getBlogBySlug: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateBlog: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteBlog: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPersonalizedFeed: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTrendingBlogs: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyBlogs: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=blog.controller.d.ts.map