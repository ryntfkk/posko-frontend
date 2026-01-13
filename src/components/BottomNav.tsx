'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useUnreadCount } from '@/features/notifications/useNotifications';
import { MAIN_NAV_ITEMS } from '@/config/navigation';
import { Bell, User } from 'lucide-react';

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
      '/',
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
  // [UPDATED] Menggunakan class yang sama untuk icon Lucide
  const iconBaseClass = "w-6 h-6 transition-all duration-300";
  const activeClass = "text-red-600 scale-110 drop-shadow-sm";
  const inactiveClass = "text-gray-400 group-hover:text-gray-600";

  return (
    <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[99]">
      <nav className="bg-white/95 backdrop-blur-md border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl px-2 py-3.5 flex justify-between items-center max-w-sm mx-auto">

        {/* --- DYNAMIC MAIN ITEMS (Home, Orders, Chat) --- */}
        {/* Mengambil dari config/navigation.ts untuk konsistensi dengan Desktop */}
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center group"
              aria-label={t(item.label)}
            >
              <Icon
                className={`${iconBaseClass} ${isActive(item.href) ? activeClass : inactiveClass}`}
                strokeWidth={isActive(item.href) ? 2.5 : 2}
              />
            </Link>
          );
        })}

        {/* --- NOTIFICATIONS (Manual Handling for Badge) --- */}
        <Link href="/notifications" className="flex-1 flex flex-col items-center justify-center group relative" aria-label="Notifikasi">
          <div className="relative">
            <Bell
              className={`${iconBaseClass} ${isActive('/notifications') ? activeClass : inactiveClass}`}
              strokeWidth={isActive('/notifications') ? 2.5 : 2}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </Link>

        {/* --- PROFILE (Manual Handling for Specific Logic) --- */}
        <Link href="/profile" className="flex-1 flex flex-col items-center justify-center group" aria-label={t('nav.profile')}>
          <User
            className={`${iconBaseClass} ${isActive('/profile') ? activeClass : inactiveClass}`}
            strokeWidth={isActive('/profile') ? 2.5 : 2}
          />
        </Link>

      </nav>
    </div>
  );
}