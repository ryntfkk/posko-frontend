// src/app/provider/[providerId]/page.tsx
'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation'; // [UPDATE] Import useRouter
import { useEffect, useState } from 'react';

import api from '@/lib/axios'; // [UPDATE] Import axios instance
import { fetchProviderById, toggleFavorite, checkFavoriteStatus } from '@/features/providers/api'; // [UPDATE] Import checkFavoriteStatus
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
  const router = useRouter(); // [UPDATE]
  const providerId = Array.isArray(params.providerId) ? params.providerId[0] : params.providerId;

  // Data State
  const [provider, setProvider] = useState<Provider | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [distance, setDistance] = useState('Menghitung...');

  // Interaction State
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false); // [BARU] Loading state chat

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

          // 2. [FIX] Check Initial Favorite Status
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
    if (!provider || !provider.userId) return; // Safety check
    
    // 1. Optimistic Update (UI Langsung Berubah)
    const oldIsFavorited = isFavorited;
    const oldProvider = { ...provider }; // Shallow copy
    
    // Toggle state icon
    const newStatus = !oldIsFavorited;
    setIsFavorited(newStatus);
    
    // Toggle counter (Handle type casting if field is missing in generic Provider type)
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

  // [BARU] Handler Chat: Buat room jika belum ada, lalu redirect
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
        // Panggil endpoint create room
        // Payload: { targetUserId: string }
        await api.post('/chat', { targetUserId: provider.userId._id });
        
        // Redirect ke halaman chat (Next.js akan handle fetching list terbaru di sana)
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
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-12 font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 transition-all">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-2 flex items-center justify-between">
          <Link
            href="/"
            className="p-2 -ml-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <BackIcon />
          </Link>
          <h1 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Profil Mitra</h1>
          <div className="w-8"></div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-4 space-y-4">
        {/* 1.HERO SECTION */}
        <ProviderHeroSection
          provider={provider}
          distance={distance}
          isFavorited={isFavorited}
          isSharing={isSharing}
          onToggleFavorite={handleToggleFavorite}
          onShare={handleShare}
          onOpenCalendar={handleOpenCalendar}
          onChat={handleChat} // [BARU] Pass handler ke child
        />

        {/* LAYOUT GRID UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* KOLOM KIRI (Tab Section: Services & Docs) */}
          <div className="lg:col-span-2">
            <ProviderTabSection
              provider={provider}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onSelectService={handleSelectService}
              onImageClick={handleImageClick}
            />
          </div>

          {/* KOLOM KANAN (Info Tambahan) */}
          <div className="hidden lg:block">
            <ProviderSidebar />
          </div>
        </div>
      </main>

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