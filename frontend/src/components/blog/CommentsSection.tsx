'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart, Reply, Trash2, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth.store';
import { useToast } from '@/components/providers/ToastProvider';
import { useSocket } from '@/hooks/useSocket';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  _id: string;
  content: string;
  author: { _id: string; name: string; avatar: string };
  likesCount: number;
  repliesCount: number;
  liked: boolean;
  createdAt: string;
  parentComment?: string;   // ← add this line
  replies?: Comment[];
}

interface Props { blogId: string; }

const Avatar = ({ name, avatar, size = 8 }: { name: string; avatar?: string; size?: number }) => (
  avatar
    ? <img src={avatar} alt={name} className={`h-${size} w-${size} rounded-full object-cover flex-shrink-0`} />
    : <div className={`h-${size} w-${size} rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs flex-shrink-0`}>
        {name?.charAt(0).toUpperCase()}
      </div>
);

const CommentInput = ({ onSubmit, placeholder = 'Add a comment...', autoFocus = false, onCancel }: {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    await onSubmit(text.trim());
    setText('');
    setLoading(false);
  };

  return (
    <div className="flex gap-3">
      <div className="flex-1 border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 bg-card">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full px-3 pt-3 pb-1 text-sm bg-transparent resize-none outline-none"
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
        />
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="text-xs text-muted-foreground">{text.length}/2000</span>
          <div className="flex gap-2">
            {onCancel && (
              <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1">
                Cancel
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || loading}
              className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommentItem = ({
  comment, blogId, onDelete, onLike, depth = 0
}: {
  comment: Comment; blogId: string; onDelete: (id: string, parentId?: string) => void;
  onLike: (id: string) => void; depth?: number;
}) => {
  const [showReply, setShowReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const isOwn = user?._id === comment.author._id;

  const handleReplySubmit = async (content: string) => {
    try {
      const res = await api.post(`/comments/${blogId}`, { content, parentCommentId: comment._id });
      setReplies((prev) => [...prev, res.data.comment]);
      setShowReplies(true);
      setShowReply(false);
      toast('Reply posted!', 'success');
    } catch {
      toast('Failed to post reply', 'error');
    }
  };

  const loadReplies = async () => {
    if (showReplies) { setShowReplies(false); return; }
    if (replies.length > 0) { setShowReplies(true); return; }
    setLoadingReplies(true);
    try {
      // Replies are already loaded with the comment from the API
      setShowReplies(true);
    } finally {
      setLoadingReplies(false);
    }
  };

  const replyCount = replies.length || comment.repliesCount;

  return (
    <div className={`${depth > 0 ? 'ml-8 pl-4 border-l-2 border-muted' : ''}`}>
      <div className="flex gap-3 group">
        <Avatar name={comment.author.name} avatar={comment.author.avatar} size={depth > 0 ? 7 : 8} />
        <div className="flex-1 min-w-0">
          {/* Comment bubble */}
          <div className="bg-muted/40 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1.5 ml-1">
            {/* Like */}
            <button
              onClick={() => isAuthenticated ? onLike(comment._id) : toast('Sign in to like', 'info')}
              className={`flex items-center gap-1 text-xs transition-colors ${comment.liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
            >
              <Heart className={`h-3.5 w-3.5 ${comment.liked ? 'fill-current' : ''}`} />
              {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
            </button>

            {/* Reply — only on top-level comments */}
            {depth === 0 && isAuthenticated && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Reply className="h-3.5 w-3.5" />
                Reply
              </button>
            )}

            {/* Delete */}
            {isOwn && (
              <button
                onClick={() => onDelete(comment._id, comment.replies ? undefined : (comment as any).parentComment)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>

          {/* Reply input */}
          {showReply && (
            <div className="mt-3 ml-1">
              <CommentInput
                onSubmit={handleReplySubmit}
                placeholder={`Reply to ${comment.author.name}...`}
                autoFocus
                onCancel={() => setShowReply(false)}
              />
            </div>
          )}

          {/* Show/hide replies */}
          {depth === 0 && replyCount > 0 && (
            <button
              onClick={loadReplies}
              className="flex items-center gap-1.5 mt-2 ml-1 text-xs text-primary hover:underline"
            >
              {loadingReplies ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : showReplies ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {showReplies ? 'Hide' : 'View'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}

          {/* Replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  blogId={blogId}
                  onDelete={(id) => {
                    setReplies((prev) => prev.filter((r) => r._id !== id));
                    onDelete(id);
                  }}
                  onLike={onLike}
                  depth={1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CommentsSection = ({ blogId }: Props) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const { joinBlog, leaveBlog, onNewComment } = useSocket();

  useEffect(() => {
    fetchComments();
    joinBlog(blogId);
    const unsubscribe = onNewComment((comment: Comment) => {
      if (!comment.parentComment) {
        setComments((prev) => {
          if (prev.find((c) => c._id === comment._id)) return prev;
          return [{ ...comment, replies: [] }, ...prev];
        });
        setTotal((t) => t + 1);
      }
    });
    return () => { leaveBlog(blogId); unsubscribe?.(); };
  }, [blogId]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${blogId}`);
      setComments(res.data.comments);
      setTotal(res.data.pagination.total);
    } catch {
      toast('Failed to load comments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (content: string) => {
    try {
      const res = await api.post(`/comments/${blogId}`, { content });
      setComments((prev) => [{ ...res.data.comment, replies: [] }, ...prev]);
      setTotal((t) => t + 1);
      toast('Comment posted!', 'success');
    } catch {
      toast('Failed to post comment', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c._id !== id));
      setTotal((t) => Math.max(0, t - 1));
      toast('Comment deleted', 'success');
    } catch {
      toast('Failed to delete comment', 'error');
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const res = await api.post(`/comments/like/${commentId}`);
      const liked = res.data.liked;

      // Update in top-level comments
      setComments((prev) =>
        prev.map((c) => {
          if (c._id === commentId) return { ...c, liked, likesCount: c.likesCount + (liked ? 1 : -1) };
          // Update in replies
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r._id === commentId ? { ...r, liked, likesCount: r.likesCount + (liked ? 1 : -1) } : r
              ),
            };
          }
          return c;
        })
      );
    } catch {
      toast('Failed to like comment', 'error');
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-6">Comments {total > 0 && <span className="text-muted-foreground font-normal text-base">({total})</span>}</h2>

      {/* Comment input */}
      {isAuthenticated ? (
        <div className="flex gap-3 mb-8">
          <Avatar name={user?.name || ''} avatar={user?.avatar} />
          <div className="flex-1">
            <CommentInput onSubmit={handleAddComment} />
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 border rounded-xl text-center text-sm text-muted-foreground bg-muted/30">
          <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link> to join the conversation
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              blogId={blogId}
              onDelete={handleDelete}
              onLike={handleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
};