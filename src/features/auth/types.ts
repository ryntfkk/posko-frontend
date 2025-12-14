// src/features/auth/types.ts
export interface User {
  _id: string;
  fullName: string;
  email: string;
  roles: string[];
  activeRole: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  balance?: number;
  providerStatus?: string; // [NEW] Status verifikasi provider
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
  email: string;
  password?: string;
  phoneNumber: string;
  birthDate?: string; // YYYY-MM-DD
  gender?: string;
  roles?: string[];
  verificationToken: string; // [REQUIRED] Token Email
  phoneVerificationToken: string; // [NEW] Token WhatsApp
  address: {
    province: string;
    city: string;
    district: string;
    village: string;
    postalCode: string;
    detail: string;
  };
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
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