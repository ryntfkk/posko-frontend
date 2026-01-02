'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, LogOut, ExternalLink, Menu, X } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { PROFILE_MENU_ITEMS, MAIN_NAV_ITEMS } from '@/config/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useUnreadCount } from '@/features/notifications/useNotifications';

// --- ATOMIC COMPONENT: SEARCH INPUT ---
// Digunakan ulang di Mobile (Sticky) dan Desktop (Header) untuk konsistensi UI
interface GlobalSearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent | React.KeyboardEvent) => void;
  placeholder: string;
  className?: string;
}

const GlobalSearchInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder, 
  className = "" 
}: GlobalSearchInputProps) => (
  <div className={`relative ${className}`}>
    <input
      type="text"
      placeholder={placeholder}
      className="w-full pl-9 pr-4 h-9 lg:h-10 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all placeholder:text-gray-400"
      value={value}
      onChange={onChange}
      onKeyDown={(e) => e.key === 'Enter' && onSubmit(e)}
    />
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  </div>
);

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { user, isLoading, isLoggedIn, logout } = useAuth();
  
  // MENGGUNAKAN ONE SOURCE OF TRUTH UNTUK NOTIFIKASI
  // Hook ini sama dengan yang dipakai di BottomNav
  const { data: unreadCount = 0 } = useUnreadCount();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // [NEW] STATE UNTUK MENGATASI HYDRATION MISMATCH DAN FLICKERING AUTH BUTTON
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // [NEW] LOGIC VISIBILITAS SEARCH BAR (FIX UX ISSUE)
  // Hanya tampilkan search bar mobile di halaman Home, Search, dan kategori Services
  // Tidak akan muncul di halaman Chat, Profile, Detail Order, dll.
  const showMobileSearch = ['/', '/search'].includes(pathname) || pathname.startsWith('/services');

  // Sembunyikan header pada halaman Auth
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(pathname);
  if (isAuthPage) return null;

  // Helper Data User
  const profileName = user?.fullName || 'User Posko';
  const profileEmail = user?.email || '-';
  const profileBadge = user?.activeRole ? user.activeRole.charAt(0).toUpperCase() + user.activeRole.slice(1) : 'Member';
  const profileAvatar = user?.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profileName)}`;
  
  // Cek sederhana untuk UI Mitra
  const hasProviderRole = user?.roles?.includes('provider');

  const handleSearchSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    // Mencegah default form submit jika dipanggil dari onSubmit form
    if ('preventDefault' in e) e.preventDefault(); 
    
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      // Optional: Close keyboard on mobile logic could go here
    }
  };

  return (
    <>
      {/* --- MOBILE HEADER --- */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-2.5 flex items-center justify-between shadow-sm transition-all">
        <div className="flex items-center gap-2">
          <Link href="/" className="relative w-6 h-6 block">
            <Image
              src="/logo.png"
              alt="Posko Logo"
              fill
              className="object-contain"
              sizes="24px"
            />
          </Link>
          <div>
            <h1 className="text-sm font-black text-gray-900 leading-none tracking-tight">POSKO<span className="text-red-600">.</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          
          {/* [FIX] LOADING STATE HANDLING PADA MOBILE */}
          {/* Jika belum mounted (SSR) atau sedang loading data user, tampilkan Skeleton */}
          {!isMounted || isLoading ? (
             <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse" />
          ) : isLoggedIn ? (
            <Link href="/profile">
              <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 overflow-hidden relative active:scale-95 transition-transform">
                <Image
                  src={profileAvatar}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  sizes="28px"
                />
              </div>
            </Link>
          ) : (
            <Link href="/login" className="text-[10px] font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>

      {/* --- MOBILE SEARCH BAR (STICKY & CONDITIONAL) --- */}
      {/* [FIX] Search bar sekarang hanya muncul di halaman yang relevan sesuai logika showMobileSearch */}
      {showMobileSearch && (
        <div className="lg:hidden px-4 py-2 bg-white sticky top-[48px] z-20 border-b border-gray-100 shadow-sm animate-fadeIn">
          <GlobalSearchInput 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSubmit={handleSearchSubmit}
            placeholder={t('home.searchPlaceholder')}
          />
        </div>
      )}

      {/* --- DESKTOP HEADER --- */}
      <header className="hidden lg:block sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo.png"
                  alt="Posko Logo"
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">POSKO<span className="text-red-600">.</span></span>
            </Link>
            
            {/* [FIX] MENGGUNAKAN MAIN_NAV_ITEMS AGAR KONSISTEN ONE SOURCE OF TRUTH */}
            <nav className="flex gap-6 text-sm font-bold text-gray-600">
              {MAIN_NAV_ITEMS.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`hover:text-red-600 transition-colors ${
                    (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href))
                      ? 'text-red-600' 
                      : ''
                  }`}
                >
                  {t(item.label)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-64">
              <GlobalSearchInput 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSubmit={handleSearchSubmit}
                placeholder={t('common.search')}
              />
            </div>

            <LanguageSwitcher />

            {/* [FIX] LOADING STATE HANDLING PADA DESKTOP */}
            {/* Mencegah tombol Login muncul sekejap saat user sebenarnya sudah login */}
            {!isMounted || isLoading ? (
              <div className="flex items-center gap-3">
                 <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                 <div className="w-24 h-8 bg-gray-200 rounded-full animate-pulse" />
              </div>
            ) : isLoggedIn ? (
              <div className="flex items-center gap-4">
                
                {/* [NEW] NOTIFICATION BELL (Desktop) */}
                <Link href="/notifications" className="relative text-gray-500 hover:text-red-600 transition-colors p-1 group">
                  <Bell className="w-5 h-5 group-hover:animate-swing" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </Link>

                {/* PROFILE DROPDOWN */}
                <div className="relative">
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                    <div className="text-right hidden xl:block"><p className="text-xs font-bold text-gray-900 leading-tight">Halo, {profileName.split(' ')[0]}</p></div>
                    <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden border border-gray-200 relative">
                      <Image
                        src={profileAvatar}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  </button>
                  
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn ring-1 ring-black/5">
                        {/* Header Info */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden shrink-0 relative">
                            <Image
                              src={profileAvatar}
                              alt="Avatar"
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{isLoading ? '...' : profileName}</p>
                            <p className="text-[10px] text-gray-500 truncate">{profileEmail}</p>
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-red-50 text-red-600 text-[8px] font-bold rounded uppercase tracking-wider border border-red-100">{profileBadge}</span>
                          </div>
                        </div>

                        <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
                          
                          {/* DYNAMIC MENU FROM CONFIG */}
                          {/* [FIX] Memastikan Desktop User memiliki akses ke semua menu yang ada di Mobile */}
                          {PROFILE_MENU_ITEMS.map((section, idx) => (
                             <div key={idx} className={idx === 0 ? "px-2 pt-3 pb-1" : "px-2 py-2"}>
                                {idx > 0 && <div className="h-px bg-gray-50 mx-2 mb-2"></div>}
                                <h3 className="text-[10px] font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">{section.group}</h3>
                                {section.items.map((item) => (
                                  <Link key={item.href} href={item.href} className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.bg} ${item.color} group-hover:bg-opacity-80 transition-colors`}>
                                        <item.icon className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{item.label}</span>
                                    </div>
                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                  </Link>
                                ))}
                             </div>
                          ))}

                          <div className="h-px bg-gray-50 mx-4"></div>

                          {/* SECTION: MITRA (External Link) */}
                          <div className="px-2 py-2">
                            <h3 className="text-[10px] font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">Area Mitra</h3>
                            <a 
                              href="https://provider.poskojasa.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group text-left"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${hasProviderRole ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-green-50 text-green-600 group-hover:bg-green-100'}`}>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                                    {hasProviderRole ? "Ke Dashboard Mitra" : "Gabung Jadi Mitra"}
                                  </span>
                                  <span className="text-[9px] text-gray-400">
                                    {hasProviderRole ? "Kelola pesanan Anda" : "Mulai tawarkan jasa Anda"}
                                  </span>
                                </div>
                              </div>
                              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </a>
                          </div>

                          {/* Logout */}
                          <div className="px-4 pb-4 pt-2 border-t border-gray-50 mt-2">
                              <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <LogOut className="w-3.5 h-3.5" />
                                {t('auth.logout')}
                              </button>
                          </div>

                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-2"><Link href="/login" className="text-xs font-bold text-gray-600 hover:text-gray-900 px-3 py-2">{t('nav.login')}</Link><Link href="/register" className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full shadow-sm transition-all">{t('nav.register')}</Link></div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}