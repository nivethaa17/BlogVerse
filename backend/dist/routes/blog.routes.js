"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = require("../controllers/blog.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', blog_controller_1.getBlogs);
router.get('/trending', blog_controller_1.getTrendingBlogs);
router.get('/feed', auth_middleware_1.authenticate, blog_controller_1.getPersonalizedFeed);
router.get('/my', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('writer'), blog_controller_1.getMyBlogs);
router.get('/:slug', auth_middleware_1.authenticate, blog_controller_1.getBlogBySlug);
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('writer'), blog_controller_1.createBlog);
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('writer'), blog_controller_1.updateBlog);
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('writer'), blog_controller_1.deleteBlog);
exports.default = router;
//# sourceMappingURL=blog.routes.js.map