// src/features/orders/api.ts
import api from '@/lib/axios';
import { CreateOrderPayload, Order } from './types';

// Create Order
export const createOrder = (data: CreateOrderPayload) => {
  const formData = new FormData();

  // Append data JSON fields
  formData.append('providerId', data.providerId || '');
  formData.append('orderType', data.orderType);
  formData.append('totalAmount', data.totalAmount.toString());

  // [FIX] Append Admin Fee & Discount agar Backend menyimpan data keuangan yang akurat
  if (data.adminFee) formData.append('adminFee', data.adminFee.toString());
  if (data.discountAmount) formData.append('discountAmount', data.discountAmount.toString());

  formData.append('scheduledAt', data.scheduledAt);
  formData.append('orderNote', data.orderNote || '');
  if (data.voucherCode) formData.append('voucherCode', data.voucherCode);

  // Append complex objects as JSON strings
  formData.append('items', JSON.stringify(data.items));
  formData.append('shippingAddress', JSON.stringify(data.shippingAddress));
  formData.append('location', JSON.stringify(data.location));
  formData.append('customerContact', JSON.stringify(data.customerContact));
  formData.append('propertyDetails', JSON.stringify(data.propertyDetails));
  formData.append('scheduledTimeSlot', JSON.stringify(data.scheduledTimeSlot));

  // Append Attachments (File[])
  if (data.attachments && data.attachments.length > 0) {
    data.attachments.forEach((att: any) => {
      if (att.file) {
        formData.append('attachments', att.file);
      }
    });
  }

  return api.post<{ message: string; data: Order }>('/orders', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// List Orders dengan Pagination
export const listOrders = (view: 'customer' | 'provider' = 'customer', page = 1, limit = 10, search?: string) => {
  let url = `/orders?view=${view}&page=${page}&limit=${limit}`;
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  return api.get(url);
};

// Incoming Orders (Provider)
export const listIncomingOrders = () => {
  return api.get('/orders/incoming');
};

// Get Detail
export const fetchOrderById = (orderId: string) => {
  return api.get<{ message: string; data: Order }>(`/orders/${orderId}`);
};

// Update Status
export const updateOrderStatus = (orderId: string, status: string) => {
  return api.patch(`/orders/${orderId}/status`, { status });
};

// Accept Order (Provider)
export const acceptOrder = (orderId: string) => {
  return api.patch(`/orders/${orderId}/accept`);
};

// Reject Order (Provider)
export const rejectOrder = (orderId: string) => {
  return api.patch(`/orders/${orderId}/reject`);
};

// Cancel Order (Customer)
export const cancelOrder = (orderId: string, reason: string) => {
  return api.post(`/orders/${orderId}/cancel`, { reason });
};

// Dispute Order (Customer) - Support File Upload
export const disputeOrder = (orderId: string, reason: string, files?: File[]) => {
  const formData = new FormData();
  formData.append('reason', reason);

  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append('evidence', file);
    });
  }

  return api.post(`/orders/${orderId}/dispute`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Request Additional Fee
export const requestAdditionalFee = (orderId: string, data: { description: string; amount: number }) => {
  return api.post(`/orders/${orderId}/additional-fee`, data);
};

// Reject Additional Fee
export const rejectAdditionalFee = (orderId: string, feeId: string) => {
  return api.put(`/orders/${orderId}/fees/${feeId}/reject`);
};