// src/features/providers/components/ProviderStickyBottomCTA.tsx

import Link from 'next/link';
import { Provider } from '../types';
import { ServiceItem } from './types';
import { formatCurrency } from './utils';
import { ArrowRightIcon } from './Icons';

interface ProviderStickyBottomCTAProps {
  provider: Provider;
}

export default function ProviderStickyBottomCTA({ provider }: ProviderStickyBottomCTAProps) {
  const activeServices = (provider.services as ServiceItem[]).filter((s) => s.isActive);
  const minPrice = activeServices.length > 0 ? Math.min(...activeServices.map((s) => s.price)) : 0;

  return (
    // POSITIONING: Fixed di bawah (bottom-0) untuk Mobile.
    // NOTE: Jika BottomNav Anda menutupi ini, ubah 'bottom-0' menjadi 'bottom-16' (64px).
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      
      {/* Glassmorphism Container */}
      <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex items-center gap-4">
          
          {/* Price Section: Clean & Vertical */}
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
              Mulai dari
            </span>
            <span className="text-lg font-black text-gray-900 leading-none truncate">
              {activeServices.length > 0 ? formatCurrency(minPrice) : 'Hubungi CS'}
            </span>
          </div>

          {/* Action Button: Pill Shape, Gradient/Solid Red */}
          <Link
            href={`/checkout?type=direct&providerId=${provider._id}`}
            className="group flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white pl-5 pr-4 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-red-100 transition-all active:scale-95"
          >
            <span>Pesan Jasa</span>
            <div className="bg-white/20 rounded-full p-1 group-hover:bg-white/30 transition-colors">
               <ArrowRightIcon className="w-3.5 h-3.5 text-white" />
            </div>
          </Link>
          
        </div>
      </div>
    </div>
  );
}