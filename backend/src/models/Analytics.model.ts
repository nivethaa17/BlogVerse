import mongoose, { Document, Schema } from 'mongoose';

// ==================== READER ANALYTICS ====================
export interface IReaderAnalytics extends Document {
  user: mongoose.Types.ObjectId;
  totalBlogsRead: number;
  totalReadingTime: number; // in minutes
  categoryDistribution: Map<string, number>;
  tagDistribution: Map<string, number>;
  monthlyActivity: { month: string; count: number }[];
  lastUpdated: Date;
}

const readerAnalyticsSchema = new Schema<IReaderAnalytics>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalBlogsRead: { type: Number, default: 0 },
  totalReadingTime: { type: Number, default: 0 },
  categoryDistribution: { type: Map, of: Number, default: {} },
  tagDistribution: { type: Map, of: Number, default: {} },
  monthlyActivity: [{ month: String, count: Number }],
  lastUpdated: { type: Date, default: Date.now },
});

export const ReaderAnalytics = mongoose.model<IReaderAnalytics>('ReaderAnalytics', readerAnalyticsSchema);

// ==================== WRITER ANALYTICS ====================
export interface IWriterAnalytics extends Document {
  user: mongoose.Types.ObjectId;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalBlogs: number;
  totalFollowers: number;
  monthlyViews: { month: string; views: number }[];
  monthlyFollowers: { month: string; count: number }[];
  topBlogs: { blogId: mongoose.Types.ObjectId; views: number; likes: number }[];
  engagementRate: number;
  lastUpdated: Date;
}

const writerAnalyticsSchema = new Schema<IWriterAnalytics>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalViews: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  totalComments: { type: Number, default: 0 },
  totalBlogs: { type: Number, default: 0 },
  totalFollowers: { type: Number, default: 0 },
  monthlyViews: [{ month: String, views: Number }],
  monthlyFollowers: [{ month: String, count: Number }],
  topBlogs: [{
    blogId: { type: Schema.Types.ObjectId, ref: 'Blog' },
    views: Number,
    likes: Number,
  }],
  engagementRate: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

export const WriterAnalytics = mongoose.model<IWriterAnalytics>('WriterAnalytics', writerAnalyticsSchema);
