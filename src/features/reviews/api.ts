// src/features/reviews/api.ts
import api from '@/lib/axios';

export interface CreateReviewPayload {
  userId: string;
  providerId: string;
  orderId: string; // [FIX] Wajib ada agar sesuai dengan validasi Backend baru
  rating: number;
  comment: string;
}

export const createReview = (data: CreateReviewPayload) => {
  return api.post('/reviews', data);
};