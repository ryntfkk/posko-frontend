'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  MessageCircle, 
  FileText, 
  AlertCircle, 
  CheckCheck, 
  Trash2, 
  RefreshCw,
  WifiOff
} from 'lucide-react';
import { notificationApi } from '@/features/notifications/api';
import { Notification } from '@/features/notifications/types';
import { useSocket } from '@/context/SocketContext';

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    isLoading,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        setError(null);
        const res = await notificationApi.getNotifications(1, 100);
        return res.data;
      } catch (err: any) {
        console.error('Failed to load notifications:', err);
        
        // Determine error message
        let errorMessage = 'Gagal memuat notifikasi';
        if (err.response?.status === 404) {
          errorMessage = 'Endpoint notifikasi tidak ditemukan. Pastikan backend sudah di-restart dan route notifications sudah terdaftar.';
        } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          errorMessage = 'Koneksi timeout. Pastikan koneksi internet Anda stabil.';
        } else if (err.message?.includes('Network Error')) {
          errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server mengalami masalah. Silakan coba lagi nanti.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
        }
        
        setError(errorMessage);
        throw err;
      }
    },
    refetchOnWindowFocus: true,
    retry: false, // Don't retry automatically to avoid spam
  });

  const notifications = data?.data || [];

  // Listen for new notifications via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      // Refresh notifications when new one arrives
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
    };

    // Listen for various notification events
    socket.on('notification:new', handleNewNotification);
    socket.on('notification:new_message', handleNewNotification);
    socket.on('order_status_update', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:new_message', handleNewNotification);
      socket.off('order_status_update', handleNewNotification);
    };
  }, [socket, queryClient]);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read in background
    if (!notification.isRead) {
      try {
        await notificationApi.markAsRead(notification._id);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }

    // Navigate based on type
    switch (notification.type) {
      case 'chat':
        if (notification.data?.roomId) {
          router.push(`/chat?room=${notification.data.roomId}`);
        } else {
          router.push('/chat');
        }
        break;
      case 'order':
        if (notification.data?.orderId) {
          router.push(`/orders/${notification.data.orderId}`);
        } else {
          router.push('/orders');
        }
        break;
      case 'support':
        if (notification.data?.ticketId) {
          router.push(`/support/${notification.data.ticketId}`);
        } else {
          router.push('/support');
        }
        break;
      default:
        break;
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'chat':
        return <MessageCircle className={iconClass} style={{ color: '#3b82f6' }} />;
      case 'order':
        return <FileText className={iconClass} style={{ color: '#10b981' }} />;
      case 'support':
        return <AlertCircle className={iconClass} style={{ color: '#f59e0b' }} />;
      default:
        return <Bell className={iconClass} style={{ color: '#6b7280' }} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola pemberitahuan Anda</p>
          </div>
          {hasUnread && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
            >
              <CheckCheck className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-600">Baca Semua</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900">Gagal Memuat</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 rounded-lg bg-white border border-red-200 hover:bg-red-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-500">Memuat notifikasi...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Notifikasi</h2>
            <p className="text-gray-500 text-center max-w-sm">
              Kami akan memberi tahu Anda jika ada aktivitas penting
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-xl p-4 border cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead 
                    ? 'border-red-200 bg-red-50/30' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                    !notification.isRead ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`text-sm font-semibold ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0 mt-1"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatDate(notification.createdAt)}
                      </span>
                      <button
                        onClick={(e) => handleDeleteNotification(notification._id, e)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Hapus notifikasi"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {!isLoading && notifications.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefetching ? 'animate-spin' : ''}`} />
              <span className="text-sm text-gray-600">
                {isRefetching ? 'Memuat ulang...' : 'Muat Ulang'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

