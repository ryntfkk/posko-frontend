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
  verificationToken: string; // [NEW] Wajib ada untuk registrasi final
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

// [NEW] Tipe untuk Pre-Register (Kirim OTP)
export interface PreRegisterResponse {
  message: string;
  data: {
    email: string;
  };
}

// [NEW] Tipe untuk Verify Pre-OTP (Dapat Token)
export interface VerifyPreOtpResponse {
  message: string;
  data: {
    email: string;
    verificationToken: string;
  };
}