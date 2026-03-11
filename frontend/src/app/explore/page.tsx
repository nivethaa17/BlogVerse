'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { BlogCard } from '@/components/blog/BlogCard';
import { Search, Filter, Grid, List, Loader2, ChevronDown } from 'lucide-react';
import api from '@/lib/api';

const CATEGORIES = ['All', 'Technology', 'AI & ML', 'Web Development', 'Design', 'Finance', 'Health', 'Science', 'Productivity'];

export default function ExplorePage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [layout, setLayout] = useState<'card' | 'list'>('card');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get('category');
    const tag = searchParams.get('tag');
    if (cat) setCategory(cat);
    fetchBlogs(1, cat || 'All', tag || '', true);
  }, []);

  const fetchBlogs = async (p = 1, cat = category, q = search, reset = false) => {
    setLoading(true);
    try {
      const params: any = { page: p, limit: 12, status: 'published' };
      if (cat !== 'All') params.category = cat;
      if (q) params.search = q;

      const res = await api.get('/blogs', { params });
      const newBlogs = res.data.blogs;
      setBlogs(reset ? newBlogs : (prev) => [...prev, ...newBlogs]);
      setTotal(res.data.pagination.total);
      setHasMore(newBlogs.length === 12);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBlogs(1, category, search, true);
  };

  const handleCategory = (cat: string) => {
    setCategory(cat);
    fetchBlogs(1, cat, search, true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore</h1>
          <p className="text-muted-foreground">Discover stories, thinking, and expertise</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm hover:bg-primary/90">
            Search
          </button>
          <div className="flex gap-1 border rounded-lg p-1">
            <button type="button" onClick={() => setLayout('card')} className={`p-1.5 rounded ${layout === 'card' ? 'bg-muted' : ''}`}>
              <Grid className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setLayout('list')} className={`p-1.5 rounded ${layout === 'list' ? 'bg-muted' : ''}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">{total} posts found</p>

        {/* Blog Grid/List */}
        {loading && blogs.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No blogs found. Try a different search.</p>
          </div>
        ) : (
          <>
            {layout === 'card' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => <BlogCard key={blog._id} blog={blog} layout="card" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {blogs.map((blog) => <BlogCard key={blog._id} blog={blog} layout="list" />)}
              </div>
            )}

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => fetchBlogs(page + 1)}
                  disabled={loading}
                  className="flex items-center gap-2 mx-auto border px-6 py-2.5 rounded-lg text-sm hover:bg-muted disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
