'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  registerUser,
  preRegister,
  verifyPreOtp,
} from '@/features/auth/api';
import { RegisterPayload } from '@/features/auth/types';

// Interface untuk password strength
interface PasswordStrength {
  hasMinLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // =====================
  // STATE: EMAIL OTP
  // =====================
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [verificationToken, setVerificationToken] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'verified'>('idle');

  // State UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Strength
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
  });

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
  });

  // Effect untuk Timer OTP Email
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errorMsg) setErrorMsg('');

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  // ==========================================
  // LOGIC EMAIL OTP
  // ==========================================
  const handleRequestOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      return alert('Masukkan email yang valid');
    }

    console.log('[Frontend] Requesting Email OTP for:', formData.email);
    setIsLoading(true);
    try {
      await preRegister(formData.email);
      setOtpMode(true);
      setOtpTimer(60);
      setErrorMsg('');
    } catch (error: any) {
      console.error('[Frontend] Email OTP Error:', error);
      if (error.response?.status === 409) {
        setErrorMsg('Email sudah terdaftar. Silakan login atau gunakan email lain.');
      } else {
        const msg = error.response?.data?.message || 'Gagal mengirim OTP Email.';
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      return alert('Kode OTP harus 6 digit');
    }

    setIsLoading(true);
    try {
      const res = await verifyPreOtp(formData.email, otpCode);
      setVerificationToken(res.data.verificationToken);
      setEmailStatus('verified');
      setOtpMode(false);
      setErrorMsg('');
      alert('Email berhasil diverifikasi! Silakan lengkapi pendaftaran.');
    } catch (error: any) {
      console.error('[Frontend] Verify Email OTP Error:', error);
      const msg = error.response?.data?.message || 'Kode OTP salah.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;

    setIsLoading(true);
    try {
      await preRegister(formData.email);
      setOtpTimer(60);
      alert('Kode OTP baru telah dikirim ke Email.');
    } catch (error: any) {
      console.error('[Frontend] Resend Email OTP Error:', error);
      alert('Gagal mengirim ulang OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // FINAL SUBMIT (SIMPLIFIED)
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (emailStatus !== 'verified') {
      setErrorMsg('Silakan verifikasi email terlebih dahulu.');
      return;
    }

    if (!formData.fullName || formData.fullName.length < 3) {
      setErrorMsg('Nama lengkap minimal 3 karakter.');
      return;
    }
    if (!formData.username || !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setErrorMsg('Username wajib diisi dan hanya boleh mengandung huruf, angka, underscore.');
      return;
    }

    if (!formData.password) {
      setErrorMsg('Password wajib diisi.');
      return;
    }

    const { hasMinLength, hasLowercase, hasUppercase, hasNumber } = passwordStrength;
    if (!hasMinLength || !hasLowercase || !hasUppercase || !hasNumber) {
      setErrorMsg('Password belum memenuhi syarat kekuatan.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Konfirmasi password tidak sesuai.');
      return;
    }

    if (!verificationToken) {
      setErrorMsg('Sesi verifikasi email kadaluarsa. Silakan refresh dan ulangi.');
      return;
    }

    setIsLoading(true);
    console.log('[Frontend] Submitting Simplified Registration Data...');

    try {
      // Simplified Payload
      const payload: RegisterPayload = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        verificationToken,      // Token Email Only
        roles: ['customer'],
        // Excluding phone, address, location, etc.
      };

      await registerUser(payload);

      console.log('[Frontend] Registration Success');
      router.push('/');
      router.refresh();

    } catch (error: any) {
      console.error('[Frontend] Registration Error:', error);
      const msg = error.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.';
      setErrorMsg(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">

      {/* Container Utama */}
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden relative border border-gray-100">

        {/* OTP MODAL OVERLAY (EMAIL) */}
        {otpMode && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fadeIn">
            <div className="w-full max-w-xs text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifikasi Email</h2>
              <p className="text-gray-500 text-sm mb-6">
                Kode OTP telah dikirim ke <span className="font-bold">{formData.email}</span>
              </p>

              {errorMsg && (
                <div className="mb-4 p-2 bg-red-50 text-red-600 text-xs rounded-lg font-medium">
                  {errorMsg}
                </div>
              )}

              <input
                type="text"
                value={otpCode}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value) && e.target.value.length <= 6) {
                    setOtpCode(e.target.value);
                  }
                }}
                className="w-full h-12 text-center text-2xl font-bold tracking-[0.5em] text-gray-800 border-2 border-gray-200 rounded-xl focus:border-red-500 outline-none mb-4"
                placeholder="000000"
                autoFocus
              />

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading || otpCode.length !== 6}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 mb-4"
              >
                {isLoading ? '...' : 'Verifikasi'}
              </button>

              <button
                onClick={() => setOtpMode(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Batal / Ganti Email
              </button>
            </div>
          </div>
        )}

        <div className="p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">P</div>
              <span className="text-2xl font-extrabold tracking-tight text-gray-900">Posko.</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
            <p className="text-gray-500 text-sm mt-1">Daftar sekarang untuk mulai memesan jasa.</p>
          </div>

          {errorMsg && !otpMode && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
              <input
                type="text" name="fullName"
                value={formData.fullName} onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                placeholder="Contoh: Budi Santoso"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">@</span>
                <input
                  type="text" name="username"
                  value={formData.username} onChange={handleChange}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                  placeholder="budi_santoso"
                />
              </div>
            </div>

            {/* Email Verification Group */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Email</label>
              <div className="flex gap-2">
                <input
                  type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  disabled={emailStatus === 'verified'}
                  className={`flex-1 px-4 py-3 border rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all ${emailStatus === 'verified'
                    ? 'bg-green-50 border-green-200 text-green-700 font-medium'
                    : 'bg-white border-gray-200 focus:border-blue-500'
                    }`}
                  placeholder="nama@email.com"
                />
                {emailStatus !== 'verified' ? (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={isLoading || !formData.email}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {isLoading ? '...' : 'Verifikasi'}
                  </button>
                ) : (
                  <div className="flex items-center justify-center w-12 bg-green-100 text-green-600 rounded-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </div>
              {emailStatus === 'verified' && (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Email terverifikasi
                </p>
              )}
            </div>

            {/* Password Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                    placeholder="******"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ulangi Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                    placeholder="******"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xl shadow-red-200 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mendaftarkan...
                  </div>
                ) : 'Daftar Sekarang'}
              </button>
            </div>

            <p className="text-center text-gray-500 text-sm">
              Sudah punya akun? <Link href="/login" className="text-red-600 font-bold hover:underline">Login disini</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}