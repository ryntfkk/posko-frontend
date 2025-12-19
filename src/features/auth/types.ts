// src/features/auth/types.ts

// [NEW] Import Provider type untuk response public profile
// Pastikan path ini benar sesuai struktur project Anda
import { Provider } from '@/features/providers/types';

export interface Address {
  province: string;
  city: string;
  district: string;
  village: string;
  postalCode: string;
  detail: string;
}

export interface GeoLocation {
  type: string; // 'Point'
  coordinates: number[]; // [lng, lat]
}

export interface User {
  _id: string;
  fullName: string;
  username: string; // [NEW] Added username
  email: string;
  roles: string[];
  activeRole: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  balance?: number;
  providerStatus?: string; // [NEW] Status verifikasi provider
  location?: GeoLocation;
  address?: Partial<Address>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  message: string;
  data: {
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
    profile: User;
  };
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  fullName: string;
  username: string; // [NEW] Added username
  email: string;
  password?: string;
  phoneNumber?: string; // Optional
  birthDate?: string; // YYYY-MM-DD
  gender?: string;
  roles?: string[];
  verificationToken: string; // [REQUIRED] Token Email
  phoneVerificationToken?: string; // [OPTIONAL] Token WhatsApp
  address?: Address;
  location?: GeoLocation;
  profilePictureUrl?: string;
  bannerPictureUrl?: string;
  bio?: string;
}

export interface ProfileResponse {
  message: string;
  data: {
    profile: User;
  };
}

// [NEW] Tipe untuk Public Profile Response
export interface PublicUserProfileResponse {
  message: string;
  data: {
    user: User;
    provider: Provider | null; // Provider bisa null jika user bukan mitra
    isProvider: boolean;
  };
}

// [NEW] Tipe untuk Pre-Register (Kirim OTP Email)
export interface PreRegisterResponse {
  message: string;
  data: {
    email: string;
  };
}

// [NEW] Tipe untuk Verify Pre-OTP (Dapat Token Email)
export interface VerifyPreOtpResponse {
  message: string;
  data: {
    email: string;
    verificationToken: string;
  };
}

// [NEW] Tipe untuk Request Phone OTP (Kirim OTP WA)
export interface RequestPhoneOtpResponse {
  message: string;
  data: {
    phoneNumber: string;
  };
}

// [NEW] Tipe untuk Verify Phone OTP (Dapat Token WA)
export interface VerifyPhoneOtpResponse {
  message: string;
  data: {
    phoneNumber: string;
    phoneVerificationToken: string;
  };
}