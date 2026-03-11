"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFollow = exports.getFollowing = exports.getFollowers = exports.toggleFollow = exports.checkBookmark = exports.getBookmarks = exports.toggleBookmark = exports.checkLike = exports.toggleLike = void 0;
const Social_model_1 = require("../models/Social.model");
const Blog_model_1 = require("../models/Blog.model");
const Comment_model_1 = require("../models/Comment.model");
const User_model_1 = require("../models/User.model");
const Analytics_model_1 = require("../models/Analytics.model");
const errorHandler_1 = require("../middleware/errorHandler");
const socket_1 = require("../config/socket");
// ==================== LIKES ====================
const toggleLike = async (req, res) => {
    const { targetType, targetId } = req.body;
    if (!['blog', 'comment'].includes(targetType)) {
        throw new errorHandler_1.AppError('Invalid target type', 400);
    }
    const existing = await Social_model_1.Like.findOne({
        user: req.user._id,
        targetType,
        targetId,
    });
    if (existing) {
        await Social_model_1.Like.deleteOne({ _id: existing._id });
        // Decrement count
        if (targetType === 'blog') {
            await Blog_model_1.Blog.findByIdAndUpdate(targetId, { $inc: { likesCount: -1 } });
            await Analytics_model_1.WriterAnalytics.findOneAndUpdate({ user: (await Blog_model_1.Blog.findById(targetId))?.author }, { $inc: { totalLikes: -1 } });
        }
        else {
            await Comment_model_1.Comment.findByIdAndUpdate(targetId, { $inc: { likesCount: -1 } });
        }
        res.json({ success: true, liked: false });
    }
    else {
        await Social_model_1.Like.create({ user: req.user._id, targetType, targetId });
        if (targetType === 'blog') {
            const blog = await Blog_model_1.Blog.findByIdAndUpdate(targetId, { $inc: { likesCount: 1 } });
            if (blog) {
                await Analytics_model_1.WriterAnalytics.findOneAndUpdate({ user: blog.author }, { $inc: { totalLikes: 1 } });
                // Notify author
                if (blog.author.toString() !== req.user._id.toString()) {
                    const notification = await Social_model_1.Notification.create({
                        recipient: blog.author,
                        sender: req.user._id,
                        type: 'like',
                        message: `${req.user.name} liked your blog "${blog.title}"`,
                        link: `/blog/${blog.slug}`,
                    });
                    (0, socket_1.emitNotification)(blog.author.toString(), notification);
                }
            }
        }
        else {
            await Comment_model_1.Comment.findByIdAndUpdate(targetId, { $inc: { likesCount: 1 } });
        }
        res.json({ success: true, liked: true });
    }
};
exports.toggleLike = toggleLike;
const checkLike = async (req, res) => {
    const { targetType, targetId } = req.query;
    const like = await Social_model_1.Like.findOne({
        user: req.user._id,
        targetType,
        targetId,
    });
    res.json({ success: true, liked: !!like });
};
exports.checkLike = checkLike;
// ==================== BOOKMARKS ====================
const toggleBookmark = async (req, res) => {
    const { blogId } = req.body;
    const existing = await Social_model_1.Bookmark.findOne({ user: req.user._id, blog: blogId });
    if (existing) {
        await Social_model_1.Bookmark.deleteOne({ _id: existing._id });
        await Blog_model_1.Blog.findByIdAndUpdate(blogId, { $inc: { bookmarksCount: -1 } });
        res.json({ success: true, bookmarked: false });
    }
    else {
        await Social_model_1.Bookmark.create({ user: req.user._id, blog: blogId });
        await Blog_model_1.Blog.findByIdAndUpdate(blogId, { $inc: { bookmarksCount: 1 } });
        res.json({ success: true, bookmarked: true });
    }
};
exports.toggleBookmark = toggleBookmark;
const getBookmarks = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const bookmarks = await Social_model_1.Bookmark.find({ user: req.user._id })
        .populate({
        path: 'blog',
        populate: { path: 'author', select: 'name avatar' },
    })
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit);
    const total = await Social_model_1.Bookmark.countDocuments({ user: req.user._id });
    res.json({ success: true, bookmarks, pagination: { page: +page, limit: +limit, total } });
};
exports.getBookmarks = getBookmarks;
const checkBookmark = async (req, res) => {
    const bookmark = await Social_model_1.Bookmark.findOne({ user: req.user._id, blog: req.query.blogId });
    res.json({ success: true, bookmarked: !!bookmark });
};
exports.checkBookmark = checkBookmark;
// ==================== FOLLOWS ====================
const toggleFollow = async (req, res) => {
    const { userId } = req.body;
    if (userId === req.user._id.toString())
        throw new errorHandler_1.AppError("Can't follow yourself", 400);
    const existing = await Social_model_1.Follower.findOne({ follower: req.user._id, following: userId });
    if (existing) {
        await Social_model_1.Follower.deleteOne({ _id: existing._id });
        await User_model_1.User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
        await User_model_1.User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } });
        await Analytics_model_1.WriterAnalytics.findOneAndUpdate({ user: userId }, { $inc: { totalFollowers: -1 } });
        res.json({ success: true, following: false });
    }
    else {
        await Social_model_1.Follower.create({ follower: req.user._id, following: userId });
        await User_model_1.User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
        await User_model_1.User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } });
        await Analytics_model_1.WriterAnalytics.findOneAndUpdate({ user: userId }, { $inc: { totalFollowers: 1 } });
        const notification = await Social_model_1.Notification.create({
            recipient: userId,
            sender: req.user._id,
            type: 'follow',
            message: `${req.user.name} started following you`,
            link: `/profile/${req.user._id}`,
        });
        (0, socket_1.emitNotification)(userId, notification);
        res.json({ success: true, following: true });
    }
};
exports.toggleFollow = toggleFollow;
const getFollowers = async (req, res) => {
    const followers = await Social_model_1.Follower.find({ following: req.params.userId })
        .populate('follower', 'name avatar bio followersCount');
    res.json({ success: true, followers });
};
exports.getFollowers = getFollowers;
const getFollowing = async (req, res) => {
    const following = await Social_model_1.Follower.find({ follower: req.params.userId })
        .populate('following', 'name avatar bio followersCount');
    res.json({ success: true, following });
};
exports.getFollowing = getFollowing;
const checkFollow = async (req, res) => {
    const follow = await Social_model_1.Follower.findOne({ follower: req.user._id, following: req.query.userId });
    res.json({ success: true, following: !!follow });
};
exports.checkFollow = checkFollow;
//# sourceMappingURL=social.controller.js.map