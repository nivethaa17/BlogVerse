import mongoose, { Document, Schema } from 'mongoose';

// ==================== LIKE MODEL ====================
export interface ILike extends Document {
  user: mongoose.Types.ObjectId;
  targetType: 'blog' | 'comment';
  targetId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['blog', 'comment'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);
likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

export const Like = mongoose.model<ILike>('Like', likeSchema);

// ==================== BOOKMARK MODEL ====================
export interface IBookmark extends Document {
  user: mongoose.Types.ObjectId;
  blog: mongoose.Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blog: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
  },
  { timestamps: true }
);
bookmarkSchema.index({ user: 1, blog: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);

// ==================== FOLLOWER MODEL ====================
export interface IFollower extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
}

const followerSchema = new Schema<IFollower>(
  {
    follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);
followerSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follower = mongoose.model<IFollower>('Follower', followerSchema);

// ==================== NOTIFICATION MODEL ====================
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

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'comment', 'follow', 'reply', 'mention'], required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
