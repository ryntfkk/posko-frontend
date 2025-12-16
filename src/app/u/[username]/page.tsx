// src/app/u/[username]/page.tsx
'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import api from '@/lib/axios';
import { fetchPublicProfile, fetchProfile } from '@/features/auth/api';
import { toggleFavorite, checkFavoriteStatus } from '@/features/providers/api';

import { Provider } from '@/features/providers/types';
import { User } from '@/features/auth/types';

import {
  ProfileHeroSection,
  ProfileTabSection,
  ProfileSidebar,
  ProfileStickyBottomCTA
} from '@/features/profile/components';

import {
  calculateDistance,
  TabType,
  ServiceItem,
  BackIcon,
  ProviderLoading,
  ProviderNotFound,
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
    if (!identifier) return;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchPublicProfile(identifier);
        
        setUser(response.data.user);
        setProvider(response.data.provider);

        const token = localStorage.getItem('posko_token');
        if (token) {
          const userRes = await fetchProfile();
          setCurrentUser(userRes.data.profile);

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
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [identifier]);

  // Calculate Distance
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
    if (!provider) return;
    
    const oldIsFavorited = isFavorited;
    const oldProvider = { ...provider };
    
    const newStatus = !oldIsFavorited;
    setIsFavorited(newStatus);
    
    const currentFavs = provider.totalFavorites || 0;
    const newFavs = newStatus ? currentFavs + 1 : Math.max(0, currentFavs - 1);
    
    setProvider({
        ...provider,
        totalFavorites: newFavs
    });

    try {
        await toggleFavorite(provider._id);
    } catch (error) {
        console.error('Gagal update favorit:', error);
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

  const handleOpenCalendar = () => { setIsCalendarOpen(true); };
  const handleCloseCalendar = () => { setIsCalendarOpen(false); };
  const handleChangeMonth = (delta: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonth(newDate);
  };
  const handleSelectService = (service: ServiceItem) => { setSelectedService(service); };
  const handleCloseServiceDetail = () => { setSelectedService(null); };
  const handleTabChange = (tab: TabType) => { setActiveTab(tab); };
  const handleImageClick = (imageUrl: string) => { setLightboxImage(imageUrl); };
  const handleCloseLightbox = () => { setLightboxImage(null); };

  if (isLoading) return <ProviderLoading />;
  if (!user) return <ProviderNotFound />;

  // Check verification status for Header Badge
  const isVerified = provider?.verificationStatus === 'verified';

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
          
          {/* [UPDATED] Nama diperbesar (text-lg) & max-width ditambah */}
          <h1 className="text-lg font-bold text-gray-900 truncate max-w-[240px] flex items-center gap-1.5">
            {user.fullName}
            {isVerified && (
              <span className="text-blue-500 shrink-0" title="Mitra Terverifikasi">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.491 4.491 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.06-1.06L10 13.69l-1.72-1.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.25-4.25z" clipRule="evenodd" />
                </svg>
              </span>
            )}
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
          
          <div className="lg:col-span-8 w-full lg:pr-12">
            
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

            <div className="h-px bg-gray-100 w-full lg:hidden"></div>

            <ProfileTabSection
              user={user}
              provider={provider}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onSelectService={handleSelectService}
              onImageClick={handleImageClick}
            />
          </div>

          <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-l lg:border-gray-100 lg:pl-10 lg:py-8">
             <ProfileSidebar user={user} provider={provider} />
          </div>

        </div>
      </div>

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

      <ProfileStickyBottomCTA provider={provider} />
    </div>
  );
}