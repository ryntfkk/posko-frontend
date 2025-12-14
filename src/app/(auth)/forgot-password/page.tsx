// src/app/(auth)/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { forgotPassword, verifyResetOtp } from '@/features/auth/api';

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [step, setStep] = useState<1 | 2>(1); // 1: Input Email, 2: Input OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!email.includes('@')) {
      setError('Masukkan email yang valid.');
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSuccessMsg('Kode OTP telah dikirim ke email Anda.');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      setError('Kode OTP harus 6 digit.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyResetOtp(email, otp);
      // Simpan token reset sementara di sessionStorage atau kirim lewat query param
      const resetToken = res.data.resetToken;
      
      // Redirect ke halaman buat password baru
      router.push(`/reset-password?token=${resetToken}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kode OTP salah atau kadaluarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex">
      {/* Left Column */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 md:px-16 lg:px-24 py-12 relative bg-white z-10">
        <Link href="/login" className="absolute top-8 left-6 lg:left-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-bold">Kembali ke Login</span>
        </Link>

        <div className="max-w-md w-full mx-auto mt-10 lg:mt-0">
          <div className="mb-8">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-6 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Lupa Password?</h1>
            <p className="text-gray-500 text-base">
              {step === 1 
                ? 'Masukkan email Anda untuk menerima kode verifikasi.' 
                : `Kode OTP telah dikirim ke ${email}. Masukkan kode tersebut di bawah ini.`}
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded-r-xl flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-gray-700 text-xs font-bold uppercase tracking-wider">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-xl shadow-gray-200 hover:bg-red-600 hover:shadow-red-200 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center disabled:opacity-70"
              >
                {isLoading ? <><Spinner /> Mengirim...</> : 'Kirim Kode OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="otp" className="block text-gray-700 text-xs font-bold uppercase tracking-wider">Kode OTP (6 Digit)</label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none tracking-[0.5em] text-center font-mono text-lg"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Hanya angka
                  disabled={isLoading}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-xl shadow-gray-200 hover:bg-red-600 hover:shadow-red-200 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center disabled:opacity-70"
              >
                {isLoading ? <><Spinner /> Memverifikasi...</> : 'Verifikasi & Lanjut'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-gray-500 hover:text-red-600 font-medium"
              >
                Kirim Ulang Kode / Ganti Email
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right Column: Visual */}
      <div className="hidden lg:block w-1/2 relative bg-gray-900 overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1581092921461-eab62e97a783?q=80&w=2070&auto=format&fit=crop" 
          alt="Forgot Password Visual"
          fill
          className="object-cover opacity-40 mix-blend-overlay"
        />
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent via-gray-900/40 to-gray-900"></div>
      </div>
    </div>
  );
}