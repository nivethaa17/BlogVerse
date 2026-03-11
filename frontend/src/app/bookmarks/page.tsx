'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { BlogCard } from '@/components/blog/BlogCard';
import { BookMarked, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookmarks').then((res) => {
      setBookmarks(res.data.bookmarks.map((b: any) => b.blog).filter(Boolean));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BookMarked className="h-6 w-6" /> Saved Articles ({bookmarks.length})
        </h1>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookMarked className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No saved articles yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((blog) => blog && <BlogCard key={blog._id} blog={blog} layout="list" />)}
          </div>
        )}
      </div>
    </div>
  );
}
