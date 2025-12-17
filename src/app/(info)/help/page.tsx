// src/app/(info)/help/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, ChevronRight, ChevronDown, 
  User, ShoppingBag, CreditCard, Shield, 
  MessageCircle, Mail, Phone, FileText, 
  TicketPercent, Wrench, AlertTriangle, ArrowLeft
} from 'lucide-react';

// --- DATA: COMPREHENSIVE KNOWLEDGE BASE ---
// Disusun berdasarkan use-case nyata aplikasi jasa on-demand

const CATEGORIES = [
  { id: 'common', label: 'Topik Populer', icon: <FileText className="w-3.5 h-3.5" />, desc: 'Paling sering ditanyakan' },
  { id: 'account', label: 'Akun & Keamanan', icon: <User className="w-3.5 h-3.5" />, desc: 'Login, OTP, Alamat' },
  { id: 'orders', label: 'Pesanan & Layanan', icon: <ShoppingBag className="w-3.5 h-3.5" />, desc: 'Booking, Reschedule' },
  { id: 'payment', label: 'Pembayaran', icon: <CreditCard className="w-3.5 h-3.5" />, desc: 'Refund, Invoice' },
  { id: 'promo', label: 'Voucher & Promo', icon: <TicketPercent className="w-3.5 h-3.5" />, desc: 'Diskon, Referral' },
  { id: 'warranty', label: 'Garansi & Komplain', icon: <Shield className="w-3.5 h-3.5" />, desc: 'Klaim servis, Laporan' },
  { id: 'partner', label: 'Mitra & Teknisi', icon: <Wrench className="w-3.5 h-3.5" />, desc: 'Etika, Pendaftaran' },
];

const KNOWLEDGE_BASE = {
  common: [
    { q: "Bagaimana cara membatalkan pesanan?", a: "Pesanan dapat dibatalkan gratis jika status masih 'Menunggu Konfirmasi'. Jika mitra sudah dalam perjalanan, akan dikenakan biaya kompensasi perjalanan sebesar Rp15.000." },
    { q: "Berapa lama garansi servis di Posko?", a: "Seluruh layanan perbaikan kami dilindungi Garansi 14 Hari. Jika masalah yang sama muncul kembali dalam periode tersebut, kami akan memperbaikinya ulang secara GRATIS." },
    { q: "Apakah harga di aplikasi sudah final?", a: "Harga di aplikasi adalah estimasi awal. Jika teknisi menemukan kerusakan tambahan saat pengecekan, mereka akan menginput biaya tambahan di aplikasi yang harus Anda setujui terlebih dahulu sebelum pengerjaan lanjut." },
  ],
  account: [
    { q: "Saya tidak menerima kode OTP", a: "Pastikan nomor HP aktif dan memiliki sinyal. Jika menggunakan WhatsApp, cek koneksi internet. Tunggu 60 detik untuk kirim ulang. Jangan berikan kode OTP kepada siapa pun, termasuk pihak Posko." },
    { q: "Cara mengubah alamat atau titik peta", a: "Masuk ke menu Profil > Alamat Saya. Anda bisa mengedit alamat yang ada. Pastikan pin point peta akurat untuk memudahkan mitra menemukan lokasi Anda." },
    { q: "Bagaimana cara menghapus akun?", a: "Permintaan hapus akun dapat dilakukan via menu Pengaturan > Privasi > Hapus Akun. Data akan dihapus permanen dalam 30 hari sesuai kebijakan privasi." },
  ],
  orders: [
    { q: "Bisakah saya mengubah jadwal (Reschedule)?", a: "Ya, reschedule bisa dilakukan maksimal 2 jam sebelum jadwal layanan melalui halaman Detail Pesanan. Jika kurang dari 2 jam, silakan hubungi Customer Service." },
    { q: "Teknisi belum datang melewati jam booking", a: "Mitra memiliki toleransi keterlambatan 15 menit karena kondisi lalu lintas. Anda bisa melacak lokasi mitra atau chat langsung via aplikasi. Jika tidak ada kabar, hubungi CS untuk penggantian mitra prioritas." },
    { q: "Apakah saya perlu menyediakan alat?", a: "Untuk layanan standar (seperti AC, Cleaning), mitra membawa peralatan sendiri. Namun untuk sparepart khusus (misal: freon, kabel tambahan), mungkin dikenakan biaya tambahan jika tidak Anda sediakan." },
  ],
  payment: [
    { q: "Metode pembayaran apa saja yang tersedia?", a: "Kami menerima Transfer Virtual Account (BCA, Mandiri, BRI, BNI), E-Wallet (GoPay, OVO, ShopeePay), Kartu Kredit/Debit, dan PayLater." },
    { q: "Apakah bisa bayar tunai (COD)?", a: "Pembayaran tunai langsung ke mitra tersedia untuk layanan tertentu di bawah Rp500.000. Untuk transaksi besar, wajib menggunakan pembayaran non-tunai demi keamanan." },
    { q: "Kapan dana refund masuk?", a: "Refund ke Saldo/E-Wallet diproses instan (maks 1x24 jam). Refund ke Kartu Kredit/Debit membutuhkan waktu 7-14 hari kerja tergantung bank penerbit." },
    { q: "Saya ditagih biaya parkir oleh teknisi?", a: "Biaya parkir di lokasi pelanggan ditanggung oleh pelanggan jika ada. Biaya tol atau bensin teknisi sudah termasuk dalam biaya layanan aplikasi." },
  ],
  promo: [
    { q: "Voucher tidak bisa digunakan", a: "Cek Syarat & Ketentuan voucher. Beberapa voucher hanya berlaku untuk layanan spesifik, metode pembayaran tertentu, atau memiliki minimum transaksi." },
    { q: "Apakah bisa menggabungkan promo?", a: "Umumnya hanya 1 kode promo yang bisa digunakan per transaksi, namun Anda tetap bisa mendapatkan Posko Poin dari transaksi tersebut." },
  ],
  warranty: [
    { q: "Cara klaim garansi servis", a: "Buka menu Pesanan > Riwayat > Pilih pesanan terkait > Klik tombol 'Klaim Garansi'. Lampirkan foto/video bukti masalah yang muncul kembali. Tim kami akan memverifikasi dalam 1x24 jam." },
    { q: "Apa saja yang tidak tercover garansi?", a: "Garansi tidak mencakup kerusakan akibat bencana alam, kesalahan penggunaan oleh pelanggan, atau jika unit telah diotak-atik oleh pihak lain selain mitra Posko selama masa garansi." },
    { q: "Bagaimana melaporkan mitra yang tidak sopan?", a: "Keamanan Anda prioritas kami. Laporkan segera via tombol 'Lapor Masalah' di pesanan atau hubungi Tombol Darurat (SOS) jika mendesak. Kami akan menindak tegas mitra yang melanggar kode etik." },
  ],
  partner: [
    { q: "Siapa itu mitra Posko?", a: "Mitra Posko adalah tenaga ahli profesional yang telah melewati proses seleksi ketat: verifikasi KTP/SKCK, tes keterampilan teknis, dan pelatihan standar pelayanan (SOP)." },
    { q: "Apakah teknisi sudah divaksin?", a: "Ya, 100% mitra aktif kami wajib sudah vaksinasi COVID-19 dosis lengkap dan mematuhi protokol kesehatan saat bekerja di rumah Anda." },
  ]
};

