import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const googleAuth: (req: Request, res: Response) => Promise<void>;
export declare const googleAuthComplete: (req: Request, res: Response) => Promise<void>;
export declare const getMe: (req: any, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map