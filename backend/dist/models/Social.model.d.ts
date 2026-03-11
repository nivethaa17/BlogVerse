import mongoose, { Document } from 'mongoose';
export interface ILike extends Document {
    user: mongoose.Types.ObjectId;
    targetType: 'blog' | 'comment';
    targetId: mongoose.Types.ObjectId;
    createdAt: Date;
}
export declare const Like: mongoose.Model<ILike, {}, {}, {}, mongoose.Document<unknown, {}, ILike, {}, {}> & ILike & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export interface IBookmark extends Document {
    user: mongoose.Types.ObjectId;
    blog: mongoose.Types.ObjectId;
    createdAt: Date;
}
export declare const Bookmark: mongoose.Model<IBookmark, {}, {}, {}, mongoose.Document<unknown, {}, IBookmark, {}, {}> & IBookmark & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export interface IFollower extends Document {
    follower: mongoose.Types.ObjectId;
    following: mongoose.Types.ObjectId;
    createdAt: Date;
}
export declare const Follower: mongoose.Model<IFollower, {}, {}, {}, mongoose.Document<unknown, {}, IFollower, {}, {}> & IFollower & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export type NotificationType = 'like' | 'comment' | 'follow' | 'reply' | 'mention';
export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    type: NotificationType;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Social.model.d.ts.map