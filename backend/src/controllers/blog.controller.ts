import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Blog } from '../models/Blog.model';
import { User } from '../models/User.model';
import { ReaderAnalytics, WriterAnalytics } from '../models/Analytics.model';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const blogSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(100),
  summary: z.string().max(500).optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).max(10).optional(),
  category: z.string(),
  status: z.enum(['draft', 'published']).optional(),
});

const getVisibleAuthorIds = async (currentUserId?: string): Promise<string[]> => {
  const publicUsers = await User.find({ isPublic: true }).select('_id');
  const visibleIds = new Set<string>(publicUsers.map((u) => u._id.toString()));
  if (!currentUserId) return Array.from(visibleIds);
  visibleIds.add(currentUserId);
  const { Follower } = await import('../models/Social.model');
  const following = await Follower.find({ follower: currentUserId }).select('following');
  following.forEach((f) => visibleIds.add(f.following.toString()));
  return Array.from(visibleIds);
};

export const createBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = blogSchema.parse(req.body);
  const blog = await Blog.create({ ...data, author: req.user!._id });
  if (data.status === 'published') {
    await WriterAnalytics.findOneAndUpdate({ user: req.user!._id }, { $inc: { totalBlogs: 1 } });
  }
  res.status(201).json({ success: true, blog });
};

export const getBlogs = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10, category, tag, search, author, status = 'published' } = req.query;
  let visibleAuthorIds: string[];

  if (author) {
    const authorUser = await User.findById(author).select('isPublic');
    if (!authorUser) { res.json({ success: true, blogs: [], pagination: { page: 1, limit: +limit, total: 0, pages: 0 } }); return; }
    const isOwn = req.user?._id.toString() === author.toString();
    let isFollowing = false;
    if (req.user && !isOwn) {
      const { Follower } = await import('../models/Social.model');
      isFollowing = !!(await Follower.findOne({ follower: req.user._id, following: author }));
    }
    if (!authorUser.isPublic && !isOwn && !isFollowing) {
      res.json({ success: true, blogs: [], pagination: { page: 1, limit: +limit, total: 0, pages: 0 } }); return;
    }
    visibleAuthorIds = [author as string];
  } else {
    visibleAuthorIds = await getVisibleAuthorIds(req.user?._id?.toString());
  }

  const query: any = { status, author: { $in: visibleAuthorIds } };
  if (category) query.category = category;
  if (tag) query.tags = tag;
  if (search) query.$text = { $search: search as string };

  const [blogs, total] = await Promise.all([
    Blog.find(query).populate('author', 'name avatar bio followersCount isPublic').sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit),
    Blog.countDocuments(query),
  ]);
  res.json({ success: true, blogs, pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) } });
};

export const getBlogBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  const blog = await Blog.findOne({ slug: req.params.slug }).populate('author', 'name avatar bio followersCount followingCount isPublic');
  if (!blog) throw new AppError('Blog not found', 404);
  const author = blog.author as any;
  const isOwn = req.user?._id.toString() === author._id.toString();
  if (!isOwn && !author.isPublic) {
    if (req.user) {
      const { Follower } = await import('../models/Social.model');
      if (!(await Follower.findOne({ follower: req.user._id, following: author._id }))) throw new AppError('Private profile', 403);
    } else throw new AppError('Private profile', 403);
  }
  await Blog.findByIdAndUpdate(blog._id, { $inc: { viewsCount: 1 } });
  if (req.user) {
    await ReaderAnalytics.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { totalBlogsRead: 1, totalReadingTime: blog.readTime, [`categoryDistribution.${blog.category}`]: 1 }, lastUpdated: new Date() },
      { upsert: true }
    );
    await WriterAnalytics.findOneAndUpdate({ user: blog.author }, { $inc: { totalViews: 1 } });
  }
  res.json({ success: true, blog });
};

export const updateBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw new AppError('Blog not found', 404);
  if (blog.author.toString() !== req.user!._id.toString()) throw new AppError('Not authorized', 403);
  const wasPublished = blog.status === 'published';
  const data = blogSchema.partial().parse(req.body);
  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!wasPublished && data.status === 'published') {
    await WriterAnalytics.findOneAndUpdate({ user: req.user!._id }, { $inc: { totalBlogs: 1 } });
  }
  res.json({ success: true, blog: updatedBlog });
};

export const deleteBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) throw new AppError('Blog not found', 404);
  if (blog.author.toString() !== req.user!._id.toString()) throw new AppError('Not authorized', 403);
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Blog deleted' });
};

export const getPersonalizedFeed = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10 } = req.query;
  const user = req.user!;
  const visibleAuthorIds = await getVisibleAuthorIds(user._id.toString());
  const { Follower } = await import('../models/Social.model');
  const followingDocs = await Follower.find({ follower: user._id }).select('following');
  const followingIds = followingDocs.map((f) => f.following.toString());
  const query: any = { status: 'published', author: { $in: visibleAuthorIds } };
  if (followingIds.length > 0 || user.preferences.length > 0) {
    query.$or = [{ author: user._id.toString() }];
    if (followingIds.length > 0) query.$or.push({ author: { $in: followingIds } });
    if (user.preferences.length > 0) query.$or.push({ category: { $in: user.preferences } });
  }
  const [blogs, total] = await Promise.all([
    Blog.find(query).populate('author', 'name avatar bio isPublic').sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit),
    Blog.countDocuments(query),
  ]);
  res.json({ success: true, blogs, pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) } });
};

export const getTrendingBlogs = async (req: AuthRequest, res: Response): Promise<void> => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const publicUserIds = (await User.find({ isPublic: true }).select('_id')).map((u) => u._id);
  const blogs = await Blog.find({ status: 'published', createdAt: { $gte: sevenDaysAgo }, author: { $in: publicUserIds } })
    .populate('author', 'name avatar isPublic')
    .sort({ viewsCount: -1, likesCount: -1 })
    .limit(10);
  res.json({ success: true, blogs });
};

export const getMyBlogs = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query;
  const query: any = { author: req.user!._id };
  if (status) query.status = status;
  const blogs = await Blog.find(query).sort({ updatedAt: -1 });
  res.json({ success: true, blogs });
};