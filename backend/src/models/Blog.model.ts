import mongoose, { Document, Schema } from 'mongoose';

export type BlogStatus = 'draft' | 'published';

export interface IBlog extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  summary: string;
  coverImage?: string;
  author: mongoose.Types.ObjectId;
  tags: string[];
  category: string;
  status: BlogStatus;
  slug: string;
  readTime: number;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true },
    summary: { type: String, maxlength: 500, default: '' },
    coverImage: { type: String, default: '' },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    category: { type: String, required: true, trim: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    slug: { type: String, unique: true, sparse: true },
    readTime: { type: Number, default: 1 },
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate slug from title
blogSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();
  }
  // Calculate read time (avg 200 words/min)
  if (this.isModified('content')) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  next();
});

blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const Blog = mongoose.model<IBlog>('Blog', blogSchema);
