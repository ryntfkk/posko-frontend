// src/features/settings/api.ts
import api from '@/lib/axios';
import { SettingsResponse } from './types';

export const settingsApi = {
  // Mengambil konfigurasi global (termasuk adminFee)
  getGlobalConfig: async (): Promise<SettingsResponse> => {
    const response = await api.get('/settings');
    return response.data;
  },

  // [NEW] Update Username
  updateUsername: async (username: string): Promise<any> => {
    const response = await api.put('/settings/username', { username });
    return response.data;
  }
};