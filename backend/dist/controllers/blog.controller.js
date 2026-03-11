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
exports.getMyBlogs = exports.getTrendingBlogs = exports.getPersonalizedFeed = exports.deleteBlog = exports.updateBlog = exports.getBlogBySlug = exports.getBlogs = exports.createBlog = void 0;
const Blog_model_1 = require("../models/Blog.model");
const User_model_1 = require("../models/User.model");
const Analytics_model_1 = require("../models/Analytics.model");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
const blogSchema = zod_1.z.object({
    title: zod_1.z.string().min(5).max(200),
    content: zod_1.z.string().min(100),
    summary: zod_1.z.string().max(500).optional(),
    coverImage: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).max(10).optional(),
    category: zod_1.z.string(),
    status: zod_1.z.enum(['draft', 'published']).optional(),
});
const getVisibleAuthorIds = async (currentUserId) => {
    const publicUsers = await User_model_1.User.find({ isPublic: true }).select('_id');
    const visibleIds = new Set(publicUsers.map((u) => u._id.toString()));
    if (!currentUserId)
        return Array.from(visibleIds);
    visibleIds.add(currentUserId);
    const { Follower } = await Promise.resolve().then(() => __importStar(require('../models/Social.model')));
    const following = await Follower.find({ follower: currentUserId }).select('following');
    following.forEach((f) => visibleIds.add(f.following.toString()));
    return Array.from(visibleIds);
};
const createBlog = async (req, res) => {
    const data = blogSchema.parse(req.body);
    const blog = await Blog_model_1.Blog.create({ ...data, author: req.user._id });
    if (data.status === 'published') {
        await Analytics_model_1.WriterAnalytics.findOneAndUpdate({ user: req.user._id }, { $inc: { totalBlogs: 1 } });
    }
    res.status(201).json({ success: true, blog });
};
exports.createBlog = createBlog;
const getBlogs = async (req, res) => {
    const { page = 1, limit = 10, category, tag, search, author, status = 'published' } = req.query;
    let visibleAuthorIds;
    if (author) {
        const authorUser = await User_model_1.User.findById(author).select('isPublic');
        if (!authorUser) {
            res.json({ success: true, blogs: [], pagination: { page: 1, limit: +limit, total: 0, pages: 0 } });
            return;
        }
        const isOwn = req.user?._id.toString() === author.toString();
        let isFollowing = false;
        if (req.user && !isOwn) {
            const { Follower } = await Promise.resolve().then(() => __importStar(require('../models/Social.model')));
            isFollowing = !!(await Follower.findOne({ follower: req.user._id, following: author }));
        }
        if (!authorUser.isPublic && !isOwn && !isFollowing) {
            res.json({ success: true, blogs: [], pagination: { page: 1, limit: +limit, total: 0, pages: 0 } });
            return;
        }
        visibleAuthorIds = [author];
    }
    else {
        visibleAuthorIds = await getVisibleAuthorIds(req.user?._id?.toString());
    }
    const query = { status, author: { $in: visibleAuthorIds } };
    if (category)
        query.category = category;
    if (tag)
        query.tags = tag;
    if (search)
        query.$text = { $search: search };
    const [blogs, total] = await Promise.all([
        Blog_model_1.Blog.find(query).populate('author', 'name avatar bio followersCount isPublic').sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit),
        Blog_model_1.Blog.countDocuments(query),
    ]);
    res.json({ success: true, blogs, pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) } });
};
exports.getBlogs = getBlogs;
const getBlogBySlug = async (req, res) => {
    const blog = await Blog_model_1.Blog.findOne({ slug: req.params.slug }).populate('author', 'name avatar bio followersCount followingCount isPublic');
    if (!blog)
        throw new errorHandler_1.AppError('Blog not found', 404);
    const author = blog.author;
    const isOwn = req.user?._id.toString() === author._id.toString();
    if (!isOwn && !author.isPublic) {
        if (req.user) {
            const { Follower } = await Promise.resolve().then(() => __importStar(require('../models/Social.model')));
            if (!(await Follower.findOne({ follower: req.user._id, following: author._id })))
                throw new errorHandler_1.AppError('Private profile', 403);
        }
        else
            throw new errorHandler_1.AppError('Private profile', 403);
    }
    await Blog_model_1.Blog.findByIdAndUpdate(blog._id, { $inc: { viewsCount: 1 } });
    if (req.user) {
        await Analytics_model_1.ReaderAnalytics.findOneAndUpdate({ user: req.user._id }, { $inc: { totalBlogsRead: 1, totalReadingTime: blog.readTime, [`categoryDistribution.${blog.category}`]: 1 }, lastUpdated: new Date() }, { upsert: true });
        await Analytics_model_1.WriterAnalytics.findOneAndUpdate({ user: blog.author }, { $inc: { totalViews: 1 } });
    }
    res.json({ success: true, blog });
};
exports.getBlogBySlug = getBlogBySlug;
const updateBlog = async (req, res) => {
    const blog = await Blog_model_1.Blog.findById(req.params.id);
    if (!blog)
        throw new errorHandler_1.AppError('Blog not found', 404);
    if (blog.author.toString() !== req.user._id.toString())
        throw new errorHandler_1.AppError('Not authorized', 403);
    const wasPublished = blog.status === 'published';
    const data = blogSchema.partial().parse(req.body);
    const updatedBlog = await Blog_model_1.Blog.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!wasPublished && data.status === 'published') {
        await Analytics_model_1.WriterAnalytics.findOneAndUpdate({ user: req.user._id }, { $inc: { totalBlogs: 1 } });
    }
    res.json({ success: true, blog: updatedBlog });
};
exports.updateBlog = updateBlog;
const deleteBlog = async (req, res) => {
    const blog = await Blog_model_1.Blog.findById(req.params.id);
    if (!blog)
        throw new errorHandler_1.AppError('Blog not found', 404);
    if (blog.author.toString() !== req.user._id.toString())
        throw new errorHandler_1.AppError('Not authorized', 403);
    await Blog_model_1.Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog deleted' });
};
exports.deleteBlog = deleteBlog;
const getPersonalizedFeed = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const user = req.user;
    const visibleAuthorIds = await getVisibleAuthorIds(user._id.toString());
    const { Follower } = await Promise.resolve().then(() => __importStar(require('../models/Social.model')));
    const followingDocs = await Follower.find({ follower: user._id }).select('following');
    const followingIds = followingDocs.map((f) => f.following.toString());
    const query = { status: 'published', author: { $in: visibleAuthorIds } };
    if (followingIds.length > 0 || user.preferences.length > 0) {
        query.$or = [{ author: user._id.toString() }];
        if (followingIds.length > 0)
            query.$or.push({ author: { $in: followingIds } });
        if (user.preferences.length > 0)
            query.$or.push({ category: { $in: user.preferences } });
    }
    const [blogs, total] = await Promise.all([
        Blog_model_1.Blog.find(query).populate('author', 'name avatar bio isPublic').sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit),
        Blog_model_1.Blog.countDocuments(query),
    ]);
    res.json({ success: true, blogs, pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) } });
};
exports.getPersonalizedFeed = getPersonalizedFeed;
const getTrendingBlogs = async (req, res) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const publicUserIds = (await User_model_1.User.find({ isPublic: true }).select('_id')).map((u) => u._id);
    const blogs = await Blog_model_1.Blog.find({ status: 'published', createdAt: { $gte: sevenDaysAgo }, author: { $in: publicUserIds } })
        .populate('author', 'name avatar isPublic')
        .sort({ viewsCount: -1, likesCount: -1 })
        .limit(10);
    res.json({ success: true, blogs });
};
exports.getTrendingBlogs = getTrendingBlogs;
const getMyBlogs = async (req, res) => {
    const { status } = req.query;
    const query = { author: req.user._id };
    if (status)
        query.status = status;
    const blogs = await Blog_model_1.Blog.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, blogs });
};
exports.getMyBlogs = getMyBlogs;
//# sourceMappingURL=blog.controller.js.map