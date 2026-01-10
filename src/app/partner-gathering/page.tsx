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
  Users,
  Target,
  BarChart3,
  CheckCircle2,
  Lock,
  ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

// --- UTILS: Zero-Lag Scroll Reveal Engine ---
// Menggunakan IntersectionObserver asli browser untuk performa maksimal
const RevealOnScroll = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function PartnerGatheringPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-red-100 selection:text-red-900">

      {/* GLOBAL STYLES FOR NATIVE ANIMATIONS */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* --- SECTION 1: HERO --- */}
      {/* Menggunakan konten dari halaman 1 PDF */}
      <section className="relative pt-10 pb-10 lg:pt-28 lg:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-60 pointer-events-none" />
        <div className="hidden lg:block absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

            {/* Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-6 hover:shadow-md transition-shadow cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase text-gray-600">Partner Gathering S1</span>
            </div>

            {/* Heading */}
            <h1 className="animate-fade-in-up text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-gray-900 mb-6 leading-[1.15]">
              Ubah <span className="text-red-600">Keahlian</span><br />
              Jadi <span className="underline decoration-red-200 decoration-4 underline-offset-4">Penghasilan</span>
            </h1>

            <p className="animate-fade-in-up delay-100 text-base sm:text-lg text-gray-500 mb-8 max-w-xl mx-auto leading-relaxed">
              Infrastruktur teknologi yang menghubungkan keahlian Anda dengan kebutuhan pasar yang masif dan mendesak.
            </p>

            {/* Stats/Info Pills */}
            <div className="animate-fade-in-up delay-200 flex flex-wrap justify-center gap-3 mb-10">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm font-medium text-gray-600">
                <MapPin className="w-4 h-4 text-red-500" />
                Kota Semarang
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm font-medium text-gray-600">
                <Calendar className="w-4 h-4 text-red-500" />
                September 2025
              </div>
            </div>

            {/* Hero Image */}
            <div className="animate-fade-in-up delay-300 relative w-full aspect-[16/9] lg:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-100 group">
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                <Image
                  src="/images/partner-gathering/hero-collage.jpg"
                  alt="Mitra Posko Gathering"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 text-left text-white">
                <p className="text-sm font-medium opacity-90 mb-1">Presented By</p>
                <p className="text-xl font-bold">Posko Indonesia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: THE PROBLEM (Page 2) --- */}
      <section className="py-12 lg:py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            <RevealOnScroll className="order-2 lg:order-1">
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Akses Pasar yang <span className="text-red-600">Terputus</span>
              </h2>
              <div className="space-y-6 text-lg text-gray-600">
                <p>
                  Ketiadaan Wadah untuk Menjual Jasa
                </p>
                <p>
                  Masalah terbesar saat ini adalah ketiadaan platform terpadu, yang mengakibatkan akses penyedia jasa terhadap pelanggan menjadi sangat terbatas. Tanpa adanya wadah digital ini, banyak tenaga ahli kesulitan memasarkan diri mereka sendiri
                </p>
                <div className="pt-4 border-l-4 border-red-500 pl-6 bg-white py-4 pr-4 shadow-sm rounded-r-lg">
                  <p className="font-semibold text-gray-900 italic">
                    "POSKO dibangun untuk menyelesaikan friksi ini secara sistematis."
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll className="order-1 lg:order-2 flex justify-center" delay={200}>
              <div className="relative w-full max-w-md aspect-square bg-white rounded-3xl shadow-lg border border-gray-100 p-8 flex items-center justify-center animate-float">
                {/* Visual Representation of Fragmentation */}
                <div className="grid grid-cols-2 gap-4 w-full h-full opacity-80">
                  <div className="bg-red-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                    <Users className="w-8 h-8 text-red-400 mb-2" />
                    <span className="text-xs font-bold text-gray-500">Sulit Cari Pelanggan</span>
                  </div>
                  <div className="bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                    <BarChart3 className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs font-bold text-gray-500">Harga Tidak Jelas</span>
                  </div>
                  <div className="bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                    <Target className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs font-bold text-gray-500">Akses Terbatas</span>
                  </div>
                  <div className="bg-red-50 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                    <ShieldCheck className="w-8 h-8 text-red-400 mb-2" />
                    <span className="text-xs font-bold text-gray-500">Persaingan Tidak Sehat</span>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

          </div>
        </div>
      </section>

      {/* --- SECTION 3: THE SOLUTION (Page 3) --- */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <RevealOnScroll className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Apa Itu <span className="text-red-600">POSKO ?</span>
            </h2>
            <p className="text-lg text-gray-600">
              Bayangkan POSKO seperti Gojek atau Grab, tapi khusus untuk <strong className="text-gray-900">Jasa Teknik dan Keahlian</strong>.
            </p>
          </RevealOnScroll>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* App Mockup */}
            <RevealOnScroll className="flex justify-center bg-gray-50 rounded-[3rem] p-8 lg:p-12">
              <div className="relative w-64 lg:w-72 aspect-[9/19] rounded-[2.5rem] border-[8px] border-gray-900 overflow-hidden shadow-2xl bg-white">
                <Image
                  src="/images/partner-gathering/app-mockup.png"
                  alt="Aplikasi Posko Customer"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </RevealOnScroll>

            {/* How It Works Steps (Page 3) */}
            <div className="space-y-10">
              <RevealOnScroll delay={100}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">1</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Pelanggan Butuh Bantuan</h3>
                    <p className="text-gray-600">
                      Ada orang di sekitar Anda yang AC-nya bocor, butuh tukang cat, atau jasa fotografi. Mereka buka aplikasi POSKO.
                    </p>
                  </div>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={200}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">2</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Order di Siarkan</h3>
                    <p className="text-gray-600">
                      Karena posisi Anda dekat (terbaca di peta aplikasi), pesanan itu masuk ke HP Anda secara real-time.
                    </p>
                  </div>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={300}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">3</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Datang & Kerjakan</h3>
                    <p className="text-gray-600">
                      Anda datang ke lokasi, selesaikan pekerjaan, dan Anda dibayar. Sistem kami lebih canggih dari sekadar "Ojek Online".
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 4: FEATURES (Page 4) --- */}
      <section className="py-12 bg-gray-900 text-white overflow-hidden relative">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-red-600 rounded-full blur-[128px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600 rounded-full blur-[128px]" />
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-6 relative z-10">
          <RevealOnScroll>
            <h2 className="text-3xl lg:text-5xl font-bold text-white text-center mb-16">
              Fleksibilitas Cara Kerja
            </h2>
          </RevealOnScroll>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

            {/* Basic Order Card */}
            <RevealOnScroll delay={100} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 hover:border-red-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white">Basic Order</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Ini persis seperti Gojek/Grab. Order masuk otomatis, harga sudah standar, Anda tinggal ambil dan jalan.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <Check className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>Sistem otomatis cari teknisi terdekat</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <Check className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>Cocok untuk kerja cepat seperti service elektronik</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <Check className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>Harga transparan sesuai platform</span>
                </li>
              </ul>
            </RevealOnScroll>

            {/* Direct Order Card */}
            <RevealOnScroll delay={200} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 hover:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-white">Direct Order</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Fitur unggulan kami. Pelanggan memilih Anda secara spesifik berdasarkan portofolio dan rating.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span>Anda atur harga jasa sendiri (Rate Card)</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span>Pelanggan memilih kualitas, bukan harga murah</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span>Bangun reputasi dan brand pribadi ini cocok untuk Makeup Artist dan lain sebagainya</span>
                </li>
              </ul>
            </RevealOnScroll>

          </div>
        </div>
      </section>

      {/* --- SECTION 5: RUKO DIGITAL (Page 5) --- */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Mockup Profil (Left) */}
            <RevealOnScroll className="order-2 lg:order-1 relative">
              <div className="relative mx-auto w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden p-4">
                {/* Header Mockup */}
                <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                    <img src="/images/partner-gathering/rb.png" alt="Rina" width={64} height={64} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Rina Beauty</h4>
                    <p className="text-sm text-gray-500">MUA & Nail Art</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-yellow-500 mt-1">
                      <Star className="w-3 h-3 fill-current" /> 4.8 (33 Pesanan)
                    </div>
                  </div>
                </div>
                {/* Portfolio Mockup */}
                <div className="space-y-3">
                  <div className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-gray-800">Make Up Artist (MUA)</p>
                        <p className="text-xs text-gray-500 mt-1">Jasa make up profesional...</p>
                      </div>
                      <span className="text-sm font-bold text-red-600">Rp 550.000</span>
                    </div>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-gray-800">Nail Art Home</p>
                        <p className="text-xs text-gray-500 mt-1">Layanan nail art di rumah...</p>
                      </div>
                      <span className="text-sm font-bold text-red-600">Rp 85.000</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <button className="w-full py-2 bg-red-600 text-white rounded-lg font-medium text-sm">Chat Mitra</button>
                </div>
              </div>

              {/* Decorative Arrow/Label */}
              <div className="absolute -right-8 top-1/2 hidden lg:block text-gray-400">
                <ArrowRight className="w-8 h-8" />
              </div>
            </RevealOnScroll>

            {/* Text Content (Right) */}
            <RevealOnScroll delay={100} className="order-1 lg:order-2">
              <div className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                Personal Branding
              </div>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
                Etalase Bisnis Anda <br /><span className="text-red-600">Profil Publik</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Bayangkan Profil Mitra ini seperti Showroom Pribadi. Bedanya, Anda tidak perlu bayar sewa tempat, dan "toko" ini buka 24 jam.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Identitas Profesional</h4>
                    <p className="text-sm text-gray-600">Tampilkan kategori keahlian spesifik (misal: Spesialis AC Inverter).</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Reputasi Nyata</h4>
                    <p className="text-sm text-gray-600">Ulasan positif tampil sebagai jaminan kualitas. Pelanggan membeli kualitas, bukan harga murah.</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

          </div>
        </div>
      </section>

      {/* --- SECTION 6: BENEFITS SEASON 1 (Page 6) --- */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <RevealOnScroll className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Keuntungan Join <span className="text-red-600">SEASON 1</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              "The First Mover Advantage"
            </p>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Di dunia digital, timing adalah segalanya.
            </p>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <RevealOnScroll delay={100} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <TrendingUp className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Prioritas Sistem</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Algoritma kami akan memprioritaskan profil lama yang sudah terverifikasi lebih dulu dibandingkan akun baru. Anda punya "senioritas".
              </p>
            </RevealOnScroll>

            {/* Benefit 2 */}
            <RevealOnScroll delay={200} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Users className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Peluang Mentor</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Peluang besar direkrut menjadi Mentor atau Trainer di POSKO Academy bagi mitra awal yang berpengalaman.
              </p>
            </RevealOnScroll>

            {/* Benefit 3 */}
            <RevealOnScroll delay={300} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <Lock className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Akses B2B</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Kami hanya mempercayakan kontrak besar (B2B) kepada Mitra Season 1 yang rekam jejaknya sudah kami kenal.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* --- SECTION 7: FEES & RISK FREE (Page 7 & 8) --- */}
      <section className="py-12 lg:py-20 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Fee Explanation */}
            <RevealOnScroll>
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8">Transparansi Biaya</h2>

              <div className="flex items-end gap-4 mb-8">
                <span className="text-8xl font-black text-red-500 leading-none">12%</span>
                <span className="text-xl font-medium text-gray-400 mb-2">Platform Fee</span>
              </div>

              <div className="space-y-6 text-gray-300">
                <p className="text-lg">
                  <span className="text-white font-bold">Mengapa ada potongan?</span> Kami menggunakan dana ini untuk "membakar uang" beriklan agar pelanggan datang mencari Anda, biaya server 24 jam, dan operasional verifikasi.
                </p>
                <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700">
                  <h4 className="text-white font-bold mb-2">Logika Bisnis</h4>
                  <p className="text-sm text-gray-400">
                    Anda menyimpan <strong className="text-white">88% pendapatan bersih</strong>. Bayangkan jika kerja sendiri, Anda harus cari pelanggan dan tawar menawar. Dengan memberikan 12%, kami mengambil alih beban mencari pelanggan.
                  </p>
                </div>
              </div>
            </RevealOnScroll>

            {/* Risk Free Card */}
            <RevealOnScroll delay={200} className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                  Pay-Per-Success
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">100% Tanpa Risiko</h3>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />
                    <span className="text-red-100">Gratis pendaftaran.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />
                    <span className="text-red-100">Tidak ada biaya bulanan.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />
                    <span className="text-red-100">Tidak ada order = Tidak bayar sepeser pun.</span>
                  </li>
                </ul>
                <p className="text-white/80 font-medium italic">
                  "Kami hanya mendapatkan uang jika ANDA mendapatkan uang."
                </p>
              </div>
            </RevealOnScroll>

          </div>
        </div>
      </section>

      {/* --- SECTION 8: STEPS (Page 9) --- */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <RevealOnScroll className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
              Langkah Bergabung
            </h2>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-100 z-0" />

            {/* Step 1 */}
            <RevealOnScroll delay={0} className="relative z-10 bg-white pt-4">
              <div className="w-16 h-16 mx-auto bg-red-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-red-200">1</div>
              <h3 className="text-xl font-bold text-center mb-3">Registrasi Akun</h3>
              <p className="text-center text-gray-500 text-sm px-4">
                Daftar dengan email di poskojasa.com untuk mengamankan username Anda.
              </p>
            </RevealOnScroll>

            {/* Step 2 */}
            <RevealOnScroll delay={150} className="relative z-10 bg-white pt-4">
              <div className="w-16 h-16 mx-auto bg-white border-2 border-red-600 text-red-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-sm">2</div>
              <h3 className="text-xl font-bold text-center mb-3">Finalisasi Data</h3>
              <p className="text-center text-gray-500 text-sm px-4">
                Login ke portal provider. Upload KTP, pilih kategori keahlian, dan upload portofolio.
              </p>
            </RevealOnScroll>

            {/* Step 3 */}
            <RevealOnScroll delay={300} className="relative z-10 bg-white pt-4">
              <div className="w-16 h-16 mx-auto bg-white border-2 border-gray-200 text-gray-400 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6">3</div>
              <h3 className="text-xl font-bold text-center mb-3">Verifikasi</h3>
              <p className="text-center text-gray-500 text-sm px-4">
                Tim kami memverifikasi data untuk keamanan ekosistem. Tunggu info via WhatsApp/Email.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <RevealOnScroll>
            <h2 className="text-4xl lg:text-6xl font-black text- -900 mb-8">
              Let's Work Together!
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-red-600 text-white rounded-full font-bold text-lg hover:bg-red-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                Daftar Sekarang
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all duration-300"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
            <p className="mt-8 text-sm text-gray-400">
              Posko Indonesia
            </p>
          </RevealOnScroll>
        </div>
      </section>

    </main>
  );
}