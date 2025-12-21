// src/app/services/[category]/page.tsx
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchProviders } from '@/features/providers/api';
import { fetchProfile } from '@/features/auth/api';
import { Provider } from '@/features/providers/types';
import { User } from '@/features/auth/types';
import { fetchServices } from '@/features/services/api';
import { Service } from '@/features/services/types';
import { calculateDistance } from '@/features/providers/components/utils';

// --- HOOKS ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

//Helper: Format harga ringkas (cth: 50rb, 1.2jt) - ASLI
const formatCompactPrice = (price: number) => {
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1).replace(/\.0$/, '') + 'jt';
  }
  if (price >= 1000) {
    return (price / 1000).toFixed(0) + 'rb';
  }
  return price.toString();
};

// --- ICONS (Original + New Tabs Icons) ---
const Icons = {
  Location: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  MapPinSolid: () => (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  ),
  Price: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Bolt: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Check: () => (
    <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
  ),
  // New Icons for Tabs
  Users: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
};

// --- COMPONENT: SERVICE LIST (BASIC ORDER) ---
function ServiceListSection({ categoryParam }: { categoryParam: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await fetchServices(categoryParam);
        if (res && res.data) {
          setServices(res.data);
        }
      } catch (err) {
        console.error("Gagal load services:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (categoryParam) loadServices();
  }, [categoryParam]);

  if (isLoading) return <div className="h-24 animate-pulse bg-gray-50 rounded-xl w-full border border-dashed border-gray-200"></div>;
  if (services.length === 0) return (
    <div className="col-span-full text-center py-8 text-gray-400 text-xs">Belum ada layanan terdaftar.</div>
  );

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {services.map((svc) => (
        <button
          key={svc._id}
          onClick={() => router.push(`/services/${categoryParam}/${svc._id}`)}
          className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 bg-white hover:border-red-100 hover:shadow-md transition-all text-center group h-full"
        >
          <div className="w-10 h-10 relative bg-gray-50 rounded-full flex items-center justify-center overflow-hidden shrink-0">
            {svc.iconUrl ? (
              <Image src={svc.iconUrl} alt={svc.name} fill className="object-cover p-1.5" />
            ) : (
              <span className="text-[10px] font-bold text-gray-400">IMG</span>
            )}
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-gray-700 leading-tight line-clamp-2 group-hover:text-red-600">
            {svc.name}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function ServiceCategoryPage() {
  const router = useRouter();
  const params = useParams();

  // --- VIEW STATE (TABS) ---
  const [viewMode, setViewMode] = useState<'providers' | 'services'>('providers');

  // --- DATA STATE ---
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Location State
  interface LocationState { lat: number; lng: number; }
  const [currentLocation, setCurrentLocation] = useState<LocationState | undefined>(undefined);
  const [locationSource, setLocationSource] = useState<'prop' | 'gps' | 'none'>('none');
  const [geoError, setGeoError] = useState<string | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'price_asc' | 'price_desc' | 'rating'>('distance');

  // Popup & Refs
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef<number>(0);
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Category Logic
  const rawCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const categoryParam = decodeURIComponent(rawCategory || '').toLowerCase().trim();
  const categoryDisplayName = useMemo(() => {
    if (!categoryParam) return '';
    return categoryParam.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }, [categoryParam]);

  // Click Outside Listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setActivePopup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load User Profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('posko_token');
        if (token) {
          const res = await fetchProfile();
          setUserProfile(res.data.profile);
        }
      } catch (error) {
        console.error("Gagal memuat profil user:", error);
      } finally {
        setIsProfileLoaded(true);
      }
    };
    loadUserProfile();
  }, []);

  // Sync Profile Location
  useEffect(() => {
    if (userProfile?.location?.coordinates) {
      const [lng, lat] = userProfile.location.coordinates;
      if (lat !== 0 || lng !== 0) {
        setCurrentLocation({ lat, lng });
        setLocationSource('prop');
      }
    }
  }, [userProfile]);

  // GPS Handler
  const handleUseMyLocation = () => {
    setGeoError(null);
    if (navigator.geolocation) {
      const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationSource('gps');
        },
        (error) => {
          let msg = "Gagal mendapatkan lokasi.";
          if (error.code === 1) msg = "Izin lokasi ditolak.";
          setGeoError(msg);
        },
        options
      );
    } else {
      setGeoError("Browser tidak mendukung geolokasi.");
    }
  };

  // Load Providers (Only when viewMode is 'providers' to save resources, or always if you prefer)
  useEffect(() => {
    if (!isProfileLoaded) return;
    // Jika user di tab services, kita pause dulu fetch provider kecuali mau pre-fetch
    if (viewMode !== 'providers' && providers.length > 0) return;

    const loadProviders = async () => {
      const currentRequestId = ++requestIdRef.current;
      setIsLoading(true);
      try {
        const response = await fetchProviders({
          lat: currentLocation?.lat,
          lng: currentLocation?.lng,
          category: categoryParam,
          search: debouncedSearch,
          sortBy: sortBy
        });

        if (currentRequestId === requestIdRef.current) {
          setProviders(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        if (currentRequestId === requestIdRef.current) setProviders([]);
      } finally {
        if (currentRequestId === requestIdRef.current) setIsLoading(false);
      }
    };

    loadProviders();
  }, [categoryParam, debouncedSearch, sortBy, currentLocation, isProfileLoaded, viewMode]);

  // --- HELPERS ---
  const handleBasicOrder = () => {
    const categoryQuery = categoryParam || 'ac';
    router.push(`/checkout?type=basic&category=${encodeURIComponent(categoryQuery)}`);
  };

  const calculateDistanceStr = (prov: Provider) => {
    let distanceStr = null;
    if (prov.distance) {
      distanceStr = (prov.distance / 1000).toFixed(1) + ' km';
    } else if (currentLocation && prov.userId?.location?.coordinates) {
      const provLng = prov.userId.location.coordinates[0];
      const provLat = prov.userId.location.coordinates[1];
      distanceStr = calculateDistance(currentLocation.lat, currentLocation.lng, provLat, provLng) + ' km';
    }
    return distanceStr;
  };

  const filterOptions = [
    { value: 'distance', label: 'Terdekat' },
    { value: 'price_asc', label: 'Harga Terendah' },
    { value: 'rating', label: 'Rating Tertinggi' },
  ];

  const getSourceLabel = () => {
    if (locationSource === 'prop' && userProfile?.address?.district) return `Kec. ${userProfile.address.district}`;
    if (locationSource === 'prop') return 'Alamat Tersimpan';
    if (locationSource === 'gps') return 'Lokasi GPS Anda';
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-12 font-sans">

      {/* --- STICKY HEADER WITH TABS (SEAMLESS) --- */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto">

          {/* Top Row: Back & Search */}
          <div className="px-4 lg:px-6 py-2.5 flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-1.5 -ml-1 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Icons.ChevronLeft />
            </button>

            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <Icons.Search />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={viewMode === 'providers' ? `Cari mitra ${categoryDisplayName}...` : `Cari jenis layanan...`}
                className="w-full bg-gray-100/80 border-0 rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-1 focus:ring-red-500 focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Row 2: SEAMLESS SEGMENTED TABS */}
          <div className="px-4 pb-3">
            <div className="bg-gray-100 p-1 rounded-lg flex relative">
              <button
                onClick={() => setViewMode('providers')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[6px] text-xs sm:text-sm font-bold transition-all duration-200 ${viewMode === 'providers'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icons.Users />
                Direct Order
              </button>
              <button
                onClick={() => setViewMode('services')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[6px] text-xs sm:text-sm font-bold transition-all duration-200 ${viewMode === 'services'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icons.Grid />
                Basic Order
              </button>
            </div>
          </div>

          {/* Row 3: MOBILE FILTER BAR (Only Visible in Providers Tab) */}
          {/* Ini dikembalikan persis seperti kode asli (horizontal scroll) */}
          {viewMode === 'providers' && (
            <div className="lg:hidden px-4 py-2 bg-white border-t border-gray-100 overflow-x-auto no-scrollbar flex gap-2">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as typeof sortBy)}
                  className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${sortBy === opt.value
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-white text-gray-600 border-gray-200'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">

        {/* === CONTENT: SERVICES TAB (BASIC ORDER) === */}
        {viewMode === 'services' && (
          <div className="animate-fadeIn">
            {/* Penjelasan Basic Order - Section Menarik dengan Keuntungan (Compact) */}
            <div className="bg-gradient-to-br from-red-50 via-white to-red-50 rounded-xl border border-red-100 shadow-sm p-4 mb-4">
              {/* Header dengan Icon */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="bg-gradient-to-br from-red-600 to-red-500 p-2 rounded-lg shadow-sm">
                  <Icons.Bolt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 leading-tight">Basic Order</h2>
                  <p className="text-[10px] text-gray-600">Pemesanan Cepat & Otomatis</p>
                </div>
              </div>

              {/* Keuntungan Basic Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="flex items-start gap-2 bg-white/60 rounded-lg p-2 border border-red-100">
                  <div className="bg-red-100 p-1.5 rounded shrink-0">
                    <Icons.MapPinSolid className="text-red-600 w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-900 mb-0.5">Teknisi Terdekat</h3>
                    <p className="text-[9px] text-gray-600 leading-snug">Sistem otomatis mencari teknisi terdekat dari lokasi Anda</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/60 rounded-lg p-2 border border-red-100">
                  <div className="bg-red-100 p-1.5 rounded shrink-0">
                    <Icons.ShieldCheck className="text-red-600 w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-900 mb-0.5">Mitra Terverifikasi</h3>
                    <p className="text-[9px] text-gray-600 leading-snug">Semua teknisi telah melalui proses verifikasi dan terpercaya</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/60 rounded-lg p-2 border border-red-100">
                  <div className="bg-red-100 p-1.5 rounded shrink-0">
                    <Icons.Price className="text-red-600 w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold text-gray-900 mb-0.5">Harga Standar</h3>
                    <p className="text-[9px] text-gray-600 leading-snug">Harga transparan sesuai standar platform</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service List Component - Dikeluarkan dari card */}
            <ServiceListSection categoryParam={categoryParam} />
          </div>
        )}

        {/* === CONTENT: PROVIDERS TAB (DIRECT ORDER) === */}
        {viewMode === 'providers' && (
          <div className="animate-fadeIn">

            {/* DESKTOP FILTER (POPUP) - ASLI */}
            <div className="hidden lg:flex items-center gap-3 mb-6 relative" ref={popupRef}>
              <span className="text-sm font-bold text-gray-700 mr-2">Urutkan:</span>
              <button
                onClick={() => setActivePopup(activePopup === 'sort' ? null : 'sort')}
                className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 transition-all ${sortBy ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-600 border-gray-200'
                  }`}
              >
                {filterOptions.find(f => f.value === sortBy)?.label || 'Pilih Urutan'}
                <Icons.ChevronDown />
              </button>
              {activePopup === 'sort' && (
                <div className="absolute top-full left-16 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 p-1 flex flex-col animate-fadeIn">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value as typeof sortBy); setActivePopup(null); }}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-red-600 text-left"
                    >
                      {opt.label}
                      {sortBy === opt.value && <Icons.Check />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RESULTS INFO & LOCATION SELECTOR */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-end justify-between">
                <h1 className="text-sm lg:text-base font-bold text-gray-900">
                  {isLoading ? 'Memuat...' : `${providers.length} Mitra Tersedia`}
                </h1>
                {!isLoading && currentLocation ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-red-50 text-red-700 border border-red-100 font-medium">
                    {getSourceLabel()}
                  </span>
                ) : (
                  !isLoading && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleUseMyLocation}
                        className="text-[10px] font-bold text-red-600 bg-white border border-red-100 hover:bg-red-50 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <Icons.Location />
                        <span className="hidden lg:inline">Cari Sekitar Saya</span>
                        <span className="lg:hidden">Lokasi</span>
                      </button>
                      <Link
                        href="/profile/address"
                        className="text-[10px] font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
                      >
                        + Alamat
                      </Link>
                    </div>
                  )
                )}
              </div>

              {!isLoading && !currentLocation && (
                <p className="text-[10px] lg:text-xs text-gray-500">
                  Menampilkan hasil acak. Aktifkan lokasi atau tambah alamat untuk melihat mitra terdekat.
                </p>
              )}
            </div>

            {/* PROVIDER LIST GRID (ASLI) */}
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-5 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-full flex flex-col gap-2">
                    <div className="aspect-[4/3] bg-gray-100 rounded-xl" />
                    <div className="h-3 w-3/4 bg-gray-100 rounded" />
                    <div className="h-2 w-1/2 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : providers.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-6 lg:p-12 text-center border border-dashed border-gray-200 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-1">
                  <Icons.Search />
                </div>
                <div>
                  <p className="text-gray-900 font-bold mb-1">Tidak ada mitra ditemukan</p>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    {currentLocation
                      ? `Belum ada mitra layanan ${categoryDisplayName} di area ini.`
                      : `Aktifkan lokasi atau tambahkan alamat untuk melihat mitra terdekat.`}
                  </p>
                </div>
                {!currentLocation && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto">
                    <button
                      onClick={handleUseMyLocation}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-full text-sm transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Icons.Location />
                      Aktifkan Lokasi
                    </button>
                    <Link
                      href="/profile/address"
                      className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold py-2.5 px-6 rounded-full text-sm transition-all flex items-center justify-center gap-2"
                    >
                      + Tambah Alamat
                    </Link>
                  </div>
                )}
                {(searchTerm || sortBy !== 'distance') && (
                  <button
                    onClick={() => { setSearchTerm(''); setSortBy('distance'); }}
                    className="mt-2 text-xs text-red-600 font-bold hover:underline"
                  >
                    Reset Filter & Pencarian
                  </button>
                )}
                {geoError && (
                  <div className="mt-3 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100 max-w-sm">
                    {geoError}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-5">
                {providers.map((prov) => {
                  const distanceStr = calculateDistanceStr(prov);

                  // Sort services
                  const sortedServices = [...(prov.services || [])].sort((a, b) => {
                    const catA = a.serviceId?.category?.toLowerCase() || '';
                    const catB = b.serviceId?.category?.toLowerCase() || '';
                    if (catA === categoryParam && catB !== categoryParam) return -1;
                    if (catA !== categoryParam && catB === categoryParam) return 1;
                    return 0;
                  });

                  const activeServices = sortedServices.filter(s => s.isActive);
                  const serviceNames = activeServices
                    .filter(s => s.serviceId?.name)
                    .map(s => s.serviceId.name)
                    .slice(0, 2)
                    .join(', ');

                  const serviceDisplay = serviceNames || 'Belum mendaftar layanan';
                  const getMinPrice = () => {
                    if (activeServices.length === 0) return 0;
                    return Math.min(...activeServices.map((s) => s.price || 0));
                  };
                  const minPrice = getMinPrice();

                  const getLocationLabel = () => {
                    const addr = prov.userId?.address;
                    if (!addr) return 'Lokasi Mitra';
                    if (addr.district) return `Kec. ${addr.district}`;
                    if (addr.city) return addr.city;
                    return 'Lokasi Mitra';
                  };

                  return (
                    <Link
                      href={`/u/${prov.userId.username || prov.userId._id}`}
                      key={prov._id}
                      className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full group hover:shadow-md hover:border-red-100 transition-all duration-300 h-full"
                    >
                      {/* IMAGE AREA (Aspect 4:3) - RESTORED */}
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        <Image
                          src={prov.userId?.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${prov.userId?.fullName || 'default'}`}
                          alt={prov.userId?.fullName || 'Mitra'}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Rating Badge - RESTORED */}
                        <div className="absolute bottom-1.5 left-1.5 z-20 flex items-center gap-0.5 bg-black/60 backdrop-blur-[2px] px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white border border-white/10">
                          <span className='text-yellow-400 text-[8px]'>★</span>
                          <span>{(prov.rating && prov.rating > 0) ? prov.rating.toFixed(1) : 'Baru'}</span>
                        </div>
                        {/* Online Dot - RESTORED */}
                        {prov.isOnline && (
                          <div className="absolute top-1.5 right-1.5 z-20 w-2 h-2 bg-green-500 rounded-full border border-white shadow-sm animate-pulse"></div>
                        )}
                      </div>

                      {/* CONTENT AREA - RESTORED */}
                      <div className="p-2 flex flex-col flex-1 gap-0.5">
                        <h4 className="font-bold text-xs text-gray-900 truncate leading-tight group-hover:text-red-600 transition-colors">
                          {prov.userId?.fullName || 'Mitra Posko'}
                        </h4>

                        {/* Services Section */}
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

                        {/* Location & Distance */}
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
                          {/* Action Icon */}
                          <div className="w-5 h-5 rounded-full bg-red-50 text-red-400 group-hover:bg-red-600 group-hover:text-white flex items-center justify-center transition-colors">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}