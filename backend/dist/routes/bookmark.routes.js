"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const social_controller_1 = require("../controllers/social.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/toggle', auth_middleware_1.authenticate, social_controller_1.toggleBookmark);
router.get('/', auth_middleware_1.authenticate, social_controller_1.getBookmarks);
router.get('/check', auth_middleware_1.authenticate, social_controller_1.checkBookmark);
exports.default = router;
//# sourceMappingURL=bookmark.routes.js.map