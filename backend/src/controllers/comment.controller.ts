import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Comment } from '../models/Comment.model';
import { Blog } from '../models/Blog.model';
import { Like, Notification } from '../models/Social.model';
import { WriterAnalytics } from '../models/Analytics.model';
import { AppError } from '../middleware/errorHandler';
import { emitToBlog, emitToUser } from '../config/socket';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentCommentId: z.string().optional(),
});

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  const { blogId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const topLevel = await Comment.find({ blog: blogId, parentComment: null })
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);

  const total = await Comment.countDocuments({ blog: blogId, parentComment: null });

  const commentsWithReplies = await Promise.all(
    topLevel.map(async (comment) => {
      const replies = await Comment.find({ blog: blogId, parentComment: comment._id })
        .populate('author', 'name avatar')
        .sort({ createdAt: 1 })
        .limit(10);

      let commentLiked = false;
      const replyLikedMap: Record<string, boolean> = {};

      if (req.user) {
        const allIds = [comment._id, ...replies.map((r) => r._id)];
        // targetId is the correct field name from Social.model.ts
        const userLikes = await Like.find({
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
    })
  );

  res.json({ success: true, comments: commentsWithReplies, pagination: { page: +page, limit: +limit, total, pages: Math.ceil(total / +limit) } });
};

export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { blogId } = req.params;
  const { content, parentCommentId } = commentSchema.parse(req.body);

  const blog = await Blog.findById(blogId);
  if (!blog) throw new AppError('Blog not found', 404);

  if (parentCommentId) {
    const parent = await Comment.findById(parentCommentId);
    if (!parent) throw new AppError('Parent comment not found', 404);
    if (parent.parentComment) throw new AppError('Cannot reply to a reply', 400);
  }

  const comment = await Comment.create({
    blog: blogId,
    author: req.user!._id,
    content,
    parentComment: parentCommentId || null,
  });

  if (parentCommentId) {
    await Comment.findByIdAndUpdate(parentCommentId, { $inc: { repliesCount: 1 } });
  }

  await Blog.findByIdAndUpdate(blogId, { $inc: { commentsCount: 1 } });
  await WriterAnalytics.findOneAndUpdate(
    { user: blog.author },
    { $inc: { totalComments: 1 } },
    { upsert: true }
  );

  const populated = await Comment.findById(comment._id).populate('author', 'name avatar');

  if (populated) {
    emitToBlog(blogId, 'new:comment', { ...populated.toObject(), liked: false, replies: [] });
  }

  if (blog.author.toString() !== req.user!._id.toString()) {
    const notification = await Notification.create({
      recipient: blog.author,
      sender: req.user!._id,
      type: 'comment',
      message: `commented on your blog "${blog.title}"`,
      link: `/blog/${blog.slug}`,
    });
    const populatedNotif = await notification.populate('sender', 'name avatar');
    emitToUser(blog.author.toString(), 'notification', populatedNotif);
  }

  res.status(201).json({ success: true, comment: { ...populated?.toObject(), liked: false, replies: [] } });
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new AppError('Comment not found', 404);
  if (comment.author.toString() !== req.user!._id.toString()) throw new AppError('Not authorized', 403);

  if (!comment.parentComment) {
    await Comment.deleteMany({ parentComment: comment._id });
  } else {
    await Comment.findByIdAndUpdate(comment.parentComment, { $inc: { repliesCount: -1 } });
  }

  await Blog.findByIdAndUpdate(comment.blog, { $inc: { commentsCount: -1 } });
  await Comment.findByIdAndDelete(comment._id);
  res.json({ success: true, message: 'Comment deleted' });
};

export const toggleCommentLike = async (req: AuthRequest, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) throw new AppError('Comment not found', 404);

  // targetId is the correct field name in Like model (Social.model.ts)
  const existingLike = await Like.findOne({
    user: req.user!._id,
    targetId: commentId,
    targetType: 'comment',
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: -1 } });
    res.json({ success: true, liked: false });
  } else {
    await Like.create({ user: req.user!._id, targetId: commentId, targetType: 'comment' });
    await Comment.findByIdAndUpdate(commentId, { $inc: { likesCount: 1 } });
    res.json({ success: true, liked: true });
  }
};