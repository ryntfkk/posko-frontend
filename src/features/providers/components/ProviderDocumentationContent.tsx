// src/features/providers/components/ProviderDocumentationContent.tsx

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Provider } from '../types';
import { fetchProviderDocumentation, DocumentationItem } from '../api';
import { FALLBACK_PORTFOLIO_IMAGES } from './utils';
import { GalleryIcon, ZoomIcon } from './Icons';

interface ProviderDocumentationContentProps {
  provider: Provider;
  onImageClick: (imageUrl: string) => void;
}

export default function ProviderDocumentationContent({ provider, onImageClick }: ProviderDocumentationContentProps) {
  const [docs, setDocs] = useState<DocumentationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDocs = async () => {
      try {
        if (provider._id) {
          setIsLoading(true);
          const res = await fetchProviderDocumentation(provider._id);
          const data = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
          setDocs(data);
        }
      } catch (error) {
        console.error('Gagal memuat dokumentasi:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDocs();
  }, [provider._id]);

  // Loading State: Grid Rapat (High Density)
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
           <div key={i} className="aspect-square bg-gray-100"></div>
        ))}
      </div>
    );
  }

  const hasRealDocs = docs.length > 0;

  // Render Helper
  const renderImage = (url: string, alt: string, overlayContent: React.ReactNode) => {
    if (!url || url.includes('undefined') || url.includes('null')) {
      return (
        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
          <span className="text-[9px]">N/A</span>
        </div>
      );
    }

    return (
      <>
        <Image
          src={url}
          alt={alt}
          fill
          sizes="(max-width: 768px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {overlayContent}
      </>
    );
  };

  // TAMPILAN UTAMA: DOKUMENTASI REAL
  if (hasRealDocs) {
    return (
      <div className="flex flex-col">
        {/* Info Bar Compact */}
        <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 border-b border-gray-100 flex items-center gap-2">
           <GalleryIcon className="w-3.5 h-3.5" />
           <span>Menampilkan {docs.length} bukti pekerjaan terverifikasi</span>
        </div>

        {/* Grid Seamless (Tanpa Gap Besar) */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5">
          {docs.map((item, idx) => (
            <div
              key={idx}
              className="relative aspect-square overflow-hidden group cursor-pointer bg-gray-100"
              onClick={() => {
                if (item.url && !item.url.includes('undefined')) {
                  onImageClick(item.url);
                }
              }}
            >
              {renderImage(
                item.url, 
                `Bukti Order ${item.orderNumber || idx}`,
                <>
                  {/* Overlay: Minimalist Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-100 flex flex-col justify-end p-2 transition-opacity">
                      <div className="flex items-center gap-1.5">
                        {/* ID Badge Compact */}
                        <div className="flex flex-col">
                          <span className="text-[8px] text-gray-300 leading-none mb-0.5">ORDER</span>
                          <span className="text-[10px] font-bold text-white font-mono tracking-tight leading-none">
                            {item.orderNumber || `#${item.orderId?.slice(-6)}`}
                          </span>
                        </div>
                      </div>
                  </div>

                  {/* Icon Zoom (Center) */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-black/30 backdrop-blur-sm rounded-full p-2 text-white border border-white/20">
                         <ZoomIcon className="w-4 h-4" />
                      </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // TAMPILAN FALLBACK (Portfolio Manual)
  const portfolioImages =
    provider.portfolioImages && provider.portfolioImages.length > 0
      ? provider.portfolioImages
      : FALLBACK_PORTFOLIO_IMAGES;

  const isUsingFallback = !provider.portfolioImages || provider.portfolioImages.length === 0;

  return (
    <div className="flex flex-col">
      {isUsingFallback && (
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex gap-3 items-center">
          <span className="text-lg shrink-0">📷</span>
          <div>
            <p className="text-xs font-bold text-amber-900">Belum Ada Riwayat Pekerjaan</p>
            <p className="text-[10px] text-amber-800 opacity-80 leading-tight">
              Mitra ini belum menyelesaikan pesanan via aplikasi. Menampilkan ilustrasi layanan.
            </p>
          </div>
        </div>
      )}

      {/* Grid Seamless */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0.5">
        {portfolioImages.map((img, idx) => (
          <div
            key={idx}
            className="relative aspect-square overflow-hidden group cursor-pointer bg-gray-100"
            onClick={() => onImageClick(img)}
          >
            {renderImage(
              img, 
              `Portfolio ${idx + 1}`,
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-sm rounded-full p-2 text-white border border-white/20">
                  <ZoomIcon className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {portfolioImages.length === 0 && !isUsingFallback && (
        <div className="text-center py-16 bg-white">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <GalleryIcon className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-gray-500 text-xs">Belum ada dokumentasi.</p>
        </div>
      )}
    </div>
  );
}