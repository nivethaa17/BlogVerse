import { Router } from 'express';
import { toggleLike, checkLike } from '../controllers/social.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.post('/toggle', authenticate, toggleLike);
router.get('/check', authenticate, checkLike);

export default router;
