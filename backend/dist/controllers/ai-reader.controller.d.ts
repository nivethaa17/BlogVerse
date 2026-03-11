import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getSmartSummary: (req: AuthRequest, res: Response) => Promise<void>;
export declare const analyzeComment: (req: AuthRequest, res: Response) => Promise<void>;
export declare const analyzeAllComments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPersonalizedRecommendations: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getEvolvingInterests: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=ai-reader.controller.d.ts.map