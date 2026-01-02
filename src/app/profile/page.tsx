'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

// --- IMPORTS SOURCE OF TRUTH ---
import { useAuth } from '@/hooks/useAuth';
import { PROFILE_MENU_ITEMS } from '@/config/navigation';
import { useLanguage } from '@/context/LanguageContext';

// --- COMPONENTS ---
import BalanceCard from '@/features/wallet/components/BalanceCard';

export default function ProfilePage() {
    const router = useRouter();
    const { user, isLoading, logout } = useAuth();
    const { t } = useLanguage();

    // State untuk feedback copy link
    const [copySuccess, setCopySuccess] = useState(false);

    // [ACTION] Handle Register / Switch Provider
    const handleProviderAction = () => {
        // Bisa diarahkan ke link eksternal atau internal route
        window.location.href = 'https://provider.poskojasa.com/';
    };

    // [ACTION] Fitur Copy Link Profil
    const handleShareProfile = () => {
        if (!user?.username) {
            router.push('/profile/edit');
            return;
        }
        const shareUrl = `${window.location.origin}/u/${user.username}`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            });
        } else {
            alert(`Link profil Anda: ${shareUrl}`);
        }
    };

    // Loading State
    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xs font-medium text-gray-500">Memuat profil...</div>;

    // Helper: Cek Provider
    const isProvider = user?.roles?.includes('provider');
    const isProviderMode = user?.activeRole === 'provider';

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* --- HEADER PROFILE --- */}
            <div className="bg-white p-6 mb-4 shadow-sm border-b border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                        {user?.profilePictureUrl ? (
                            <Image
                                src={user.profilePictureUrl}
                                alt={user.fullName}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{user?.fullName || 'Pengguna Posko'}</h1>
                        {user?.username ? (
                            <p className="text-sm text-gray-500 font-medium">@{user.username}</p>
                        ) : (
                            <p className="text-gray-500 text-sm">{user?.phoneNumber || user?.email}</p>
                        )}

                        <div className="flex gap-2 mt-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] uppercase font-bold tracking-wider rounded border border-gray-200">
                                Customer
                            </span>
                            {isProvider && (
                                <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${isProviderMode ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                    Mitra
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tombol Share Profile (Khusus Provider) */}
                {isProvider && (
                    <button
                        onClick={handleShareProfile}
                        className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all active:scale-[0.98]"
                    >
                        {copySuccess ? (
                            <>
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                <span className="text-green-600">Link Tersalin!</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                <span>{user?.username ? 'Bagikan Profil Saya' : 'Buat Username'}</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* --- MENU LIST CONTAINER --- */}
            <div className="px-4 space-y-6">

                {/* Wallet Card */}
                {user && <BalanceCard balance={user.balance || 0} />}

                {/* DYNAMIC MENU GENERATION FROM CONFIG */}
                {PROFILE_MENU_ITEMS.map((section, idx) => (
                    <div key={idx}>
                        <h3 className="text-xs font-bold text-gray-400 mb-3 px-1 uppercase tracking-wider">{section.group}</h3>
                        <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                            {section.items.map((item, itemIdx) => {
                                // Render Item
                                return (
                                    <Link 
                                        key={item.href} 
                                        href={item.href} 
                                        className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${itemIdx !== section.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Icon Wrapper dengan warna dinamis dari config */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.bg || 'bg-gray-50'} ${item.color || 'text-gray-600'}`}>
                                                <item.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">
                                                {item.label}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* SECTION SPECIAL: MITRA AREA (Manual Handling karena logika kompleks) */}
                <div>
                    <h3 className="text-xs font-bold text-gray-400 mb-3 px-1 uppercase tracking-wider">Area Mitra</h3>
                    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                        <button onClick={handleProviderAction} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isProvider ? 'bg-green-50 text-green-600' : 'bg-teal-50 text-teal-600'}`}>
                                    {isProvider ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">
                                        {isProvider ? (isProviderMode ? 'Mode Customer' : 'Mode Mitra') : 'Daftar Jadi Mitra'}
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                        {isProvider ? 'Kelola pesanan dan layanan Anda' : 'Mulai tawarkan jasa Anda di Posko'}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </button>
                    </div>
                </div>

                {/* LOGOUT BUTTON */}
                <div className="pb-8">
                    <button
                        onClick={logout}
                        className="w-full bg-white p-4 rounded-xl shadow-sm text-red-600 font-bold text-sm border border-gray-100 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Keluar Aplikasi
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-[10px] text-gray-300">Posko App v1.0.0 (Secure Mode)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}