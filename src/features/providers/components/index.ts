// src/features/providers/components/index.ts

// Utils & Types
export * from './utils';
export * from './types';
export * from './Icons';

// Components yang MASIH ADA dan DIPAKAI
// Pastikan hanya file yang benar-benar ada di folder Anda yang di-export di sini
export { default as ProviderLoading } from './ProviderLoading';
export { default as ProviderNotFound } from './ProviderNotFound';
export { default as ProviderCalendarModal } from './ProviderCalendarModal';
export { default as ProviderServiceDetailModal } from './ProviderServiceDetailModal';
export { default as ProviderImageLightbox } from './ProviderImageLightbox';

// --- BAGIAN YANG SUDAH DIHAPUS ---
// Jangan masukkan baris-baris di bawah ini lagi ke dalam file Anda:
// export { default as ProviderHeroSection } from './ProviderHeroSection';
// export { default as ProviderTabSection } from './ProviderTabSection';
// export { default as ProviderServicesContent } from './ProviderServicesContent';
// export { default as ProviderDocumentationContent } from './ProviderDocumentationContent';
// export { default as ProviderSidebar } from './ProviderSidebar';
// export { default as ProviderStickyBottomCTA } from './ProviderStickyBottomCTA';