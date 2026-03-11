"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const social_controller_1 = require("../controllers/social.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/toggle', auth_middleware_1.authenticate, social_controller_1.toggleLike);
router.get('/check', auth_middleware_1.authenticate, social_controller_1.checkLike);
exports.default = router;
//# sourceMappingURL=like.routes.js.map