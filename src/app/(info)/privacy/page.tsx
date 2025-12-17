import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, Server, Globe, Bell, CreditCard, Mail } from 'lucide-react';

export const metadata = {
  title: 'Kebijakan Privasi | Posko',
  description: 'Kebijakan privasi mengenai bagaimana Posko mengumpulkan, menggunakan, dan melindungi data Anda.',
};

export default function PrivacyPage() {
  const lastUpdated = "18 Desember 2025";

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* 1. COMPACT HEADER */}
      {/* Menggunakan padding vertikal kecil (py-8) agar tidak membuang ruang di atas */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Kebijakan Privasi
          </h1>
          <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            Terakhir diperbarui: {lastUpdated}
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 2. RESPONSIVE SIDEBAR (Desktop Only) */}
          {/* Sticky navigation untuk memanfaatkan lebar layar desktop */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-3">
            <div className="sticky top-24 space-y-1">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Daftar Isi
              </p>
              <nav className="space-y-0.5">
                {[
                  "Pendahuluan",
                  "Data yang Kami Kumpulkan",
                  "Penggunaan Data",
                  "Berbagi Informasi",
                  "Keamanan Data",
                  "Hak Pengguna",
                  "Cookie & Pelacakan",
                  "Hubungi Kami"
                ].map((item, idx) => (
                  <a 
                    key={idx} 
                    href={`#section-${idx + 1}`} 
                    className="block px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-red-600 transition-colors duration-200"
                  >
                    {item}
                  </a>
                ))}
              </nav>
              
              {/* Quick Contact Card - High Density */}
              <div className="mt-8 p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                <h4 className="text-xs font-bold text-gray-900 uppercase mb-2">Butuh Bantuan?</h4>
                <p className="text-xs text-gray-600 mb-3">Tim privasi kami siap membantu pertanyaan Anda.</p>
                <Link 
                  href="/contact" 
                  className="block w-full text-center px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
                >
                  Hubungi DPO
                </Link>
              </div>
            </div>
          </aside>

          {/* 3. MAIN CONTENT (Information Density Focused) */}
          {/* Menggunakan text-sm untuk body agar informasi padat namun terbaca */}
          <div className="lg:col-span-9 xl:col-span-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-5 sm:p-8 space-y-8 divide-y divide-gray-100">

              {/* SECTION 1: Pendahuluan */}
              <section id="section-1" className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-gray-900">1. Pendahuluan</h2>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                  <p>
                    PT Posko Solusi Indonesia ("Posko", "kami", "kita") menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan mengungkapkan informasi Anda ketika Anda menggunakan layanan marketplace jasa kami, termasuk situs web dan aplikasi mobile ("Platform").
                  </p>
                  <p>
                    Dengan mengakses atau menggunakan Platform Posko, Anda menyetujui praktik yang dijelaskan dalam Kebijakan ini.
                  </p>
                </div>
              </section>

              {/* SECTION 2: Data Collection */}
              <section id="section-2" className="pt-8 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <DatabaseIcon className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-gray-900">2. Data yang Kami Kumpulkan</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card style yang compact untuk list data */}
                  <InfoCard title="Informasi Identitas" icon={<UserIcon className="w-4 h-4"/>}>
                    Nama lengkap, alamat email, nomor telepon, dan foto profil yang Anda berikan saat pendaftaran.
                  </InfoCard>
                  <InfoCard title="Data Lokasi & Properti" icon={<MapPinIcon className="w-4 h-4"/>}>
                    Alamat lengkap pengerjaan layanan, koordinat GPS (untuk teknisi), dan detail properti (rumah/kantor) untuk keperluan layanan.
                  </InfoCard>
                  <InfoCard title="Informasi Pembayaran" icon={<CreditCard className="w-4 h-4"/>}>
                    Riwayat transaksi, metode pembayaran, dan detail tagihan. Kami tidak menyimpan nomor kartu kredit/debit secara penuh (ditangani oleh Payment Gateway).
                  </InfoCard>
                  <InfoCard title="Data Teknis" icon={<Server className="w-4 h-4"/>}>
                    Alamat IP, tipe perangkat, sistem operasi, dan log aktivitas saat menggunakan aplikasi.
                  </InfoCard>
                </div>
              </section>

              {/* SECTION 3: Usage */}
              <section id="section-3" className="pt-8 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-gray-900">3. Penggunaan Data</h2>
                </div>
                <p className="text-sm text-gray-600">Kami menggunakan informasi Anda untuk tujuan berikut:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 list-disc pl-5">
                  <li>Memproses dan mengelola pesanan layanan Anda.</li>
                  <li>Menghubungkan Anda dengan Mitra Teknisi di area Anda.</li>
                  <li>Memproses pembayaran dan mencegah penipuan.</li>
                  <li>Mengirimkan notifikasi terkait status pesanan.</li>
                  <li>Meningkatkan kualitas layanan dan UI/UX aplikasi.</li>
                  <li>Menangani keluhan dan dukungan pelanggan (CS).</li>
                </ul>
              </section>

              {/* SECTION 4: Sharing */}
              <section id="section-4" className="pt-8 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-gray-900">4. Berbagi Informasi</h2>
                </div>
                <div className="text-sm text-gray-600 space-y-3">
                  <p>Kami tidak menjual data pribadi Anda. Namun, kami membagikan data dalam situasi berikut:</p>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <div className="shrink-0 w-1 bg-red-100 rounded-full h-auto"></div>
                      <div>
                        <strong className="block text-gray-900 text-xs uppercase tracking-wide">Mitra Penyedia Jasa (Teknisi)</strong>
                        <span className="leading-snug">Nama dan alamat lokasi layanan akan diberikan kepada teknisi HANYA setelah Anda melakukan pemesanan, agar mereka dapat menuju lokasi Anda.</span>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="shrink-0 w-1 bg-red-100 rounded-full h-auto"></div>
                      <div>
                        <strong className="block text-gray-900 text-xs uppercase tracking-wide">Pihak Ketiga & Integrasi</strong>
                        <span className="leading-snug">Layanan Payment Gateway (Midtrans/Xendit) untuk memproses pembayaran, dan layanan peta (Google Maps) untuk lokasi.</span>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="shrink-0 w-1 bg-red-100 rounded-full h-auto"></div>
                      <div>
                        <strong className="block text-gray-900 text-xs uppercase tracking-wide">Hukum</strong>
                        <span className="leading-snug">Jika diwajibkan oleh hukum atau permintaan resmi dari penegak hukum di Indonesia.</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </section>

              {/* SECTION 5: Security */}
              <section id="section-5" className="pt-8 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-gray-900">5. Keamanan Data</h2>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-md p-4 text-sm text-gray-600">
                  <p>
                    Kami menerapkan langkah-langkah keamanan teknis dan organisasional yang sesuai standar industri (seperti enkripsi SSL/TLS) untuk melindungi data Anda. Namun, harap diingat bahwa tidak ada metode transmisi melalui internet yang 100% aman. Kami menyarankan Anda untuk menjaga kerahasiaan kata sandi akun Posko Anda.
                  </p>
                </div>
              </section>

               {/* SECTION 6: User Rights */}
               <section id="section-6" className="pt-8 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-gray-900">6. Hak Pengguna</h2>
                </div>
                <p className="text-sm text-gray-600 mb-3">Sesuai peraturan perundang-undangan yang berlaku, Anda memiliki hak untuk:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border border-gray-200 p-3 rounded hover:border-red-200 transition-colors">
                    <h3 className="text-xs font-bold text-gray-900 uppercase mb-1">Akses & Koreksi</h3>
                    <p className="text-xs text-gray-500">Melihat dan mengubah data profil melalui menu Pengaturan.</p>
                  </div>
                  <div className="border border-gray-200 p-3 rounded hover:border-red-200 transition-colors">
                    <h3 className="text-xs font-bold text-gray-900 uppercase mb-1">Penghapusan</h3>
                    <p className="text-xs text-gray-500">Meminta penghapusan akun dan data terkait (Right to be Forgotten).</p>
                  </div>
                  <div className="border border-gray-200 p-3 rounded hover:border-red-200 transition-colors">
                    <h3 className="text-xs font-bold text-gray-900 uppercase mb-1">Opt-Out</h3>
                    <p className="text-xs text-gray-500">Berhenti berlangganan email marketing atau notifikasi promosi.</p>
                  </div>
                </div>
              </section>

              {/* SECTION 7: Contact */}
              <section id="section-8" className="pt-8 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-gray-900">Hubungi Kami</h2>
                </div>
                <p className="text-sm text-gray-600">
                  Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi Data Protection Officer (DPO) kami melalui:
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                   <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-100 flex-1">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 text-red-600">
                        <Mail size={14} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">privacy@posko.id</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-100 flex-1">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-200 text-red-600">
                        <MapPinIcon size={14} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Kantor Pusat</p>
                        <p className="text-sm font-medium text-gray-900">Surabaya, Jawa Timur</p>
                      </div>
                   </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -- Helper Components for Clean UI --

function InfoCard({ title, children, icon }: { title: string, children: React.ReactNode, icon: React.ReactNode }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
      <div className="flex items-center gap-2 mb-2 text-gray-900">
        <div className="text-red-600">{icon}</div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed text-justify">
        {children}
      </p>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  );
}

function DatabaseIcon({ className }: { className?: string }) {
    return (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
    );
}