"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("../controllers/comment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// IMPORTANT: /like/:commentId must be declared BEFORE /:blogId
// otherwise Express matches "like" as a blogId
router.post('/like/:commentId', auth_middleware_1.authenticate, comment_controller_1.toggleCommentLike);
router.get('/:blogId', auth_middleware_1.optionalAuthenticate, comment_controller_1.getComments);
router.post('/:blogId', auth_middleware_1.authenticate, comment_controller_1.addComment);
router.delete('/:id', auth_middleware_1.authenticate, comment_controller_1.deleteComment);
exports.default = router;
//# sourceMappingURL=comment.routes.js.map