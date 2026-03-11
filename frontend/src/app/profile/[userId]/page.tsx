'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { BlogCard } from '@/components/blog/BlogCard';
import { Users, BookOpen, Loader2, Lock, Globe, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth.store';
import { useToast } from '@/components/providers/ToastProvider';
import Link from 'next/link';

export default function ProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  const isOwnProfile = user?._id === userId;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const profileRes = await api.get(`/users/${userId}`);
      const profileData = profileRes.data.user;
      setProfile(profileData);

      // If private and not owner, don't fetch blogs
      if (!profileData.isPublic && !isOwnProfile) {
        setIsPrivate(true);
        setLoading(false);
        return;
      }

      const blogsRes = await api.get('/blogs', {
        params: { author: userId, status: 'published', limit: 20 },
      });
      setBlogs(blogsRes.data.blogs);

      if (isAuthenticated && !isOwnProfile) {
        const followRes = await api.get('/follows/check', { params: { userId } });
        setFollowing(followRes.data.following);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setIsPrivate(true);
      } else {
        toast('Failed to load profile', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) { toast('Sign in to follow', 'info'); return; }
    try {
      const res = await api.post('/follows/toggle', { userId });
      setFollowing(res.data.following);
      setProfile((p: any) => ({ ...p, followersCount: p.followersCount + (res.data.following ? 1 : -1) }));
      toast(res.data.following ? `Following ${profile.name}` : 'Unfollowed', 'success');
    } catch {
      toast('Action failed', 'error');
    }
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

  // Private profile wall
  if (isPrivate && !isOwnProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-card border rounded-2xl p-12">
            <Lock className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Private Profile</h2>
            <p className="text-muted-foreground">
              This user has set their profile to private. Their blogs and information are not visible to others.
            </p>
            <Link href="/explore" className="inline-block mt-6 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm hover:bg-primary/90">
              Explore Public Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const isWriter = profile.role === 'writer' || profile.role === 'both';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Profile Header */}
      <div className="bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <img
              src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random&size=120`}
              alt={profile.name}
              className="h-28 w-28 rounded-full border-4 border-background shadow-md"
            />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold">{profile.name}</h1>
                    {/* Privacy badge */}
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      profile.isPublic
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                    }`}>
                      {profile.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {profile.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize mt-1 inline-block">
                    {profile.role}
                  </span>
                </div>

                <div className="flex gap-2 md:ml-auto">
                  {isOwnProfile ? (
                    <Link href="/dashboard" className="px-4 py-2 border rounded-full text-sm font-medium hover:bg-muted">
                      Edit Profile
                    </Link>
                  ) : (
                    <button
                      onClick={handleFollow}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                        following ? 'border bg-muted' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      {following ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>

              {profile.bio && <p className="text-muted-foreground mb-4">{profile.bio}</p>}

              <div className="flex gap-6 text-sm">
                <span><strong>{blogs.length}</strong> <span className="text-muted-foreground">posts</span></span>
                <span><strong>{profile.followersCount}</strong> <span className="text-muted-foreground">followers</span></span>
                <span><strong>{profile.followingCount}</strong> <span className="text-muted-foreground">following</span></span>
              </div>

              {profile.preferences?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {profile.preferences.slice(0, 5).map((p: string) => (
                    <span key={p} className="text-xs bg-muted px-2 py-0.5 rounded-full">{p}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> Published Posts ({blogs.length})
        </h2>

        {blogs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground border rounded-xl">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>{isOwnProfile ? 'You haven\'t published any blogs yet' : 'No published posts yet'}</p>
            {isOwnProfile && (
              <Link href="/write" className="inline-block mt-3 text-sm text-primary hover:underline">
                Write your first blog →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
