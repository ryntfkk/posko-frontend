// src/features/profile/components/ProfileSidebar.tsx
'use client';

import { Provider } from '@/features/providers/types';
import { User } from '@/features/auth/types';

interface ProfileSidebarProps {
    user: User;
    provider: Provider | null;
}

export default function ProfileSidebar({ user, provider }: ProfileSidebarProps) {
  
  const isProvider = !!provider;

  return (
    <div className="space-y-5 pr-2">
      
      {/* INFO MEMBER - Selalu tampil */}
      <div className="flex gap-3 items-start group">
        <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100">
           <span className="text-sm">👤</span>
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Status Pengguna</h3>
          <p className="text-[11px] leading-relaxed text-gray-600">
             {isProvider ? 'Mitra Terverifikasi Posko' : 'Anggota Komunitas Posko'}
          </p>
        </div>
      </div>

      <div className="h-px bg-gray-100 w-full ml-11"></div>

      {/* Jika Mitra, Tampilkan Jaminan */}
      {isProvider && (
        <>
          <div className="flex gap-3 items-start group">
            <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <span className="text-sm">✨</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Jaminan Posko</h3>
              <p className="text-[11px] leading-relaxed text-gray-600">
                Layanan dilindungi <span className="font-semibold text-gray-900">garansi 7 hari</span> & asuransi. Uang Anda aman hingga pekerjaan tuntas.
              </p>
            </div>
          </div>
          
          <div className="h-px bg-gray-100 w-full ml-11"></div>

          <div className="flex gap-3 items-start group">
            <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100">
              <span className="text-sm">💡</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">Tips Pemesanan</h3>
              <p className="text-[11px] leading-relaxed text-gray-600">
                Pilih tanggal <span className="text-green-600 font-bold">Hijau</span> (Tersedia). Tanggal Merah berarti mitra sedang penuh/libur.
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full ml-11"></div>
        </>
      )}

      {/* Bantuan */}
      <div className="flex gap-3 items-center group cursor-pointer hover:bg-gray-50 -mx-2 p-2 rounded-lg transition-colors">
        <div className="shrink-0 w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
           <span className="text-sm">📞</span>
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-900">Butuh Bantuan?</h3>
          <p className="text-[10px] text-gray-500">Hubungi CS Posko 24/7</p>
        </div>
      </div>
    </div>
  );
}