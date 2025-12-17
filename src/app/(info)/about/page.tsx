import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Zap, Users, Award, ArrowRight, MapPin, Clock } from 'lucide-react';

// Metadata untuk SEO
export const metadata = {
  title: 'Tentang Posko - Solusi Jasa Harian Terpercaya',
  description: 'Mengenal lebih dekat Posko, platform penyedia jasa harian profesional, cepat, dan aman untuk kebutuhan rumah tangga Anda.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      
      {/* 1. HERO SECTION: Compact & Direct */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-xs font-medium text-red-700 uppercase tracking-wide">Tentang Posko</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              Revolusi Jasa Harian <br className="hidden md:block"/>
              <span className="text-red-600">Cepat & Terpercaya.</span>
            </h1>
            
            <p className="text-sm md:text-base text-gray-500 leading-relaxed max-w-lg">
              Posko hadir untuk menghubungkan Anda dengan teknisi dan pekerja profesional dalam hitungan menit. Tanpa drama, transparan, dan bergaransi.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link href="/services/all" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-sm active:scale-95">
                Pesan Jasa Sekarang
              </Link>
              <Link href="/info/contact" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all active:scale-95">
                Hubungi Kami
              </Link>
            </div>
          </div>
          
          {/* Hero Image - Hidden on very small screens to save space, visible on slightly larger mobile */}
          <div className="relative h-48 md:h-80 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm hidden xs:block">
             {/* Placeholder for Hero Image - Ganti src dengan gambar tim/hero Anda */}
             <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center text-gray-400">
                <span className="text-sm">Posko Hero Image Area</span>
             </div>
          </div>
        </div>
      </section>

      {/* 2. STATS & VALUES: High Density Grid (Bento Box Style) */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-gray-900">Mengapa Memilih Kami?</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Standar baru dalam pelayanan jasa rumah tangga.</p>
            </div>
          </div>

          {/* Grid Layout: 2 Kolom di Mobile (Compact), 4 di Desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            
            {/* Card 1 */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-red-200 transition-colors group">
              <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center mb-3 group-hover:bg-red-100 transition-colors">
                <ShieldCheck className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Terverifikasi</h3>
              <p className="text-xs text-gray-500 leading-snug">
                Setiap mitra melalui proses screening ketat & cek latar belakang.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-red-200 transition-colors group">
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Respons Cepat</h3>
              <p className="text-xs text-gray-500 leading-snug">
                Pemesanan instan. Mitra tiba dalam waktu rata-rata 30 menit.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-red-200 transition-colors group">
              <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                <Award className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">Bergaransi</h3>
              <p className="text-xs text-gray-500 leading-snug">
                Layanan tidak memuaskan? Kami berikan garansi pengerjaan ulang.
              </p>
            </div>

             {/* Card 4 - Stats (Different Style) */}
             <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">Total Mitra</p>
                <p className="text-2xl font-bold text-white mt-1">500+</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                 <p className="text-xs text-gray-400 font-medium">Pengguna Puas</p>
                 <p className="text-xl font-bold text-white mt-0.5">10k+</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. MISSION SECTION: Efficient Text Layout */}
      <section className="py-8 md:py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Misi Kami</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  Di Posko, kami percaya bahwa mencari bantuan profesional tidak seharusnya sulit. Misi kami mendigitalkan sektor jasa informal di Indonesia.
                </p>
                <p>
                  Kami membangun ekosistem yang adil: <strong>Customer</strong> mendapatkan harga transparan dan keamanan, sementara <strong>Mitra</strong> (tukang, teknisi, tenaga ahli) mendapatkan akses pasar yang lebih luas dan peningkatan kesejahteraan.
                </p>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                 <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Jangkauan Luas</p>
                        <p className="text-xs text-gray-500">Tersedia di Jabodetabek & Surabaya</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-gray-900">Pemberdayaan</p>
                        <p className="text-xs text-gray-500">Membantu UMKM jasa lokal</p>
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Contextual Image/Pattern */}
            <div className="order-1 md:order-2 bg-gray-50 rounded-xl p-6 border border-gray-100 flex items-center justify-center">
               <div className="text-center">
                  <span className="text-4xl font-bold text-red-600 tracking-tighter">POSKO</span>
                  <p className="text-sm text-gray-400 mt-2 tracking-widest uppercase text-xs">Professional Service Kooperation</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA SECTION: Compact & Full Width on Mobile */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-10 text-center shadow-lg shadow-red-200">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-2">Siap menyelesaikan masalah Anda?</h2>
            <p className="text-red-100 text-sm md:text-base mb-6 max-w-2xl mx-auto">
              Temukan penyedia jasa terbaik di sekitar Anda sekarang juga.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link href="/services/all" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-red-700 bg-white rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                Lihat Layanan <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link href="/auth/register" className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors">
                Daftar Jadi Mitra
              </Link>
            </div>
          </div>
        </div>
      </section>
      
    </main>
  );
}