// src/app/profile/favorites/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchFavorites } from '@/features/providers/api';
import { Provider } from '@/features/providers/types';
import { ProviderCard } from '@/features/providers/components';

export default function FavoritesPage() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const res = await fetchFavorites();
                // The backend structure for /favorites/me likely returns an array of objects { providerId: Provider } 
                // OR just the array of Providers. Based on mobile app check, it's often nested.
                // Let's handle both or check the data structure.
                // Mobile: response.data.data.map(item => item.providerId)

                const data = (res as any).data || res;
                if (Array.isArray(data)) {
                    // Check if it's nested
                    if (data.length > 0 && (data[0] as any).providerId) {
                        setFavorites(data.map((item: any) => item.providerId));
                    } else {
                        setFavorites(data);
                    }
                }
            } catch (error) {
                console.error("Gagal memuat favorit:", error);
            } finally {
                setLoading(false);
            }
        };
        loadFavorites();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-red-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-lg font-bold text-gray-900">Favorit Saya</h1>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 font-sans">
                {favorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-red-200" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Belum ada favorit</h2>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">
                            Simpan mitra langganan Anda di sini untuk akses lebih cepat di masa mendatang.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95"
                        >
                            Cari Mitra
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                        {favorites.map((prov) => (
                            <ProviderCard
                                key={prov._id}
                                provider={prov}
                                isFavorited={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
