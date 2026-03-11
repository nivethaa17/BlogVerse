import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Like, Bookmark, Follower, Notification } from '../models/Social.model';
import { Blog } from '../models/Blog.model';
import { Comment } from '../models/Comment.model';
import { User } from '../models/User.model';
import { WriterAnalytics } from '../models/Analytics.model';
import { AppError } from '../middleware/errorHandler';
import { emitNotification } from '../config/socket';

// ==================== LIKES ====================
export const toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
  const { targetType, targetId } = req.body;
  if (!['blog', 'comment'].includes(targetType)) {
    throw new AppError('Invalid target type', 400);
  }

  const existing = await Like.findOne({
    user: req.user!._id,
    targetType,
    targetId,
  });

  if (existing) {
    await Like.deleteOne({ _id: existing._id });
    // Decrement count
    if (targetType === 'blog') {
      await Blog.findByIdAndUpdate(targetId, { $inc: { likesCount: -1 } });
      await WriterAnalytics.findOneAndUpdate(
        { user: (await Blog.findById(targetId))?.author },
        { $inc: { totalLikes: -1 } }
      );
    } else {
      await Comment.findByIdAndUpdate(targetId, { $inc: { likesCount: -1 } });
    }
    res.json({ success: true, liked: false });
  } else {
    await Like.create({ user: req.user!._id, targetType, targetId });
    if (targetType === 'blog') {
      const blog = await Blog.findByIdAndUpdate(targetId, { $inc: { likesCount: 1 } });
      if (blog) {
        await WriterAnalytics.findOneAndUpdate(
          { user: blog.author },
          { $inc: { totalLikes: 1 } }
        );
        // Notify author
        if (blog.author.toString() !== req.user!._id.toString()) {
          const notification = await Notification.create({
            recipient: blog.author,
            sender: req.user!._id,
            type: 'like',
            message: `${req.user!.name} liked your blog "${blog.title}"`,
            link: `/blog/${blog.slug}`,
          });
          emitNotification(blog.author.toString(), notification);
        }
      }
    } else {
      await Comment.findByIdAndUpdate(targetId, { $inc: { likesCount: 1 } });
    }
    res.json({ success: true, liked: true });
  }
};

export const checkLike = async (req: AuthRequest, res: Response): Promise<void> => {
  const { targetType, targetId } = req.query;
  const like = await Like.findOne({
    user: req.user!._id,
    targetType,
    targetId,
  });
  res.json({ success: true, liked: !!like });
};

// ==================== BOOKMARKS ====================
export const toggleBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  const { blogId } = req.body;

  const existing = await Bookmark.findOne({ user: req.user!._id, blog: blogId });
  if (existing) {
    await Bookmark.deleteOne({ _id: existing._id });
    await Blog.findByIdAndUpdate(blogId, { $inc: { bookmarksCount: -1 } });
    res.json({ success: true, bookmarked: false });
  } else {
    await Bookmark.create({ user: req.user!._id, blog: blogId });
    await Blog.findByIdAndUpdate(blogId, { $inc: { bookmarksCount: 1 } });
    res.json({ success: true, bookmarked: true });
  }
};

export const getBookmarks = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, limit = 10 } = req.query;
  const bookmarks = await Bookmark.find({ user: req.user!._id })
    .populate({
      path: 'blog',
      populate: { path: 'author', select: 'name avatar' },
    })
    .sort({ createdAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);

  const total = await Bookmark.countDocuments({ user: req.user!._id });
  res.json({ success: true, bookmarks, pagination: { page: +page, limit: +limit, total } });
};

export const checkBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  const bookmark = await Bookmark.findOne({ user: req.user!._id, blog: req.query.blogId });
  res.json({ success: true, bookmarked: !!bookmark });
};

// ==================== FOLLOWS ====================
export const toggleFollow = async (req: AuthRequest, res: Response): Promise<void> => {
  const { userId } = req.body;
  if (userId === req.user!._id.toString()) throw new AppError("Can't follow yourself", 400);

  const existing = await Follower.findOne({ follower: req.user!._id, following: userId });
  if (existing) {
    await Follower.deleteOne({ _id: existing._id });
    await User.findByIdAndUpdate(req.user!._id, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: -1 } });
    await WriterAnalytics.findOneAndUpdate({ user: userId }, { $inc: { totalFollowers: -1 } });
    res.json({ success: true, following: false });
  } else {
    await Follower.create({ follower: req.user!._id, following: userId });
    await User.findByIdAndUpdate(req.user!._id, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(userId, { $inc: { followersCount: 1 } });
    await WriterAnalytics.findOneAndUpdate({ user: userId }, { $inc: { totalFollowers: 1 } });

    const notification = await Notification.create({
      recipient: userId,
      sender: req.user!._id,
      type: 'follow',
      message: `${req.user!.name} started following you`,
      link: `/profile/${req.user!._id}`,
    });
    emitNotification(userId, notification);

    res.json({ success: true, following: true });
  }
};

export const getFollowers = async (req: AuthRequest, res: Response): Promise<void> => {
  const followers = await Follower.find({ following: req.params.userId })
    .populate('follower', 'name avatar bio followersCount');
  res.json({ success: true, followers });
};

export const getFollowing = async (req: AuthRequest, res: Response): Promise<void> => {
  const following = await Follower.find({ follower: req.params.userId })
    .populate('following', 'name avatar bio followersCount');
  res.json({ success: true, following });
};

export const checkFollow = async (req: AuthRequest, res: Response): Promise<void> => {
  const follow = await Follower.findOne({ follower: req.user!._id, following: req.query.userId });
  res.json({ success: true, following: !!follow });
};
