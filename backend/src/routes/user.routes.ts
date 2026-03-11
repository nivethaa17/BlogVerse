import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar, searchUsers, togglePrivacy } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();
router.get('/search', authenticate, searchUsers);
router.put('/profile', authenticate, updateProfile);       // PUT first
router.patch('/privacy', authenticate, togglePrivacy);     // then PATCH
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);
router.get('/:userId', authenticate, getProfile);          // dynamic LAST

export default router;
