"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
require("express-async-errors");
const database_1 = require("./config/database");
const socket_1 = require("./config/socket");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const comment_routes_1 = __importDefault(require("./routes/comment.routes"));
const like_routes_1 = __importDefault(require("./routes/like.routes"));
const bookmark_routes_1 = __importDefault(require("./routes/bookmark.routes"));
const follow_routes_1 = __importDefault(require("./routes/follow.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const ai_reader_routes_1 = __importDefault(require("./routes/ai-reader.routes"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Initialize Socket.io
(0, socket_1.initializeSocket)(server);
// Connect to MongoDB
(0, database_1.connectDB)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(rateLimiter_1.rateLimiter);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/blogs', blog_routes_1.default);
app.use('/api/comments', comment_routes_1.default);
app.use('/api/likes', like_routes_1.default);
app.use('/api/bookmarks', bookmark_routes_1.default);
app.use('/api/follows', follow_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/ai-reader', ai_reader_routes_1.default);
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 BlogVerse Server running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map