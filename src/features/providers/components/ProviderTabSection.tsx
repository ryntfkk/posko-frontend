// src/features/providers/components/ProviderTabSection.tsx

import { Provider } from '../types';
import { ServiceItem, TabType } from './types';
import ProviderServicesContent from './ProviderServicesContent';
import ProviderDocumentationContent from './ProviderDocumentationContent';

interface ProviderTabSectionProps {
  provider: Provider;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSelectService: (service: ServiceItem) => void;
  onImageClick: (imageUrl: string) => void;
}

export default function ProviderTabSection({
  provider,
  activeTab,
  onTabChange,
  onSelectService,
  onImageClick,
}: ProviderTabSectionProps) {
  const activeServicesCount = (provider.services as ServiceItem[]).filter((s) => s.isActive).length;
  const portfolioCount = provider.portfolioImages?.length || 0;

  return (
    <div className="relative min-h-[500px]">
      {/* Sticky Tab Header */}
      {/* Top disesuaikan dengan tinggi header utama (~60px) agar menempel pas di bawahnya */}
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
            
            {/* Active Indicator Line */}
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

            {/* Active Indicator Line */}
            {activeTab === 'documentation' && (
               <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 rounded-t-full"></div>
            )}
          </button>
          
        </div>
      </div>

      {/* Tab Content Area */}
      {/* Padding container dihapus agar list bisa full-width */}
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