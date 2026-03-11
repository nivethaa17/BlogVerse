'use client';

import Link from 'next/link';
import { Heart, MessageCircle, BookMarked, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BlogCardProps {
  blog: {
    _id: string;
    title: string;
    summary: string;
    coverImage?: string;
    slug: string;
    tags: string[];
    category: string;
    readTime: number;
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
    author: {
      _id: string;
      name: string;
      avatar?: string;
    };
  };
  layout?: 'card' | 'list';
}

export const BlogCard = ({ blog, layout = 'card' }: BlogCardProps) => {
  if (layout === 'list') {
    return (
      <div className="flex gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors group">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <img
              src={blog.author.avatar || `https://ui-avatars.com/api/?name=${blog.author.name}&background=random&size=32`}
              alt={blog.author.name}
              className="h-6 w-6 rounded-full"
            />
            <Link href={`/profile/${blog.author._id}`} className="text-xs text-muted-foreground hover:text-foreground">
              {blog.author.name}
            </Link>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
            </span>
          </div>
          <Link href={`/blog/${blog.slug}`}>
            <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors line-clamp-2">
              {blog.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{blog.summary}</p>
          </Link>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{blog.category}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {blog.readTime} min
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" /> {blog.viewsCount}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Heart className="h-3 w-3" /> {blog.likesCount}
            </span>
          </div>
        </div>
        {blog.coverImage && (
          <img src={blog.coverImage} alt={blog.title} className="h-24 w-32 rounded-md object-cover flex-shrink-0" />
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
      {blog.coverImage && (
        <Link href={`/blog/${blog.slug}`}>
          <img src={blog.coverImage} alt={blog.title} className="w-full h-48 object-cover group-hover:opacity-95 transition-opacity" />
        </Link>
      )}
      <div className="p-5">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={blog.author.avatar || `https://ui-avatars.com/api/?name=${blog.author.name}&background=random&size=32`}
            alt={blog.author.name}
            className="h-8 w-8 rounded-full"
          />
          <div>
            <Link href={`/profile/${blog.author._id}`} className="text-sm font-medium hover:text-primary">
              {blog.author.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Content */}
        <Link href={`/blog/${blog.slug}`}>
          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {blog.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{blog.summary}</p>
        </Link>

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {blog.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {blog.readTime} min</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {blog.viewsCount}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {blog.likesCount}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {blog.commentsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
