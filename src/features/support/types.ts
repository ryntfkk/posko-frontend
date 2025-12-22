// src/features/support/types.ts
import { Order } from '../orders/types';
import { User } from '../auth/types';

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  _id: string;
  orderId: string | Order;
  customerId: string | User;
  adminId: string | User | null;
  chatRoomId: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  subject: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export interface SupportMessage {
  sender: string | User;
  content: string;
  attachment?: {
    url: string;
    type: 'image' | 'video' | 'document';
  };
  sentAt: string;
}

export interface CreateSupportTicketRequest {
  orderId: string;
  subject: string;
  initialMessage?: string;
}



