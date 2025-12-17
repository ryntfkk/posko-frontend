// src/app/help/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, ChevronRight, ChevronDown, 
  User, ShoppingBag, CreditCard, Shield, 
  MessageCircle, Mail, Phone, ExternalLink 
} from 'lucide-react';

// --- MOCK DATA (Lengkap & Sesuai Konteks Posko) ---
const CATEGORIES = [
  { id: 'account', label: 'Akun & Keamanan', icon: <User className="w-4 h-4" />, desc: 'Login, profil, password' },
  { id: 'orders', label: 'Pesanan & Layanan', icon: <ShoppingBag className="w-4 h-4" />, desc: 'Status, pembatalan, teknisi' },
  { id: 'payment', label: 'Pembayaran', icon: <CreditCard className="w-4 h-4" />, desc: 'Refund, e-wallet, invoice' },
  { id: 'trust', label: 'Keamanan & Garansi', icon: <Shield className="w-4 h-4" />, desc: 'Garansi servis, report' },
];

const FAQS = {
  account: [
    { q: "Bagaimana cara mengubah alamat tersimpan?", a: "Masuk ke menu Profil > Alamat Saya. Anda bisa menambah alamat baru atau mengedit alamat yang sudah ada. Pastikan titik peta sesuai agar teknisi tidak nyasar." },
    { q: "Saya lupa kata sandi, bagaimana resetnya?", a: "Di halaman Login, klik 'Lupa Password'. Kami akan mengirimkan tautan reset ke email yang terdaftar. Link berlaku selama 15 menit demi keamanan." },
    { q: "Apakah data saya aman di Posko?", a: "Sangat aman. Kami menggunakan enkripsi standar industri untuk melindungi data pribadi dan transaksi Anda." }
  ],
  orders: [
    { q: "Bagaimana jika teknisi tidak datang tepat waktu?", a: "Mitra kami memiliki toleransi keterlambatan 15 menit. Jika lebih, gunakan fitur Chat di aplikasi untuk menghubungi mitra atau hubungi CS kami untuk penggantian mitra prioritas." },
    { q: "Cara membatalkan pesanan?", a: "Pesanan bisa dibatalkan gratis jika status masih 'Menunggu Konfirmasi'. Jika teknisi sudah jalan, akan dikenakan biaya pembatalan Rp15.000 untuk ganti rugi transport." },
    { q: "Apakah saya bisa request teknisi wanita?", a: "Untuk layanan tertentu (seperti Make-up atau Cleaning), Anda bisa memberikan catatan saat order. Namun, ini tergantung ketersediaan mitra di area Anda." }
  ],
  payment: [
    { q: "Metode pembayaran apa saja yang tersedia?", a: "Kami menerima Transfer Bank (VA), E-Wallet (GoPay, OVO, ShopeePay), dan Kartu Kredit. Pembayaran Tunai (COD) hanya tersedia untuk layanan tertentu." },
    { q: "Kapan dana refund akan masuk?", a: "Refund ke E-Wallet instan (1x24 jam). Untuk Kartu Kredit/Debit maksimal 7-14 hari kerja tergantung bank penerbit." }
  ],
  trust: [
    { q: "Apakah layanan Posko bergaransi?", a: "Ya! Semua layanan perbaikan memiliki garansi servis 14 hari. Jika masalah yang sama muncul kembali, kami perbaiki gratis." },
    { q: "Bagaimana cara klaim garansi?", a: "Buka menu Pesanan > Riwayat > Pilih pesanan terkait > Klik 'Ajukan Komplain/Garansi'. Lampirkan foto bukti pengerjaan." }
  ]
};

