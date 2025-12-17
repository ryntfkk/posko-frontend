import React from 'react';
import Link from 'next/link';

// --- Types & Data Mock ---
// Dalam production, ini bisa diambil dari API/CMS
type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  isHot?: boolean;
};

const OPENINGS: Job[] = [
  { id: '1', title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Surabaya (Hybrid)', type: 'Full-time', isHot: true },
  { id: '2', title: 'Product Designer (UI/UX)', department: 'Design', location: 'Remote', type: 'Full-time', isHot: true },
  { id: '3', title: 'Backend Developer (Go)', department: 'Engineering', location: 'Surabaya', type: 'Full-time' },
  { id: '4', title: 'Marketing Specialist', department: 'Marketing', location: 'Jakarta', type: 'Contract' },
  { id: '5', title: 'Customer Success Lead', department: 'Operations', location: 'Surabaya', type: 'Full-time' },
  { id: '6', title: 'Data Analyst', department: 'Data', location: 'Remote', type: 'Full-time' },
];

const BENEFITS = [
  { title: 'Competitive Salary', desc: 'Gaji di atas rata-rata pasar.' },
  { title: 'Remote Friendly', desc: 'Bekerja dari mana saja untuk role tertentu.' },
  { title: 'Health Insurance', desc: 'BPJS dan asuransi swasta premium.' },
  { title: 'Learning Budget', desc: 'Tunjangan tahunan untuk kursus & buku.' },
];

// --- Icons (Inline SVG for Zero Dependency) ---
const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);
const MapPinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
);
const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const FilterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
);

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* 1. Header Section: Compact & Clean */}
      <header className="border-b border-gray-100 bg-white pt-8 pb-6 lg:pt-12 lg:pb-8">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2">
                Bergabung Bersama Kami
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                Karir di Posko
              </h1>
              <p className="mt-2 text-sm text-gray-500 max-w-2xl leading-relaxed">
                Bantu kami merevolusi cara orang menemukan jasa rumah tangga. 
                Kami mencari talenta terbaik yang menyukai tantangan dan *high-density interfaces*.
              </p>
            </div>
            {/* Desktop Action (Hidden on mobile to save space) */}
            <div className="hidden md:block">
               <Link href="#openings" className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors">
                  Lihat Lowongan <ArrowRightIcon className="w-4 h-4" />
               </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Values / Culture: Grid Compact */}
      <section className="bg-gray-50 py-8 border-b border-gray-100">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
              {BENEFITS.map((item, idx) => (
                <div key={idx} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm hover:border-red-100 transition-colors">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-snug">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* 3. Job Listings: High Density List */}
      <section id="openings" className="py-8 lg:py-12">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          
          {/* Controls / Filter Bar */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Open Positions ({OPENINGS.length})</h2>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              <FilterIcon className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>

          {/* Table-like List for High Density */}
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            {/* Table Header (Visible on Desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50/50 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-5">Role</div>
              <div className="col-span-3">Department</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            <div className="divide-y divide-gray-100">
              {OPENINGS.map((job) => (
                <Link 
                  href={`/careers/${job.id}`} 
                  key={job.id} 
                  className="group block hover:bg-red-50/30 transition-colors"
                >
                  <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center px-4 py-3 sm:px-6">
                    
                    {/* Role / Title (Mobile & Desktop) */}
                    <div className="col-span-5 mb-2 md:mb-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                          {job.title}
                        </span>
                        {job.isHot && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 uppercase tracking-wide">
                            Hot
                          </span>
                        )}
                      </div>
                      {/* Mobile Only Meta */}
                      <div className="md:hidden flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3" />
                          {job.location}
                        </span>
                      </div>
                    </div>

                    {/* Department (Desktop) */}
                    <div className="hidden md:block col-span-3">
                      <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        {job.department}
                      </span>
                    </div>

                    {/* Location & Type (Desktop) */}
                    <div className="hidden md:block col-span-2 text-xs text-gray-500">
                       <div className="flex flex-col">
                         <span className="font-medium text-gray-700">{job.location}</span>
                         <span className="text-[11px]">{job.type}</span>
                       </div>
                    </div>

                    {/* Action Arrow (Desktop & Mobile aligned right) */}
                    <div className="col-span-2 flex justify-end items-center absolute right-4 top-1/2 -translate-y-1/2 md:static md:translate-y-0">
                       <span className="hidden md:inline-block text-xs font-medium text-red-600 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">Apply</span>
                       <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-red-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="mt-6 text-center">
             <p className="text-xs text-gray-400">
                Posko Indonesia berhak menolak lamaran yang tidak sesuai kualifikasi tanpa pemberitahuan.
             </p>
          </div>

        </div>
      </section>

      {/* 4. Bottom CTA (Internal Hiring Focus) */}
      <section className="border-t border-gray-100 py-10 bg-gray-50">
        <div className="mx-auto max-w-lg text-center px-4">
           <h3 className="text-sm font-bold text-gray-900 mb-2">Bukan mencari pekerjaan korporat?</h3>
           <p className="text-xs text-gray-500 mb-4">
             Jika Anda ingin mendaftar sebagai penyedia jasa (Mitra Posko), silakan kunjungi halaman kemitraan kami.
           </p>
           <Link 
             href="/" 
             className="inline-flex items-center justify-center rounded border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
           >
             Daftar Sebagai Mitra
           </Link>
        </div>
      </section>
    </div>
  );
}