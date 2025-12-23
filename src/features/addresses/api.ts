import api from '@/lib/axios';
import {
  AddressesResponse,
  AddressResponse,
  CreateAddressPayload,
  UpdateAddressPayload
} from './types';

export const fetchAddresses = async () => {
  const response = await api.get<AddressesResponse>('/addresses');
  return response.data;
};

export const getDefaultAddress = async () => {
  const response = await api.get<AddressesResponse>('/addresses');
  const addresses = response.data.data || [];
  return addresses.find(addr => addr.isDefault) || addresses[0] || null;
};

export const createAddress = async (payload: CreateAddressPayload) => {
  const response = await api.post<AddressResponse>('/addresses', payload);
  return response.data;
};

export const updateAddress = async (id: string, payload: UpdateAddressPayload) => {
  const response = await api.put<AddressResponse>(`/addresses/${id}`, payload);
  return response.data;
};

export const deleteAddress = async (id: string) => {
  const response = await api.delete(`/addresses/${id}`);
  return response.data;
};

export const setDefaultAddress = async (id: string) => {
  const response = await api.patch<AddressResponse>(`/addresses/${id}/default`);
  return response.data;
};

