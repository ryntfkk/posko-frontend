// src/features/support/api.ts
import api from '@/lib/axios';
import { SupportTicket, CreateSupportTicketRequest } from './types';

/**
 * Create support ticket dari order
 */
export const createSupportTicket = async (data: CreateSupportTicketRequest) => {
  const response = await api.post<{ message: string; data: SupportTicket }>('/support/tickets', data);
  return response.data;
};

/**
 * Cek apakah sudah ada support ticket untuk order tertentu
 */
export const getSupportTicketByOrder = async (orderId: string) => {
  const response = await api.get<{ message: string; data: SupportTicket | null }>(
    `/support/tickets/order/${orderId}`
  );
  return response.data;
};

/**
 * List semua support tickets customer
 */
export const listSupportTickets = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
}) => {
  const response = await api.get<{
    message: string;
    data: SupportTicket[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>('/support/tickets', { params });
  return response.data;
};

/**
 * Get support ticket detail dengan chat history
 */
export const getSupportTicket = async (ticketId: string) => {
  const response = await api.get<{ message: string; data: SupportTicket }>(
    `/support/tickets/${ticketId}`
  );
  return response.data;
};





