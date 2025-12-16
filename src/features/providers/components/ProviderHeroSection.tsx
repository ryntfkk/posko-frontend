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
  provider: Provider | null; // Provider bisa null
  distance:  string;
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

  // Data Statistik (Hanya jika Provider ada)
  const isProvider = !!provider;
  const totalOrders = provider?.totalCompletedOrders ??  0;
  const rating = provider?.rating ?? 0;
  const totalFavorites = provider?.totalFavorites ?? 0;

  // Definisikan URL gambar (Ambil dari User, bukan Provider)
  const profileImageUrl = user.profilePictureUrl ||
    `https://api.dicebear.com/7. x/avataaars/svg?seed=${user. username || user.fullName || 'default'}`;

  // Cek Status Verifikasi
  const isVerified = provider?.verificationStatus === 'verified';

  // [FIX] Helper function untuk mendapatkan alamat yang tepat berdasarkan role
  // Jika user adalah Provider, ambil dari provider.location.address
  // Jika user biasa, ambil dari user.address
  const getDisplayAddress = (): string => {
    if (isProvider && provider?.location?.address) {
      // Prioritas untuk Provider: city > district > province
      const providerAddress = provider.location.address;
      return providerAddress.city || 
             providerAddress.district || 
             providerAddress.province || 
             'Lokasi Mitra belum diatur';
    }
    // Fallback ke alamat user biasa
    return user.address?.city || 'Kota tidak tersedia';
  };

  return (
    <section className="bg-white px-4 pt-6 pb-4 relative">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex items-start gap-4 lg:gap-8 mb-4">
        
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
          {/* Status Dot (Hanya jika provider & online) */}
          {isProvider && provider?.isOnline && (
            <div className="absolute bottom-3 right-3 w-5 h-5 border-[3px] border-white bg-green-500 rounded-full"></div>
          )}
        </button>

        {/* 2. STATS OR EMPTY SPACE */}
        <div className="flex-1 flex flex-col justify-center h-28 lg:h-40">
            {isProvider ?  (
              <div className="flex justify-around items-center text-center">
                  {/* Rating */}
                  <button 
                    onClick={() => setIsReviewsOpen(true)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                      <span className="font-bold text-lg lg:text-2xl text-gray-900 flex items-center gap-1 group-hover:text-yellow-600 transition-colors">
                          {rating. toFixed(1)} <span className="text-yellow-500 text-sm lg:text-lg">★</span>
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
              // Tampilan untuk User Biasa (Non-Mitra)
              <div className="flex flex-col justify-center h-full px-2">
                 <div className="text-sm text-gray-500 italic">
                    "Bergabung sejak {new Date(user.createdAt || Date.now()).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}"
                 </div>
              </div>
            )}
        </div>
      </div>

      {/* --- BIO & INFO SECTION --- */}
      <div className="flex flex-col gap-2 mb-6 px-1">
          
          {/* Nama & Verified Badge */}
          <div className="flex flex-col">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-1.5">
                {user.fullName}
                {isVerified && (
                  <span className="text-blue-500" title="Mitra Terverifikasi">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121. 75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
            </h1>
            
            {/* Location & Username */}
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <span className="text-gray-900 font-medium">@{user.username}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                {/* [FIX] Menggunakan helper function untuk alamat yang tepat */}
                <span>{getDisplayAddress()}</span>
                {isProvider && (
                  <>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>{distance}</span>
                  </>
                )}
            </p>
          </div>

          {/* Bio Text */}
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line mt-1">
             {user.bio || (isProvider ?  'Mitra profesional siap membantu kebutuhan Anda.' : 'Pengguna Posko.')}
          </p>
      </div>

      {/* --- ACTION BUTTONS --- */}
      <div className="flex gap-2">
         {isProvider ?  (
           <>
              {/* Tombol Chat (Mitra) */}
              <button
                onClick={onChat}
                className="flex-1 bg-gray-900 text-white font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <ChatIcon className="w-4 h-4" />
                Chat Mitra
              </button>

              {/* Tombol Jadwal (Mitra) */}
              <button
                onClick={onOpenCalendar}
                className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-lg text-sm hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <CalendarIcon className="w-4 h-4" />
                Cek Jadwal
              </button>

              {/* Tombol Favorite */}
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
             {/* Tombol Share untuk User Biasa */}
             <button
                onClick={onShare}
                className="flex-1 bg-gray-100 text-gray-800 font-semibold py-2.5 px-4 rounded-lg text-sm hover: bg-gray-200 active: scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8. 684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Bagikan Profil
             </button>
           </>
         )}
      </div>

      {/* Modal Review (Hanya jika provider) */}
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