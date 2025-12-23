import { useQuery } from '@tanstack/react-query';
import { notificationApi } from './api';

/**
 * Hook to get unread notification count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notification-unread-count'],
    queryFn: async () => {
      try {
        const res = await notificationApi.getUnreadCount();
        return res.data.data.unreadCount;
      } catch (error: any) {
        // If user is not authenticated, return 0
        if (error.response?.status === 401) {
          return 0;
        }
        // If endpoint not found (404), return 0 (backend might not have route yet)
        if (error.response?.status === 404) {
          console.warn('[Notification] Endpoint not found. Make sure backend is running and route is registered.');
          return 0;
        }
        throw error;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    retry: false, // Don't retry on error to avoid spam
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('posko_token'), // Only fetch if authenticated
  });
}

