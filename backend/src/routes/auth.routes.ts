// ==================== auth.routes.ts ====================
import { Router } from 'express';
import { register, login, googleAuth, googleAuthComplete, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/google', authRateLimiter, googleAuth);
router.post('/google/complete', authRateLimiter, googleAuthComplete);
router.get('/me', authenticate, getMe);

export default router;
