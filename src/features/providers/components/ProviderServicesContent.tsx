// src/features/providers/components/ProviderServicesContent.tsx

import Link from 'next/link';
import { Provider } from '../types';
import { ServiceItem } from './types';
import { formatCurrency, formatDuration } from './utils';
import { ServiceIcon } from './Icons';
import { getUnitLabel } from '@/features/services/types';

interface ProviderServicesContentProps {
  provider: Provider;
  onSelectService: (service: ServiceItem) => void;
}

export default function ProviderServicesContent({ provider, onSelectService }: ProviderServicesContentProps) {
  const activeServices = (provider.services as ServiceItem[]).filter((s) => s.isActive);

  if (activeServices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
          <ServiceIcon className="w-5 h-5 text-gray-400"/>
        </div>
        <p className="text-gray-500 text-xs">Belum ada layanan aktif.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {activeServices.map((item, index) => {
        const service = item.serviceId;
        const unitDisplay = service.displayUnit || service.unitLabel || getUnitLabel((service.unit as any) || 'unit');
        const durationText = formatDuration(service.estimatedDuration);
        
        // Cek apakah item terakhir untuk menghilangkan border bottom
        const isLast = index === activeServices.length - 1;

        return (
          <div
            key={service._id}
            // LIST ITEM: Full width, border bottom halus, hover effect
            className={`group relative flex items-start gap-3 py-4 px-4 lg:px-0 transition-colors hover:bg-gray-50 cursor-pointer ${
                !isLast ? 'border-b border-gray-100' : ''
            }`}
            onClick={() => onSelectService(item)} // Klik seluruh baris membuka detail
          >
            
            {/* 1. Left Icon: Compact & Clean */}
            <div className="shrink-0 pt-1">
               <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 overflow-hidden">
                 <img 
                    src={service.iconUrl || '/file.svg'} 
                    alt={service.name} 
                    className="w-10 h-10 lg:w-6 lg:h-6 object-contain opacity-80 group-hover:scale-110 transition-transform" 
                 />
               </div>
            </div>

            {/* 2. Main Content */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex justify-between items-start gap-2">
                 {/* Judul Layanan */}
                 <h4 className="font-bold text-gray-900 text-sm lg:text-base leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                    {service.name}
                 </h4>
                 
                 {/* Harga (Dipindah ke atas sejajar judul untuk efisiensi di mobile) */}
                 <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900 text-sm lg:text-base whitespace-nowrap">
                       {formatCurrency(item.price)}
                    </p>
                 </div>
              </div>

              {/* Deskripsi Singkat */}
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed max-w-[90%]">
                 {service.shortDescription || 'Layanan profesional dengan jaminan kualitas.'}
              </p>

              {/* [UPDATE] Call to Action Text */}
              <p className="text-[10px] font-medium text-blue-600 mt-1">
                 Lihat detail lengkap &gt;
              </p>

              {/* Meta Info Row: Duration, Unit, Promo */}
              <div className="flex items-center flex-wrap gap-2 mt-2">
                 
                 {/* Unit Badge */}
                 <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase tracking-wide">
                    / {unitDisplay}
                 </span>

                 {/* Duration Badge */}
                 {durationText && (
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                       • {durationText}
                    </span>
                 )}

                 {/* Promo Badge */}
                 {service.isPromo && service.discountPercent && service.discountPercent > 0 && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-sm border border-red-100">
                       Diskon {service.discountPercent}%
                    </span>
                 )}
              </div>
            </div>

            {/* 3. Button "Add" (Optional / Shortcut) */}
            <div className="self-center shrink-0 pl-1" onClick={(e) => e.stopPropagation()}>
               <Link
                 href={`/checkout?type=direct&providerId=${provider._id}`}
                 className="flex items-center justify-center w-8 h-8 rounded-full border border-red-600 text-red-600 bg-white hover:bg-red-600 hover:text-white transition-all active:scale-90 shadow-sm"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                   <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                 </svg>
               </Link>
            </div>

          </div>
        );
      })}
    </div>
  );
}