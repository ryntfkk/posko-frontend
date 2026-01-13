// src/app/(info)/terms/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  Scale,
  AlertCircle,
  FileText,
  ShieldCheck,
  Clock,
  CreditCard,
  Siren,        // Icon baru untuk CSAE
  Users         // Icon baru untuk UGC
} from 'lucide-react';

// --- CONTENT DATA (Structured for density) ---
const TERMS_SECTIONS = [
  {
    id: 'intro',
    title: 'Pendahuluan',
    icon: <FileText className="w-3.5 h-3.5" />,
    content: (
      <>
        <p>Selamat datang di Aplikasi Posko. Syarat dan Ketentuan ini adalah perjanjian yang mengikat antara Pengguna ("Anda") dan PT Posko Solusi Indonesia ("Kami").</p>
        <p className="mt-2">Dengan mendaftar, mengakses, atau menggunakan layanan Posko, Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui seluruh isi Syarat dan Ketentuan ini.</p>
      </>
    )
  },
  {
    id: 'definitions',
    title: 'Definisi',
    icon: <Scale className="w-3.5 h-3.5" />,
    content: (
      <ul className="list-disc pl-4 space-y-1 marker:text-gray-400">
        <li><strong>Aplikasi:</strong> Perangkat lunak Posko yang menghubungkan Pengguna dengan Penyedia Jasa.</li>
        <li><strong>Mitra/Teknisi:</strong> Pihak ketiga penyedia jasa yang terdaftar dan diverifikasi oleh Posko.</li>
        <li><strong>Pengguna:</strong> Pihak yang mengajukan permintaan layanan melalui Aplikasi.</li>
        <li><strong>Layanan:</strong> Jasa perbaikan, pembersihan, atau perawatan yang disediakan oleh Mitra.</li>
      </ul>
    )
  },
  {
    id: 'csae',
    title: 'Perlindungan Anak (CSAE)',
    icon: <Siren className="w-3.5 h-3.5 text-red-600" />, // Highlight icon merah
    content: (
      <div className="space-y-3">
        <div className="p-3 bg-red-50 border border-red-100 rounded text-red-900 text-xs font-medium">
          <strong>ZERO TOLERANCE POLICY:</strong> Posko menerapkan kebijakan toleransi nol terhadap segala bentuk Kekerasan dan Eksploitasi Seksual Anak.
        </div>
        <p>
          Kami melarang keras penggunaan layanan kami untuk memposting, membagikan, atau memfasilitasi konten yang berkaitan dengan Pelecehan Seksual dan Eksploitasi terhadap Anak (Child Sexual Abuse and Exploitation / CSAE).
        </p>
        <p>Tindakan yang dilarang keras mencakup, namun tidak terbatas pada:</p>
        <ul className="list-disc pl-4 space-y-1 marker:text-red-500">
          <li><strong>Grooming (Pembujuk-rayuan):</strong> Upaya membangun kepercayaan dengan anak untuk tujuan eksploitasi seksual.</li>
          <li><strong>Sextortion (Pemerasan Seksual):</strong> Mengancam untuk menyebarkan konten seksual anak guna memeras korban.</li>
          <li><strong>Perdagangan Anak:</strong> Perdagangan anak untuk tujuan seksual atau kerja paksa.</li>
          <li><strong>Konten Eksploitatif:</strong> Menyimpan, mendistribusikan, atau memproduksi materi pelecehan seksual anak (CSAM).</li>
        </ul>
        <p className="text-xs text-gray-500 italic mt-2">
          Setiap pelanggaran terkait CSAE akan kami laporkan langsung ke <strong>NCMEC (National Center for Missing & Exploited Children)</strong> dan Penegak Hukum setempat (Kepolisian). Akun akan diblokir permanen tanpa peringatan.
        </p>
      </div>
    )
  },
  {
    id: 'ugc',
    title: 'Pedoman Konten & Moderasi',
    icon: <Users className="w-3.5 h-3.5" />,
    content: (
      <>
        <p>
          Mengingat fitur chat dan interaksi dalam aplikasi, Pengguna wajib mematuhi standar komunitas (UGC Policy). Kami berhak menghapus konten dan menangguhkan akun yang melanggar:
        </p>
        <ol className="list-decimal pl-4 mt-2 space-y-1.5 marker:text-gray-500">
          <li>
            <strong>Ujaran Kebencian:</strong> Konten yang mempromosikan kekerasan atau diskriminasi berdasarkan ras, agama, disabilitas, usia, orientasi seksual, atau identitas gender.
          </li>
          <li>
            <strong>Pelecehan & Intimidasi:</strong> Tindakan bullying, doxing, atau pengancaman terhadap Mitra maupun pengguna lain.
          </li>
          <li>
            <strong>Aktivitas Ilegal:</strong> Promosi perjudian, obat-obatan terlarang, atau tindakan kriminal lainnya.
          </li>
        </ol>
        <div className="mt-3 p-2.5 bg-gray-50 rounded border border-gray-100 text-xs">
          <span className="font-bold text-gray-800">Mekanisme Pelaporan:</span> Pengguna dapat melaporkan pelanggaran melalui fitur "Report" di dalam chat atau menghubungi support. Tim kami akan meninjau laporan dalam waktu 24 jam.
        </div>
      </>
    )
  },
  {
    id: 'orders',
    title: 'Pemesanan & Pembatalan',
    icon: <Clock className="w-3.5 h-3.5" />,
    content: (
      <>
        <p>Prosedur pemesanan dan kebijakan pembatalan diatur demi kenyamanan bersama:</p>
        <ul className="mt-2 space-y-2 border-l-2 border-red-100 pl-3">
          <li>
            <strong className="text-gray-900 block text-xs uppercase tracking-wide">Estimasi Kedatangan</strong>
            Mitra memiliki toleransi keterlambatan hingga 15 menit dari jadwal yang ditentukan akibat kondisi lalu lintas.
          </li>
          <li>
            <strong className="text-gray-900 block text-xs uppercase tracking-wide">Biaya Pembatalan</strong>
            Pembatalan gratis jika status masih "Menunggu Konfirmasi". Jika Mitra sudah dalam perjalanan, dikenakan biaya kompensasi sebesar <strong>Rp15.000</strong>.
          </li>
        </ul>
      </>
    )
  },
  {
    id: 'payment',
    title: 'Harga & Pembayaran',
    icon: <CreditCard className="w-3.5 h-3.5" />,
    content: (
      <>
        <p>Harga yang tertera di aplikasi adalah estimasi awal. Harga final dapat berubah jika terdapat:</p>
        <ol className="list-decimal pl-4 mt-1 space-y-0.5 marker:text-gray-500">
          <li>Penambahan *sparepart* atau material.</li>
          <li>Tingkat kesulitan atau kerusakan yang lebih parah dari deskripsi awal.</li>
          <li>Layanan tambahan yang diminta di tempat.</li>
        </ol>
        <p className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded text-yellow-800 text-xs font-medium">
          Penting: Seluruh pembayaran wajib dilakukan melalui Aplikasi (Cashless/VA/CC). Posko tidak bertanggung jawab atas transaksi tunai di luar aplikasi.
        </p>
      </>
    )
  },
  {
    id: 'guarantee',
    title: 'Garansi Layanan',
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    content: (
      <>
        <p>Kami memberikan perlindungan garansi layanan dengan ketentuan:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
            <div className="font-bold text-gray-900 mb-0.5">Masa Garansi</div>
            <div className="text-gray-600">14 Hari Kalender setelah status pesanan "Selesai".</div>
          </div>
          <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
            <div className="font-bold text-gray-900 mb-0.5">Cakupan</div>
            <div className="text-gray-600">Kerusakan yang sama pada unit yang sama. Bukan kerusakan baru.</div>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500 italic">Klaim garansi wajib menyertakan bukti foto/video sebelum dan sesudah pengerjaan.</p>
      </>
    )
  },
  {
    id: 'prohibitions',
    title: 'Larangan Lainnya',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    content: (
      <p>
        Pengguna dilarang keras untuk: (a) Melakukan transaksi di luar aplikasi dengan Mitra Posko (Bypassing);
        (b) Mencoba meretas, memodifikasi, atau mengakses source code aplikasi;
        (c) Menggunakan akun palsu atau identitas orang lain.
      </p>
    )
  }
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('intro');

  // Simple scrollspy logic
  useEffect(() => {
    const handleScroll = () => {
      const sections = TERMS_SECTIONS.map(s => document.getElementById(s.id));
      const scrollPosition = window.scrollY + 120; // Offset for header

      for (const section of sections) {
        if (section && section.offsetTop <= scrollPosition && (section.offsetTop + section.offsetHeight) > scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">

      {/* 1. COMPACT HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="p-1.5 -ml-2 hover:bg-gray-50 rounded-full transition-colors lg:hidden">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>

          <div className="flex-1">
            <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-0.5">
              <span>Info</span>
              <ChevronRight className="w-3 h-3" />
              <span>Legal</span>
            </div>
            <h1 className="text-sm lg:text-base font-bold text-gray-900 leading-none">Syarat & Ketentuan</h1>
          </div>

          <div className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded border border-gray-100">
            Update: Des 2024
          </div>
        </div>

        {/* MOBILE HORIZONTAL NAV (Sticky under header) */}
        <div className="lg:hidden w-full overflow-x-auto border-b border-gray-100 bg-white no-scrollbar">
          <div className="flex px-4 py-0 gap-4 min-w-max">
            {TERMS_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`
                  py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap
                  ${activeSection === section.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'}
                `}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* 2. DESKTOP SIDEBAR (Sticky Table of Contents) */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Daftar Isi</h3>
              <nav className="space-y-0.5">
                {TERMS_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5
                      ${activeSection === section.id
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <span className={`shrink-0 ${activeSection === section.id ? 'text-red-500' : 'text-gray-400'}`}>
                      {section.icon}
                    </span>
                    {section.title}
                  </button>
                ))}
              </nav>

              <div className="mt-8 px-3 py-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-500 leading-tight mb-2">
                  Membutuhkan bantuan terkait pasal tertentu?
                </p>
                <Link href="/help" className="text-[11px] font-bold text-red-600 hover:underline">
                  Hubungi Legal Support &rarr;
                </Link>
              </div>
            </div>
          </aside>

          {/* 3. CONTENT AREA (High Density Text) */}
          <article className="flex-1 max-w-3xl">
            <div className="space-y-8 lg:space-y-10">
              {TERMS_SECTIONS.map((section, idx) => (
                <section key={section.id} id={section.id} className="scroll-mt-28 lg:scroll-mt-24">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded bg-gray-100 text-[10px] font-bold text-gray-500">
                      {idx + 1}
                    </span>
                    <h2 className="text-sm lg:text-base font-bold text-gray-900">{section.title}</h2>
                  </div>

                  <div className="text-[13px] lg:text-sm text-gray-600 leading-relaxed lg:leading-7 space-y-3 pl-7">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>

            {/* Footer Closure */}
            <div className="mt-12 pt-6 border-t border-gray-100 pl-7">
              <p className="text-[11px] text-gray-400 leading-relaxed text-justify">
                Posko berhak untuk mengubah, memodifikasi, menambah, atau menghapus bagian dari Syarat dan Ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Pengguna disarankan untuk memeriksa halaman ini secara berkala. Penggunaan layanan yang berkelanjutan setelah perubahan dianggap sebagai persetujuan terhadap perubahan tersebut.
              </p>
            </div>
          </article>

        </div>
      </div>
    </main>
  );
}