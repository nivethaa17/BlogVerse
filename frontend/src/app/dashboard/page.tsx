'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Eye, Heart, MessageCircle, Users, BookOpen, Clock,
  PenSquare, TrendingUp, Loader2, Lock, Globe, ToggleLeft, ToggleRight
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth.store';
import { useToast } from '@/components/providers/ToastProvider';
import Link from 'next/link';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const StatCard = ({ icon: Icon, label, value, color, sub }: any) => (
  <div className="bg-card border rounded-xl p-5 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold">{(value ?? 0).toLocaleString()}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const { user, updateUser, isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const [writerData, setWriterData] = useState<any>(null);
  const [readerData, setReaderData] = useState<any>(null);
  const [myBlogs, setMyBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'writer' | 'reader'>('writer');
  const [isPublic, setIsPublic] = useState(true);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  const isWriter = user?.role === 'writer' || user?.role === 'both';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isWriter) setTab('reader');
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const promises: Promise<any>[] = [
        api.get('/analytics/reader'),
        api.get('/auth/me'),
      ];
      if (isWriter) {
        promises.push(api.get('/analytics/writer'));
        promises.push(api.get('/blogs/my'));
      }

      const [readerRes, meRes, writerRes, blogsRes] = await Promise.all(promises);

      setReaderData(readerRes.data.analytics);
      setIsPublic(meRes.data.user?.isPublic ?? true);
      updateUser({ isPublic: meRes.data.user?.isPublic ?? true });

      if (writerRes) {
        setWriterData(writerRes.data);
        setMyBlogs(blogsRes?.data?.blogs || []);
      }
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrivacy = async () => {
    setPrivacyLoading(true);
    try {
      const res = await api.patch('/users/privacy');
      setIsPublic(res.data.isPublic);
      updateUser({ isPublic: res.data.isPublic });
      toast(res.data.message, 'success');
    } catch {
      toast('Failed to update privacy', 'error');
    } finally {
      setPrivacyLoading(false);
    }
  };

  const categoryData = readerData?.categoryDistribution
    ? Object.entries(readerData.categoryDistribution).map(([name, value]) => ({ name, value: value as number }))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePrivacy}
              disabled={privacyLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                isPublic
                  ? 'bg-green-50 border-green-300 text-green-700 dark:bg-green-950/30 dark:border-green-700 dark:text-green-400'
                  : 'bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-950/30 dark:border-orange-700 dark:text-orange-400'
              }`}
            >
              {privacyLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPublic ? (
                <Globe className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {isPublic ? 'Public Profile' : 'Private Profile'}
              {isPublic ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            </button>

            {isWriter && (
              <Link href="/write" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90">
                <PenSquare className="h-4 w-4" /> New Blog
              </Link>
            )}
          </div>
        </div>

        {/* Privacy Banner */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border mb-8 text-sm ${
          isPublic
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300'
            : 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-300'
        }`}>
          {isPublic ? <Globe className="h-5 w-5 flex-shrink-0" /> : <Lock className="h-5 w-5 flex-shrink-0" />}
          <span>
            {isPublic
              ? 'Your profile is public — your blogs and profile are visible to everyone.'
              : 'Your profile is private — your blogs and profile are hidden from other users. Only you can see them.'}
          </span>
        </div>

        {/* Tabs */}
        {isWriter && (
          <div className="flex gap-1 mb-8 bg-muted p-1 rounded-lg w-fit">
            <button
              onClick={() => setTab('writer')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === 'writer' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
            >
              ✍️ Writer Analytics
            </button>
            <button
              onClick={() => setTab('reader')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === 'reader' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
            >
              📚 Reader Analytics
            </button>
          </div>
        )}

        {/* WRITER TAB */}
        {tab === 'writer' && isWriter && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard icon={Eye} label="Total Views" value={writerData?.analytics?.totalViews} color="bg-blue-500" sub="All time" />
              <StatCard icon={Heart} label="Total Likes" value={writerData?.analytics?.totalLikes} color="bg-red-500" />
              <StatCard icon={MessageCircle} label="Comments" value={writerData?.analytics?.totalComments} color="bg-green-500" />
              <StatCard icon={Users} label="Followers" value={writerData?.analytics?.totalFollowers} color="bg-purple-500" />
              <StatCard icon={PenSquare} label="Published" value={writerData?.analytics?.totalBlogs} color="bg-orange-500" sub="Blogs" />
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Engagement Rate</h3>
              </div>
              <p className="text-4xl font-bold text-purple-600">{writerData?.engagementRate ?? 0}%</p>
              <p className="text-sm text-muted-foreground mt-1">Based on likes + comments / total views</p>
            </div>

            {writerData?.topBlogs?.length > 0 && (
              <div className="bg-card border rounded-xl p-6">
                <h2 className="font-semibold text-lg mb-6">Top Performing Blogs</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={writerData.topBlogs} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="title" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="viewsCount" name="Views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="likesCount" name="Likes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="commentsCount" name="Comments" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-lg">My Blogs</h2>
                <Link href="/write" className="text-sm text-primary hover:underline">+ New</Link>
              </div>
              {myBlogs.length > 0 ? (
                <div className="divide-y">
                  {myBlogs.map((blog) => (
                    <div key={blog._id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <Link href={`/blog/${blog.slug}`} className="font-medium hover:text-primary line-clamp-1 text-sm">
                          {blog.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${blog.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'}`}>
                            {blog.status}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" /> {blog.viewsCount}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Heart className="h-3 w-3" /> {blog.likesCount}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {blog.commentsCount}</span>
                        </div>
                      </div>
                      <Link href={`/write?edit=${blog._id}`} className="text-xs text-primary hover:underline flex-shrink-0">Edit</Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <PenSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                  <p className="font-medium text-muted-foreground">No blogs yet</p>
                  <Link href="/write" className="inline-block mt-3 text-sm text-primary hover:underline">Write your first blog →</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* READER TAB */}
        {(tab === 'reader' || !isWriter) && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard icon={BookOpen} label="Blogs Read" value={readerData?.totalBlogsRead} color="bg-blue-500" sub="Total articles" />
              <StatCard icon={Clock} label="Reading Time" value={readerData?.totalReadingTime} color="bg-green-500" sub="Minutes spent" />
              <StatCard icon={TrendingUp} label="Categories" value={categoryData.length} color="bg-purple-500" sub="Topics explored" />
            </div>

            {categoryData.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border rounded-xl p-6">
                  <h2 className="font-semibold text-lg mb-6">Reading by Category</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%" cy="50%"
                          innerRadius={55} outerRadius={90}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {categoryData.map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card border rounded-xl p-6">
                  <h2 className="font-semibold text-lg mb-4">Category Breakdown</h2>
                  <div className="space-y-3">
                    {[...categoryData].sort((a, b) => b.value - a.value).map((item: any, i: number) => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm flex-1">{item.name}</span>
                        <span className="text-sm font-medium">{item.value} read</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 border rounded-xl bg-card">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="font-medium text-muted-foreground">No reading data yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start reading blogs to see your analytics</p>
                <Link href="/explore" className="inline-block mt-3 text-sm text-primary hover:underline">Explore blogs →</Link>
              </div>
            )}

            {readerData?.totalBlogsRead > 0 && (
              <div className="bg-card border rounded-xl p-6">
                <h2 className="font-semibold text-lg mb-4">Reading Summary</h2>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{readerData.totalBlogsRead}</p>
                    <p className="text-xs text-muted-foreground mt-1">Articles Read</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{readerData.totalReadingTime}</p>
                    <p className="text-xs text-muted-foreground mt-1">Minutes Reading</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {readerData.totalBlogsRead > 0
                        ? Math.round(readerData.totalReadingTime / readerData.totalBlogsRead)
                        : 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Avg Min/Article</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}