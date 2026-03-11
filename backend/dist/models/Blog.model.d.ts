import mongoose, { Document } from 'mongoose';
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
export declare const Blog: mongoose.Model<IBlog, {}, {}, {}, mongoose.Document<unknown, {}, IBlog, {}, {}> & IBlog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Blog.model.d.ts.map