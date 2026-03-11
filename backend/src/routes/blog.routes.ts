import { Router } from 'express';
import {
  createBlog, getBlogs, getBlogBySlug, updateBlog, deleteBlog,
  getPersonalizedFeed, getTrendingBlogs, getMyBlogs
} from '../controllers/blog.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getBlogs);
router.get('/trending', getTrendingBlogs);
router.get('/feed', authenticate, getPersonalizedFeed);
router.get('/my', authenticate, requireRole('writer'), getMyBlogs);
router.get('/:slug', authenticate, getBlogBySlug);
router.post('/', authenticate, requireRole('writer'), createBlog);
router.put('/:id', authenticate, requireRole('writer'), updateBlog);
router.delete('/:id', authenticate, requireRole('writer'), deleteBlog);

export default router;
