'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchProfile, requestSecurityOTP, verifySecurityOTP, updatePasswordSecure, updateEmailSecure, updatePhoneSecure } from '@/features/auth/api';
import { User } from '@/features/auth/types';

type SecurityMode = 'LIST' | 'OTP_CHALLENGE' | 'UPDATE_PASSWORD' | 'UPDATE_EMAIL' | 'UPDATE_PHONE';

export default function SecurityPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // UI State
    const [mode, setMode] = useState<SecurityMode>('LIST');
    const [targetAction, setTargetAction] = useState<SecurityMode | null>(null); // Action to perform after OTP
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // OTP State
    const [otp, setOtp] = useState('');
    const [otpSentTo, setOtpSentTo] = useState('');
    const [otpChannel, setOtpChannel] = useState('');
    const [securityToken, setSecurityToken] = useState<string | null>(null);

    // Form States
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await fetchProfile();
            setUser(res.data.profile);
        } catch (error) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    // 1. Initial Action Click (Request OTP)
    const handleActionClick = async (action: SecurityMode) => {
        setTargetAction(action);
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const res = await requestSecurityOTP();
            // res.data = { channel: 'whatsapp' | 'email', sentTo: '...' }
            setOtpChannel(res.data.channel);
            setOtpSentTo(res.data.sentTo);
            setMode('OTP_CHALLENGE');
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Gagal meminta OTP.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 2. Verify OTP
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const res = await verifySecurityOTP(otp);
            const token = res.data.securityToken;
            setSecurityToken(token);

            // Move to target form
            if (targetAction) {
                setMode(targetAction);
            }
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Kode OTP salah atau kadaluarsa.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 3. Update Helpers
    const handleUpdate = async (apiCall: () => Promise<any>, successMsg: string) => {
        setIsSubmitting(true);
        setErrorMessage(null);
        try {
            await apiCall();
            setSuccessMessage(successMsg);
            setMode('LIST');
            setSecurityToken(null);
            setTargetAction(null);
            // Reload profile/update local state
            loadProfile();

            // Clear forms
            setNewPassword('');
            setConfirmPassword('');
            setNewEmail('');
            setNewPhone('');

            // Auto clear success msg
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || 'Gagal memperbarui data.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

    const renderHeader = (title: string, onBack?: () => void) => (
        <header className="bg-white shadow-sm sticky top-0 z-30 px-4 py-3 flex items-center gap-4">
            <button
                onClick={onBack || (() => router.push('/profile'))}
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <h1 className="text-base font-bold text-gray-900">{title}</h1>
        </header>
    );

    const renderFeedback = () => (
        <>
            {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{errorMessage}</span>
                </div>
            )}
            {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{successMessage}</span>
                </div>
            )}
        </>
    );

    // --- VIEW: LIST ---
    if (mode === 'LIST') {
        return (
            <div className="min-h-screen bg-gray-50 pb-10 font-sans text-gray-800">
                {renderHeader('Keamanan Akun')}
                <main className="max-w-lg mx-auto p-4 md:p-6">
                    {renderFeedback()}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* Ganti Password */}
                        <button
                            onClick={() => handleActionClick('UPDATE_PASSWORD')}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-medium text-gray-700">Ganti Password</h3>
                                    <p className="text-xs text-gray-400">Ubah kata sandi akun Anda</p>
                                </div>
                            </div>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>

                        {/* Ganti Email */}
                        <button
                            onClick={() => handleActionClick('UPDATE_EMAIL')}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-50 text-orange-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-medium text-gray-700">Ganti Email</h3>
                                    <p className="text-xs text-gray-400">{user?.email}</p>
                                </div>
                            </div>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>

                        {/* Ganti Phone */}
                        <button
                            onClick={() => handleActionClick('UPDATE_PHONE')}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-medium text-gray-700">Ganti Nomor HP</h3>
                                    {user?.phoneNumber ? (
                                        <p className="text-xs text-gray-400">{user.phoneNumber}</p>
                                    ) : (
                                        <p className="text-xs text-red-400">Belum diatur</p>
                                    )}
                                </div>
                            </div>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-xl text-blue-800 text-xs leading-relaxed">
                        <p className="font-semibold mb-1">Informasi Keamanan</p>
                        Setiap perubahan data sensitif (Password, Email, Nomor HP) memerlukan verifikasi OTP.
                        Jika Anda memiliki Email dan Nomor HP terdaftar, OTP akan dikirimkan melalui <strong>WhatsApp</strong> sebagai prioritas.
                    </div>
                </main>
            </div>
        );
    }

    // --- VIEW: OTP CHALLENGE ---
    if (mode === 'OTP_CHALLENGE') {
        return (
            <div className="min-h-screen bg-gray-50 pb-10 font-sans text-gray-800">
                {renderHeader('Verifikasi Keamanan', () => setMode('LIST'))}
                <main className="max-w-lg mx-auto p-4 md:p-6">
                    {renderFeedback()}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Masukkan Kode OTP</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Demi keamanan, silakan masukkan kode OTP yang telah dikirim ke <strong>{otpChannel === 'whatsapp' ? 'WhatsApp' : 'Email'}</strong> Anda ({otpSentTo}).
                        </p>

                        <form onSubmit={handleVerifyOTP}>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="******"
                                maxLength={6}
                                className="w-full text-center text-2xl tracking-[0.5em] font-bold py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none mb-6"
                                autoFocus
                            />

                            <button
                                type="submit"
                                disabled={isSubmitting || otp.length !== 6}
                                className={`w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-lg shadow-red-100 transition-all
                                    ${(isSubmitting || otp.length !== 6) ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:scale-[0.98]'}
                                `}
                            >
                                {isSubmitting ? 'Memverifikasi...' : 'Verifikasi'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        );
    }

    // --- VIEW: UPDATE FORMS ---
    return (
        <div className="min-h-screen bg-gray-50 pb-10 font-sans text-gray-800">
            {renderHeader(
                mode === 'UPDATE_PASSWORD' ? 'Ganti Password' :
                    mode === 'UPDATE_EMAIL' ? 'Ganti Email' : 'Ganti Nomor HP',
                () => setMode('LIST') // Cancel goes back to list (token might expire but better UX than stuck)
            )}
            <main className="max-w-lg mx-auto p-4 md:p-6">
                {renderFeedback()}

                {mode === 'UPDATE_PASSWORD' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Password Baru</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-500 focus:bg-white transition-all"
                                placeholder="Minimal 8 karakter"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Konfirmasi Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-500 focus:bg-white transition-all"
                                placeholder="Ulangi password baru"
                            />
                        </div>
                        <button
                            onClick={() => handleUpdate(
                                () => updatePasswordSecure({ securityToken, newPassword, confirmPassword }),
                                'Password berhasil diperbarui!'
                            )}
                            disabled={isSubmitting || !newPassword}
                            className={`w-full mt-4 py-3.5 rounded-xl font-bold text-white text-sm shadow-lg shadow-red-100 transition-all
                                ${isSubmitting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}
                            `}
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}
                        </button>
                    </div>
                )}

                {mode === 'UPDATE_EMAIL' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Email Baru</label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-500 focus:bg-white transition-all"
                                placeholder="nama@email.com"
                            />
                        </div>
                        <button
                            onClick={() => handleUpdate(
                                () => updateEmailSecure({ securityToken, newEmail }),
                                'Email berhasil diperbarui!'
                            )}
                            disabled={isSubmitting || !newEmail}
                            className={`w-full mt-4 py-3.5 rounded-xl font-bold text-white text-sm shadow-lg shadow-red-100 transition-all
                                ${isSubmitting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}
                            `}
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Email Baru'}
                        </button>
                    </div>
                )}

                {mode === 'UPDATE_PHONE' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Nomor WhatsApp Baru</label>
                            <input
                                type="tel"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-500 focus:bg-white transition-all"
                                placeholder="0812xxxxxxx"
                            />
                        </div>
                        <button
                            onClick={() => handleUpdate(
                                () => updatePhoneSecure({ securityToken, newPhone }),
                                'Nomor Telepon berhasil diperbarui!'
                            )}
                            disabled={isSubmitting || !newPhone}
                            className={`w-full mt-4 py-3.5 rounded-xl font-bold text-white text-sm shadow-lg shadow-red-100 transition-all
                                ${isSubmitting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}
                            `}
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Nomor Baru'}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
