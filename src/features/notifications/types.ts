export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'chat' | 'order' | 'support' | 'system';
  data: any;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}


