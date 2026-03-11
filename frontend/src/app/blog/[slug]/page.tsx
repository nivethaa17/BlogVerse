'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { CommentsSection } from '@/components/blog/CommentsSection';
import { Clock, Eye, Heart, BookMarked, Share2, Edit, Loader2, ChevronLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth.store';
import { useToast } from '@/components/providers/ToastProvider';
import { SmartSummary } from '@/components/blog/SmartSummary';
import { CommentIntelligencePanel } from '@/components/blog/CommentModeration';

export default function BlogPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const res = await api.get(`/blogs/${slug}`);
      setBlog(res.data.blog);

      if (isAuthenticated) {
        const [likeRes, bookmarkRes] = await Promise.all([
          api.get('/likes/check', { params: { targetType: 'blog', targetId: res.data.blog._id } }),
          api.get('/bookmarks/check', { params: { blogId: res.data.blog._id } }),
        ]);
        setLiked(likeRes.data.liked);
        setBookmarked(bookmarkRes.data.bookmarked);

        if (user?._id !== res.data.blog.author._id) {
          const followRes = await api.get('/follows/check', { params: { userId: res.data.blog.author._id } });
          setFollowing(followRes.data.following);
        }
      }
    } catch {
      router.push('/404');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) { toast('Sign in to like', 'info'); return; }
    try {
      const res = await api.post('/likes/toggle', { targetType: 'blog', targetId: blog._id });
      setLiked(res.data.liked);
      setBlog((b: any) => ({ ...b, likesCount: b.likesCount + (res.data.liked ? 1 : -1) }));
    } catch {
      toast('Failed to like', 'error');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) { toast('Sign in to bookmark', 'info'); return; }
    try {
      const res = await api.post('/bookmarks/toggle', { blogId: blog._id });
      setBookmarked(res.data.bookmarked);
      toast(res.data.bookmarked ? 'Bookmarked!' : 'Removed bookmark', 'success');
    } catch {
      toast('Failed to bookmark', 'error');
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) { toast('Sign in to follow', 'info'); return; }
    try {
      const res = await api.post('/follows/toggle', { userId: blog.author._id });
      setFollowing(res.data.following);
      toast(res.data.following ? `Following ${blog.author.name}` : 'Unfollowed', 'success');
    } catch {
      toast('Failed to follow', 'error');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast('Link copied!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!blog) return null;

  const isAuthor = user?._id === blog.author._id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">{blog.category}</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-4 mb-4 leading-tight">{blog.title}</h1>
          {blog.summary && <p className="text-lg text-muted-foreground">{blog.summary}</p>}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mt-5">
            <div className="flex items-center gap-3">
              <img
                src={blog.author.avatar || `https://ui-avatars.com/api/?name=${blog.author.name}&background=random&size=40`}
                alt={blog.author.name}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <Link href={`/profile/${blog.author._id}`} className="font-medium hover:text-primary">{blog.author.name}</Link>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</p>
              </div>
            </div>

            {!isAuthor && (
              <button
                onClick={handleFollow}
                className={`text-sm px-4 py-1.5 rounded-full border transition-all ${following ? 'bg-muted' : 'bg-primary text-primary-foreground border-primary'}`}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            )}

            <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {blog.readTime} min</span>
              <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {blog.viewsCount}</span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {blog.coverImage && (
          <img src={blog.coverImage} alt={blog.title} className="w-full max-h-96 object-cover rounded-xl mb-8" />
        )}

        <SmartSummary blogId={blog._id} readTime={blog.readTime} />

<div dangerouslySetInnerHTML={{ __html: blog.content }} />

        {/* Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {blog.tags.map((tag: string) => (
              <Link key={tag} href={`/explore?tag=${tag}`} className="text-sm bg-muted hover:bg-muted/80 px-3 py-1 rounded-full transition-colors">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 py-6 border-y">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${liked ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950/30' : 'hover:bg-muted'}`}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
            <span className="text-sm">{blog.likesCount}</span>
          </button>

          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${bookmarked ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/30' : 'hover:bg-muted'}`}
          >
            <BookMarked className={`h-5 w-5 ${bookmarked ? 'fill-current' : ''}`} />
            <span className="text-sm">Save</span>
          </button>

          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full border hover:bg-muted transition-all">
            <Share2 className="h-5 w-5" /> Share
          </button>

          {isAuthor && (
            <Link href={`/write?edit=${blog._id}`} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full border hover:bg-muted transition-all">
              <Edit className="h-5 w-5" /> Edit
            </Link>
          )}
        </div>

        {/* Comments */}
        <CommentsSection blogId={blog._id} />
      </div>

<CommentIntelligencePanel
  blogId={blog._id}
  isAuthor={user?._id === blog.author._id}
/>
    </div>
  );
}
