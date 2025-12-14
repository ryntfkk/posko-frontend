// src/features/services/api.ts
import api from '@/lib/axios';
import { ServiceResponse, Category } from './types';

// Wrapper response untuk kategori
interface CategoryResponse {
  status: string;
  data: Category[];
}

export const fetchServices = async (category?: string | null) => {
  // Kirim parameter 'category' (slug) ke backend
  const response = await api.get<ServiceResponse>('/services', {
    params: { category }
  });
  return response.data;
};

// [BARU] Fungsi fetch categories
export const fetchCategories = async () => {
  const response = await api.get<CategoryResponse>('/categories', {
    params: { activeOnly: true }
  });
  // Backend mengembalikan { status: 'success', data: [...] }
  return response.data; 
};