// src/features/profile/components/ProfileHeroSection.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { User } from '@/features/auth/types';
import { Provider } from '@/features/providers/types';
import { HeartIcon, CalendarIcon, ChatIcon } from '@/features/providers/components/Icons';
import ProviderReviewsListModal from '@/features/providers/components/ProviderReviewsListModal';

interface ProfileHeroSectionProps {
  user: User;
  provider: Provider | null;
  distance: string;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  onOpenCalendar: () => void;
  onChat: () => void;
  onViewProfile: (imageUrl: string) => void;
}

export default function ProfileHeroSection({
  user,
  provider,
  distance,
  isFavorited,
  onToggleFavorite,
  onShare,
  onOpenCalendar,
  onChat,
  onViewProfile,
}: ProfileHeroSectionProps) {
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  // Data Statistik
  const isProvider = !!provider;
  const totalOrders = provider?.totalCompletedOrders ?? 0;
  const rating = provider?.rating ?? 0;
  const totalFavorites = provider?.totalFavorites ?? 0;

  // Definisikan URL gambar
  const profileImageUrl = user.profilePictureUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || user.fullName || 'default'}`;

  // Logika Penentuan Alamat
  let displayLocation = 'Lokasi belum diatur';

  if (isProvider && provider) {
      const addressData = provider.location?.address;
      
      if (addressData) {
          displayLocation = addressData.city || 
                            addressData.district || 
                            addressData.province || 
                            (addressData.fullAddress ? 'Lokasi Mitra' : 'Lokasi belum diatur');
      } else {
          displayLocation = 'Lokasi Mitra belum diatur';
      }
  } else {
      displayLocation = user.address?.city || 'Kota tidak tersedia';
  }

  return (
    <section className="bg-white px-4 pt-6 pb-4 relative">
      
      {/* --- HEADER SECTION (Foto & Stats) --- */}
      {/* [UPDATED] mb-3 (12px) agar jarak ke info tidak terlalu jauh */}
      <div className="flex items-start gap-4 lg:gap-8 mb-3">
        
        {/* 1. FOTO PROFIL */}
        <button 
            onClick={() => onViewProfile(profileImageUrl)}
            className="shrink-0 relative group"
        >
          <div className="w-28 h-28 lg:w-40 lg:h-40 rounded-full border-2 border-gray-100 p-1">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-50">
               <Image
                 src={profileImageUrl}
                 alt={user.fullName}
                 fill
                 className="object-cover"
               />
            </div>
          </div>
          {/* Status Dot */}
          {isProvider && provider?.isOnline && (
            <div className="absolute bottom-3 right-3 w-5 h-5 border-[3px] border-white bg-green-500 rounded-full"></div>
          )}
        </button>

        {/* 2. STATS */}
        <div className="flex-1 flex flex-col justify-center h-28 lg:h-40">
            {isProvider ? (
              <div className="flex justify-around items-center text-center">
                  {/* Rating */}
                  <button 
                    onClick={() => setIsReviewsOpen(true)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                      <span className="font-bold text-lg lg:text-2xl text-gray-900 flex items-center gap-1 group-hover:text-yellow-600 transition-colors">
                          {rating.toFixed(1)}
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
            ) : (
              <div className="flex flex-col justify-center h-full px-2">
                 <div className="text-sm text-gray-500 italic">
                    "Bergabung sejak {new Date(user.createdAt || Date.now()).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}"
                 </div>
              </div>
            )}
        </div>
      </div>

      {/* --- BIO & INFO SECTION --- */}
      {/* [UPDATED] Menggunakan gap-3 (12px) untuk jarak antar blok (Identity Block vs Bio) */}
      <div className="flex flex-col gap-3 mb-6">
          
          {/* Blok Identitas: Username & Lokasi */}
          {/* [UPDATED] gap-1 (4px) agar username dan lokasi rapat */}
          <div className="flex flex-col gap-1">
            
            {/* Username */}
            <p className="text-base text-gray-900 font-bold">@{user.username}</p>

            {/* Location & Distance */}
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400 shrink-0">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                
                <span className="font-medium">{displayLocation}</span>
                
                {isProvider && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className={`${distance.includes('Login') ? 'text-blue-600 italic' : ''}`}>
                        {distance}
                    </span>
                  </>
                )}
            </div>
          </div>

          {/* Bio Text */}
          {/* [UPDATED] Tidak ada margin top manual, mengikuti gap parent (gap-3) */}
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
             {user.bio || (isProvider ? 'Mitra profesional siap membantu kebutuhan Anda.' : 'Pengguna Posko.')}
          </p>
      </div>

      {/* --- ACTION BUTTONS --- */}
      <div className="flex gap-2">
         {isProvider ? (
           <>
              <button
                onClick={onChat}
                className="flex-1 bg-gray-900 text-white font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <ChatIcon className="w-4 h-4" />
                Chat Mitra
              </button>

              <button
                onClick={onOpenCalendar}
                className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <CalendarIcon className="w-4 h-4" />
                Cek Jadwal
              </button>

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
           </>
         ) : (
           <>
             <button
                onClick={onShare}
                className="flex-1 bg-gray-100 text-gray-800 font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Bagikan Profil
             </button>
           </>
         )}
      </div>

      {isProvider && provider && (
        <ProviderReviewsListModal 
            isOpen={isReviewsOpen}
            onClose={() => setIsReviewsOpen(false)}
            providerId={provider._id}
        />
      )}

    </section>
  );
}