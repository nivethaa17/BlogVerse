'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, Send, X, Loader2, Image as ImageIcon, Tag } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { AIAssistant } from '@/components/editor/AIAssistant';
import api from '@/lib/api';
import { useToast } from '@/components/providers/ToastProvider';
import { useAuthStore } from '@/lib/store/auth.store';

const CATEGORIES = [
  'Technology', 'AI & ML', 'Web Development', 'Design', 'Finance',
  'Health', 'Science', 'Productivity', 'Career', 'Travel', 'Food', 'Lifestyle',
];

export default function WritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [saving, setSaving] = useState(false);
  const [blogId, setBlogId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || (user.role !== 'writer' && user.role !== 'both')) {
      router.push('/');
    }
    const editId = searchParams.get('edit');
    if (editId) loadBlog(editId);
  }, []);

  const loadBlog = async (id: string) => {
    try {
      const res = await api.get(`/blogs/${id}`);
      const blog = res.data.blog;
      setTitle(blog.title);
      setContent(blog.content);
      setSummary(blog.summary);
      setCategory(blog.category);
      setTags(blog.tags);
      setCoverImage(blog.coverImage || '');
      setBlogId(id);
    } catch {
      toast('Failed to load blog', 'error');
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const saveBlog = async (publishStatus: 'draft' | 'published') => {
    if (!title.trim()) { toast('Title is required', 'error'); return; }
    if (!content || content === '<p></p>') { toast('Content is required', 'error'); return; }
    if (!category) { toast('Category is required', 'error'); return; }

    setSaving(true);
    try {
      const data = { title, content, summary, category, tags, coverImage, status: publishStatus };
      if (blogId) {
        await api.put(`/blogs/${blogId}`, data);
      } else {
        const res = await api.post('/blogs', data);
        setBlogId(res.data.blog._id);
      }
      setStatus(publishStatus);
      toast(publishStatus === 'published' ? 'Blog published!' : 'Draft saved!', 'success');
      if (publishStatus === 'published') router.push('/dashboard');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{blogId ? 'Edit Blog' : 'Write New Blog'}</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => saveBlog('draft')}
              disabled={saving}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-muted"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Draft
            </button>
            <button
              onClick={() => saveBlog('published')}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:bg-primary/90"
            >
              <Send className="h-4 w-4" /> Publish
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Title */}
            <input
              type="text"
              placeholder="Your blog title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-muted-foreground/50 py-2"
            />

            {/* Summary */}
            <textarea
              placeholder="Write a brief summary (optional)..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="w-full text-sm bg-transparent border-b pb-2 outline-none text-muted-foreground placeholder-muted-foreground/50 resize-none"
            />

            {/* Rich Text Editor */}
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your story..."
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* AI Assistant */}
            <AIAssistant
              content={content}
              title={title}
              onApplyContent={(c) => setContent(c)}
              onApplySummary={(s) => setSummary(s)}
              onApplyTitle={(t) => setTitle(t)}
              onApplyTags={(tgs) => setTags(tgs)}
            />

            {/* Cover Image */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Cover Image
              </h3>
              <input
                type="text"
                placeholder="Image URL..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full text-sm px-3 py-2 border rounded-md bg-background"
              />
              {coverImage && (
                <img src={coverImage} alt="Cover" className="mt-2 w-full h-32 object-cover rounded-md" />
              )}
            </div>

            {/* Category */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-sm mb-3">Category *</h3>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Tags */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" /> Tags
              </h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  className="flex-1 text-sm px-3 py-1.5 border rounded-md bg-background"
                />
                <button onClick={addTag} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm">+</button>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-muted text-xs px-2 py-1 rounded-full">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
