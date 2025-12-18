import api from '@/lib/axios';
import { WalletHistoryResponse } from './types';

export const getWalletHistory = async (page = 1, limit = 10, type?: string) => {
    const params: any = { page, limit };
    if (type) params.type = type;

    const response = await api.get<WalletHistoryResponse>('/wallet/history', { params });
    return response.data;
};
