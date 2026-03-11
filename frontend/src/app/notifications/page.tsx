'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Bell, Heart, MessageCircle, UserPlus, Loader2, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';

const NotificationIcon = ({ type }: { type: string }) => {
  if (type === 'like') return <Heart className="h-4 w-4 text-red-500" />;
  if (type === 'comment') return <MessageCircle className="h-4 w-4 text-blue-500" />;
  if (type === 'follow') return <UserPlus className="h-4 w-4 text-green-500" />;
  return <Bell className="h-4 w-4 text-muted-foreground" />;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { on } = useSocket();

  useEffect(() => {
    fetchNotifications();
    const cleanup = on('notification', (notification: any) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((c) => c + 1);
    });
    return cleanup;
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read');
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleClick = (notification: any) => {
    if (!notification.isRead) {
      api.patch('/notifications/read', { ids: [notification._id] });
      setNotifications((prev) => prev.map((n) => n._id === notification._id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (notification.link) router.push(notification.link);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" /> Notifications {unreadCount > 0 && <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
          </h1>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => handleClick(n)}
                className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all hover:bg-muted/30 ${!n.isRead ? 'bg-primary/5 border-primary/20' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={n.sender?.avatar || `https://ui-avatars.com/api/?name=${n.sender?.name}&background=random&size=40`}
                    alt={n.sender?.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                    <NotificationIcon type={n.type} />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.isRead && <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-2" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
