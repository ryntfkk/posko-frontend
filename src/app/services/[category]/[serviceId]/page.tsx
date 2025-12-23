'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { fetchServices } from '@/features/services/api';
import { Service } from '@/features/services/types';
import { fetchProviders } from '@/features/providers/api';
import { Provider } from '@/features/providers/types';
import { fetchProfile } from '@/features/auth/api';
import { User } from '@/features/auth/types';
import { calculateDistance } from '@/features/providers/components/utils';
import { useCart } from '@/features/cart/useCart';

// --- ICONS ---
const Icons = {
    ChevronLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
    Star: () => <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
    Check: () => <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
    X: () => <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    Clock: () => <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Info: () => <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

export default function ServiceDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { cart, resetAndAddItem } = useCart();

    const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;
    const serviceId = Array.isArray(params.serviceId) ? params.serviceId[0] : params.serviceId;

    // State
    const [service, setService] = useState<Service | null>(null);
    const [relatedServices, setRelatedServices] = useState<Service[]>([]);
    const [recommendProviders, setRecommendProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);

    // 1. Load User & Location
    useEffect(() => {
        const initUser = async () => {
            try {
                const res = await fetchProfile();
                setUserProfile(res.data.profile);
                // [UPDATE] Use defaultLocation from Address collection instead of profile.location
                if ((res.data.profile as any).defaultLocation?.coordinates) {
                    const [lng, lat] = (res.data.profile as any).defaultLocation.coordinates;
                    if (lat !== 0 || lng !== 0) setCurrentLocation({ lat, lng });
                }
            } catch (e) {
                console.error("Gagal load profile", e);
            }
        };
        initUser();
    }, []);

    // 2. Load Service Detail & Providers
    useEffect(() => {
        if (!categoryParam || !serviceId) return;

        const initData = async () => {
            setIsLoading(true);
            try {
                // A. Load Service Detail (Reuse list fetch since no public detail endpoint yet)
                const sRes = await fetchServices(categoryParam);
                const found = sRes.data.find((s) => s._id === serviceId);

                if (found) {
                    setService(found);
                    setRelatedServices(sRes.data.filter(s => s._id !== serviceId));

                    // B. Load Providers offering this Service
                    // Use currentLocation if available
                    let lat, lng;
                    if (currentLocation) {
                        lat = currentLocation.lat;
                        lng = currentLocation.lng;
                    }

                    const pRes = await fetchProviders({
                        category: categoryParam,
                        serviceId: serviceId, // Filter by Service ID
                        lat, lng,
                        sortBy: 'distance',
                        limit: 10
                    });
                    setRecommendProviders(pRes.data);
                } else {
                    console.error("Service not found");
                }

            } catch (error) {
                console.error("Error loading service detail:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initData();
    }, [categoryParam, serviceId, currentLocation]); // Re-run if location becomes available

    const handleOrder = () => {
        if (!service) return;

        // Add to Cart as 'basic' type (Pencarian Mitra Otomatis)
        // We clear cart first for simplicity OR handle conflict? 
        // Plan said: "Add item to cart using useCart ... then redirect immediately to /order/summary"
        // resetAndAddItem is perfect for "Order" button which implies a fresh start usually, 
        // or checks conflict.

        // Construct Cart Item
        const cartItem = {
            // id: service._id, // Removed to fix Lint
            serviceId: service._id,
            serviceName: service.name,
            category: categoryParam || 'general',
            pricePerUnit: service.displayPrice || service.basePrice,
            quantity: 1, // Default 1
            orderType: 'basic' as const,
            providerId: undefined, // Basic order has no provider selected yet
            providerName: undefined,
            duration: service.estimatedDuration || 60,
            requirements: service.requirements
        };

        // Use resetAndAddItem to ensure clean state for "Order Now" flow
        // If user wants to add multiple, they usually use "Add to Cart". 
        // "Pesan Layanan" implies intent to checkout.
        resetAndAddItem(cartItem);

        // Redirect to Summary
        router.push(`/order/summary?type=basic&category=${categoryParam}`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <p className="text-gray-500 mb-4">Layanan tidak ditemukan.</p>
                <button onClick={() => router.back()} className="text-red-600 font-bold hover:underline">Kembali</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">

            {/* HEADER */}
            <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-1 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors">
                        <Icons.ChevronLeft />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-base font-bold leading-tight line-clamp-1">{service.name}</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">

                {/* HERO CARD */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-red-50 to-transparent opacity-50"></div>

                    <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mb-4 relative z-10 p-1">
                        {service.iconUrl ? (
                            <Image src={service.iconUrl} alt={service.name} width={64} height={64} className="object-cover rounded-full" />
                        ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-full"></div>
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2 relative z-10">{service.name}</h2>
                    <p className="text-sm text-gray-500 max-w-md relative z-10 mb-4">{service.description}</p>

                    <div className="flex items-center gap-4 text-xs font-medium text-gray-600 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                        {service.estimatedDuration && (
                            <div className="flex items-center gap-1.5">
                                <Icons.Clock />
                                <span>~{service.estimatedDuration} Menit</span>
                            </div>
                        )}
                        <div className="w-px h-3 bg-gray-300"></div>
                        <div>
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(service.displayPrice || service.basePrice)}
                            <span className="text-gray-400 font-normal ml-1">/ {service.unitLabel || service.unit}</span>
                        </div>
                    </div>
                </section>

                {/* DETAIL INFO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Includes */}
                    {service.includes && service.includes.length > 0 && (
                        <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center"><Icons.Check /></span>
                                Termasuk
                            </h3>
                            <ul className="space-y-2">
                                {service.includes.map((item, i) => (
                                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                        <span className="mt-0.5 min-w-[4px] h-[4px] bg-green-400 rounded-full"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Excludes */}
                    {service.excludes && service.excludes.length > 0 && (
                        <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center"><Icons.X /></span>
                                Tidak Termasuk
                            </h3>
                            <ul className="space-y-2">
                                {service.excludes.map((item, i) => (
                                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                        <span className="mt-0.5 min-w-[4px] h-[4px] bg-red-300 rounded-full"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                    {/* Requirements */}
                    {service.requirements && service.requirements.length > 0 && (
                        <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm md:col-span-2">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center"><Icons.Info /></span>
                                Persyaratan Layanan
                            </h3>
                            <ul className="space-y-2">
                                {service.requirements.map((item, i) => (
                                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                        <span className="mt-0.5 min-w-[4px] h-[4px] bg-orange-400 rounded-full"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

            </main>

            {/* RELATED SERVICES SECTION */}
            {relatedServices.length > 0 && (
                <section className="max-w-3xl mx-auto px-4 pb-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 px-1">Layanan Lainnya di Kategori Ini</h3>
                    <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 no-scrollbar scroll-smooth">
                        {relatedServices.map((svc) => (
                            <Link
                                key={svc._id}
                                href={`/services/${categoryParam}/${svc._id}`}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 bg-white min-w-[100px] w-[100px] hover:border-red-100 hover:shadow-md transition-all text-center group shrink-0"
                            >
                                <div className="w-10 h-10 relative bg-gray-50 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                                    {svc.iconUrl ? (
                                        <Image src={svc.iconUrl} alt={svc.name} fill className="object-cover p-1.5" />
                                    ) : (
                                        <span className="text-[10px] font-bold text-gray-400">IMG</span>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium text-gray-700 leading-tight line-clamp-2 group-hover:text-red-600 h-8 flex items-center justify-center">
                                    {svc.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* FLOATING ACTION BOTTOM BAR */}
            <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 pb-6 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total Harga</span>
                        <span className="text-lg font-bold text-red-600">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(service.displayPrice || service.basePrice)}
                        </span>
                    </div>

                    <button
                        onClick={handleOrder}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>Pesan Layanan</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>

        </div>
    );
}
