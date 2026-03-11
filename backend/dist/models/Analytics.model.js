"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriterAnalytics = exports.ReaderAnalytics = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const readerAnalyticsSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalBlogsRead: { type: Number, default: 0 },
    totalReadingTime: { type: Number, default: 0 },
    categoryDistribution: { type: Map, of: Number, default: {} },
    tagDistribution: { type: Map, of: Number, default: {} },
    monthlyActivity: [{ month: String, count: Number }],
    lastUpdated: { type: Date, default: Date.now },
});
exports.ReaderAnalytics = mongoose_1.default.model('ReaderAnalytics', readerAnalyticsSchema);
const writerAnalyticsSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalBlogs: { type: Number, default: 0 },
    totalFollowers: { type: Number, default: 0 },
    monthlyViews: [{ month: String, views: Number }],
    monthlyFollowers: [{ month: String, count: Number }],
    topBlogs: [{
            blogId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Blog' },
            views: Number,
            likes: Number,
        }],
    engagementRate: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
});
exports.WriterAnalytics = mongoose_1.default.model('WriterAnalytics', writerAnalyticsSchema);
//# sourceMappingURL=Analytics.model.js.map