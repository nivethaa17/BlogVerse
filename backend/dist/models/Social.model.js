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
exports.Notification = exports.Follower = exports.Bookmark = exports.Like = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const likeSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['blog', 'comment'], required: true },
    targetId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
}, { timestamps: true });
likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
exports.Like = mongoose_1.default.model('Like', likeSchema);
const bookmarkSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    blog: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Blog', required: true },
}, { timestamps: true });
bookmarkSchema.index({ user: 1, blog: 1 }, { unique: true });
exports.Bookmark = mongoose_1.default.model('Bookmark', bookmarkSchema);
const followerSchema = new mongoose_1.Schema({
    follower: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
followerSchema.index({ follower: 1, following: 1 }, { unique: true });
exports.Follower = mongoose_1.default.model('Follower', followerSchema);
const notificationSchema = new mongoose_1.Schema({
    recipient: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'comment', 'follow', 'reply', 'mention'], required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
exports.Notification = mongoose_1.default.model('Notification', notificationSchema);
//# sourceMappingURL=Social.model.js.map