'use client';
import { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';

const FAQS = [
  { q: "Bagaimana cara memesan layanan?", a: "Pilih kategori layanan di beranda, tentukan lokasi dan waktu, lalu pilih Mitra yang tersedia." },
  { q: "Apakah harga sudah termasuk sparepart?", a: "Belum. Harga di aplikasi adalah biaya jasa dasar. Sparepart dibeli terpisah atau disediakan customer." },
  { q: "Bagaimana jika Mitra membatalkan sepihak?", a: "Sistem akan otomatis mencarikan pengganti. Jika gagal, dana dikembalikan 100%." },
  { q: "Metode pembayaran apa yang tersedia?", a: "Saat ini kami mendukung Transfer Bank (VA), E-Wallet (GoPay/OVO), dan Kartu Kredit." },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-8 py-6">
      {/* Search Bar Kecil */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Cari kendala..." 
          className="w-full bg-gray-50 border-none rounded-lg py-2.5 pl-10 pr-4 text-xs font-medium focus:ring-1 focus:ring-red-500 placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        {FAQS.map((item, idx) => (
          <div key={idx} className="border border-gray-100 rounded-lg overflow-hidden bg-white">
            <button 
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-xs font-bold text-gray-800 pr-4">{item.q}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${openIndex === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 pt-0 text-xs text-gray-500 leading-relaxed border-t border-gray-50 border-dashed mt-1">
                {item.a}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* CTA Box */}
      <div className="mt-8 p-4 bg-red-50 rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-600 shadow-sm">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-900">Masih butuh bantuan?</p>
          <p className="text-[10px] text-gray-500">Tim CS kami online 24/7 untukmu.</p>
        </div>
        <button className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">Chat Admin</button>
      </div>
    </div>
  );
}