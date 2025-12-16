// src/features/profile/components/ProfileTabSection.tsx
'use client';

import { User } from '@/features/auth/types';
import { Provider } from '@/features/providers/types';
import { ServiceItem, TabType } from '@/features/providers/components/types';
// Menggunakan kembali komponen konten dari modul provider untuk menghindari duplikasi kode
import ProviderServicesContent from '@/features/providers/components/ProviderServicesContent';
import ProviderDocumentationContent from '@/features/providers/components/ProviderDocumentationContent';

interface ProfileTabSectionProps {
  user: User;
  provider: Provider | null;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSelectService: (service: ServiceItem) => void;
  onImageClick: (imageUrl: string) => void;
}

export default function ProfileTabSection({
  user,
  provider,
  activeTab,
  onTabChange,
  onSelectService,
  onImageClick,
}: ProfileTabSectionProps) {
  
  const isProvider = !!provider;

  // Jika bukan provider, kita mungkin tidak perlu tab section sama sekali, 
  // atau hanya menampilkan tab 'Tentang'.
  // Untuk saat ini jika user biasa, kita return null agar tampilan bersih,
  // atau Anda bisa menambahkan tab 'Aktivitas' di masa depan.
  if (!isProvider || !provider) {
      return (
          <div className="py-10 text-center text-gray-400 bg-white border-t border-gray-100">
             <p className="text-sm">Tidak ada layanan yang ditampilkan.</p>
          </div>
      );
  }

  // --- LOGIKA PROVIDER ---
  const activeServicesCount = (provider.services as ServiceItem[]).filter((s) => s.isActive).length;
  const portfolioCount = provider.portfolioImages?.length || 0;

  return (
    <div className="relative min-h-[500px]">
      {/* Sticky Tab Header */}
      <div className="sticky top-[60px] lg:top-[68px] z-30 bg-white border-b border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex w-full overflow-x-auto no-scrollbar">
          
          {/* Tab: Layanan */}
          <button
            onClick={() => onTabChange('services')}
            className={`flex-1 min-w-[120px] relative py-3 lg:py-4 flex items-center justify-center gap-2 text-sm font-bold transition-colors ${
              activeTab === 'services' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>Layanan</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
               activeTab === 'services' ? 'bg-gray-100 text-gray-900' : 'bg-gray-50 text-gray-400'
            }`}>
              {activeServicesCount}
            </span>
            
            {activeTab === 'services' && (
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 rounded-t-full"></div>
            )}
          </button>

          {/* Tab: Dokumentasi */}
          <button
            onClick={() => onTabChange('documentation')}
            className={`flex-1 min-w-[120px] relative py-3 lg:py-4 flex items-center justify-center gap-2 text-sm font-bold transition-colors ${
              activeTab === 'documentation' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>Portofolio</span>
            {portfolioCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                 activeTab === 'documentation' ? 'bg-gray-100 text-gray-900' : 'bg-gray-50 text-gray-400'
              }`}>
                {portfolioCount}
              </span>
            )}

            {activeTab === 'documentation' && (
               <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 rounded-t-full"></div>
            )}
          </button>
          
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="bg-white pb-10">
        {activeTab === 'services' && (
           <ProviderServicesContent 
             provider={provider} 
             onSelectService={onSelectService} 
           />
        )}
        {activeTab === 'documentation' && (
           <ProviderDocumentationContent 
             provider={provider} 
             onImageClick={onImageClick} 
           />
        )}
      </div>
    </div>
  );
}