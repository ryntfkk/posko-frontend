'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  Search, 
  MessageCircle, 
  Wrench, 
  CreditCard, 
  ShieldCheck, 
  UserCircle,
  FileText
} from 'lucide-react';
import Link from 'next/link';

// --- DATA: COMPREHENSIVE FAQ CONTENT ---
const FAQ_DATA = [
  {
    category: "Layanan & Pesanan",
    icon: Wrench,
    items: [
      { q: "Bagaimana alur pemesanan jasa di Posko?", a: "Pilih kategori layanan di beranda > Tentukan lokasi & waktu > Sistem akan mencarikan Mitra terdekat. Anda bisa memantau status mitra secara real-time." },
      { q: "Apakah harga jasa sudah termasuk sparepart?", a: "Tidak. Harga di aplikasi adalah biaya jasa (tenaga kerja). Sparepart dapat dibeli sendiri oleh customer atau dititipkan pembelangkannya ke Mitra (dengan struk resmi)." },
      { q: "Bisakah saya request tukang/mitra spesifik?", a: "Saat ini sistem kami menggunakan algoritma 'Nearest Available' untuk kecepatan. Namun, Anda bisa melihat rating mitra sebelum pekerjaan dimulai." },
      { q: "Bagaimana jika Mitra membatalkan pesanan?", a: "Sistem otomatis mencari pengganti dalam 5 menit. Jika gagal, dana dikembalikan 100% ke saldo/rekening asal (Instant Refund)." },
    ]
  },
  {
    category: "Pembayaran",
    icon: CreditCard,
    items: [
      { q: "Metode pembayaran apa saja yang tersedia?", a: "Kami mendukung Virtual Account (BCA, Mandiri, BRI), E-Wallet (GoPay, OVO, Dana), dan Kartu Kredit/Debit Visa & Mastercard." },
      { q: "Apakah bisa bayar tunai (COD)?", a: "Demi keamanan transaksi dan garansi, seluruh pembayaran wajib dilakukan NON-TUNAI melalui aplikasi sebelum layanan dimulai." },
      { q: "Bagaimana cara mengajukan refund?", a: "Refund otomatis diproses jika pesanan dibatalkan sistem. Untuk kasus lain, ajukan via menu 'Riwayat Pesanan' > 'Bantuan' maksimal 1x24 jam setelah status selesai." },
    ]
  },
  {
    category: "Garansi & Komplain",
    icon: ShieldCheck,
    items: [
      { q: "Apakah layanan Posko bergaransi?", a: "Ya, kami memberikan Garansi Layanan 7-30 hari (tergantung jenis jasa). Garansi mencakup pengerjaan ulang gratis untuk kendala yang sama." },
      { q: "Bagaimana jika hasil kerja Mitra tidak memuaskan?", a: "Jangan selesaikan pesanan di aplikasi. Laporkan via fitur komplain, sertakan foto bukti. Tim QC kami akan memediasi atau mengirim mitra pengganti." },
      { q: "Apa yang membatalkan garansi?", a: "Garansi hangus jika: Customer memanggil mitra di luar aplikasi (bypass), kerusakan akibat bencana alam, atau sparepart yang disediakan customer berkualitas buruk." },
    ]
  },
  {
    category: "Akun & Keamanan",
    icon: UserCircle,
    items: [
      { q: "Bagaimana cara mengubah alamat atau nomor HP?", a: "Masuk ke menu Profil > Edit Profil. Pastikan nomor HP aktif untuk verifikasi OTP saat login." },
      { q: "Apakah data pribadi saya aman?", a: "Sangat aman. Kami menggunakan enkripsi SSL dan tidak membagikan nomor telepon asli Anda ke Mitra (menggunakan fitur Masking Call/Chat)." },
    ]
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("Layanan & Pesanan");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Filter Logic: Combine Category & Search
  const filteredData = useMemo(() => {
    if (searchQuery.length > 2) {
      // Global Search Mode (Ignore tabs)
      return FAQ_DATA.flatMap(cat => cat.items.map(item => ({ ...item, catName: cat.category })))
        .filter(item => 
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    // Tab Mode
    return FAQ_DATA.find(cat => cat.category === activeCategory)?.items || [];
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-10">
      {/* --- HEADER SECTION: Compact & Clean --- */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 lg:py-6">
          <h1 className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight mb-3">
            Pusat Bantuan
          </h1>
          
          {/* Search Input: High Focus */}
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setOpenIndex(null); }}
              placeholder="Cari kendala (cth: garansi, refund)..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* --- CATEGORY TABS (Scrollable on Mobile) --- */}
        {searchQuery.length <= 2 && (
          <div className="max-w-3xl mx-auto px-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 pb-3 lg:pb-4 min-w-max">
              {FAQ_DATA.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.category;
                return (
                  <button
                    key={cat.category}
                    onClick={() => { setActiveCategory(cat.category); setOpenIndex(null); }}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
                      ${isActive 
                        ? 'bg-red-50 border-red-200 text-red-700 shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}
                    `}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-600' : 'text-gray-400'}`} />
                    {cat.category}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        {/* Search Result Header */}
        {searchQuery.length > 2 && (
          <p className="text-xs font-medium text-gray-500 mb-2">
            Hasil pencarian untuk "{searchQuery}" ({filteredData.length})
          </p>
        )}

        {filteredData.length > 0 ? (
          filteredData.map((item: any, idx) => (
            <div 
              key={idx} 
              className="group bg-white rounded-lg border border-gray-200 overflow-hidden transition-all hover:border-red-100 hover:shadow-sm"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex justify-between items-start p-3.5 text-left bg-white"
              >
                <div className="flex flex-col gap-0.5 pr-4">
                  {/* Show category tag in search mode */}
                  {item.catName && (
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-0.5">
                      {item.catName}
                    </span>
                  )}
                  <span className={`text-xs lg:text-sm font-semibold text-gray-800 leading-snug group-hover:text-red-600 transition-colors`}>
                    {item.q}
                  </span>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-300 mt-0.5 ${openIndex === idx ? 'rotate-180 text-red-500' : ''}`} 
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out bg-gray-50/50 ${openIndex === idx ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-3.5 pt-0 text-xs text-gray-600 leading-relaxed border-t border-gray-100 border-dashed mt-1">
                  {item.a}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">Tidak ditemukan</p>
            <p className="text-xs text-gray-500">Coba kata kunci lain atau hubungi admin.</p>
          </div>
        )}

        {/* --- COMPACT BOTTOM CTA --- */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Butuh bantuan lanjut?</p>
              <p className="text-[10px] text-gray-500">CS kami siap membantu 24/7</p>
            </div>
          </div>
          <Link 
            href="/chat" // Asumsi ada route chat
            className="bg-gray-900 hover:bg-gray-800 text-white text-[10px] lg:text-xs font-semibold px-4 py-2 rounded-md transition-colors"
          >
            Chat Admin
          </Link>
        </div>
      </div>
    </div>
  );
}