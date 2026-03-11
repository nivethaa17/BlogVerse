import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ReaderAnalytics, WriterAnalytics } from '../models/Analytics.model';
import { Blog } from '../models/Blog.model';

export const getReaderAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  // upsert: create record if it doesn't exist yet
  const analytics = await ReaderAnalytics.findOneAndUpdate(
    { user: req.user!._id },
    { $setOnInsert: { user: req.user!._id } },
    { upsert: true, new: true }
  );
  res.json({ success: true, analytics });
};

export const getWriterAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  // upsert: create record if it doesn't exist yet
  const analytics = await WriterAnalytics.findOneAndUpdate(
    { user: req.user!._id },
    { $setOnInsert: { user: req.user!._id } },
    { upsert: true, new: true }
  );

  const topBlogs = await Blog.find({ author: req.user!._id, status: 'published' })
    .sort({ viewsCount: -1 })
    .limit(5)
    .select('title slug viewsCount likesCount commentsCount');

  // Sync totalBlogs count from actual DB (in case it's out of sync)
  const actualBlogCount = await Blog.countDocuments({ author: req.user!._id, status: 'published' });
  if (analytics.totalBlogs !== actualBlogCount) {
    await WriterAnalytics.findOneAndUpdate(
      { user: req.user!._id },
      { totalBlogs: actualBlogCount }
    );
    analytics.totalBlogs = actualBlogCount;
  }

  const totalInteractions = analytics.totalLikes + analytics.totalComments;
  const engagementRate = analytics.totalViews > 0
    ? ((totalInteractions / analytics.totalViews) * 100).toFixed(2)
    : '0.00';

  res.json({ success: true, analytics, topBlogs, engagementRate });
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = req.user!;
  const stats: any = {};

  // Always upsert reader analytics
  const readerAnalytics = await ReaderAnalytics.findOneAndUpdate(
    { user: user._id },
    { $setOnInsert: { user: user._id } },
    { upsert: true, new: true }
  );
  stats.reader = {
    totalBlogsRead: readerAnalytics.totalBlogsRead,
    totalReadingTime: readerAnalytics.totalReadingTime,
    categoryDistribution: readerAnalytics.categoryDistribution,
  };

  if (user.role === 'writer' || user.role === 'both') {
    // Always upsert writer analytics
    const writerAnalytics = await WriterAnalytics.findOneAndUpdate(
      { user: user._id },
      { $setOnInsert: { user: user._id } },
      { upsert: true, new: true }
    );

    // Sync published blog count from actual data
    const actualBlogCount = await Blog.countDocuments({ author: user._id, status: 'published' });
    if (writerAnalytics.totalBlogs !== actualBlogCount) {
      await WriterAnalytics.findOneAndUpdate({ user: user._id }, { totalBlogs: actualBlogCount });
      writerAnalytics.totalBlogs = actualBlogCount;
    }

    const topBlogs = await Blog.find({ author: user._id, status: 'published' })
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