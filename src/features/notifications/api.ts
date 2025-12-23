import api from '@/lib/axios';
import { NotificationResponse, UnreadCountResponse } from './types';

/**
 * Retry function with exponential backoff
 */
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries = 2,
  baseDelay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on 401, 403, 404, or non-timeout errors
      if (error.response?.status && [401, 403, 404].includes(error.response.status)) {
        throw error;
      }
      
      // Only retry on timeout or network errors
      const isTimeout = error.code === 'ECONNABORTED' || 
                      error.message?.includes('timeout') ||
                      error.message?.includes('Network Error');
      
      if (!isTimeout || attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff: wait longer for each retry
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`[Notification API] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const notificationApi = {
  /**
   * Fetch user notifications with retry logic and longer timeout
   */
  getNotifications: async (page = 1, limit = 20) => {
    return retryRequest(() => {
      const url = '/notifications';
      console.log('[Notification API] Fetching notifications from:', url);
      return api.get<NotificationResponse>(url, {
        params: { page, limit },
        timeout: 45000, // 45 seconds for notifications endpoint
      });
    });
  },

  /**
   * Get unread notification count with retry logic
   */
  getUnreadCount: async () => {
    return retryRequest(() => {
      const url = '/notifications/unread-count';
      console.log('[Notification API] Fetching unread count from:', url);
      return api.get<UnreadCountResponse>(url, {
        timeout: 20000, // 20 seconds for unread count
      });
    });
  },

  /**
   * Mark a notification as read
   */
  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () =>
    api.patch('/notifications/read-all'),

  /**
   * Delete a notification
   */
  deleteNotification: (id: string) =>
    api.delete(`/notifications/${id}`)
};

