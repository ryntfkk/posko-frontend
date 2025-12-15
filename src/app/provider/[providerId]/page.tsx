// src/app/provider/[providerId]/page.tsx
'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import api from '@/lib/axios';
import { fetchProviderById, toggleFavorite, checkFavoriteStatus } from '@/features/providers/api';
import { fetchProfile } from '@/features/auth/api';
import { Provider } from '@/features/providers/types';
import { User } from '@/features/auth/types';

import {
  calculateDistance,
  TabType,
  ServiceItem,
  BackIcon,
  ProviderLoading,
  ProviderNotFound,
  ProviderHeroSection,
  ProviderTabSection,
  ProviderSidebar,
  ProviderCalendarModal,
  ProviderServiceDetailModal,
  ProviderImageLightbox,
  ProviderStickyBottomCTA,
} from '@/features/providers/components';

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const providerId = Array.isArray(params.providerId) ? params.providerId[0] : params.providerId;

  // Data State
  const [provider, setProvider] = useState<Provider | null>(null);
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
    if (! providerId) return;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        const providerRes = await fetchProviderById(providerId);
        setProvider(providerRes.data);

        const token = localStorage.getItem('posko_token');
        if (token) {
          // 1. Load Profile
          const userRes = await fetchProfile();
          setCurrentUser(userRes.data.profile);

          // 2. Check Initial Favorite Status
          try {
             const favRes = await checkFavoriteStatus(providerId);
             setIsFavorited(favRes.data.isFavorited);
          } catch (err) {
             console.error('Gagal cek status favorit:', err);
          }
        } else {
          setDistance('Login untuk Jarak');
        }
      } catch (error) {
        console.error('Gagal memuat data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [providerId]);

  // Calculate Distance
  useEffect(() => {
    if (provider && currentUser?.location?.coordinates && provider.userId?.location?.coordinates) {
      const [uLng, uLat] = currentUser.location.coordinates;
      const [pLng, pLat] = provider.userId.location.coordinates;

      setDistance(uLat === 0 ? 'Set Alamat' : calculateDistance(uLat, uLng, pLat, pLng));
    }
  }, [provider, currentUser]);

  // Handlers
  const handleShare = async () => {
    setIsSharing(true);
    if (navigator.share && provider) {
      try {
        await navigator.share({
          title: `Jasa ${provider.userId?.fullName || 'Mitra'}`,
          text: 'Cek jasa profesional ini di Posko! ',
          url: window.location.href,
        });
      } catch (err) {
        /* Ignore share cancel */
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link tersalin! ');
    }
    setTimeout(() => setIsSharing(false), 500);
  };

  const handleToggleFavorite = async () => {
    if (!provider || !provider.userId) return;
    
    // 1. Optimistic Update
    const oldIsFavorited = isFavorited;
    const oldProvider = { ...provider };
    
    // Toggle state icon
    const newStatus = !oldIsFavorited;
    setIsFavorited(newStatus);
    
    // Toggle counter
    const currentFavs = (provider as any).totalFavorites || 0;
    const newFavs = newStatus ? currentFavs + 1 : Math.max(0, currentFavs - 1);
    
    setProvider({
        ...provider,
        // @ts-ignore
        totalFavorites: newFavs
    } as Provider);

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
        alert('Silakan login terlebih dahulu untuk chat dengan mitra.');
        router.push('/login');
        return;
    }

    if (!provider || !provider.userId) return;

    if (isChatLoading) return;
    setIsChatLoading(true);

    try {
        await api.post('/chat', { targetUserId: provider.userId._id });
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

  // Render Not Found
  if (! provider) {
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
            {provider.userId?.fullName}
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
      {/* Menggunakan max-w-6xl agar lebih lebar sedikit di desktop */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-start">
          
          {/* KOLOM UTAMA (KIRI) */}
          {/* UPDATE: Ditambahkan lg:pr-12 agar Hero Section tidak menabrak Sidebar */}
          <div className="lg:col-span-8 w-full lg:pr-12">
            
            {/* 1. HERO SECTION */}
            <ProviderHeroSection
              provider={provider}
              distance={distance}
              isFavorited={isFavorited}
              isSharing={isSharing}
              onToggleFavorite={handleToggleFavorite}
              onShare={handleShare}
              onOpenCalendar={handleOpenCalendar}
              onChat={handleChat}
              onViewProfile={handleImageClick}
            />

            {/* SEPARATOR HALUS (Mobile Only) */}
            <div className="h-px bg-gray-100 w-full lg:hidden"></div>

            {/* 2. TAB & LIST SECTION */}
            <ProviderTabSection
              provider={provider}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onSelectService={handleSelectService}
              onImageClick={handleImageClick}
            />
          </div>

          {/* KOLOM KANAN (SIDEBAR DESKTOP) */}
          {/* UPDATE: Padding kiri diperbesar (pl-10) agar konten tidak mepet garis batas */}
          <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-l lg:border-gray-100 lg:pl-10 lg:py-8">
             <ProviderSidebar />
          </div>

        </div>
      </div>

      {/* MODALS */}
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

      <ProviderImageLightbox
        imageUrl={lightboxImage}
        onClose={handleCloseLightbox}
      />

      {/* STICKY BOTTOM CTA */}
      <ProviderStickyBottomCTA provider={provider} />
    </div>
  );
}