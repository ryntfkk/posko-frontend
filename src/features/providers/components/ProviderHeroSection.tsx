// src/features/providers/components/ProviderHeroSection.tsx

import Image from 'next/image';
import { useState } from 'react'; // [UPDATE] Import useState
import { Provider } from '../types';
import { HeartIcon, CalendarIcon, ChatIcon } from './Icons';
import ProviderReviewsListModal from './ProviderReviewsListModal'; // [UPDATE] Import Modal

interface ProviderHeroSectionProps {
  provider: Provider;
  distance: string;
  isFavorited: boolean;
  isSharing: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  onOpenCalendar: () => void;
  onChat: () => void;
  onViewProfile: (imageUrl: string) => void;
}

export default function ProviderHeroSection({
  provider,
  distance,
  isFavorited,
  onToggleFavorite,
  onOpenCalendar,
  onChat,
  onViewProfile,
}: ProviderHeroSectionProps) {
  const [isReviewsOpen, setIsReviewsOpen] = useState(false); // [UPDATE] State Modal

  const totalOrders = provider.totalCompletedOrders ?? 0;
  const rating = provider.rating ?? 0;
  const totalFavorites = provider.totalFavorites ?? 0;

  // Definisikan URL gambar
  const profileImageUrl = provider.userId?.profilePictureUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.userId?.fullName || 'default'}`;

  return (
    // UBAH: Hapus rounded, shadow, border. Gunakan padding compact.
    <section className="bg-white px-4 pt-4 pb-4 lg:px-0 lg:pt-6 lg:pb-6 relative">
      
      <div className="flex flex-col gap-4">
        
        {/* TOP ROW: Avatar + Info Utama */}
        <div className="flex items-center gap-4">
          
          {/* Avatar: Compact (w-16 di mobile, w-20 di desktop) */}
          <button 
            onClick={() => onViewProfile(profileImageUrl)}
            className="relative shrink-0 group cursor-pointer"
            title="Lihat foto profil"
          >
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border border-gray-100 overflow-hidden bg-gray-50 relative">
              <Image
                src={profileImageUrl}
                alt={provider.userId?.fullName || 'Mitra'}
                fill
                className="object-cover"
              />
            </div>
            {/* Status Indicator (Dot Only) */}
            {provider.isOnline && (
              <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 border-2 border-white bg-green-500 rounded-full"></div>
            )}
          </button>

          {/* Info Column: High Density Typography */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col items-start">
              
              {/* Nama & Badge */}
              <h2 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight truncate w-full flex items-center gap-1">
                {provider.userId?.fullName || 'Nama Tidak Tersedia'}
                <span className="shrink-0 text-blue-500" title="Terverifikasi">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.491 4.491 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.06-1.06L10 13.69l-1.72-1.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z" clipRule="evenodd" />
                  </svg>
                </span>
              </h2>
              
              {/* Lokasi & Distance: Small & Subtle */}
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                <span className="truncate max-w-[180px]">{provider.userId?.address?.city || 'Lokasi N/A'}</span>
                <span className="w-0.5 h-0.5 bg-gray-400 rounded-full"></span>
                <span className="font-medium text-gray-700">{distance}</span>
              </p>

              {/* Stats Inline: Rating, Orders, & Favorites */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                 {/* Rating & Orders [UPDATE: Jadi Button] */}
                 <button 
                    onClick={() => setIsReviewsOpen(true)}
                    className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer active:scale-95"
                 >
                    <span className="text-yellow-500">★</span>
                    <span className="font-bold text-gray-900">{rating.toFixed(1)}</span>
                    <span className="text-gray-400 font-normal">({totalOrders} pesanan)</span>
                    <span className="text-gray-300 ml-1">›</span>
                 </button>

                 {/* Total Favorites Badge */}
                 <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                    <HeartIcon solid={true} className="w-3 h-3 text-red-500" />
                    <span className="font-bold text-gray-900">{totalFavorites}</span>
                 </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bio: Text-sm, tight leading */}
        <p className="text-xs lg:text-sm text-gray-600 leading-relaxed line-clamp-2 lg:line-clamp-3">
          {provider.userId?.bio || 'Mitra profesional siap membantu kebutuhan Anda dengan pelayanan terbaik dan bergaransi.'}
        </p>

        {/* BUTTONS: Compact Row */}
        <div className="flex items-center gap-2 mt-1">
            <button
              onClick={onChat}
              className="flex-1 h-9 flex items-center justify-center gap-2 bg-gray-900 text-white rounded-lg active:scale-[0.98] transition-all hover:bg-gray-800"
            >
              <ChatIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">Chat</span>
            </button>

            <button
              onClick={onOpenCalendar}
              className="flex-1 h-9 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs font-bold">Jadwal</span>
            </button>
            
            <button
              onClick={onToggleFavorite}
              className={`h-9 w-9 flex items-center justify-center rounded-lg border transition-all ${
                isFavorited
                  ? 'bg-red-50 border-red-100 text-red-500'
                  : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
              }`}
            >
              <HeartIcon solid={isFavorited} className="w-4 h-4" />
            </button>
        </div>

      </div>

      {/* [UPDATE] Pasang Modal Disini */}
      <ProviderReviewsListModal 
        isOpen={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
        providerId={provider._id}
      />

    </section>
  );
}