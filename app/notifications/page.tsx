'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { nameToUniqueSlug } from '@/lib/utils/mentions';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Heart,
  MessageCircle,
  Repeat2,
  AtSign,
  UserPlus,
  CheckCheck,
  Trash2,
  Loader2,
  ArrowLeft,
  Filter
} from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: 'mention' | 'like' | 'comment' | 'repost' | 'follow';
  post_id?: string;
  comment_id?: string;
  message: string;
  read: boolean;
  created_at: string;
  actor: {
    full_name: string;
    avatar_url: string | null;
    is_verified: boolean;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'mention' | 'like' | 'comment' | 'follow'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/feed/notifications?limit=100');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login?redirectTo=/notifications');
          return;
        }
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount === 0) return;

    setMarkingRead(true);
    try {
      const response = await fetch('/api/feed/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    } finally {
      setMarkingRead(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/feed/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] })
      });

      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setDeleting(notificationId);
    try {
      const response = await fetch(`/api/feed/notifications?id=${notificationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.type === 'follow') {
      // Navigate to the actor's profile
      const profileSlug = notification.actor?.full_name && notification.actor_id
        ? nameToUniqueSlug(notification.actor.full_name, notification.actor_id)
        : notification.actor_id;
      router.push(`/connect/${profileSlug}`);
    } else if (notification.post_id) {
      router.push(`/feed?post=${notification.post_id}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <AtSign className="w-5 h-5 text-blue-500" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'repost':
        return <Repeat2 className="w-5 h-5 text-purple-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={markingRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {markingRead ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              Mark all read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'mention', label: 'Mentions' },
            { key: 'like', label: 'Likes' },
            { key: 'comment', label: 'Comments' },
            { key: 'follow', label: 'Follows' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${filter === key
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Bell className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm text-gray-400">
                {filter === 'all'
                  ? "You're all caught up!"
                  : `No ${filter} notifications`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`relative ${!notification.read ? 'bg-green-50/50' : ''}`}
                  >
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full px-4 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {notification.actor.avatar_url ? (
                          <Image
                            src={notification.actor.avatar_url}
                            alt={notification.actor.full_name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                            {notification.actor.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {/* Icon badge */}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] text-gray-900">
                          <span className="font-semibold">{notification.actor.full_name}</span>
                          {' '}
                          {notification.message.replace(notification.actor.full_name, '').trim()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0 mt-2" />
                      )}
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      disabled={deleting === notification.id}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      style={{ opacity: deleting === notification.id ? 1 : undefined }}
                    >
                      {deleting === notification.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
