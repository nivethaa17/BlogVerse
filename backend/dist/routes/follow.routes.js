"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const social_controller_1 = require("../controllers/social.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/toggle', auth_middleware_1.authenticate, social_controller_1.toggleFollow);
router.get('/check', auth_middleware_1.authenticate, social_controller_1.checkFollow);
router.get('/:userId/followers', social_controller_1.getFollowers);
router.get('/:userId/following', social_controller_1.getFollowing);
exports.default = router;
//# sourceMappingURL=follow.routes.js.map