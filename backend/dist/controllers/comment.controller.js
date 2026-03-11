"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleCommentLike = exports.deleteComment = exports.addComment = exports.getComments = void 0;
const Comment_model_1 = require("../models/Comment.model");
const Blog_model_1 = require("../models/Blog.model");
const Social_model_1 = require("../models/Social.model");
const Analytics_model_1 = require("../models/Analytics.model");
const errorHandler_1 = require("../middleware/errorHandler");
const socket_1 = require("../config/socket");
const zod_1 = require("zod");
const commentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(2000),
    parentCommentId: zod_1.z.string().optional(),
});
const getComments = async (req, res) => {
    const { blogId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const topLevel = await Comment_model_1.Comment.find({ blog: blogId, parentComment: null })
        .populate('author', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit);
    const total = await Comment_model_1.Comment.countDocuments({ blog: blogId, parentComment: null });
    const commentsWithReplies = await Promise.all(topLevel.map(async (comment) => {
        const replies = await Comment_model_1.Comment.find({ blog: blogId, parentComment: comment._id })
            .populate('author', 'name avatar')
            .sort({ createdAt: 1 })
            .limit(10);
        let commentLiked = false;
        const replyLikedMap = {};
        if (req.user) {
            const allIds = [comment._id, ...replies.map((r) => r._id)];
            // targetId is the correct field name from Social.model.ts
            const userLikes = await Social_model_1.Like.find({
                user: req.user._id,
                targetType: 'comment',
                targetId: { $in: allIds },
            });
            const likedSet = new Set(userLikes.map((l) => l.targetId.toString()));
            commentLiked = likedSet.has(comment._id.toString());
            replies.forEach((r) => {
                replyLikedMap[r._id.toString()] = likedSet.has(r._id.toString());
            });
        }
        return {
            ...comment.toObject(),
            liked: commentLiked,
            replies: replies.map((r) => ({
                ...r.toObject(),
                liked: replyLikedMap[r._id.toString()] || false,
            })),
        };
    }));
    res.json({ success: true, comments: commentsWithReplies, pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) } });
};
exports.getComments = getComments;
const addComment = async (req, res) => {
    const { blogId } = req.params;
    const { content, parentCommentId } = commentSchema.parse(req.body);
    const blog = await Blog_model_1.Blog.findById(blogId);
    if (!blog)
        throw new errorHandler_1.AppError('Blog not found', 404);
    if (parentCommentId) {
        const parent = await Comment_model_1.Comment.findById(parentCommentId);
        if (!parent)
            throw new errorHandler_1.AppError('Parent comment not found', 404);
        if (parent.parentComment)
            throw new errorHandler_1.AppError('Cannot reply to a reply', 400);
    }
    const comment = await Comment_model_1.Comment.create({
        blog: blogId,
        author: req.user._id,
        content,
        parentComment: parentCommentId || null,
    });
    if (parentCommentId) {
        await Comment_model_1.Comment.findByIdAndUpdate(parentCommentId, { $inc: { repliesCount: 1 } });
    }
    await Blog_model_1.Blog.findByIdAndUpdate(blogId, { $inc: { commentsCount: 1 } });
    await Analytics_model_1.WriterAnalytics.findOneAndUpdate({ user: blog.author }, { $inc: { totalComments: 1 } }, { upsert: true });
    const populated = await Comment_model_1.Comment.findById(comment._id).populate('author', 'name avatar');
    if (populated) {
        (0, socket_1.emitToBlog)(blogId, 'new:comment', { ...populated.toObject(), liked: false, replies: [] });
    }
    if (blog.author.toString() !== req.user._id.toString()) {
        const notification = await Social_model_1.Notification.create({
            recipient: blog.author,
            sender: req.user._id,
            type: 'comment',
            message: `commented on your blog "${blog.title}"`,
            link: `/blog/${blog.slug}`,
        });
        const populatedNotif = await notification.populate('sender', 'name avatar');
        (0, socket_1.emitToUser)(blog.author.toString(), 'notification', populatedNotif);
    }
    res.status(201).json({ success: true, comment: { ...populated?.toObject(), liked: false, replies: [] } });
};
exports.addComment = addComment;
const deleteComment = async (req, res) => {
    const comment = await Comment_model_1.Comment.findById(req.params.id);
    if (!comment)
        throw new errorHandler_1.AppError('Comment not found', 404);
    if (comment.author.toString() !== req.user._id.toString())
        throw new errorHandler_1.AppError('Not authorized', 403);
    if (!comment.parentComment) {
        await Comment_model_1.Comment.deleteMany({ parentComment: comment._id });
    }
    else {
        await Comment_model_1.Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } });
    }
    await Blog_model_1.Blog.findByIdAndUpdate(comment.blog, { $inc: { commentsCount: -1 } });
    await Comment_model_1.Comment.findByIdAndDelete(comment._id);
    res.json({ success: true, message: 'Comment deleted' });
};
exports.deleteComment = deleteComment;
const toggleCommentLike = async (req, res) => {
    const { commentId } = req.params;
    const comment = await Comment_model_1.Comment.findById(commentId);
    if (!comment)
        throw new errorHandler_1.AppError('Comment not found', 404);
    // targetId is the correct field name in Like model (Social.model.ts)
    const existingLike = await Social_model_1.Like.findOne({
        user: req.user._id,
        targetId: commentId,
        targetType: 'comment',
    });
    if (existingLike) {
        await Social_model_1.Like.findByIdAndDelete(existingLike._id);
        await Comment_model_1.Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: -1 } });
        res.json({ success: true, liked: false });
    }
    else {
        await Social_model_1.Like.create({ user: req.user._id, targetId: commentId, targetType: 'comment' });
        await Comment_model_1.Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: 1 } });
        res.json({ success: true, liked: true });
    }
};
exports.toggleCommentLike = toggleCommentLike;
//# sourceMappingURL=comment.controller.js.map