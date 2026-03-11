import { Router } from 'express';
import { getComments, addComment, deleteComment, toggleCommentLike } from '../controllers/comment.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

// IMPORTANT: /like/:commentId must be declared BEFORE /:blogId
// otherwise Express matches "like" as a blogId
router.post('/like/:commentId', authenticate, toggleCommentLike);

router.get('/:blogId', optionalAuthenticate, getComments);
router.post('/:blogId', authenticate, addComment);
router.delete('/:id', authenticate, deleteComment);

export default router;