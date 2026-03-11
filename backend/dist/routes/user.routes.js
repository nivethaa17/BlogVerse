"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = (0, express_1.Router)();
router.get('/search', auth_middleware_1.authenticate, user_controller_1.searchUsers);
router.put('/profile', auth_middleware_1.authenticate, user_controller_1.updateProfile); // PUT first
router.patch('/privacy', auth_middleware_1.authenticate, user_controller_1.togglePrivacy); // then PATCH
router.post('/avatar', auth_middleware_1.authenticate, upload.single('avatar'), user_controller_1.uploadAvatar);
router.get('/:userId', auth_middleware_1.authenticate, user_controller_1.getProfile); // dynamic LAST
exports.default = router;
//# sourceMappingURL=user.routes.js.map