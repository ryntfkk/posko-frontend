import api from '@/lib/axios';
import { ProviderListResponse, Provider } from './types';

// Interface untuk Dokumentasi Real (Updated: Added orderNumber)
export interface DocumentationItem {
  url: string;
  type: 'photo' | 'video';
  description: string;
  orderId: string;
  orderNumber?: string; // [BARU]
  completedAt: string;
  // Field lama tetap ada tapi tidak dipakai di UI
  customerName?: string;
  rating?: number | null;
  comment?: string | null;
}

// Interface parameter query
export interface FetchProvidersParams {
  lat?: number;
  lng?: number;
  category?: string;
  search?: string;
  sortBy?: 'distance' | 'price_asc' | 'price_desc' | 'rating';
  limit?: number;
  page?: number;
  serviceId?: string; // [BARU] Filter by specific Service ID
}

export const fetchProviders = async (params: FetchProvidersParams) => {
  const response = await api.get<ProviderListResponse>('/providers', { params });
  return response.data;
};

export const fetchProviderById = async (id: string) => {
  const response = await api.get<{ data: Provider }>(`/providers/${id}`);
  return response.data;
};

export const fetchProviderDocumentation = async (id: string) => {
  const response = await api.get<{ data: DocumentationItem[] }>(`/providers/${id}/documentation`);
  return response.data;
};

export const fetchProviderMe = async () => {
  const response = await api.get('/providers/me');
  return response.data;
};

// [FIX] URL diperbaiki dari '/favorites' menjadi '/favorites/toggle'
export const toggleFavorite = async (providerId: string) => {
  const response = await api.post('/favorites/toggle', { providerId });
  return response.data;
};

// [BARU] Cek status favorit awal
export const checkFavoriteStatus = async (providerId: string) => {
  const response = await api.get<{ data: { isFavorited: boolean } }>(`/favorites/check/${providerId}`);
  return response.data;
};

// [BARU] Fetch list of favorited providers
export const fetchFavorites = async () => {
  const response = await api.get<{ data: Provider[] }>('/favorites/me');
  return response.data;
};

export const createProvider = async (data: any) => {
  const response = await api.post('/providers', data);
  return response.data;
};

export const updateProviderServices = async (services: any[]) => {
  const response = await api.put('/providers/services', { services });
  return response.data;
};

export const toggleOnlineStatus = async (isOnline: boolean) => {
  const response = await api.put('/providers/online-status', { isOnline });
  return response.data;
};

export const updateAvailability = async (blockedDates: string[]) => {
  const response = await api.put('/providers/availability', { blockedDates });
  return response.data;
};

export const updatePortfolio = async (portfolioImages: string[]) => {
  const response = await api.put('/providers/portfolio', { portfolioImages });
  return response.data;
};

export const updateProviderProfile = async (formData: FormData) => {
  const response = await api.put('/providers/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};