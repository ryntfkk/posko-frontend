// src/app/u/[username]/page.tsx
'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import api from '@/lib/axios';
// [UPDATED] Menggunakan fetchPublicProfile untuk mengambil data User + Provider
import { fetchPublicProfile, fetchProfile } from '@/features/auth/api';
// [UPDATED] Import API provider hanya untuk fungsi spesifik mitra (Favorite)
import { toggleFavorite, checkFavoriteStatus } from '@/features/providers/api';

import { Provider } from '@/features/providers/types';
import { User } from '@/features/auth/types';

// [UPDATED] Mengimpor komponen Profil baru yang User-Centric
import {
  ProfileHeroSection,
  ProfileTabSection,
  ProfileSidebar,
  ProfileStickyBottomCTA
} from '@/features/profile/components';

// Menggunakan komponen shared dari folder providers (Modal, Icons, dll)
import {
  calculateDistance,
  TabType,
  ServiceItem,
  BackIcon,
  ProviderLoading,
  ProviderNotFound, // Kita gunakan ini sebagai fallback jika User tidak ditemukan
  ProviderCalendarModal,
  ProviderServiceDetailModal,
  ProviderImageLightbox,
} from '@/features/providers/components';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  
  const identifier = Array.isArray(params.username) ? params.username[0] : params.username;

  // Data State
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null); // Provider bisa null
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState('Menghitung...');

  // Interaction State
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Calendar State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Service Detail Modal State
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('services');

  // Image Lightbox State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
    if (!identifier) return;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch Public Profile (User-Centric)
        // Endpoint ini mengembalikan { user, provider, isProvider }
        const response = await fetchPublicProfile(identifier);
        
        setUser(response.data.user);
        setProvider(response.data.provider);

        const token = localStorage.getItem('posko_token');
        if (token) {
          // 2. Load Current User Profile (untuk hitung jarak)
          const userRes = await fetchProfile();
          setCurrentUser(userRes.data.profile);

          // 3. Check Favorite Status (Hanya jika profil ini adalah MITRA)
          if (response.data.provider?._id) {
            try {
               const favRes = await checkFavoriteStatus(response.data.provider._id);
               setIsFavorited(favRes.data.isFavorited);
            } catch (err) {
               console.error('Gagal cek status favorit:', err);
            }
          }
        } else {
          setDistance('Login untuk lihat Jarak');
        }
      } catch (error) {
        console.error('Gagal memuat data profil:', error);
        setUser(null); // Menandakan user tidak ditemukan
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [identifier]);

  // Calculate Distance
  // Menggunakan lokasi User, bukan hanya Provider
  useEffect(() => {
    if (user && user.location?.coordinates && currentUser?.location?.coordinates) {
      const [uLng, uLat] = currentUser.location.coordinates;
      const [targetLng, targetLat] = user.location.coordinates;

      setDistance(uLat === 0 ? 'Set Alamat' : calculateDistance(uLat, uLng, targetLat, targetLng));
    }
  }, [user, currentUser]);

  // Handlers
  const handleShare = async () => {
    setIsSharing(true);
    
    // Gunakan username dari data user yang sudah di-fetch
    const shareUrl = user?.username
      ? `${window.location.origin}/u/${user.username}`
      : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Profil ${user?.fullName || 'Pengguna Posko'}`,
          text: provider 
            ? 'Cek jasa profesional ini di Posko!' 
            : 'Lihat profil pengguna ini di Posko!',
          url: shareUrl,
        });
      } catch (err) {
        /* Ignore share cancel */
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link profil tersalin: ' + shareUrl);
    }
    setTimeout(() => setIsSharing(false), 500);
  };

  const handleToggleFavorite = async () => {
    // Favorit hanya berlaku jika user ini adalah MITRA (punya provider data)
    if (!provider) return;
    
    // 1. Optimistic Update
    const oldIsFavorited = isFavorited;
    const oldProvider = { ...provider };
    
    // Toggle state icon
    const newStatus = !oldIsFavorited;
    setIsFavorited(newStatus);
    
    // Toggle counter
    const currentFavs = provider.totalFavorites || 0;
    const newFavs = newStatus ? currentFavs + 1 : Math.max(0, currentFavs - 1);
    
    setProvider({
        ...provider,
        totalFavorites: newFavs
    });

    try {
        // 2. Call API
        await toggleFavorite(provider._id);
    } catch (error) {
        console.error('Gagal update favorit:', error);
        // 3. Revert jika gagal
        setIsFavorited(oldIsFavorited);
        setProvider(oldProvider);
        alert('Gagal menyimpan favorit. Silakan coba lagi.');
    }
  };

  const handleChat = async () => {
    if (!currentUser) {
        alert('Silakan login terlebih dahulu untuk chat.');
        router.push('/login');
        return;
    }

    if (!user) return;

    if (isChatLoading) return;
    setIsChatLoading(true);

    try {
        // Menggunakan user._id sebagai target
        await api.post('/chat', { targetUserId: user._id });
        router.push('/chat');
    } catch (error: any) {
        console.error('Gagal memulai chat:', error);
        const msg = error.response?.data?.message || 'Gagal menghubungkan chat.';
        alert(msg);
    } finally {
        setIsChatLoading(false);
    }
  };

  const handleOpenCalendar = () => {
    setIsCalendarOpen(true);
  };

  const handleCloseCalendar = () => {
    setIsCalendarOpen(false);
  };

  const handleChangeMonth = (delta: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
  };

  const handleSelectService = (service: ServiceItem) => {
    setSelectedService(service);
  };

  const handleCloseServiceDetail = () => {
    setSelectedService(null);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleImageClick = (imageUrl: string) => {
    setLightboxImage(imageUrl);
  };

  const handleCloseLightbox = () => {
    setLightboxImage(null);
  };

  // Render Loading
  if (isLoading) {
    return <ProviderLoading />;
  }

  // Render Not Found (Jika User null)
  if (!user) {
    return <ProviderNotFound />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-24 lg:pb-0">
      
      {/* HEADER: Minimalist Sticky */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="p-1.5 -ml-2 text-gray-800 hover:text-red-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <BackIcon />
          </Link>
          
          <h1 className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
            {user.fullName}
          </h1>
          
          <div className="flex gap-2">
            <button 
              onClick={handleShare}
              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-start">
          
          {/* KOLOM UTAMA (KIRI) */}
          <div className="lg:col-span-8 w-full lg:pr-12">
            
            {/* 1. HERO SECTION (UPDATED: Menggunakan ProfileHeroSection) */}
            <ProfileHeroSection
              user={user}
              provider={provider}
              distance={distance}
              isFavorited={isFavorited}
              onToggleFavorite={handleToggleFavorite}
              onShare={handleShare}
              onOpenCalendar={handleOpenCalendar}
              onChat={handleChat}
              onViewProfile={handleImageClick}
            />

            {/* SEPARATOR HALUS (Mobile Only) */}
            <div className="h-px bg-gray-100 w-full lg:hidden"></div>

            {/* 2. TAB & LIST SECTION (UPDATED: Menggunakan ProfileTabSection) */}
            <ProfileTabSection
              user={user}
              provider={provider}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onSelectService={handleSelectService}
              onImageClick={handleImageClick}
            />
          </div>

          {/* KOLOM KANAN (SIDEBAR DESKTOP) (UPDATED: Menggunakan ProfileSidebar) */}
          <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-l lg:border-gray-100 lg:pl-10 lg:py-8">
             <ProfileSidebar user={user} provider={provider} />
          </div>

        </div>
      </div>

      {/* MODALS (Hanya dirender jika data provider ada untuk fungsionalitas mitra) */}
      {provider && (
        <>
            <ProviderCalendarModal
                provider={provider}
                isOpen={isCalendarOpen}
                currentMonth={currentMonth}
                onClose={handleCloseCalendar}
                onChangeMonth={handleChangeMonth}
            />

            <ProviderServiceDetailModal
                provider={provider}
                selectedService={selectedService}
                onClose={handleCloseServiceDetail}
            />
        </>
      )}

      <ProviderImageLightbox
        imageUrl={lightboxImage}
        onClose={handleCloseLightbox}
      />

      {/* STICKY BOTTOM CTA (UPDATED: Menggunakan ProfileStickyBottomCTA) */}
      <ProfileStickyBottomCTA provider={provider} />
    </div>
  );
}