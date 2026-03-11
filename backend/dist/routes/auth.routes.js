"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ==================== auth.routes.ts ====================
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
router.post('/register', rateLimiter_1.authRateLimiter, auth_controller_1.register);
router.post('/login', rateLimiter_1.authRateLimiter, auth_controller_1.login);
router.post('/google', rateLimiter_1.authRateLimiter, auth_controller_1.googleAuth);
router.post('/google/complete', rateLimiter_1.authRateLimiter, auth_controller_1.googleAuthComplete);
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.getMe);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map