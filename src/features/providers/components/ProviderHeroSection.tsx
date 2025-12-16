// src/features/providers/components/ProviderHeroSection.tsx

import Image from 'next/image';
import { useState } from 'react';
import { Provider } from '../types';
import { HeartIcon, CalendarIcon, ChatIcon } from './Icons';
import ProviderReviewsListModal from './ProviderReviewsListModal';

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
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  const totalOrders = provider.totalCompletedOrders ?? 0;
  const rating = provider.rating ?? 0;
  const totalFavorites = provider.totalFavorites ?? 0;

  // Definisikan URL gambar
  const profileImageUrl = provider.userId?.profilePictureUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.userId?.fullName || 'default'}`;

  return (
    <section className="bg-white px-4 pt-6 pb-4 relative">
      
      {/* --- HEADER SECTION: Layout ala Instagram (Updated Sizes) --- */}
      <div className="flex items-start gap-4 lg:gap-8 mb-4">
        
        {/* 1. FOTO PROFIL (EXTRA LARGE) */}
        {/* UPDATE: Ukuran dinaikkan jadi w-28 (mobile) dan w-40 (desktop) */}
        <button 
            onClick={() => onViewProfile(profileImageUrl)}
            className="shrink-0 relative group"
        >
          <div className="w-28 h-28 lg:w-40 lg:h-40 rounded-full border-2 border-gray-100 p-1">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-50">
               <Image
                 src={profileImageUrl}
                 alt={provider.userId?.fullName || 'Mitra'}
                 fill
                 className="object-cover"
               />
            </div>
          </div>
          {/* Status Dot */}
          {provider.isOnline && (
            <div className="absolute bottom-3 right-3 w-5 h-5 border-[3px] border-white bg-green-500 rounded-full"></div>
          )}
        </button>

        {/* 2. STATS (Rating, Order, Fav) - Layout Sejajar */}
        {/* UPDATE: Height container disesuaikan agar center vertical dengan foto */}
        <div className="flex-1 flex flex-col justify-center h-28 lg:h-40">
            <div className="flex justify-around items-center text-center">
                
                {/* Rating */}
                <button 
                  onClick={() => setIsReviewsOpen(true)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                    <span className="font-bold text-lg lg:text-2xl text-gray-900 flex items-center gap-1 group-hover:text-yellow-600 transition-colors">
                        {rating.toFixed(1)} <span className="text-yellow-500 text-sm lg:text-lg">★</span>
                    </span>
                    <span className="text-xs lg:text-sm text-gray-500">Rating</span>
                </button>

                {/* Orders */}
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg lg:text-2xl text-gray-900">
                        {totalOrders}
                    </span>
                    <span className="text-xs lg:text-sm text-gray-500">Pesanan</span>
                </div>

                {/* Favorites */}
                <div className="flex flex-col items-center">
                    <span className="font-bold text-lg lg:text-2xl text-gray-900">
                        {totalFavorites}
                    </span>
                    <span className="text-xs lg:text-sm text-gray-500">Favorit</span>
                </div>
            </div>

            {/* Area kosong di bawah stats untuk mobile action jika diperlukan nanti */}
        </div>
      </div>

      {/* --- BIO & INFO SECTION --- */}
      <div className="flex flex-col gap-2 mb-6 px-1">
          
          {/* Nama & Verified */}
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-1.5">
                {provider.userId?.fullName || 'Nama Tidak Tersedia'}
                <span className="text-blue-500" title="Terverifikasi">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.491 4.491 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.06-1.06L10 13.69l-1.72-1.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z" clipRule="evenodd" />
                  </svg>
                </span>
            </h1>
            
            {/* Location Subtitle */}
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <span>{provider.userId?.address?.city || 'Lokasi tidak tersedia'}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>{distance}</span>
            </p>
          </div>

          {/* Bio Text */}
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line mt-1">
             {provider.userId?.bio || 'Mitra profesional siap membantu kebutuhan Anda dengan pelayanan terbaik.'}
          </p>
      </div>

      {/* --- ACTION BUTTONS (Full Width Row) --- */}
      <div className="flex gap-2">
         {/* Tombol Chat (Primary) */}
         <button
            onClick={onChat}
            className="flex-1 bg-gray-900 text-white font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <ChatIcon className="w-4 h-4" />
            Chat Mitra
          </button>

          {/* Tombol Jadwal (Secondary) */}
          <button
            onClick={onOpenCalendar}
            className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            Cek Jadwal
          </button>
          
          {/* Tombol Favorite (Icon Only) */}
          <button
            onClick={onToggleFavorite}
            className={`w-11 h-11 flex items-center justify-center rounded-lg border transition-all shrink-0 ${
                isFavorited
                  ? 'bg-red-50 border-red-100 text-red-500'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
          >
            <HeartIcon solid={isFavorited} className="w-5 h-5" />
          </button>
      </div>

      {/* Modal Review */}
      <ProviderReviewsListModal 
        isOpen={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
        providerId={provider._id}
      />

    </section>
  );
}