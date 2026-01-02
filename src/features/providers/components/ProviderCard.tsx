// src/features/providers/components/ProviderCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Provider } from '../types';

// Helper: Format harga ringkas (cth: 50rb, 1.2jt)
const formatCompactPrice = (price: number) => {
    if (price >= 1000000) {
        return (price / 1000000).toFixed(1).replace(/\.0$/, '') + 'jt';
    }
    if (price >= 1000) {
        return (price / 1000).toFixed(0) + 'rb';
    }
    return price.toString();
};

interface ProviderCardProps {
    provider: Provider;
    currentLocation?: { lat: number; lng: number };
    categoryParam?: string;
    isFavorited?: boolean;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
    provider,
    currentLocation,
    categoryParam,
    isFavorited = false
}) => {
    // Sort services to prioritize current category
    const sortedServices = [...(provider.services || [])].sort((a, b) => {
        const catA = a.serviceId?.category?.toLowerCase() || '';
        const catB = b.serviceId?.category?.toLowerCase() || '';
        if (categoryParam) {
            if (catA === categoryParam && catB !== categoryParam) return -1;
            if (catA !== categoryParam && catB === categoryParam) return 1;
        }
        return 0;
    });

    const activeServices = sortedServices.filter(s => s.isActive);
    const serviceNames = activeServices
        .filter(s => s.serviceId?.name)
        .map(s => s.serviceId.name)
        .slice(0, 2)
        .join(', ');

    const serviceDisplay = serviceNames || 'Belum mendaftar layanan';

    const minPrice = activeServices.length > 0
        ? Math.min(...activeServices.map((s) => s.price || 0))
        : 0;

    const getLocationLabel = () => {
        const addr = provider.userId?.address;
        if (!addr) return 'Lokasi Mitra';
        if (addr.district) return `Kec. ${addr.district}`;
        if (addr.city) return addr.city;
        return 'Lokasi Mitra';
    };

    const distanceStr = provider.distance
        ? (provider.distance / 1000).toFixed(1) + ' km'
        : null;

    const profileLink = provider.userId?.username
        ? `/u/${provider.userId.username}`
        : `/u/${provider.userId._id}`;

    return (
        <Link
            href={profileLink}
            className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full group hover:shadow-md hover:border-red-100 transition-all duration-300 h-full"
        >
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <Image
                    src={provider.userId?.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.userId?.fullName || 'default'}`}
                    alt={provider.userId?.fullName || 'Mitra'}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Rating Badge */}
                <div className="absolute bottom-1.5 left-1.5 z-20 flex items-center gap-0.5 bg-black/60 backdrop-blur-[2px] px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white border border-white/10">
                    <span className="text-yellow-400 text-[8px]">★</span>
                    <span>{(provider.rating && provider.rating > 0) ? provider.rating.toFixed(1) : 'Baru'}</span>
                </div>

                {/* Heart Icon for Favorites - Added for consistency with mobile */}
                <div className="absolute top-1.5 left-1.5 z-20">
                    <div className={`p-1 rounded-full backdrop-blur-md border border-white/10 shadow-sm ${isFavorited ? 'bg-red-500/80 text-white' : 'bg-black/40 text-white/70'}`}>
                        <svg className="w-2.5 h-2.5" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                </div>

                {/* Online Dot */}
                {provider.isOnline && (
                    <div className="absolute top-1.5 right-1.5 z-20 w-2 h-2 bg-green-500 rounded-full border border-white shadow-sm animate-pulse"></div>
                )}
            </div>

            <div className="p-2 flex flex-col flex-1 gap-0.5">
                <h4 className="font-bold text-xs text-gray-900 truncate leading-tight group-hover:text-red-600 transition-colors">
                    {provider.userId?.fullName || 'Mitra Posko'}
                </h4>

                <div className="flex items-center gap-1 mb-0.5">
                    <svg className="w-2.5 h-2.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-[10px] text-gray-500 truncate w-full">
                        {serviceDisplay}
                        {activeServices.length > 2 && <span className="text-[9px] align-top ml-0.5">+</span>}
                    </p>
                </div>

                <div className="flex items-center gap-1 text-[9px] text-gray-400 leading-tight">
                    <span className="truncate max-w-[60%]">{getLocationLabel()}</span>
                    {distanceStr && (
                        <>
                            <span className="shrink-0">•</span>
                            <span className="shrink-0 text-gray-500 font-medium">{distanceStr}</span>
                        </>
                    )}
                </div>

                <div className="mt-auto pt-2 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-gray-400 leading-none mb-0.5">Mulai</span>
                        <span className="text-[10px] lg:text-xs font-bold text-red-600 leading-none">
                            {minPrice > 0 ? formatCompactPrice(minPrice) : 'Hubungi'}
                        </span>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-red-50 text-red-400 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProviderCard;
