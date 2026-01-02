'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useUnreadCount } from '@/features/notifications/useNotifications';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { data: unreadCount = 0 } = useUnreadCount();

  // Helper Active State
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  // --- LOGIC VISIBILITAS NAVIGASI (CENTRALIZED) ---
  const shouldHideBottomNav = () => {
    // 1. Static Paths (Auth, Checkout, etc)
    const hiddenPaths = [
      '/login', 
      '/register', 
      '/forgot-password', 
      '/checkout', 
      '/order/summary',
      '/chat/room' // Contoh jika ada chat room full screen
    ];
    if (hiddenPaths.includes(pathname)) return true;

    // 2. Dynamic Pattern: Detail Order (/orders/ID) tapi bukan list (/orders)
    if (pathname.startsWith('/orders/') && pathname !== '/orders') return true;

    // 3. Dynamic Pattern: Provider Dashboard & Public Profile
    if (pathname.startsWith('/provider/') || pathname.startsWith('/u/')) return true;

    // 4. Dynamic Pattern: Service Detail (/services/cat/id)
    // Regex: /services/{category}/{id}
    if (/^\/services\/[^/]+\/[^/]+$/.test(pathname)) return true;

    return false;
  };

  if (shouldHideBottomNav()) return null;

  // --- STYLE CONSTANTS ---
  const iconBaseClass = "w-6 h-6 transition-all duration-300";
  const activeClass = "text-red-600 scale-110 drop-shadow-sm";
  const inactiveClass = "text-gray-400 group-hover:text-gray-600";

  return (
    <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[99]">
      <nav className="bg-white/95 backdrop-blur-md border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl px-2 py-3.5 flex justify-between items-center max-w-sm mx-auto">

        {/* --- HOME --- */}
        <Link href="/" className="flex-1 flex flex-col items-center justify-center group" aria-label={t('nav.home')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive('/') ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive('/') ? "0" : "2"}
            className={`${iconBaseClass} ${isActive('/') ? activeClass : inactiveClass}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </Link>

        {/* --- ORDERS --- */}
        <Link href="/orders" className="flex-1 flex flex-col items-center justify-center group" aria-label={t('nav.orders')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive('/orders') ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive('/orders') ? "0" : "2"}
            className={`${iconBaseClass} ${isActive('/orders') ? activeClass : inactiveClass}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </Link>

        {/* --- CHAT --- */}
        <Link href="/chat" className="flex-1 flex flex-col items-center justify-center group" aria-label={t('nav.chat')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive('/chat') ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive('/chat') ? "0" : "2"}
            className={`${iconBaseClass} ${isActive('/chat') ? activeClass : inactiveClass}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
        </Link>

        {/* --- NOTIFICATIONS --- */}
        <Link href="/notifications" className="flex-1 flex flex-col items-center justify-center group relative" aria-label="Notifikasi">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive('/notifications') ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive('/notifications') ? "0" : "2"}
              className={`${iconBaseClass} ${isActive('/notifications') ? activeClass : inactiveClass}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </Link>

        {/* --- PROFILE --- */}
        <Link href="/profile" className="flex-1 flex flex-col items-center justify-center group" aria-label={t('nav.profile')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isActive('/profile') ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive('/profile') ? "0" : "2"}
            className={`${iconBaseClass} ${isActive('/profile') ? activeClass : inactiveClass}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </Link>

      </nav>
    </div>
  );
}