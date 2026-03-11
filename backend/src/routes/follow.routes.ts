import { Router } from 'express';
import { toggleFollow, getFollowers, getFollowing, checkFollow } from '../controllers/social.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.post('/toggle', authenticate, toggleFollow);
router.get('/check', authenticate, checkFollow);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

export default router;
