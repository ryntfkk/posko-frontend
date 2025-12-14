// src/app/(auth)/register/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic'; 
import { 
  registerUser, 
  preRegister, 
  verifyPreOtp,
  requestPhoneOtp, // [NEW] Import API WA
  verifyPhoneOtp   // [NEW] Import API WA
} from '@/features/auth/api';
import { RegisterPayload } from '@/features/auth/types';
import { fetchProvinces, fetchRegionChildren, Region } from '@/features/regions/api';

// Load Peta Dynamic (CSR)
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-50 animate-pulse rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2 border border-gray-200">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
      <span className="text-xs font-medium">Memuat Peta...</span>
    </div>
  )
});

// Interface untuk password strength
interface PasswordStrength {
  hasMinLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
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

  // =====================
  // STATE: WHATSAPP OTP [NEW]
  // =====================
  const [phoneOtpMode, setPhoneOtpMode] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [phoneOtpTimer, setPhoneOtpTimer] = useState(0);
  const [phoneVerificationToken, setPhoneVerificationToken] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<'idle' | 'verified'>('idle');

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

  // Data Wilayah
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);
  
  const [selectedProvId, setSelectedProvId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    email: '', 
    password: '', 
    confirmPassword: '',
    fullName: '', 
    phoneNumber: '', 
    birthDate: '2000-01-01', 
    gender: '',
    addressProvince: '', 
    addressCity: '', 
    addressDistrict: '',
    addressVillage: '', 
    addressPostalCode: '', 
    addressDetail: '',
    latitude: null as number | null, 
    longitude: null as number | null,
  });

  // Load Provinsi saat mount
  useEffect(() => {
    fetchProvinces()
      .then(res => {
        if (res.success) {
          setProvinces(res.data);
        }
      })
      .catch(console.error);
  }, []);

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

  // Effect untuk Timer OTP WhatsApp [NEW]
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phoneOtpTimer > 0) {
      interval = setInterval(() => {
        setPhoneOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phoneOtpTimer]);

  // Check password strength
  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    });
  };

  const getPasswordScore = (): number => {
    const { hasMinLength, hasLowercase, hasUppercase, hasNumber } = passwordStrength;
    let score = 0;
    if (hasMinLength) score++;
    if (hasLowercase) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;
    return score;
  };

  const getPasswordScoreColor = (): string => {
    const score = getPasswordScore();
    if (score === 0) return 'bg-gray-200';
    if (score === 1) return 'bg-red-500';
    if (score === 2) return 'bg-orange-500';
    if (score === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthLabel = (): string => {
    const score = getPasswordScore();
    if (score === 0) return '';
    if (score === 1) return 'Lemah';
    if (score === 2) return 'Cukup';
    if (score === 3) return 'Baik';
    return 'Kuat';
  };

  // Handler Wilayah
  const handleRegionChange = (type: 'province' | 'city' | 'district' | 'village', e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const text = index > 0 ? e.target.options[index].text : '';

    if (type === 'province') {
      setSelectedProvId(id); 
      setSelectedCityId(''); 
      setSelectedDistrictId(''); 
      setSelectedVillageId('');
      setCities([]); 
      setDistricts([]); 
      setVillages([]);
      setFormData(prev => ({ 
        ...prev, 
        addressProvince: text, 
        addressCity: '', 
        addressDistrict: '', 
        addressVillage: '', 
        addressPostalCode: '' 
      }));
      
      if(id) {
        fetchRegionChildren(id)
          .then(res => {
            if (res.success) setCities(res.data);
          })
          .catch(console.error);
      }
    } 
    else if (type === 'city') {
      setSelectedCityId(id); 
      setSelectedDistrictId(''); 
      setSelectedVillageId('');
      setDistricts([]); 
      setVillages([]);
      setFormData(prev => ({ 
        ...prev, 
        addressCity: text, 
        addressDistrict: '', 
        addressVillage: '', 
        addressPostalCode: '' 
      }));

      if(id) {
        fetchRegionChildren(id)
          .then(res => {
            if (res.success) setDistricts(res.data);
          })
          .catch(console.error);
      }
    } 
    else if (type === 'district') {
      setSelectedDistrictId(id); 
      setSelectedVillageId('');
      setVillages([]);
      setFormData(prev => ({ 
        ...prev, 
        addressDistrict: text, 
        addressVillage: '', 
        addressPostalCode: '' 
      }));

      if(id) {
        fetchRegionChildren(id)
          .then(res => {
            if (res.success) setVillages(res.data);
          })
          .catch(console.error);
      }
    }
    else if (type === 'village') {
      setSelectedVillageId(id);
      const dummyPostalCode = id ? `1${id.substring(0, 4)}` : ''; 
      setFormData(prev => ({ 
        ...prev, 
        addressVillage: text, 
        addressPostalCode: dummyPostalCode 
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung Geolocation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, latitude, longitude }));
      },
      (error) => {
        console.error(error);
        alert("Gagal mengambil lokasi. Pastikan GPS aktif dan izinkan akses lokasi pada browser.");
      },
      { enableHighAccuracy: true }
    );
  };

  // ==========================================
  // LOGIC EMAIL OTP
  // ==========================================
  const handleRequestOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      return alert('Masukkan email yang valid');
    }
    
    setIsLoading(true);
    try {
      await preRegister(formData.email);
      setOtpMode(true);
      setOtpTimer(60);
      setErrorMsg('');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengirim OTP Email.';
      setErrorMsg(msg);
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
      alert('Email berhasil diverifikasi! Silakan lengkapi password.');
    } catch (error: any) {
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
    } catch (error) {
      console.error(error);
      alert('Gagal mengirim ulang OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // LOGIC WHATSAPP OTP [NEW]
  // ==========================================
  const handleRequestPhoneOtp = async () => {
    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      return alert('Masukkan nomor WhatsApp yang valid (min 10 digit).');
    }

    setIsLoading(true);
    try {
      await requestPhoneOtp(formData.phoneNumber);
      setPhoneOtpMode(true);
      setPhoneOtpTimer(60);
      setErrorMsg('');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengirim OTP WhatsApp.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (phoneOtpCode.length !== 6) {
      return alert('Kode OTP harus 6 digit');
    }

    setIsLoading(true);
    try {
      const res = await verifyPhoneOtp(formData.phoneNumber, phoneOtpCode);
      setPhoneVerificationToken(res.data.phoneVerificationToken);
      setPhoneStatus('verified');
      setPhoneOtpMode(false);
      setErrorMsg('');
      alert('Nomor WhatsApp berhasil diverifikasi!');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Kode OTP WhatsApp salah.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendPhoneOtp = async () => {
    if (phoneOtpTimer > 0) return;

    setIsLoading(true);
    try {
      await requestPhoneOtp(formData.phoneNumber);
      setPhoneOtpTimer(60);
      alert('Kode OTP baru telah dikirim ke WhatsApp.');
    } catch (error) {
      console.error(error);
      alert('Gagal mengirim ulang OTP WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // STEPS VALIDATION
  // ==========================================
  const validateStep = (): string => {
    setErrorMsg('');
    
    if (step === 1) {
      if (emailStatus !== 'verified') {
        return 'Silakan verifikasi email terlebih dahulu.';
      }
      
      if (!formData.password) {
        return 'Password wajib diisi.';
      }
      
      const { hasMinLength, hasLowercase, hasUppercase, hasNumber } = passwordStrength;
      if (!hasMinLength || !hasLowercase || !hasUppercase || !hasNumber) {
        return 'Password belum memenuhi syarat kekuatan.';
      }
      
      if (!formData.confirmPassword) {
        return 'Konfirmasi password wajib diisi.';
      }
      if (formData.password !== formData.confirmPassword) {
        return 'Konfirmasi password tidak sesuai.';
      }
    }
    
    if (step === 2) {
      if (!formData.fullName) {
        return 'Nama lengkap wajib diisi.';
      }
      if (formData.fullName.trim().length < 3) {
        return 'Nama lengkap minimal 3 karakter.';
      }
      
      if (!formData.birthDate) {
        return 'Tanggal lahir wajib diisi.';
      }
      
      if (!formData.gender) {
        return 'Jenis kelamin wajib dipilih.';
      }
      
      if (!formData.phoneNumber) {
        return 'Nomor telepon wajib diisi.';
      }
      if (formData.phoneNumber.length < 10 || formData.phoneNumber.length > 15) {
        return 'Nomor telepon harus 10-15 digit.';
      }
      if (phoneStatus !== 'verified') {
        return 'Nomor WhatsApp wajib diverifikasi.';
      }
    }
    
    return '';
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg('');
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setErrorMsg('');
    setStep(prev => prev - 1);
  };

  // ==========================================
  // FINAL SUBMIT
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (formData.latitude === null || formData.longitude === null) {
      setErrorMsg('Pilih lokasi pada peta dengan mengetuk titik rumah Anda.');
      return;
    }
    
    if (!formData.addressProvince) return setErrorMsg('Pilih provinsi terlebih dahulu.');
    if (!formData.addressCity) return setErrorMsg('Pilih kota/kabupaten terlebih dahulu.');
    if (!formData.addressDistrict) return setErrorMsg('Pilih kecamatan terlebih dahulu.');
    if (!formData.addressVillage) return setErrorMsg('Pilih kelurahan/desa terlebih dahulu.');

    if (!verificationToken) {
        setErrorMsg('Sesi verifikasi email kadaluarsa. Silakan refresh dan ulangi.');
        return;
    }
    if (!phoneVerificationToken) {
        setErrorMsg('Sesi verifikasi WhatsApp kadaluarsa. Silakan refresh dan ulangi.');
        return;
    }

    setIsLoading(true);
    
    try {
      const payload: RegisterPayload = {
        fullName: formData.fullName.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        birthDate: formData.birthDate,
        gender: formData.gender,
        roles: ['customer'],
        verificationToken,      // Token Email
        phoneVerificationToken, // Token WhatsApp [NEW]
        address: {
          province: formData.addressProvince,
          district: formData.addressDistrict,
          city: formData.addressCity,
          village: formData.addressVillage,
          postalCode: formData.addressPostalCode,
          detail: formData.addressDetail.trim()
        },
        location: { 
          type: 'Point', 
          coordinates: [formData.longitude!, formData.latitude! ] 
        }
      };
      
      await registerUser(payload);
      
      router.push('/');
      router.refresh();
      
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.';
      setErrorMsg(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-0 lg:p-8 font-sans text-gray-800">
        
      {/* Container Utama */}
      <div className="bg-white w-full max-w-5xl lg:rounded-3xl lg:shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-screen lg:min-h-[600px] relative">
          
        {/* OTP MODAL OVERLAY (EMAIL) */}
        {otpMode && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
              
              <button 
                onClick={() => setOtpMode(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi Email</h2>
              <p className="text-gray-500 text-sm mb-6">
                Kami telah mengirimkan 6 digit kode OTP ke email <br/>
                <span className="font-bold text-gray-800">{formData.email}</span>
              </p>

              {errorMsg && (
                 <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium">
                    {errorMsg}
                 </div>
              )}

              <div className="mb-6">
                <input 
                  type="text" 
                  value={otpCode}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value) && e.target.value.length <= 6) {
                      setOtpCode(e.target.value);
                    }
                  }}
                  className="w-full h-14 text-center text-3xl font-bold tracking-[0.5em] text-gray-800 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                  placeholder="000000"
                  autoFocus
                />
              </div>

              <button 
                onClick={handleVerifyOtp}
                disabled={isLoading || otpCode.length !== 6}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isLoading ? 'Memverifikasi...' : 'Verifikasi Kode'}
              </button>

              <div className="text-sm text-gray-500">
                Belum menerima kode?{' '}
                {otpTimer > 0 ? (
                  <span className="text-gray-400 font-medium">Kirim ulang dalam {otpTimer}s</span>
                ) : (
                  <button 
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-red-600 font-bold hover:underline disabled:opacity-50"
                  >
                    Kirim Ulang OTP
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* OTP MODAL OVERLAY (WHATSAPP) [NEW] */}
        {phoneOtpMode && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fadeIn">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
              
              <button 
                onClick={() => setPhoneOtpMode(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi WhatsApp</h2>
              <p className="text-gray-500 text-sm mb-6">
                Kami telah mengirimkan 6 digit kode OTP ke nomor <br/>
                <span className="font-bold text-gray-800">{formData.phoneNumber}</span>
              </p>

              {errorMsg && (
                 <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium">
                    {errorMsg}
                 </div>
              )}

              <div className="mb-6">
                <input 
                  type="text" 
                  value={phoneOtpCode}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value) && e.target.value.length <= 6) {
                      setPhoneOtpCode(e.target.value);
                    }
                  }}
                  className="w-full h-14 text-center text-3xl font-bold tracking-[0.5em] text-gray-800 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                  placeholder="000000"
                  autoFocus
                />
              </div>

              <button 
                onClick={handleVerifyPhoneOtp}
                disabled={isLoading || phoneOtpCode.length !== 6}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isLoading ? 'Memverifikasi...' : 'Verifikasi Kode WA'}
              </button>

              <div className="text-sm text-gray-500">
                Belum menerima kode?{' '}
                {phoneOtpTimer > 0 ? (
                  <span className="text-gray-400 font-medium">Kirim ulang dalam {phoneOtpTimer}s</span>
                ) : (
                  <button 
                    onClick={handleResendPhoneOtp}
                    disabled={isLoading}
                    className="text-green-600 font-bold hover:underline disabled:opacity-50"
                  >
                    Kirim Ulang OTP
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SIDEBAR (Desktop Only) */}
        <div className="hidden lg:flex bg-red-600 text-white p-10 w-1/3 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-red-500 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 bg-white rounded-xl p-1 shadow-lg group-hover:scale-105 transition-transform">
                <Image src="/logo.png" alt="Posko Logo" fill className="object-contain" />
              </div>
              <span className="text-3xl font-extrabold tracking-tight hover:text-red-100 transition-colors">Posko.</span>
            </Link>
            <p className="text-red-100 mt-5 text-sm leading-relaxed opacity-90">
              Bergabunglah dengan ribuan pengguna dan temukan bantuan profesional dalam hitungan menit.
            </p>
          </div>

          {/* Step Indicators */}
          <div className="space-y-8 relative z-10 py-8">
            {[1, 2, 3].map((num) => (
              <div 
                key={num} 
                className={`flex items-center gap-4 transition-all duration-500 ${
                  step === num ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-0'
                }`}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300 ${
                    step === num 
                      ? 'bg-white text-red-600 border-white shadow-lg' 
                      : step > num 
                        ? 'bg-red-500 text-white border-red-400'
                        : 'border-red-300 text-red-100'
                  }`}
                >
                  {step > num ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : num}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-red-200 mb-0.5">
                    Langkah {num}
                  </span>
                  <span className="font-bold text-base leading-none">
                    {num === 1 ? 'Akun Baru' : num === 2 ? 'Data Diri' : 'Alamat Lengkap'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-[10px] text-red-200 font-medium tracking-wide">© 2024 Posko Application</div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col h-full relative">
            
          {/* Mobile Header */}
          <div className="lg:hidden bg-white px-6 pt-6 pb-4 sticky top-0 z-30 border-b border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <Link href="/" className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <div className="relative w-6 h-6">
                  <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                </div>
                Posko<span className="text-red-600">.</span>
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                  Step {step} of 3
                </span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-red-600 h-full transition-all duration-500 ease-out" 
                style={{ width: `${(step/3)*100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
            <div className="max-w-xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                  {step === 1 && 'Buat Akun Baru'}
                  {step === 2 && 'Informasi Personal'}
                  {step === 3 && 'Lokasi Tempat Tinggal'}
                </h2>
                <p className="text-gray-500 text-sm">
                  Silakan lengkapi form di bawah ini dengan data yang valid.
                </p>
              </div>

              {/* Error Message (Global, except inside OTP modal) */}
              {errorMsg && !otpMode && !phoneOtpMode && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg font-medium animate-pulse flex items-center gap-2">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* ========== STEP 1: ACCOUNT ========== */}
                {step === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Email Input & OTP Trigger */}
                    <div className="flex flex-col gap-2">
                      <label className="label-text">Email Address</label>
                      <div className="flex gap-3">
                        <input 
                          type="email" 
                          name="email" 
                          value={formData.email} 
                          onChange={handleChange} 
                          placeholder="contoh@email.com" 
                          className="input-field flex-1 disabled:bg-green-50 disabled:text-green-800 disabled:border-green-200 disabled:opacity-100" 
                          disabled={emailStatus === 'verified'} 
                          autoComplete="email"
                        />
                        
                        {emailStatus === 'verified' ? (
                          <div className="px-4 flex items-center justify-center bg-green-100 text-green-700 rounded-xl font-bold text-sm border border-green-200 min-w-[100px]">
                             ✓ Verified
                          </div>
                        ) : (
                          <button 
                            type="button" 
                            onClick={handleRequestOtp} 
                            disabled={isLoading || !formData.email} 
                            className="px-5 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-md hover:-translate-y-0.5 min-w-[100px]"
                          >
                            {isLoading ? '...' : 'Kirim OTP'}
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        Kami akan mengirimkan kode verifikasi 6 digit ke email ini. Pastikan email aktif.
                      </p>
                    </div>
                    
                    {/* Password Section - Only Visible AFTER Email Verification */}
                    {emailStatus === 'verified' && (
                      <div className="animate-fadeIn space-y-6 border-t border-gray-100 pt-6">
                        
                        {/* Password */}
                        <div className="flex flex-col gap-2">
                          <label className="label-text">Password</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              name="password" 
                              value={formData.password} 
                              onChange={handleChange} 
                              className="input-field pr-12" 
                              placeholder="Minimal 8 karakter"
                              autoComplete="new-password"
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                          
                          {/* Password Strength Indicator */}
                          {formData.password && (
                            <div className="mt-2 space-y-1">
                              <div className="flex gap-1 h-1.5">
                                {[1, 2, 3, 4].map((i) => (
                                  <div 
                                    key={i} 
                                    className={`flex-1 rounded-full transition-colors duration-300 ${
                                      getPasswordScore() >= i ? getPasswordScoreColor() : 'bg-gray-200'
                                    }`}
                                  ></div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 font-medium">
                                  Kekuatan: {getPasswordStrengthLabel()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-2">
                          <label className="label-text">Ulangi Password</label>
                          <div className="relative">
                            <input 
                              type={showConfirmPassword ? "text" : "password"} 
                              name="confirmPassword" 
                              value={formData.confirmPassword} 
                              onChange={handleChange} 
                              className="input-field pr-12" 
                              placeholder="Konfirmasi password"
                              autoComplete="new-password"
                            />
                            <button 
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ========== STEP 2: PERSONAL INFO ========== */}
                {step === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Nama Lengkap */}
                    <div className="flex flex-col gap-2">
                      <label className="label-text">Nama Lengkap</label>
                      <input 
                        type="text" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleChange} 
                        className="input-field" 
                        placeholder="Nama sesuai KTP"
                        autoComplete="name"
                      />
                    </div>

                    {/* Grid untuk Tanggal Lahir & Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="label-text">Tanggal Lahir</label>
                        <div className="relative w-full">
                          <input 
                            type="date" 
                            name="birthDate" 
                            value={formData.birthDate} 
                            onChange={handleChange} 
                            className="input-field pr-10"
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="label-text">Jenis Kelamin</label>
                        <div className="relative">
                          <select 
                            name="gender" 
                            value={formData.gender} 
                            onChange={handleChange} 
                            className="input-field appearance-none cursor-pointer"
                          >
                            <option value="">Pilih...</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nomor WhatsApp & Verifikasi */}
                    <div className="flex flex-col gap-2">
                      <label className="label-text">Nomor WhatsApp</label>
                      <div className="flex gap-3">
                        <span className="flex items-center justify-center bg-gray-100 border border-gray-200 rounded-xl px-3 text-sm font-bold text-gray-600">+62</span>
                        <input 
                          type="tel" 
                          name="phoneNumber" 
                          value={formData.phoneNumber} 
                          onChange={handleChange} 
                          className="input-field flex-1 disabled:bg-green-50 disabled:text-green-800 disabled:border-green-200" 
                          placeholder="812xxxxxxx"
                          maxLength={15}
                          autoComplete="tel"
                          disabled={phoneStatus === 'verified'}
                        />

                        {phoneStatus === 'verified' ? (
                          <div className="px-4 flex items-center justify-center bg-green-100 text-green-700 rounded-xl font-bold text-sm border border-green-200 min-w-[100px]">
                             ✓ Verified
                          </div>
                        ) : (
                          <button 
                            type="button" 
                            onClick={handleRequestPhoneOtp} 
                            disabled={isLoading || !formData.phoneNumber} 
                            className="px-5 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-md hover:-translate-y-0.5 min-w-[100px]"
                          >
                            {isLoading ? '...' : 'Verifikasi WA'}
                          </button>
                        )}
                      </div>
                       <p className="text-[10px] text-gray-400 leading-relaxed">
                        Nomor ini akan digunakan untuk login dan notifikasi penting.
                      </p>
                    </div>
                  </div>
                )}

                {/* ========== STEP 3: ADDRESS & MAP ========== */}
                {step === 3 && (
                  <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                        
                      {/* Bagian Form Wilayah */}
                      <div className="space-y-5 order-2 lg:order-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                          {/* Provinsi */}
                          <div className="flex flex-col gap-2">
                            <label className="label-text">Provinsi</label>
                            <div className="relative">
                              <select 
                                className="input-field appearance-none" 
                                value={selectedProvId} 
                                onChange={(e) => handleRegionChange('province', e)}
                              >
                                <option value="">Pilih Provinsi</option>
                                {provinces.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          {/* Kota */}
                          <div className="flex flex-col gap-2">
                            <label className="label-text">Kota / Kabupaten</label>
                            <div className="relative">
                              <select 
                                className="input-field appearance-none" 
                                value={selectedCityId} 
                                onChange={(e) => handleRegionChange('city', e)} 
                                disabled={! selectedProvId}
                              >
                                <option value="">Pilih Kota</option>
                                {cities.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                          {/* Kecamatan */}
                          <div className="flex flex-col gap-2">
                            <label className="label-text">Kecamatan</label>
                            <div className="relative">
                              <select 
                                className="input-field appearance-none" 
                                value={selectedDistrictId} 
                                onChange={(e) => handleRegionChange('district', e)} 
                                disabled={!selectedCityId}
                              >
                                <option value="">Pilih Kecamatan</option>
                                {districts.map(d => (
                                  <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          {/* Kelurahan */}
                          <div className="flex flex-col gap-2">
                            <label className="label-text">Kelurahan / Desa</label>
                            <div className="relative">
                              <select 
                                className="input-field appearance-none" 
                                value={selectedVillageId} 
                                onChange={(e) => handleRegionChange('village', e)} 
                                disabled={!selectedDistrictId}
                              >
                                <option value="">Pilih Kelurahan</option>
                                {villages.map(v => (
                                  <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Detail Alamat */}
                        <div className="flex flex-col gap-2">
                          <label className="label-text">Detail Alamat</label>
                          <textarea 
                            name="addressDetail" 
                            rows={3} 
                            value={formData.addressDetail} 
                            onChange={handleChange} 
                            className="input-field h-auto py-3 min-h-[80px] resize-none leading-relaxed" 
                            placeholder="Contoh: Jl.Merdeka No.10, RT 01/02, Depan Warung Tegal"
                          ></textarea>
                        </div>
                      </div>

                      {/* Bagian Peta */}
                      <div className="space-y-3 order-1 lg:order-2">
                        <div className="flex justify-between items-end">
                          <label className="label-text mb-0">Titik Lokasi Rumah</label>
                          {formData.latitude !== null && (
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                              Koordinat Tersimpan
                            </span>
                          )}
                        </div>

                        <div className="w-full h-56 md:h-64 lg:h-full min-h-[240px] rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm relative z-0 group hover:border-red-100 transition-colors">
                          <LocationPicker 
                            onLocationSelect={handleLocationSelect} 
                            initialLat={formData.latitude ??  undefined}
                            initialLng={formData.longitude ?? undefined}
                          />
                        </div>
                        
                        {/* Tombol Get Location */}
                        <button
                          type="button"
                          onClick={handleGetCurrentLocation}
                          className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-xs font-bold hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Gunakan Lokasi Saya Sekarang
                        </button>
                      </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Sticky Bottom Footer */}
          <div className="p-5 lg:px-12 border-t border-gray-100 bg-white/90 backdrop-blur-sm sticky bottom-0 z-20">
            <div className="max-w-xl mx-auto flex flex-col md:flex-row gap-4">
              {step > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep} 
                  className="w-full md:w-auto flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm"
                >
                  Kembali
                </button>
              )}
              <button 
                type="button" 
                onClick={step < 3 ? nextStep : handleSubmit} 
                disabled={isLoading}
                className={`w-full md:w-auto flex-[2] py-3.5 rounded-xl text-white font-bold shadow-lg transition-all hover:-translate-y-0.5 text-sm flex justify-center items-center gap-2
                  ${step < 3 ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-gray-900 hover:bg-black shadow-gray-300'} 
                  disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : step < 3 ? (
                  <>Lanjut Langkah {step + 1} <span className="text-white/70">→</span></>
                ) : (
                  'Selesaikan Pendaftaran'
                )}
              </button>
            </div>
            <div className="text-center mt-4 lg:hidden">
              <Link href="/login" className="text-xs text-gray-500 font-medium">
                Sudah punya akun? <span className="font-bold text-red-600 underline underline-offset-2">Masuk disini</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Custom Utilities */
        .label-text { 
          @apply block text-[11px] font-bold text-gray-500 uppercase mb-2 tracking-wide; 
        }
        
        /* Input Styling Standard */
        .input-field { 
          @apply w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 
          placeholder-gray-400 transition-all duration-200 ease-in-out
          focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 
          disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed;
        }

        /* --- FIX KHUSUS TANGGAL (SAFARI iOS & CHROME) --- */
        
        input[type="date"] {
          -webkit-appearance: none;
          appearance: none;
          position: relative;
          display: block;
          width: 100%;
        }

        input[type="date"]::-webkit-date-and-time-value {
          text-align: left;
          min-height: 1.2em;
          display: block; 
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }

        /* Animasi Halaman */
        .animate-fadeIn { 
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }
        
        @keyframes fadeIn { 
          from { opacity: 0; transform: translateY(8px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </div>
  );
}