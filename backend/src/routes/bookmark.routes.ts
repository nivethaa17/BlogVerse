import { Router } from 'express';
import { toggleBookmark, getBookmarks, checkBookmark } from '../controllers/social.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.post('/toggle', authenticate, toggleBookmark);
router.get('/', authenticate, getBookmarks);
router.get('/check', authenticate, checkBookmark);

export default router;
