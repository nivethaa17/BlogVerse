"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// All AI writing tools — writer/both only (these help with creating content)
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('writer'), rateLimiter_1.aiRateLimiter);
router.post('/summarize', ai_controller_1.generateSummary);
router.post('/suggest-titles', ai_controller_1.suggestTitles);
router.post('/improve-grammar', ai_controller_1.improveGrammar);
router.post('/suggest-tags', ai_controller_1.suggestTags);
router.post('/generate-content', ai_controller_1.generateContent);
router.post('/enhance', ai_controller_1.enhanceContent);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map