export default function HelpCenterPage() {
  const [activeCategory, setActiveCategory] = useState('common');
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Logic: Gabungkan semua data jika sedang searching
  const filteredData = useMemo(() => {
    if (!searchQuery) return KNOWLEDGE_BASE[activeCategory as keyof typeof KNOWLEDGE_BASE] || [];
    
    // Flatten semua data untuk pencarian
    const allFaqs = Object.values(KNOWLEDGE_BASE).flat();
    return allFaqs.filter(item => 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, activeCategory]);

  return (
    <main className="min-h-screen bg-white font-sans text-gray-800 pb-20 lg:pb-10">
      
      {/* 1. COMPACT HEADER (Sticky) */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3 mb-3 lg:mb-0">
                <Link href="/profile" className="lg:hidden p-1.5 -ml-2 hover:bg-gray-50 rounded-full text-gray-600">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-base lg:text-lg font-bold text-gray-900 tracking-tight flex-1">Pusat Bantuan</h1>
                <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-gray-500">
                    <span>Butuh bantuan mendesak?</span>
                    <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">021-555-000</span>
                </div>
            </div>

            {/* Search Bar - Full width on mobile, sleek on desktop */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Cari kendala (misal: refund, teknisi telat, garansi)" 
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
            
            {/* 2. SIDEBAR CATEGORIES (Desktop: Vertical List, Mobile: Horizontal Scroll) */}
            <nav className={`
                ${searchQuery ? 'hidden' : 'block'} 
                w-full lg:w-64 shrink-0 overflow-x-auto lg:overflow-visible
                pb-2 lg:pb-0 scrollbar-hide
            `}>
                <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0 lg:sticky lg:top-24">
                    <div className="hidden lg:block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Kategori Bantuan</div>
                    {CATEGORIES.map((cat) => (
                        <button 
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); setOpenAccordion(null); }}
                            className={`
                                flex items-center gap-3 px-3 py-2 lg:py-2.5 rounded-lg text-left transition-all text-sm
                                ${activeCategory === cat.id 
                                    ? 'bg-red-50 text-red-700 font-semibold ring-1 ring-red-100 lg:ring-0' 
                                    : 'bg-white lg:hover:bg-gray-50 text-gray-600 border border-gray-200 lg:border-transparent'
                                }
                            `}
                        >
                            <span className={`shrink-0 ${activeCategory === cat.id ? 'text-red-600' : 'text-gray-400'}`}>
                                {cat.icon}
                            </span>
                            <span className="whitespace-nowrap">{cat.label}</span>
                            {activeCategory === cat.id && <ChevronRight className="w-3.5 h-3.5 ml-auto hidden lg:block" />}
                        </button>
                    ))}
                </div>
            </nav>

            {/* 3. MAIN CONTENT (FAQ List) */}
            <div className="flex-1 min-h-[50vh]">
                {/* Search Result Feedback */}
                {searchQuery && (
                    <div className="mb-4 text-sm text-gray-600">
                        Menampilkan hasil untuk "<span className="font-semibold text-gray-900">{searchQuery}</span>" ({filteredData.length})
                    </div>
                )}

                {/* FAQ Items */}
                <div className="space-y-2">
                    {filteredData.length > 0 ? (
                        filteredData.map((item, idx) => {
                            const isOpen = openAccordion === `faq-${idx}`;
                            return (
                                <div 
                                    key={idx} 
                                    className={`
                                        border rounded-lg bg-white overflow-hidden transition-all duration-200
                                        ${isOpen ? 'border-red-200 shadow-sm' : 'border-gray-100 hover:border-gray-300'}
                                    `}
                                >
                                    <button 
                                        onClick={() => setOpenAccordion(isOpen ? null : `faq-${idx}`)}
                                        className="w-full flex items-start gap-3 p-3 text-left group"
                                    >
                                        <div className={`mt-0.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-red-500' : 'text-gray-400'}`}>
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                        <span className={`text-sm font-medium leading-relaxed ${isOpen ? 'text-red-700' : 'text-gray-800 group-hover:text-gray-900'}`}>
                                            {item.q}
                                        </span>
                                    </button>
                                    
                                    <div 
                                        className={`
                                            transition-all duration-300 ease-in-out overflow-hidden
                                            ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                                        `}
                                    >
                                        <div className="px-3 pl-10 pb-4 pr-4">
                                            <div className="text-xs lg:text-[13px] text-gray-600 leading-relaxed bg-gray-50/80 p-3 rounded-lg border border-gray-100/50">
                                                {item.a}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-900">Tidak ditemukan</p>
                            <p className="text-xs text-gray-500">Coba kata kunci lain atau hubungi CS.</p>
                        </div>
                    )}
                </div>

                {/* CTA Box (Hanya muncul jika tidak searching atau di bawah list) */}
                <div className="mt-8 p-4 lg:p-5 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between gap-4">
                   <div>
                        <h3 className="text-sm font-bold text-gray-900">Jawaban kurang membantu?</h3>
                        <p className="text-xs text-gray-500 mt-1">Tim support kami siap membantu 24/7.</p>
                   </div>
                   <div className="flex gap-2">
                        <button className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors whitespace-nowrap">
                            Buat Tiket
                        </button>
                   </div>
                </div>
            </div>

            {/* 4. CONTACT SIDEBAR (Desktop: Right Sticky, Mobile: Bottom Section) */}
            <div className="lg:w-64 shrink-0">
                <div className="lg:sticky lg:top-24 space-y-3">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:block mb-3">Kontak Langsung</h2>
                    
                    {/* Live Chat Card - High Emphasis */}
                    <div className="p-4 rounded-xl bg-red-600 text-white shadow-lg shadow-red-200 lg:shadow-none">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <MessageCircle className="w-4 h-4 text-white" />
                            </div>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white border border-white/10">
                                ONLINE
                            </span>
                        </div>
                        <h3 className="text-sm font-bold mb-1">Live Chat Support</h3>
                        <p className="text-[11px] text-red-100 leading-snug mb-3">
                            Bicara langsung dengan agen CS kami untuk solusi tercepat.
                        </p>
                        <button className="w-full py-2 bg-white text-red-600 text-xs font-bold rounded-lg shadow-sm hover:bg-red-50 transition-colors">
                            Mulai Chat Sekarang
                        </button>
                    </div>

                    {/* Secondary Contacts */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                        <a href="mailto:support@posko.id" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all bg-white">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-900">Email</span>
                                <span className="text-[10px] text-gray-500">support@posko.id</span>
                            </div>
                        </a>
                        <a href="#" className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all bg-white">
                            <AlertTriangle className="w-4 h-4 text-gray-400" />
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-900">Lapor Pelanggaran</span>
                                <span className="text-[10px] text-gray-500">Privasi & Etika</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </main>
  );
}