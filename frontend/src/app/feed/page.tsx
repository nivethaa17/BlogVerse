'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BlogCard } from '@/components/blog/BlogCard';
import { Rss, TrendingUp, Loader2, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import { AIRecommendations } from '@/components/feed/AIRecommendations';

export default function FeedPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [tab, setTab] = useState<'feed' | 'trending'>('feed');

  useEffect(() => {
    fetchFeed(1, true);
    fetchTrending();
  }, []);

  const fetchFeed = async (p = 1, reset = false) => {
    setLoading(true);
    try {
      const res = await api.get('/blogs/feed', { params: { page: p, limit: 10 } });
      const newBlogs = res.data.blogs;
      setBlogs(reset ? newBlogs : (prev) => [...prev, ...newBlogs]);
      setHasMore(newBlogs.length === 10);
      setPage(p);
    } catch {
      // Fallback to all blogs
      const res = await api.get('/blogs', { params: { page: p, limit: 10, status: 'published' } });
      setBlogs(reset ? res.data.blogs : (prev) => [...prev, ...res.data.blogs]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const res = await api.get('/blogs/trending');
      setTrending(res.data.blogs);
    } catch {}
  };

  const currentBlogs = tab === 'feed' ? blogs : trending;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Feed</h1>

        {/* Tabs */}
        <div className="flex gap-4 border-b mb-6">
          <button
            onClick={() => setTab('feed')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${tab === 'feed' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
          >
            <Rss className="h-4 w-4" /> For You
          </button>
          <button
            onClick={() => setTab('trending')}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${tab === 'trending' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
          >
            <TrendingUp className="h-4 w-4" /> Trending
          </button>
        </div>
{/* AI Recommendations */}
{tab === 'feed' && (
  <div className="mb-6">
    <AIRecommendations />
  </div>
)}
        {loading && currentBlogs.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : currentBlogs.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Rss className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium">Your feed is empty</p>
            <p className="text-sm mt-1">Follow writers or update your preferences to see posts here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} layout="list" />)}
            {tab === 'feed' && hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => fetchFeed(page + 1)}
                  disabled={loading}
                  className="flex items-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
                  Load more
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
