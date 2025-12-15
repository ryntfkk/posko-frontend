// src/features/providers/components/ProviderHeroSection.tsx

import Image from 'next/image';
import { Provider } from '../types';
import { ShareIcon, HeartIcon, CalendarIcon, ChatIcon } from './Icons';

interface ProviderHeroSectionProps {
  provider: Provider;
  distance: string;
  isFavorited: boolean;
  isSharing: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  onOpenCalendar: () => void;
  onChat: () => void;
  onViewProfile: (imageUrl: string) => void; // [BARU] Prop untuk handle klik foto
}

export default function ProviderHeroSection({
  provider,
  distance,
  isFavorited,
  isSharing,
  onToggleFavorite,
  onShare,
  onOpenCalendar,
  onChat,
  onViewProfile, // [BARU]
}: ProviderHeroSectionProps) {
  const totalOrders = provider.totalCompletedOrders ?? 0;
  const totalFavorites = (provider as any).totalFavorites ?? 0;

  // Definisikan URL gambar di sini agar bisa dikirim ke handler onClick
  const profileImageUrl = provider.userId?.profilePictureUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.userId?.fullName || 'default'}`;

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-50 to-transparent rounded-full blur-2xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>

      <div className="flex flex-col gap-4 relative z-10">
        {/* TOP SECTION: Avatar & Basic Info */}
        <div className="flex items-start gap-4">
          {/* Avatar - GAYA BARU: Rounded Square & Clickable */}
          <button 
            onClick={() => onViewProfile(profileImageUrl)} // [BARU] Trigger lightbox saat klik
            className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 group cursor-pointer transition-transform active:scale-95 text-left"
            title="Lihat foto profil"
          >
            <div className="w-full h-full rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-gray-50 relative">
              <Image
                src={profileImageUrl}
                alt={provider.userId?.fullName || 'Mitra'}
                fill
                className="object-cover transition-opacity group-hover:opacity-90"
              />
            </div>
            {/* Status Indicator */}
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 border-[3px] border-white rounded-full ${
                provider.isOnline ? 'bg-green-500' : 'bg-gray-300'
              } shadow-sm`}
            ></div>
          </button>

          {/* Info Column */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex flex-col items-start">
              {/* Nama & Badge Verified */}
              <h2 className="text-base md:text-lg font-bold text-gray-900 leading-tight truncate w-full flex items-center gap-1.5">
                {provider.userId?.fullName || 'Nama Tidak Tersedia'}
                <span className="shrink-0 bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-blue-100">
                  ✓
                </span>
              </h2>
              
              {/* Lokasi & Jarak */}
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <span className="truncate max-w-[150px]">{provider.userId?.address?.city || 'Lokasi N/A'}</span>
                <span>•</span>
                <span className="font-medium text-gray-700">{distance}</span>
              </p>

              {/* Bio Singkat */}
              <p className="text-xs text-gray-500 mt-2 leading-snug line-clamp-2">
                {provider.userId?.bio || 'Siap membantu kebutuhan Anda secara profesional.'}
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Stats Bar */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-y border-gray-50 py-3">
          <div className="flex flex-col items-center px-2">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-xs">★</span>
              <span className="text-sm font-bold text-gray-900">{(provider.rating ?? 0).toFixed(1)}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Rating</span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="text-sm font-bold text-gray-900">
              {totalOrders > 99 ? '99+' : totalOrders}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">Pesanan</span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="text-sm font-bold text-gray-900">
              {totalFavorites > 999 ? '999+' : totalFavorites}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">Favorit</span>
          </div>
        </div>

        {/* BOTTOM SECTION: Action Buttons */}
        <div className="flex gap-2">
          {/* Chat Button */}
          <button
            onClick={onChat}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-gray-900 text-white rounded-xl shadow-sm hover:bg-gray-800 active:scale-95 transition-all"
          >
            <ChatIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Chat</span>
          </button>

          {/* Jadwal Button */}
          <button
            onClick={onOpenCalendar}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Jadwal</span>
          </button>

          {/* Icon Only Buttons */}
          <button
            onClick={onToggleFavorite}
            className={`h-9 w-9 flex items-center justify-center rounded-xl border transition-colors ${
              isFavorited
                ? 'bg-red-50 border-red-200 text-red-500'
                : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
            }`}
          >
            <HeartIcon solid={isFavorited} className="w-4 h-4" />
          </button>

          <button
            onClick={onShare}
            className={`h-9 w-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-colors ${
              isSharing ? 'scale-90 bg-gray-100' : ''
            }`}
          >
            <ShareIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}