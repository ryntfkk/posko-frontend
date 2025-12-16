// src/features/auth/api.ts
import api from '@/lib/axios';
import { 
  AuthResponse, 
  LoginPayload, 
  ProfileResponse, 
  RegisterPayload,
  PreRegisterResponse,
  VerifyPreOtpResponse,
  RequestPhoneOtpResponse, 
  VerifyPhoneOtpResponse,
  PublicUserProfileResponse // [NEW] Import tipe baru
} from './types';

// [HELPER] Cookie Management
function setAuthCookie(token: string) {
  document.cookie = `posko_token=${token}; path=/; max-age=604800; SameSite=Lax`;
}

function removeAuthCookie() {
  document.cookie = `posko_token=; path=/; max-age=0; SameSite=Lax`;
}

function safeSetToken(token: string): boolean {
  try {
    localStorage.setItem('posko_token', token);
    setAuthCookie(token);
    return true;
  } catch (e) {
    console.error('Failed to save token:', e);
    return false;
  }
}

function safeGetToken(): string | null {
  try {
    return localStorage.getItem('posko_token');
  } catch (e) {
    console.error('Failed to get token:', e);
    return null;
  }
}

function safeRemoveToken(): void {
  try {
    localStorage.removeItem('posko_token');
    localStorage.removeItem('posko_refresh_token');
    removeAuthCookie();
  } catch (e) {
    console.error('Failed to remove token:', e);
  }
}

// [NEW] Pre-Register: Langkah 1 (Kirim OTP ke Email)
export const preRegister = async (email: string) => {
  const response = await api.post<PreRegisterResponse>('/auth/pre-register', { email });
  return response.data;
};

// [NEW] Verify Pre-OTP: Langkah 2 (Validasi OTP & Dapat Token Email)
export const verifyPreOtp = async (email: string, otp: string) => {
  const response = await api.post<VerifyPreOtpResponse>('/auth/verify-pre-otp', { email, otp });
  return response.data;
};

// [NEW] Request Phone OTP (Kirim OTP WA)
export const requestPhoneOtp = async (phoneNumber: string) => {
  const response = await api.post<RequestPhoneOtpResponse>('/auth/request-phone-otp', { phoneNumber });
  return response.data;
};

// [NEW] Verify Phone OTP (Validasi OTP & Dapat Token WA)
export const verifyPhoneOtp = async (phoneNumber: string, otp: string) => {
  const response = await api.post<VerifyPhoneOtpResponse>('/auth/verify-phone-otp', { phoneNumber, otp });
  return response.data;
};

// [RECOVERY] Forgot Password (Kirim OTP)
export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// [RECOVERY] Verify Reset OTP (Dapat Reset Token)
export const verifyResetOtp = async (email: string, otp: string) => {
  const response = await api.post('/auth/verify-reset-otp', { email, otp });
  return response.data; // Harus return { data: { resetToken: '...' } }
};

// [RECOVERY] Reset Password (Final)
export const resetPassword = async (resetToken: string, newPassword: string) => {
  const response = await api.post('/auth/reset-password', { resetToken, newPassword });
  return response.data;
};

export const loginUser = async (credentials: LoginPayload) => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  
  if (response.data.data.tokens) {
    safeSetToken(response.data.data.tokens.accessToken);
    try {
      localStorage.setItem('posko_refresh_token', response.data.data.tokens.refreshToken);
    } catch (e) {
      console.error('Failed to save refresh token:', e);
    }
  }
  
  return response.data;
};

export const registerUser = async (payload: RegisterPayload) => {
  // Payload sekarang wajib mengandung verificationToken (Email) & phoneVerificationToken (WA)
  const response = await api.post<AuthResponse>('/auth/register', payload);
  
  // Karena registrasi sekarang langsung auto-login (verified di awal), kita simpan token
  if (response.data.data.tokens) {
    safeSetToken(response.data.data.tokens.accessToken);
    try {
      localStorage.setItem('posko_refresh_token', response.data.data.tokens.refreshToken);
    } catch (e) {
      console.error('Failed to save refresh token:', e);
    }
  }
  
  return response.data;
};

// [DEPRECATED] Fungsi ini mungkin masih dipakai di page lain, biarkan dulu tapi tidak dipakai di flow baru
export const verifyOtp = async (email: string, otp: string) => {
  const response = await api.post<AuthResponse>('/auth/verify-otp', { email, otp });
  
  if (response.data.data.tokens) {
    safeSetToken(response.data.data.tokens.accessToken);
    try {
      localStorage.setItem('posko_refresh_token', response.data.data.tokens.refreshToken);
    } catch (e) {
      console.error('Failed to save refresh token:', e);
    }
  }
  
  return response.data;
};

// [DEPRECATED] Diganti preRegister
export const resendOtp = async (email: string) => {
  const response = await api.post('/auth/resend-otp', { email });
  return response.data;
};

export const fetchProfile = async () => {
  const response = await api.get<ProfileResponse>('/auth/profile');
  return response.data;
};

// [NEW] Fetch Public Profile (User-Centric)
export const fetchPublicProfile = async (username: string) => {
  // Menggunakan endpoint public baru yang dibuat di backend
  const response = await api.get<PublicUserProfileResponse>(`/auth/public/${username}`);
  return response.data;
};

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('posko_refresh_token');
    if (!refreshToken) return null;

    const response = await api.post<AuthResponse>('/auth/refresh-token', { refreshToken });
    
    if (response.data.data.tokens) {
      safeSetToken(response.data.data.tokens.accessToken);
      localStorage.setItem('posko_refresh_token', response.data.data.tokens.refreshToken);
      return response.data.data.tokens.accessToken;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    safeRemoveToken();
    return null;
  }
};

export const logoutUser = async () => {
  try {
    // Logout backend (opsional)
    // await api.post('/auth/logout', { refreshToken }); 
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    safeRemoveToken();
  }
};

export const logout = logoutUser; 

export const updateProfile = async (data: any) => {
    const response = await api.put<ProfileResponse>('/auth/profile', data);
    return response.data;
};

export const switchRole = async (role: string) => {
  const response = await api.post('/auth/switch-role', { role });
  return response.data;
};

export const registerPartner = async () => {
  const response = await api.post('/auth/register-partner');
  return response.data;
};

export const isAuthenticated = (): boolean => {
  return !!safeGetToken();
};

export const getToken = (): string | null => {
  return safeGetToken();
};