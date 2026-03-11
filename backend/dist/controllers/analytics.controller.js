"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.getWriterAnalytics = exports.getReaderAnalytics = void 0;
const Analytics_model_1 = require("../models/Analytics.model");
const Blog_model_1 = require("../models/Blog.model");
const getReaderAnalytics = async (req, res) => {
    // upsert: create record if it doesn't exist yet
    const analytics = await Analytics_model_1.ReaderAnalytics.findOneAndUpdate({ user: req.user._id }, { $setOnInsert: { user: req.user._id } }, { upsert: true, new: true });
    res.json({ success: true, analytics });
};
exports.getReaderAnalytics = getReaderAnalytics;
const getWriterAnalytics = async (req, res) => {
    // upsert: create record if it doesn't exist yet
    const analytics = await Analytics_model_1.WriterAnalytics.findOneAndUpdate({ user: req.user._id }, { $setOnInsert: { user: req.user._id } }, { upsert: true, new: true });
    const topBlogs = await Blog_model_1.Blog.find({ author: req.user._id, status: 'published' })
        .sort({ viewsCount: -1 })
        .limit(5)
        .select('title slug viewsCount likesCount commentsCount');
    // Sync totalBlogs count from actual DB (in case it's out of sync)
    const actualBlogCount = await Blog_model_1.Blog.countDocuments({ author: req.user._id, status: 'published' });
    if (analytics.totalBlogs !== actualBlogCount) {
        await Analytics_model_1.WriterAnalytics.findOneAndUpdate({ user: req.user._id }, { totalBlogs: actualBlogCount });
        analytics.totalBlogs = actualBlogCount;
    }
    const totalInteractions = analytics.totalLikes + analytics.totalComments;
    const engagementRate = analytics.totalViews > 0
        ? ((totalInteractions / analytics.totalViews) * 100).toFixed(2)
        : '0.00';
    res.json({ success: true, analytics, topBlogs, engagementRate });
};
exports.getWriterAnalytics = getWriterAnalytics;
const getDashboardStats = async (req, res) => {
    const user = req.user;
    const stats = {};
    // Always upsert reader analytics
    const readerAnalytics = await Analytics_model_1.ReaderAnalytics.findOneAndUpdate({ user: user._id }, { $setOnInsert: { user: user._id } }, { upsert: true, new: true });
    stats.reader = {
        totalBlogsRead: readerAnalytics.totalBlogsRead,
        totalReadingTime: readerAnalytics.totalReadingTime,
        categoryDistribution: readerAnalytics.categoryDistribution,
    };
    if (user.role === 'writer' || user.role === 'both') {
        // Always upsert writer analytics
        const writerAnalytics = await Analytics_model_1.WriterAnalytics.findOneAndUpdate({ user: user._id }, { $setOnInsert: { user: user._id } }, { upsert: true, new: true });
        // Sync published blog count from actual data
        const actualBlogCount = await Blog_model_1.Blog.countDocuments({ author: user._id, status: 'published' });
        if (writerAnalytics.totalBlogs !== actualBlogCount) {
            await Analytics_model_1.WriterAnalytics.findOneAndUpdate({ user: user._id }, { totalBlogs: actualBlogCount });
            writerAnalytics.totalBlogs = actualBlogCount;
        }
        const topBlogs = await Blog_model_1.Blog.find({ author: user._id, status: 'published' })
            .sort({ viewsCount: -1 })
            .limit(5)
            .select('title slug viewsCount likesCount commentsCount');
        const totalInteractions = writerAnalytics.totalLikes + writerAnalytics.totalComments;
        const engagementRate = writerAnalytics.totalViews > 0
            ? ((totalInteractions / writerAnalytics.totalViews) * 100).toFixed(2)
            : '0.00';
        stats.writer = {
            totalViews: writerAnalytics.totalViews,
            totalLikes: writerAnalytics.totalLikes,
            totalComments: writerAnalytics.totalComments,
            totalBlogs: writerAnalytics.totalBlogs,
            totalFollowers: writerAnalytics.totalFollowers,
            engagementRate,
            topBlogs,
        };
    }
    res.json({ success: true, stats });
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=analytics.controller.js.map