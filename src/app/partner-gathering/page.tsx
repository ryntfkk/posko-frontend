// src/app/partner-gathering/page.tsx
'use client';

import { 
  ArrowRight, 
  TrendingUp, 
  Smartphone, 
  Star, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Check, 
  Zap, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PartnerGatheringPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      
      {/* --- SECTION 1: HERO (Optimized) --- */}
      <section className="relative pt-28 pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Pattern - Ringan (SVG) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-60 pointer-events-none" />
        
        {/* Dekorasi Gradient - Hanya di Desktop agar Mobile ringan */}
        <div className="hidden lg:block absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto animate-fade-in-up">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-gray-600">Partner Gathering S1</span>
            </div>

            {/* Heading - Responsive Text Size */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6 leading-[1.15]">
              Ubah <span className="text-red-600">Keahlian</span><br />
              Jadi <span className="underline decoration-red-200 decoration-4 underline-offset-4">Penghasilan</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-500 mb-8 max-w-xl mx-auto leading-relaxed">
              Platform #1 untuk menghubungkan teknisi & profesional jasa dengan ribuan pelanggan di Semarang. Tanpa ribet, tanpa perang harga.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-gray-500 bg-gray-50 px-5 py-3.5 rounded-full w-full sm:w-auto border border-gray-100">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-500" /> Semarang</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-red-500" /> Season 1</span>
              </div>
            </div>

          </div>

          {/* HERO IMAGE: Static & Performant */}
          <div className="mt-12 sm:mt-16 relative w-full aspect-[16/9] lg:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-gray-100 animate-fade-in-up delay-100">
            {/* Fallback Image Container */}
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                <Image 
                  src="/images/partner-gathering/hero-collage.jpg" 
                  alt="Mitra Posko Gathering" 
                  fill 
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
            </div>
            {/* Overlay Gradient for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 text-white">
              <p className="text-xs font-medium opacity-90 mb-0.5">Komunitas Mitra</p>
              <p className="text-lg sm:text-2xl font-bold">1.000+ Tergabung</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}