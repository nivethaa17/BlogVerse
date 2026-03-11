import { Router } from 'express';
import {
  generateSummary, suggestTitles, improveGrammar,
  suggestTags, generateContent, enhanceContent
} from '../controllers/ai.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// All AI writing tools — writer/both only (these help with creating content)
router.use(authenticate, requireRole('writer'), aiRateLimiter);

router.post('/summarize', generateSummary);
router.post('/suggest-titles', suggestTitles);
router.post('/improve-grammar', improveGrammar);
router.post('/suggest-tags', suggestTags);
router.post('/generate-content', generateContent);
router.post('/enhance', enhanceContent);

export default router;