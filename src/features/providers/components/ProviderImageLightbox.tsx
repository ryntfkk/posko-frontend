// src/features/providers/components/ProviderImageLightbox.tsx

import Image from 'next/image';
import { useEffect } from 'react';

interface ProviderImageLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ProviderImageLightbox({ imageUrl, onClose }: ProviderImageLightboxProps) {
  // Tutup dengan tombol ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="relative w-full max-w-5xl flex flex-col items-center justify-center">
         
         {/* Tombol Close */}
         <button 
           onClick={(e) => {
             e.stopPropagation();
             onClose();
           }}
           className="absolute -top-12 right-0 md:top-4 md:right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors group"
         >
           <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>

         {/* [FIX CRITICAL] CONTAINER GAMBAR 
            Harus memiliki tinggi spesifik (h-[80vh]) agar 'fill' bekerja.
            Jika tidak, tingginya 0 dan gambar tidak muncul (blank).
         */}
         <div 
            className="relative w-full h-[60vh] md:h-[80vh] rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Mencegah klik gambar menutup modal
         >
           <Image 
             src={imageUrl} 
             alt="Preview Dokumentasi" 
             fill 
             className="object-contain" // Agar gambar tidak terpotong (fit)
             sizes="(max-width: 768px) 100vw, 80vw"
             priority // Load instan
             quality={90}
           />
         </div>

         <p className="text-gray-400 text-xs mt-4 animate-pulse">
           Ketuk area gelap untuk menutup
         </p>
      </div>
    </div>
  );
}