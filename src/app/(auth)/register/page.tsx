'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, preRegister, verifyPreOtp } from '@/features/auth/api';
import { RegisterPayload } from '@/features/auth/types';

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

  // State Email OTP
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [verificationToken, setVerificationToken] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'verified'>('idle');

  // State UI
  const [showPassword, setShowPassword] = useState(false);
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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

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
    if (name === 'password') checkPasswordStrength(value);
  };

  const handleRequestOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) return alert('Email tidak valid');
    setIsLoading(true);
    try {
      await preRegister(formData.email);
      setOtpMode(true);
      setOtpTimer(60);
      setErrorMsg('');
    } catch (error: any) {
      setErrorMsg(error.response?.status === 409 ? 'Email sudah terdaftar.' : 'Gagal mengirim OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return alert('OTP harus 6 digit');
    setIsLoading(true);
    try {
      const res = await verifyPreOtp(formData.email, otpCode);
      setVerificationToken(res.data.verificationToken);
      setEmailStatus('verified');
      setOtpMode(false);
      setErrorMsg('');
    } catch (error: any) {
      setErrorMsg('Kode OTP salah.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (emailStatus !== 'verified') return setErrorMsg('Silakan verifikasi email terlebih dahulu.');
    if (!formData.fullName || formData.fullName.length < 3) return setErrorMsg('Nama lengkap minimal 3 karakter.');
    if (formData.password !== formData.confirmPassword) return setErrorMsg('Konfirmasi password tidak sesuai.');

    setIsLoading(true);
    try {
      const payload: RegisterPayload = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        verificationToken,
        roles: ['customer'],
      };
      await registerUser(payload);
      router.push('/');
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Gagal mendaftar.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900">
      
      {/* LEFT SIDE: Visual Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-red-600 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative z-10 max-w-sm text-white">
          <div className="mb-6 bg-white p-2 rounded-lg inline-block shadow-xl">
            <Image src="/logo.png" alt="Logo" width={36} height={36} priority />
          </div>
          <h2 className="text-3xl font-black leading-tight mb-3 tracking-tight">Daftar & Pesan Jasa Sekarang.</h2>
          <p className="text-red-100 text-base opacity-90">Bergabung dengan platform jasa teknisi terpercaya dengan ribuan profesional siap membantu Anda.</p>
        </div>
      </div>

      {/* RIGHT SIDE: Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[440px]">
          
          {/* Header Mobile - Compact */}
          <div className="mb-8 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="lg:hidden block mb-4">
              <Image src="/logo.png" alt="Logo" width={32} height={32} priority />
            </Link>
            <h1 className="text-xl font-black tracking-tight text-gray-900">Buat Akun Baru</h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">Lengkapi detail untuk akses penuh layanan Posko.</p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 bg-red-50 text-red-600 text-[11px] rounded-lg border border-red-100 font-bold uppercase tracking-tight flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Grid 1: Name & Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nama Lengkap</label>
                <input
                  type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:bg-white focus:border-red-500 outline-none transition-all placeholder:text-gray-300"
                  placeholder="Contoh: Budi S."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">@</span>
                  <input
                    type="text" name="username" value={formData.username} onChange={handleChange}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:bg-white focus:border-red-500 outline-none transition-all placeholder:text-gray-300"
                    placeholder="budi_s"
                  />
                </div>
              </div>
            </div>

            {/* Email Section - Integrated Inline OTP */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Alamat Email</label>
                <div className="flex gap-2">
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    disabled={emailStatus === 'verified'}
                    className={`flex-1 px-3 py-2 text-sm border rounded-lg outline-none transition-all ${
                      emailStatus === 'verified' ? 'bg-green-100 border-green-200 text-green-700 font-bold' : 'bg-white border-gray-200 focus:border-red-500'
                    }`}
                    placeholder="email@anda.com"
                  />
                  {emailStatus !== 'verified' ? (
                    <button type="button" onClick={handleRequestOtp} disabled={isLoading || !formData.email} className="px-3 py-2 bg-gray-900 text-white text-[10px] font-black rounded-lg hover:bg-black transition-all uppercase tracking-tight disabled:opacity-20">
                      {isLoading && !otpMode ? '...' : 'OTP'}
                    </button>
                  ) : (
                    <div className="flex items-center justify-center w-9 bg-green-500 text-white rounded-lg shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
              </div>

              {/* INLINE OTP FIELD - Muncul menggantikan modal */}
              {otpMode && emailStatus !== 'verified' && (
                <div className="pt-2 border-t border-gray-200 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Masukkan 6-Digit Kode</label>
                      <input
                        type="text" value={otpCode}
                        onChange={(e) => /^\d*$/.test(e.target.value) && e.target.value.length <= 6 && setOtpCode(e.target.value)}
                        className="w-full px-3 py-2 text-base font-black tracking-[0.4em] text-center border-2 border-red-100 rounded-lg focus:border-red-500 outline-none"
                        placeholder="000000"
                        autoFocus
                      />
                    </div>
                    <button onClick={handleVerifyOtp} disabled={isLoading || otpCode.length !== 6} className="h-[42px] px-4 bg-red-600 text-white text-xs font-black rounded-lg shadow-md shadow-red-100 active:scale-95 transition-all">
                      {isLoading ? '...' : 'VERIFIKASI'}
                    </button>
                  </div>
                  <div className="mt-2 flex justify-between items-center px-1">
                    <p className="text-[9px] text-gray-400 font-bold">KODE DIKIRIM KE EMAIL</p>
                    <button type="button" onClick={() => setOtpMode(false)} className="text-[9px] text-gray-500 font-black underline uppercase">Ganti Email</button>
                  </div>
                </div>
              )}
            </div>

            {/* Grid 2: Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Password</label>
                <input
                  type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:bg-white focus:border-red-500 outline-none transition-all placeholder:text-gray-300"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-[27px] text-gray-300 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7" />}
                  </svg>
                </button>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Konfirmasi</label>
                <input
                  type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:bg-white focus:border-red-500 outline-none transition-all placeholder:text-gray-300"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Password Indicator - Ultra Compact */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 px-1">
              <Hint active={passwordStrength.hasMinLength} label="8+ Karakter" />
              <Hint active={passwordStrength.hasUppercase} label="Kapital" />
              <Hint active={passwordStrength.hasNumber} label="Angka" />
            </div>

            <div className="pt-4">
              <button
                type="submit" disabled={isLoading || emailStatus !== 'verified'}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-lg shadow-lg shadow-red-100 transition-all active:scale-[0.98] disabled:opacity-40 uppercase tracking-tight"
              >
                {isLoading && emailStatus === 'verified' ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4 font-bold">
              SUDAH PUNYA AKUN? <Link href="/login" className="text-red-600 hover:underline">MASUK</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}

// Sub-component Hint
function Hint({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter transition-colors ${active ? 'text-green-600' : 'text-gray-300'}`}>
      <div className={`w-1 h-1 rounded-full ${active ? 'bg-green-600' : 'bg-gray-300'}`} />
      {label}
    </div>
  );
}