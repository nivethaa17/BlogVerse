"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_reader_controller_1 = require("../controllers/ai-reader.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, rateLimiter_1.aiRateLimiter);
router.get('/summary/:blogId', ai_reader_controller_1.getSmartSummary);
router.post('/comment/analyze', ai_reader_controller_1.analyzeComment);
router.get('/comments/analyze/:blogId', ai_reader_controller_1.analyzeAllComments);
router.get('/recommendations', ai_reader_controller_1.getPersonalizedRecommendations);
router.get('/evolving-interests', ai_reader_controller_1.getEvolvingInterests);
exports.default = router;
//# sourceMappingURL=ai-reader.routes.js.map