export default function HelpCenterPage() {
  const [activeCategory, setActiveCategory] = useState('orders');
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic (bisa dikembangkan lebih lanjut)
  const activeFaqs = FAQS[activeCategory as keyof typeof FAQS] || [];

  return (
    <main className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* 1. COMPACT HEADER & SEARCH (High Density) */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-3 flex items-center gap-4">
            <Link href="/" className="shrink-0 p-1 hover:bg-gray-50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            </Link>
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Cari kendala (misal: refund, teknisi)" 
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="hidden lg:block text-sm font-bold text-gray-900">Pusat Bantuan</div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        
        {/* 2. CATEGORY TABS (Scrollable on Mobile, Grid on Desktop) */}
        {/* Menggunakan grid kecil di mobile (2 kolom) agar efisien secara vertikal */}
        <section className="mb-8">
            <h1 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 tracking-tight">Topik Bantuan</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`
                            text-left p-3 rounded-xl border transition-all duration-200 relative group
                            ${activeCategory === cat.id 
                                ? 'bg-red-50 border-red-200 shadow-sm' 
                                : 'bg-white border-gray-200 hover:border-red-200 hover:bg-gray-50'
                            }
                        `}
                    >
                        <div className={`mb-2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeCategory === cat.id ? 'bg-white text-red-600 shadow-sm' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-red-500'}`}>
                            {cat.icon}
                        </div>
                        <h3 className={`text-sm font-bold leading-none mb-1 ${activeCategory === cat.id ? 'text-red-700' : 'text-gray-900'}`}>{cat.label}</h3>
                        <p className="text-[10px] text-gray-500 leading-tight line-clamp-1">{cat.desc}</p>
                    </button>
                ))}
            </div>
        </section>

        {/* 3. CONTENT AREA (Split Layout on Desktop) */}
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* FAQ List (Dense Accordion) */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Pertanyaan Populer</h2>
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Topik: {CATEGORIES.find(c => c.id === activeCategory)?.label}</span>
                </div>

                <div className="space-y-2">
                    {activeFaqs.map((item, idx) => {
                        const isOpen = openAccordion === `${activeCategory}-${idx}`;
                        return (
                            <div 
                                key={idx} 
                                className={`border rounded-lg overflow-hidden transition-all duration-200 ${isOpen ? 'border-red-200 bg-red-50/10' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                            >
                                <button 
                                    onClick={() => setOpenAccordion(isOpen ? null : `${activeCategory}-${idx}`)}
                                    className="w-full flex items-center justify-between p-3.5 text-left"
                                >
                                    <span className={`text-sm font-medium ${isOpen ? 'text-red-700' : 'text-gray-700'}`}>{item.q}</span>
                                    {isOpen ? <ChevronDown className="w-4 h-4 text-red-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                                </button>
                                
                                <div 
                                    className={`
                                        overflow-hidden transition-all duration-300 ease-in-out
                                        ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                                    `}
                                >
                                    <div className="px-3.5 pb-4 pt-0 text-xs lg:text-sm text-gray-600 leading-relaxed border-t border-dashed border-red-100 mt-1">
                                        <div className="pt-3">{item.a}</div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                    <div className="p-1.5 bg-white rounded-md border border-gray-200 shadow-sm shrink-0">
                        <ExternalLink className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-900">Masih butuh bantuan spesifik?</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 mb-2">Jika jawaban di atas tidak membantu, ajukan tiket bantuan.</p>
                        <button className="text-[10px] font-bold text-white bg-gray-900 hover:bg-black px-3 py-1.5 rounded-lg transition-all">
                            Buat Tiket Bantuan
                        </button>
                    </div>
                </div>
            </div>

            {/* Contact Sidebar (Sticky on Desktop, Bottom on Mobile) */}
            <div className="lg:w-72 shrink-0">
                <div className="sticky top-24 space-y-4">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider hidden lg:block">Hubungi Kami</h2>
                    
                    {/* Live Chat Card */}
                    <div className="p-4 rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-white shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                <MessageCircle className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Live Chat</h3>
                                <p className="text-[10px] text-red-600 font-medium animate-pulse">● Online (08:00 - 21:00)</p>
                            </div>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-3">Respon tercepat. Bicara langsung dengan agen CS kami.</p>
                        <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                            Mulai Chat
                        </button>
                    </div>

                    {/* Secondary Contacts Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <a href="mailto:support@posko.id" className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group text-center flex flex-col items-center gap-2">
                            <Mail className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                            <span className="text-xs font-medium text-gray-600">Email</span>
                        </a>
                        <a href="tel:+6221555555" className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group text-center flex flex-col items-center gap-2">
                            <Phone className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                            <span className="text-xs font-medium text-gray-600">Call Center</span>
                        </a>
                    </div>

                    {/* Help Tips */}
                    <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-[10px] text-blue-800 leading-tight">
                        <strong>Tips:</strong> Sertakan nomor Order ID (contoh: ORD-123) saat menghubungi CS agar penanganan lebih cepat.
                    </div>
                </div>
            </div>

        </div>
      </div>
    </main>
  );
}