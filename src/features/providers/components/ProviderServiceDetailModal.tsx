// src/features/providers/components/ProviderServiceDetailModal.tsx

import Link from 'next/link';
import { Provider } from '../types';
import { ServiceItem } from './types';
import { formatCurrency, formatDuration } from './utils';
import { CloseIcon, ClockIcon, CheckIcon, XIcon } from './Icons';
import { getUnitLabel } from '@/features/services/types';

interface ProviderServiceDetailModalProps {
  provider: Provider;
  selectedService: ServiceItem | null;
  onClose: () => void;
}

export default function ProviderServiceDetailModal({
  provider,
  selectedService,
  onClose,
}: ProviderServiceDetailModalProps) {
  if (!selectedService) return null;

  const service = selectedService.serviceId;
  const unitDisplay = service.displayUnit || service.unitLabel || getUnitLabel((service.unit as any) || 'unit');
  const durationText = formatDuration(service.estimatedDuration);

  return (
    // BACKDROP: Darker & Blur
    <div
      className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* CONTAINER: Bottom Sheet di Mobile (rounded-t-2xl), Modal Center di Desktop */}
      <div
        className="bg-white w-full lg:max-w-md lg:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] lg:max-h-[85vh] animate-slide-up lg:animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER: Sticky & Minimalist */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 shrink-0">
          <div className="pr-4">
            {/* Tags Row */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                {service.category}
              </span>
              {service.isPromo && service.discountPercent && service.discountPercent > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold uppercase tracking-wider">
                  Hemat {service.discountPercent}%
                </span>
              )}
            </div>
            <h3 className="font-bold text-xl text-gray-900 leading-tight">{service.name}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto p-5 space-y-6">

          {/* Section: Price & Estimate */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Harga Layanan</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900">{formatCurrency(selectedService.price)}</span>
                <span className="text-xs text-gray-400 font-medium">/ {unitDisplay}</span>
              </div>
            </div>

            {durationText && (
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Estimasi Waktu</p>
                <div className="flex items-center justify-end gap-1.5 text-gray-700 bg-gray-50 px-2 py-1 rounded-lg">
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{durationText}</span>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          {/* Section: Description */}
          {service.description && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Tentang Layanan</h4>
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                {service.description}
              </p>
            </div>
          )}

          {/* Section: Includes (Seamless List) */}
          {service.includes && service.includes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-green-700 uppercase tracking-wide flex items-center gap-2">
                <span>✓ Termasuk</span>
                <span className="h-px flex-1 bg-green-100"></span>
              </h4>
              <ul className="space-y-2">
                {service.includes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="mt-0.5 text-green-500 shrink-0">
                      <CheckIcon className="w-4 h-4" />
                    </div>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section: Excludes (Seamless List) */}
          {service.excludes && service.excludes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-red-700 uppercase tracking-wide flex items-center gap-2">
                <span>✗ Tidak Termasuk</span>
                <span className="h-px flex-1 bg-red-100"></span>
              </h4>
              <ul className="space-y-2">
                {service.excludes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 opacity-80">
                    <div className="mt-0.5 text-red-400 shrink-0">
                      <XIcon className="w-4 h-4" />
                    </div>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Spacer untuk Mobile Bottom */}
          <div className="h-4 lg:hidden"></div>
        </div>

        {/* FOOTER ACTION: Sticky Bottom inside Modal */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
          <Link
            href={`https://app.poskojasa.com/checkout?type=direct&providerId=${provider._id}&serviceId=${service._id}`}
            onClick={onClose}
            className="flex-[2] py-3 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors text-center shadow-lg shadow-gray-200"
          >
            Pilih Layanan Ini
          </Link>
        </div>
      </div>
    </div>
  );
}