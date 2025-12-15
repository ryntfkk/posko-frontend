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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-pulse">
        {[1, 2, 3].map((i) => (
           <div key={i} className="aspect-square bg-gray-100 rounded-2xl border border-gray-200"></div>
        ))}
      </div>
    );
  }

  const hasRealDocs = docs.length > 0;

  // Render Helper
  const renderImage = (url: string, alt: string, overlayContent: React.ReactNode) => {
    if (!url || url.includes('undefined') || url.includes('null')) {
      return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
          <span className="text-[10px]">Gambar Rusak</span>
        </div>
      );
    }

    return (
      <>
        <Image
          src={url}
          alt={alt}
          fill
          // [FIX] Tambahkan sizes untuk menghilangkan warning
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {overlayContent}
      </>
    );
  };

  // TAMPILAN UTAMA: DOKUMENTASI REAL
  if (hasRealDocs) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {docs.map((item, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer border border-gray-100 shadow-sm hover:shadow-lg transition-all"
              onClick={() => {
                // Validasi URL sebelum klik
                if (item.url && !item.url.includes('undefined')) {
                  onImageClick(item.url);
                }
              }}
            >
              {renderImage(
                item.url, 
                `Bukti Order ${item.orderNumber || idx}`,
                <>
                  {/* Overlay: HANYA MENAMPILKAN NOMOR ORDER */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                     <div className="flex items-center gap-2">
                       <div className="w-6 h-6 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                          <span className="text-xs">📦</span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[8px] text-gray-300 uppercase tracking-wider leading-none">Order ID</span>
                         <span className="text-xs font-bold text-white font-mono tracking-wide">
                           {item.orderNumber || `#${item.orderId?.slice(-6)}`}
                         </span>
                       </div>
                     </div>
                  </div>

                  {/* Icon Zoom Center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                     <div className="bg-white/90 rounded-full p-2.5 text-gray-800 shadow-xl">
                        <ZoomIcon />
                     </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-2 bg-gray-50 py-2 rounded-lg border border-gray-100">
           ✓ Menampilkan {docs.length} bukti pekerjaan terverifikasi.
        </p>
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
    <div className="space-y-4">
      {isUsingFallback && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex gap-2 items-start">
          <span className="text-lg">📷</span>
          <div>
            <p className="font-bold">Belum Ada Riwayat Pekerjaan</p>
            <p className="text-amber-700 mt-0.5 opacity-90">
              Mitra ini belum menyelesaikan pesanan via aplikasi.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {portfolioImages.map((img, idx) => (
          <div
            key={idx}
            className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer border border-gray-100 shadow-sm hover:shadow-lg transition-all"
            onClick={() => onImageClick(img)}
          >
            {renderImage(
              img, 
              `Portfolio ${idx + 1}`,
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 shadow-lg">
                  <ZoomIcon />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {portfolioImages.length === 0 && !isUsingFallback && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GalleryIcon />
          </div>
          <p className="text-gray-500 text-sm">Belum ada dokumentasi.</p>
        </div>
      )}
    </div>
  );
}