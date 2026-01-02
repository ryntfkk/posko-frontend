'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// --- API & TYPES ---
import { fetchServices, fetchCategories } from '@/features/services/api';
import { Service, Category } from '@/features/services/types';
import { voucherApi } from '@/features/vouchers/api';
import { Voucher } from '@/features/vouchers/types';
import { useCart } from '@/features/cart/useCart';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

// --- KOMPONEN EKSISTING ---
import TechnicianSection from '@/components/home/TechnicianSection';
import ServiceCategories from '@/components/home/ServiceCategories';
import ChatWidget from '@/components/ChatWidget';

// --- KOMPONEN BARU ---
import HomeBanner from '@/components/home/HomeBanner';
import BecomePartnerSection from '@/components/home/BecomePartnerSection';
import Footer from '@/components/Footer';

// --- IMPORT TEMPORARY MODAL ---
import ComingSoonModal from "../components/ComingSoonModal";
// ------------------------------

import Image from 'next/image';

const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

export default function HomePage() {
  const router = useRouter();
  const { totalItems, totalAmount, cart } = useCart();
  const { t, language } = useLanguage();
  const { user, isLoading: isLoadingProfile } = useAuth(); // Pakai hook baru

  // Data State
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [promos, setPromos] = useState<Voucher[]>([]);
  const [isLoadingPromos, setIsLoadingPromos] = useState(true);

  // Helper Profile Access
  const isProviderMode = user?.activeRole === 'provider';

  // Fetch Categories
  useEffect(() => {
    fetchCategories()
      .then(res => setCategories(res.data || []))
      .catch(err => console.error("Gagal memuat kategori:", err))
      .finally(() => setIsLoadingCategories(false));
  }, []);

  // Fetch Services 
  useEffect(() => {
    fetchServices()
      .then(res => setServices(res.data || []))
      .catch(err => console.error("Gagal memuat layanan:", err))
      .finally(() => setIsLoadingServices(false));
  }, []);

  // Fetch Vouchers
  useEffect(() => {
    voucherApi.getAvailableVouchers()
      .then(res => setPromos(res.data || []))
      .catch(err => console.error("Gagal memuat promo:", err))
      .finally(() => setIsLoadingPromos(false));
  }, []);

  // Redirect Provider
  useEffect(() => {
    if (!isLoadingProfile && isProviderMode) {
      router.replace('/dashboard');
    }
  }, [isProviderMode, isLoadingProfile, router]);

  // Checkout URL (Floating Cart Logic)
  const checkoutUrl = useMemo(() => {
    if (cart.length > 0) {
      const firstItem = cart[0];
      if (firstItem.orderType === 'direct' && firstItem.providerId) {
        return `/checkout?type=direct&providerId=${firstItem.providerId}`;
      }
      return `/checkout?type=basic`;
    }
    return '/checkout?type=basic';
  }, [cart]);

  // Valid Location Helper
  const validUserLocation = useMemo(() => {
    if (user?.location?.coordinates) {
      const [lng, lat] = user.location.coordinates;
      if (lat !== 0 || lng !== 0) {
        return { lat, lng };
      }
    }
    return undefined;
  }, [user]);

  // Address Label Helper
  const addressLabel = useMemo(() => {
    let label = 'Alamat Tersimpan';
    if (user?.address) {
      const { district, city } = user.address;
      if (district && city) label = `${district}, ${city}`;
      else if (city) label = city;
      else if (district) label = district;
    }

    if (user?.location?.coordinates) {
      const [lng, lat] = user.location.coordinates;
      if (lat && lng) label += ` (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
    }

    return label;
  }, [user]);

  // Loading Screen for Provider Redirect
  if (isProviderMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-red-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-red-100">
      {/* --- TEMPORARY COMING SOON MODAL --- */}
      <ComingSoonModal />
      {/* ------------------------------------------- */}

      {/* HEADER DAN SEARCH BAR SUDAH DIHAPUS DARI SINI KARENA SUDAH PINDAH KE SRC/COMPONENTS/LAYOUT/HEADER.TSX */}
      {/* HALAMAN INI SEKARANG HANYA FOKUS PADA KONTEN BODY */}

      {/* BANNER SECTION */}
      <HomeBanner />

      {/* PROMO / VOUCHERS SECTION */}
      <section className="mt-4 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🔥</span>
            <h2 className="text-sm lg:text-base font-bold text-gray-900">{t('home.promoTitle')}</h2>
          </div>
          <Link href="/vouchers" className="text-[10px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-full transition-colors">{t('common.viewAll')}</Link>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar snap-x">
          {isLoadingPromos ? (
            [1, 2, 3].map(i => (
              <div key={i} className="w-56 h-24 bg-gray-100 rounded-xl animate-pulse shrink-0"></div>
            ))
          ) : promos.length > 0 ? (
            promos.slice(0, 5).map((promo, idx) => (
              <PromoCard
                key={promo._id}
                voucher={promo}
                index={idx}
              />
            ))
          ) : (
            <div className="w-full py-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
              <p className="text-gray-400 text-[10px]">{t('home.noPromo')}</p>
            </div>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <ServiceCategories categories={categories} isLoading={isLoadingCategories} />

      {/* BECOME PARTNER SECTION */}
      <BecomePartnerSection />

      {/* TECHNICIANS NEARBY */}
      <TechnicianSection
        userLocation={validUserLocation}
        addressLabel={addressLabel}
      />

      {/* SECTION KEUNGGULAN (MINIMALIST STRIP) */}
      <section className="px-4 lg:px-8 mt-3 mb-6 lg:mt-6 lg:mb-10 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 py-3 px-2 lg:py-5 lg:px-6">
          <div className="grid grid-cols-3 gap-1 divide-x divide-gray-100">

            {/* Verified */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-1.5">
                <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-[10px] lg:text-xs font-bold text-gray-900 leading-none">{t('home.whyVerified')}</h3>
              <p className="text-[8px] lg:text-[10px] text-gray-400 mt-1 leading-none hidden lg:block">{t('home.whyVerifiedDesc')}</p>
            </div>

            {/* Price */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5">
                <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-[10px] lg:text-xs font-bold text-gray-900 leading-none">{t('home.whyPrice')}</h3>
              <p className="text-[8px] lg:text-[10px] text-gray-400 mt-1 leading-none hidden lg:block">{t('home.whyPriceDesc')}</p>
            </div>

            {/* Fast */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-1.5">
                <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-[10px] lg:text-xs font-bold text-gray-900 leading-none">{t('home.whyFast')}</h3>
              <p className="text-[8px] lg:text-[10px] text-gray-400 mt-1 leading-none hidden lg:block">{t('home.whyFastDesc')}</p>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />

      {/* FLOATING CHAT */}
      {user && (
        <div className="hidden lg:block">
          <ChatWidget user={user} />
        </div>
      )}

      {/* FLOATING CART */}
      {totalItems > 0 && (
        <Link href={checkoutUrl} className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-50 flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-full shadow-lg shadow-red-600/30 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fadeIn">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span className="font-bold text-xs">{totalItems} • {formatCurrency(totalAmount)}</span>
        </Link>
      )}
    </main>
  );
}

// Promo Card Component (Tetap di sini atau dipindah ke file terpisah, tapi sesuai request: kode tidak boleh hilang)
function PromoCard({ voucher, index }: { voucher: Voucher, index: number }) {
  const { language } = useLanguage();
  const colors = ['from-red-500 to-orange-500', 'from-blue-500 to-indigo-500', 'from-emerald-500 to-teal-500', 'from-purple-500 to-pink-500'];
  const bgClass = colors[index % colors.length];

  const discountText = voucher.discountType === 'percentage'
    ? `${voucher.discountValue}% OFF`
    : `${language === 'id' ? 'Hemat' : 'Save'} ${new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', { compactDisplay: "short", notation: "compact" }).format(voucher.discountValue)}`;

  return (
    <div className={`w-56 h-24 rounded-lg p-3 flex flex-row items-center justify-between text-white shadow-sm relative overflow-hidden shrink-0 group cursor-pointer snap-start transition-all hover:shadow-md ${!voucher.imageUrl ? `bg-gradient-to-r ${bgClass}` : 'bg-gray-900'}`}>

      {voucher.imageUrl ? (
        <>
          <Image
            src={voucher.imageUrl}
            alt={voucher.code}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 300px"
          />
          <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors"></div>
        </>
      ) : (
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
      )}

      <div className="flex flex-col justify-between h-full z-10 max-w-[70%]">
        <span className="text-[10px] font-medium opacity-90 truncate bg-black/20 px-1.5 py-0.5 rounded w-fit backdrop-blur-sm border border-white/10">
          {voucher.code}
        </span>
        <h3 className="font-black text-lg leading-none tracking-tight drop-shadow-sm">{discountText}</h3>
        <p className="text-[9px] opacity-90 truncate max-w-full font-medium text-gray-100">
          Min. {new Intl.NumberFormat('id-ID').format(voucher.minPurchase)}
        </p>
      </div>

      <div className="flex flex-col items-end justify-between h-full z-10">
        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] backdrop-blur-md border border-white/20">🏷️</div>
        {voucher.isClaimed ? (
          <span className="text-[9px] font-bold bg-white/90 text-gray-500 px-2 py-0.5 rounded shadow-sm">
            {language === 'id' ? 'Klaim' : 'Claimed'}
          </span>
        ) : (
          <Link href="/vouchers" className="text-[9px] font-bold bg-white text-gray-900 px-2.5 py-1 rounded shadow-sm hover:bg-gray-100 transition-colors">
            {language === 'id' ? 'Ambil' : 'Get'}
          </Link>
        )}
      </div>
    </div>
  )
}