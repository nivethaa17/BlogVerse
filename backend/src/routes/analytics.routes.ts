import { Router } from 'express';
import { getReaderAnalytics, getWriterAnalytics, getDashboardStats } from '../controllers/analytics.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();
router.get('/dashboard', authenticate, getDashboardStats);
router.get('/reader', authenticate, getReaderAnalytics);
router.get('/writer', authenticate, requireRole('writer'), getWriterAnalytics);

export default router;
