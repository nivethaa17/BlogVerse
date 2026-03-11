import { Router } from 'express';
import { getSmartSummary, analyzeComment, analyzeAllComments, getPersonalizedRecommendations, getEvolvingInterests } from '../controllers/ai-reader.controller';
import { authenticate } from '../middleware/auth.middleware';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(authenticate, aiRateLimiter);
router.get('/summary/:blogId', getSmartSummary);
router.post('/comment/analyze', analyzeComment);
router.get('/comments/analyze/:blogId', analyzeAllComments);
router.get('/recommendations', getPersonalizedRecommendations);
router.get('/evolving-interests', getEvolvingInterests);

export default router;