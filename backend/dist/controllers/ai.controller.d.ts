import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const generateSummary: (req: AuthRequest, res: Response) => Promise<void>;
export declare const suggestTitles: (req: AuthRequest, res: Response) => Promise<void>;
export declare const improveGrammar: (req: AuthRequest, res: Response) => Promise<void>;
export declare const suggestTags: (req: AuthRequest, res: Response) => Promise<void>;
export declare const generateContent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const enhanceContent: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=ai.controller.d.ts.map