'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { BlogCard } from '@/components/blog/BlogCard';
import { Sparkles, TrendingUp, BookOpen, Zap, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth.store';

export default function HomePage() {
  const [trending, setTrending] = useState<any[]>([]);
  const [latest, setLatest] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingRes, latestRes] = await Promise.all([
          api.get('/blogs/trending'),
          api.get('/blogs', { params: { limit: 6, status: 'published' } }),
        ]);
        setTrending(trendingRes.data.blogs);
        setLatest(latestRes.data.blogs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      {!isAuthenticated && (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" /> AI-Powered Blogging Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Write Smarter.<br />Read Better.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              BlogVerse combines powerful writing tools with artificial intelligence to help you create, discover, and engage with content like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Start Writing Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/explore" className="flex items-center gap-2 border px-6 py-3 rounded-lg font-medium hover:bg-muted transition-colors">
                Explore Blogs <BookOpen className="h-4 w-4" />
              </Link>
            </div>

            {/* Feature badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {['AI Content Generation', 'Real-time Comments', 'Analytics Dashboard', 'Personalized Feed', 'Role-based Access'].map((f) => (
                <span key={f} className="bg-background/80 border px-3 py-1 rounded-full text-sm text-muted-foreground">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Trending */}
            {trending.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-orange-500" /> Trending
                  </h2>
                  <Link href="/explore?sort=trending" className="text-sm text-primary hover:underline">See all</Link>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trending.slice(0, 3).map((blog) => (
                    <BlogCard key={blog._id} blog={blog} />
                  ))}
                </div>
              </section>
            )}

            {/* Latest */}
            {latest.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Zap className="h-6 w-6 text-blue-500" /> Latest Posts
                  </h2>
                  <Link href="/explore" className="text-sm text-primary hover:underline">See all</Link>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {latest.map((blog) => (
                    <BlogCard key={blog._id} blog={blog} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
