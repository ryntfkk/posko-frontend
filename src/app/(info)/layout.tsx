'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer'; 

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Logika Judul Otomatis
  const getPageTitle = () => {
    if (pathname.includes('/terms')) return 'Syarat & Ketentuan';
    if (pathname.includes('/privacy')) return 'Kebijakan Privasi';
    if (pathname.includes('/faq')) return 'Tanya Jawab (FAQ)';
    if (pathname.includes('/about')) return 'Tentang Kami';
    if (pathname.includes('/careers')) return 'Karir';
    if (pathname.includes('/contact')) return 'Hubungi Kami';
    if (pathname.includes('/help')) return 'Pusat Bantuan';
    return 'Informasi';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      {/* --- Sticky Header --- */}
      <header className="fixed top-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-md border-b border-gray-100 h-14 flex items-center justify-between px-4 lg:px-8 max-w-screen-2xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Link 
            href="/profile" // Bisa disesuaikan logic back-nya jika perlu
            className="p-1.5 -ml-1.5 hover:bg-gray-50 rounded-full transition-colors text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-bold text-gray-900 tracking-tight">
            {getPageTitle()}
          </h1>
        </div>
        {/* Opsional: Label versi atau status */}
        <div className="hidden sm:block text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
          Posko Info Center
        </div>
      </header>

      {/* --- Content Wrapper --- */}
      <main className="flex-grow pt-14">
        {children}
      </main>

      {/* --- Global Footer --- */}
      <div className="border-t border-gray-100 mt-auto">
        <Footer />
      </div>
    </div>
  );
}