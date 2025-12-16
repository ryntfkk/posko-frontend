// src/features/reviews/api.ts
import api from '@/lib/axios';

export interface Review {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    profilePictureUrl: string;
  };
  providerId: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const fetchReviews = async (params: { providerId?: string; orderId?: string }) => {
  const response = await api.get<{ data: Review[] }>('/reviews', { params });
  return response.data;
};

export const createReview = async (data: {
  userId: string;
  providerId: string;
  orderId: string;
  rating: number;
  comment: string;
}) => {
  const response = await api.post('/reviews', data);
  return response.data;
};