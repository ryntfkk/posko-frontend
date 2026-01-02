'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Menu, X } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { PROFILE_MENU_ITEMS } from '@/config/navigation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { switchRole, registerPartner } from '@/features/auth/api';

// Icons Component (Internal use)
const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { user, isLoading, isLoggedIn, logout, refetch } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Hide header on specific pages (Auth pages, etc)
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(pathname);
  if (isAuthPage) return null;

  // Helpers
  const profileName = user?.fullName || 'User Posko';
  const profileEmail = user?.email || '-';
  const profileBadge = user?.activeRole ? user.activeRole.charAt(0).toUpperCase() + user.activeRole.slice(1) : 'Member';
  const profileAvatar = user?.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profileName)}`;
  const isProviderMode = user?.activeRole === 'provider';
  const hasProviderRole = user?.roles.includes('provider');

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement> | React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSwitchModeDesktop = async () => {
    if (!user) return;
    setSwitching(true);
    try {
      if (!user.roles.includes('provider')) {
        await registerPartner();
        alert(language === 'id' ? "Selamat! Anda berhasil mendaftar sebagai Mitra." : "Congratulations! You have successfully registered as a Partner.");
      } else {
        await switchRole(user.activeRole === 'provider' ? 'customer' : 'provider');
      }
      // Force refresh data
      await refetch();
      window.location.reload(); 
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || (language === 'id' ? "Gagal mengubah mode" : "Failed to switch mode"));
      setSwitching(false);
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
          {isLoggedIn ? (
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

      {/* --- MOBILE SEARCH BAR (Only visible on Home for now, or you can make it global) --- */}
      {/* We keep this consistent: if we want search global on mobile, we put it here. 
          If strictly mimicking page.tsx, it was below header. We will include it here for consistency. */}
      {pathname === '/' && (
        <div className="lg:hidden px-4 py-2 bg-white sticky top-[48px] z-20 border-b border-gray-100 shadow-sm">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder={t('home.searchPlaceholder')}
              className="w-full pl-9 pr-4 h-9 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
            />
          </div>
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
            <nav className="flex gap-6 text-sm font-bold text-gray-600">
              <Link href="/" className={`hover:text-red-600 transition-colors ${pathname === '/' ? 'text-red-600' : ''}`}>{t('nav.home')}</Link>
              <Link href="/search" className={`hover:text-red-600 transition-colors ${pathname === '/search' ? 'text-red-600' : ''}`}>{t('nav.search')}</Link>
              <Link href="/orders" className={`hover:text-red-600 transition-colors ${pathname === '/orders' ? 'text-red-600' : ''}`}>{t('nav.orders')}</Link>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-64">
              <input
                type="text"
                placeholder={t('common.search')}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
              />
              <SearchIcon className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            </div>

            <LanguageSwitcher />

            {isLoggedIn ? (
              <div className="relative">
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                  <div className="text-right hidden xl:block"><p className="text-xs font-bold text-gray-900 leading-tight">Halo, {isLoading ? '...' : profileName.split(' ')[0]}</p></div>
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

                        {/* SECTION: MITRA (Special Logic) */}
                        <div className="px-2 py-2">
                          <h3 className="text-[10px] font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">Area Mitra</h3>
                          <button onClick={handleSwitchModeDesktop} disabled={switching} className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group disabled:opacity-50 text-left">
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${hasProviderRole ? 'bg-green-50 text-green-600 group-hover:bg-green-100' : 'bg-teal-50 text-teal-600 group-hover:bg-teal-100'}`}>
                                {hasProviderRole ? (
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                                  {switching ? '...' : hasProviderRole ? (isProviderMode ? t('auth.modeCustomer') : t('auth.modePartner')) : t('auth.bePartner')}
                                </span>
                                <span className="text-[9px] text-gray-400">
                                  {hasProviderRole ? (isProviderMode ? "Kembali ke mode pengguna" : "Kelola pesanan Anda") : "Mulai tawarkan jasa Anda"}
                                </span>
                              </div>
                            </div>
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                          </button>
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
            ) : (
              <div className="flex gap-2"><Link href="/login" className="text-xs font-bold text-gray-600 hover:text-gray-900 px-3 py-2">{t('nav.login')}</Link><Link href="/register" className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full shadow-sm transition-all">{t('nav.register')}</Link></div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}