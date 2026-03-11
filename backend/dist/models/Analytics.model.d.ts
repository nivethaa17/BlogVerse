import mongoose, { Document } from 'mongoose';
export interface IReaderAnalytics extends Document {
    user: mongoose.Types.ObjectId;
    totalBlogsRead: number;
    totalReadingTime: number;
    categoryDistribution: Map<string, number>;
    tagDistribution: Map<string, number>;
    monthlyActivity: {
        month: string;
        count: number;
    }[];
    lastUpdated: Date;
}
export declare const ReaderAnalytics: mongoose.Model<IReaderAnalytics, {}, {}, {}, mongoose.Document<unknown, {}, IReaderAnalytics, {}, {}> & IReaderAnalytics & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export interface IWriterAnalytics extends Document {
    user: mongoose.Types.ObjectId;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalBlogs: number;
    totalFollowers: number;
    monthlyViews: {
        month: string;
        views: number;
    }[];
    monthlyFollowers: {
        month: string;
        count: number;
    }[];
    topBlogs: {
        blogId: mongoose.Types.ObjectId;
        views: number;
        likes: number;
    }[];
    engagementRate: number;
    lastUpdated: Date;
}
export declare const WriterAnalytics: mongoose.Model<IWriterAnalytics, {}, {}, {}, mongoose.Document<unknown, {}, IWriterAnalytics, {}, {}> & IWriterAnalytics & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Analytics.model.d.ts.map