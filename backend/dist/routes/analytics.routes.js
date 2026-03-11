"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/dashboard', auth_middleware_1.authenticate, analytics_controller_1.getDashboardStats);
router.get('/reader', auth_middleware_1.authenticate, analytics_controller_1.getReaderAnalytics);
router.get('/writer', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('writer'), analytics_controller_1.getWriterAnalytics);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map