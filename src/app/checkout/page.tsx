'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { fetchServices } from '@/features/services/api';
import { fetchProviderById } from '@/features/providers/api';
import { Service, getUnitLabel } from '@/features/services/types';
import { Provider } from '@/features/providers/types';
import { getCartItemId, useCart } from '@/features/cart/useCart';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper untuk format durasi
const formatDuration = (minutes?: number): string => {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const remainMins = minutes % 60;
  if (remainMins === 0) return `${hours} jam`;
  return `${hours} jam ${remainMins} menit`;
};

type CheckoutType = 'basic' | 'direct';

interface CheckoutOption {
  id: string;
  name: string;
  category: string;
  description: string;
  shortDescription?: string;
  price: number;
  unit: string;
  unitLabel?: string;
  displayUnit?: string;
  estimatedDuration?: number;
  includes?: string[];
  excludes?: string[];
  isPromo?: boolean;
  promoPrice?: number;
  discountPercent?: number;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { cart, upsertItem, clearCart, isInitialized, checkConflict, resetAndAddItem } = useCart();

  // State Data
  const [services, setServices] = useState<Service[]>([]);
  const [provider, setProvider] = useState<Provider | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutType, setCheckoutType] = useState<CheckoutType>('basic');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk modal detail
  const [selectedDetail, setSelectedDetail] = useState<CheckoutOption | null>(null);
  
  // State untuk Conflict Modal
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<any>(null);

  const hasAutoAdded = useRef(false);
  
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  
  const categoryParam = searchParams?.get('category') || null;
  const serviceIdParam = searchParams?.get('serviceId');
  const typeParam = searchParams?.get('type') as CheckoutType | null;
  const providerIdParam = searchParams?.get('providerId');

  const effectiveCategory = categoryParam || detectedCategory;

  // 1. Sinkronisasi Query Params & State
  useEffect(() => {
    if (typeParam) {
        setCheckoutType(typeParam === 'direct' ? 'direct' : 'basic');
    }
    if (providerIdParam) {
        setSelectedProviderId(providerIdParam);
    }
  }, [typeParam, providerIdParam]);

  // 2. Fetch Data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (checkoutType === 'basic') {
          const res = await fetchServices(effectiveCategory);
          setServices(res.data);
        } else if (checkoutType === 'direct' && selectedProviderId) {
          const res = await fetchProviderById(selectedProviderId);
          setProvider(res.data);
          
          const activeServices = res.data.services?.filter((s: { isActive: boolean }) => s.isActive) || [];
          if (activeServices.length > 0) {
             const firstSvc = activeServices[0].serviceId;
             if (firstSvc.categories && Array.isArray(firstSvc.categories) && firstSvc.categories.length > 0) {
                 setDetectedCategory(firstSvc.categories[0].slug || null);
             } else if (typeof (firstSvc as any).category === 'string') {
                 setDetectedCategory((firstSvc as any).category);
             }
          }
        }
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data layanan. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    };

    if (checkoutType === 'basic' || (checkoutType === 'direct' && selectedProviderId)) {
      loadData();
    }
  }, [checkoutType, selectedProviderId, effectiveCategory]);

  // 3. Normalisasi Data untuk UI
  const availableOptions: CheckoutOption[] = useMemo(() => {
    if (checkoutType === 'basic') {
      return services.map(s => {
        let extractedCategoryName = 'Umum';
        
        if (s.categories && Array.isArray(s.categories) && s.categories.length > 0) {
            if (effectiveCategory) {
                const matchedCat = s.categories.find(c => c.slug === effectiveCategory.toLowerCase());
                extractedCategoryName = matchedCat ? matchedCat.name : s.categories[0].name;
            } else {
                extractedCategoryName = s.categories[0].name;
            }
        }

        return {
            id: s._id,
            name: s.name,
            category: extractedCategoryName, 
            description: s.description || 'Layanan standar aplikasi.',
            shortDescription: s.shortDescription,
            price: s.displayPrice || s.basePrice,
            unit: s.unit || 'unit',
            unitLabel: s.unitLabel,
            displayUnit: s.displayUnit || getUnitLabel(s.unit || 'unit', s.unitLabel),
            estimatedDuration: s.estimatedDuration,
            includes: s.includes,
            excludes: s.excludes,
            isPromo: s.isPromo,
            promoPrice: s.promoPrice,
            discountPercent: s.discountPercent,
        };
      });
    } else {
      if (!provider) return [];

      return provider.services
        .filter(item => item.isActive)
        .map(item => {
            const s = item.serviceId;
            let extractedCategoryName = 'Umum';

            if (s.categories && Array.isArray(s.categories) && s.categories.length > 0) {
                 extractedCategoryName = s.categories[0].name;
            } else if ((s as any).category) {
                 extractedCategoryName = (s as any).category;
            }

            return {
                id: s._id,
                name: s.name,
                category: extractedCategoryName,
                description: s.description || `Layanan oleh ${provider.userId.fullName}`,
                shortDescription: s.shortDescription,
                price: item.price,
                unit: s.unit || 'unit',
                unitLabel: s.unitLabel,
                displayUnit: s.displayUnit || getUnitLabel(s.unit || 'unit', s.unitLabel),
                estimatedDuration: s.estimatedDuration,
                includes: s.includes,
                excludes: s.excludes,
                isPromo: s.isPromo,
                promoPrice: s.promoPrice,
                discountPercent: s.discountPercent,
            };
        });
    }
  }, [checkoutType, services, provider, effectiveCategory]);

  const providerLabel = useMemo(() => {
    if (!selectedProviderId) return 'Cari Cepat';
    if (provider) return provider.userId.fullName;
    return 'Memuat...';
  }, [selectedProviderId, provider]);

  const activeCartItems = useMemo(() => {
    return cart.filter((item) => {
      if (item.quantity <= 0) return false;

      if (checkoutType === 'basic') {
        if (item.orderType !== 'basic') return false;
        
        if (effectiveCategory) {
          let targetCategoryName = effectiveCategory; 
          
          const matchingService = services.find(s => 
             s.categories && s.categories.some(c => c.slug === effectiveCategory.toLowerCase())
          );

          if (matchingService && matchingService.categories) {
              const catObj = matchingService.categories.find(c => c.slug === effectiveCategory.toLowerCase());
              if (catObj) {
                  targetCategoryName = catObj.name;
              }
          }
          
          const itemCat = (item.category ?? '').toLowerCase();
          const targetCatName = targetCategoryName.toLowerCase();
          const targetCatSlug = effectiveCategory.toLowerCase();
          
          return itemCat === targetCatName || itemCat === targetCatSlug;
        }
        return true;
      } else {
        return item.orderType === 'direct' && item.providerId === selectedProviderId;
      }
    });
  }, [cart, checkoutType, selectedProviderId, effectiveCategory, services]);

  const currentTotalAmount = activeCartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const currentTotalItems = activeCartItems.reduce((sum, item) => sum + item.quantity, 0);

  // 4. Auto-Add Service Logic
  useEffect(() => {
    if (!isInitialized || hasAutoAdded.current || availableOptions.length === 0) return;
    if (!serviceIdParam) return;

    const targetOption = availableOptions.find(o => o.id === serviceIdParam);

    if (targetOption) {
      const itemPayload = {
          serviceId: targetOption.id,
          serviceName: targetOption.name,
          category: targetOption.category,
          orderType: checkoutType,
          quantity: 1,
          pricePerUnit: targetOption.price,
          providerId: checkoutType === 'direct' ? selectedProviderId || undefined : undefined,
          providerName: checkoutType === 'direct' ? providerLabel : undefined,
      };
      
      hasAutoAdded.current = true;

      if (checkConflict(itemPayload)) {
          setPendingItem(itemPayload);
          setIsConflictModalOpen(true);
      } else {
          upsertItem(itemPayload);
      }

      const newParams = new URLSearchParams(window.location.search);
      newParams.delete('serviceId');
      window.history.replaceState(null, '', `?${newParams.toString()}`);
    }
  }, [
      isInitialized, 
      serviceIdParam, 
      availableOptions, 
      checkoutType, 
      selectedProviderId, 
      providerLabel, 
      checkConflict, 
      upsertItem 
  ]);

  const getQuantityForService = (serviceId: string) => {
    const key = getCartItemId(serviceId, checkoutType, checkoutType === 'direct' ? selectedProviderId : undefined);
    const existing = cart.find((item) => item.id === key);
    return existing?.quantity ?? 0;
  };

  const handleConfirmOrder = async () => {
    if (!isInitialized) return;
    
    if (activeCartItems.length === 0 || currentTotalItems <= 0) {
      alert('Pilih minimal satu layanan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const queryParams = new URLSearchParams({
        type: checkoutType,
      });
      
      if (checkoutType === 'basic' && effectiveCategory) {
        queryParams.append('category', effectiveCategory);
      }

      if (checkoutType === 'direct' && selectedProviderId) {
        queryParams.append('providerId', selectedProviderId);
      }

      router.push(`/order/summary?${queryParams.toString()}`);
    } catch (err) {
      console.error(err);
      alert('Terjadi kendala saat navigasi.');
      setIsSubmitting(false);
    }
  };

  const handleSwitchMode = (targetMode: CheckoutType) => {
    if (targetMode === 'direct' && !selectedProviderId) {
      alert("Silakan pilih mitra dari halaman pencarian terlebih dahulu.");
      return;
    }

    hasAutoAdded.current = false;

    setCheckoutType(targetMode);
    if (targetMode === 'basic') {
      setSelectedProviderId(null);
      const categoryToUse = detectedCategory || categoryParam;
      if (categoryToUse) {
        router.replace(`/checkout?type=basic&category=${encodeURIComponent(categoryToUse)}`);
      } else {
        router.replace('/checkout?type=basic');
      }
    }
  };

  const handleConfirmReplaceCart = () => {
    if (pendingItem) {
        resetAndAddItem(pendingItem);
        setPendingItem(null);
        setIsConflictModalOpen(false);
    }
  };

  // --- RENDER COMPONENT: SERVICE ITEM (ANTI-CHUNKY BUT DATA RICH) ---
  const renderServiceOption = (option: CheckoutOption) => {
    const quantity = getQuantityForService(option.id);
    
    const handleUpdateQuantity = (newQuantity: number) => {
      const itemPayload = {
        serviceId: option.id,
        serviceName: option.name,
        category: option.category, 
        orderType: checkoutType,
        quantity: newQuantity,
        pricePerUnit: option.price,
        providerId: checkoutType === 'direct' ? selectedProviderId || undefined : undefined,
        providerName: checkoutType === 'direct' ? providerLabel : undefined,
      };

      if (newQuantity > 0 && checkConflict(itemPayload)) {
         setPendingItem(itemPayload);
         setIsConflictModalOpen(true);
         return;
      }

      upsertItem(itemPayload);
    };

    const durationText = formatDuration(option.estimatedDuration);
    
    return (
      <div
        key={option.id}
        className={`flex items-start gap-3 py-4 border-b border-gray-100 last:border-0 transition-colors ${
          quantity > 0 ? 'bg-red-50/20 -mx-4 px-4 sm:mx-0 sm:px-0' : 'bg-transparent'
        }`}
      >
        {/* Content Section */}
        <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{option.category}</span>
                        {option.isPromo && option.discountPercent && option.discountPercent > 0 && (
                             <span className="text-[10px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded">
                                 -{option.discountPercent}%
                             </span>
                        )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mt-1 leading-snug">{option.name}</h3>
                </div>
            </div>
            
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {option.shortDescription || option.description}
            </p>

            {/* Meta Row: Price, Unit, Includes Count */}
            <div className="flex items-end flex-wrap gap-x-4 gap-y-1 pt-1">
                <div className="flex items-baseline gap-1.5">
                    {option.isPromo && option.promoPrice ? (
                    <>
                        <span className="text-sm md:text-base font-black text-red-700">{formatCurrency(option.promoPrice)}</span>
                        <span className="text-[10px] text-gray-400 line-through decoration-gray-300">{formatCurrency(option.price)}</span>
                    </>
                    ) : (
                    <span className="text-sm md:text-base font-black text-gray-900">{formatCurrency(option.price)}</span>
                    )}
                    <span className="text-[10px] text-gray-500">/{option.displayUnit}</span>
                </div>

                <div className="flex items-center gap-3 ml-auto sm:ml-0">
                    {durationText && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500" title="Estimasi Durasi">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {durationText}
                        </div>
                    )}

                    {option.includes && option.includes.length > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded-md">
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                             <span>{option.includes.length} item</span>
                        </div>
                    )}
                </div>
            </div>
            
            <button 
                onClick={() => setSelectedDetail(option)}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 mt-1"
            >
                Lihat Detail Lengkap
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>

        {/* Action Section - Compact Vertical Control */}
        <div className="flex flex-col items-center gap-1 shrink-0 ml-2 mt-1">
            {quantity > 0 ? (
                <div className="flex flex-col items-center gap-1 bg-white rounded-full shadow-sm border border-gray-100 p-0.5">
                     <button
                        onClick={() => handleUpdateQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                    <span className="text-sm font-bold text-gray-900 w-6 text-center py-0.5">{quantity}</span>
                    <button
                        onClick={() => handleUpdateQuantity(quantity - 1)}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:border-gray-400 hover:text-gray-900 active:scale-95 transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                    </button>
                </div>
            ) : (
                 <button
                    onClick={() => handleUpdateQuantity(1)}
                    disabled={checkoutType === 'direct' && !provider}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                        checkoutType === 'direct' && !provider
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          : 'bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-red-100'
                      }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </button>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-32 md:pb-10">
      {/* 1. Header (Glassmorphism) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 h-14 md:h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 -ml-2 text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex flex-col">
                    <h1 className="text-base font-bold leading-none text-gray-900">Checkout</h1>
                    <span className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[150px] sm:max-w-xs">
                        {checkoutType === 'direct' ? `Order ke: ${providerLabel}` : 'Order Basic (Otomatis)'}
                    </span>
                </div>
            </div>
            
            {/* Mode Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => handleSwitchMode('basic')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${checkoutType === 'basic' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Basic
                </button>
                <button
                    onClick={() => handleSwitchMode('direct')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${checkoutType === 'direct' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Direct
                </button>
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
        {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
                <p className="text-xs text-gray-400">Memuat data layanan...</p>
            </div>
        ) : error ? (
            <div className="text-center py-10 px-4 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100 max-w-lg mx-auto">
                <p className="font-bold mb-1">Terjadi Kesalahan</p>
                {error}
            </div>
        ) : (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
                
                {/* --- Left Column: Content --- */}
                <div className="lg:col-span-8 space-y-6 lg:pr-10">
                    
                    {/* Provider Profile (Direct Mode Only) - RESTORED FULL DATA */}
                    {checkoutType === 'direct' && provider && (
                        <div className="flex items-start gap-4 py-4 px-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                             <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white shadow-sm border-2 border-white shrink-0">
                                {/* [PERBAIKAN] Tambahkan properti sizes agar tidak warning */}
                                <Image
                                src={provider.userId.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.userId.fullName}`}
                                alt={provider.userId.fullName}
                                fill
                                sizes="56px"
                                className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white uppercase tracking-wider">Mitra Pilihan</span>
                                    {provider.rating && (
                                        <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-blue-100">
                                            <span className="text-[9px] text-yellow-500">★</span>
                                            <span className="text-[9px] font-bold text-gray-700">{provider.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-base font-bold text-gray-900 leading-tight">{provider.userId.fullName}</h2>
                                <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">
                                    {provider.userId.bio || 'Mitra profesional Posko siap melayani kebutuhan Anda.'}
                                </p>
                                <p className="text-[10px] text-blue-600 font-medium mt-1.5 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Harga Ratecard Khusus
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Section Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                         <div>
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Pilih Layanan</h2>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                                {availableOptions.length} layanan tersedia di kategori <span className="font-semibold text-gray-600">{effectiveCategory || 'Umum'}</span>
                            </p>
                         </div>
                    </div>

                    {/* Empty State */}
                    {checkoutType === 'direct' && availableOptions.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <p className="text-xs text-gray-500">Mitra ini belum memiliki layanan aktif untuk dipesan.</p>
                        </div>
                    )}

                    {/* Service List */}
                    <div className="flex flex-col">
                        {availableOptions.map((option) => renderServiceOption(option))}
                    </div>
                </div>

                {/* --- Right Column: Sticky Summary (Desktop) --- */}
                <div className="hidden lg:block lg:col-span-4 sticky top-24">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Ringkasan Pesanan</h3>
                            {activeCartItems.length > 0 && (
                                <button onClick={clearCart} className="text-[10px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors">Hapus Semua</button>
                            )}
                        </div>

                        {activeCartItems.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                </div>
                                <p className="text-xs text-gray-400">Keranjang masih kosong</p>
                            </div>
                        ) : (
                            <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                                {activeCartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start gap-2 text-xs group">
                                        <div className="space-y-0.5">
                                            <p className="font-semibold text-gray-900">{item.serviceName}</p>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                 <span>{item.quantity} x {formatCurrency(item.pricePerUnit)}</span>
                                            </div>
                                        </div>
                                        <p className="font-bold text-gray-900 whitespace-nowrap">{formatCurrency(item.totalPrice)}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="border-t border-gray-100 pt-4 space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <span className="block text-[10px] text-gray-500 mb-0.5">Total Pembayaran</span>
                                    <span className="text-xl font-black text-gray-900">{formatCurrency(currentTotalAmount)}</span>
                                </div>
                                <span className="text-[10px] text-gray-400">{currentTotalItems} item</span>
                            </div>
                            <button 
                                onClick={handleConfirmOrder}
                                disabled={activeCartItems.length === 0 || isSubmitting}
                                className="w-full h-11 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-100 disabled:shadow-none"
                            >
                                {isSubmitting ? 'Memproses...' : 'Lanjut Pembayaran'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* 4. Mobile Sticky Bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200 p-4 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4 max-w-md mx-auto">
            <div className="flex-1">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Total Estimasi</p>
                <div className="flex items-baseline gap-1">
                    <p className="text-lg font-black text-gray-900 leading-none">{formatCurrency(currentTotalAmount)}</p>
                    <span className="text-[10px] text-gray-400">({currentTotalItems} item)</span>
                </div>
            </div>
            <button
                onClick={handleConfirmOrder}
                disabled={activeCartItems.length === 0 || isSubmitting}
                className="flex-[1.2] h-11 bg-red-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-200 active:scale-95 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        Lanjut
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                )}
            </button>
        </div>
      </div>

      {/* 5. Detail Modal (Modern & COMPLETE DATA) */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDetail(null)}>
          <div 
            className="bg-white w-full md:w-[500px] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up md:animate-zoom-in" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-white shrink-0">
               <div>
                 <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wide">
                        {selectedDetail.category}
                    </span>
                    {selectedDetail.isPromo && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wide">
                            Promo
                        </span>
                    )}
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 leading-tight">{selectedDetail.name}</h3>
               </div>
               <button onClick={() => setSelectedDetail(null)} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-6">
                 {/* Price & Duration Block */}
                 <div className="flex items-end justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                        <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Harga Layanan</p>
                        <div className="flex items-baseline gap-2">
                            {selectedDetail.isPromo && selectedDetail.promoPrice ? (
                                <>
                                    <span className="text-2xl font-black text-red-600">{formatCurrency(selectedDetail.promoPrice)}</span>
                                    <span className="text-sm text-gray-400 line-through decoration-gray-300">{formatCurrency(selectedDetail.price)}</span>
                                </>
                            ) : (
                                <span className="text-2xl font-black text-gray-900">{formatCurrency(selectedDetail.price)}</span>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">per {selectedDetail.displayUnit}</p>
                    </div>
                    {selectedDetail.estimatedDuration && (
                        <div className="text-right pl-4 border-l border-gray-200">
                             <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Estimasi</p>
                             <p className="text-sm font-bold text-gray-700">{formatDuration(selectedDetail.estimatedDuration)}</p>
                        </div>
                    )}
                 </div>

                 <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-900 uppercase">Deskripsi</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedDetail.description}
                    </p>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* INCLUDES SECTION (RESTORED) */}
                    {selectedDetail.includes && selectedDetail.includes.length > 0 && (
                        <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
                            <p className="text-[10px] font-bold text-green-700 uppercase mb-2 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                Termasuk
                            </p>
                            <ul className="space-y-2">
                                {selectedDetail.includes.map((inc, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                                        <span className="block w-1 h-1 rounded-full bg-green-400 mt-1.5 shrink-0"></span>
                                        {inc}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* EXCLUDES SECTION (RESTORED) */}
                    {selectedDetail.excludes && selectedDetail.excludes.length > 0 && (
                        <div className="bg-red-50/50 rounded-xl p-4 border border-red-100">
                            <p className="text-[10px] font-bold text-red-700 uppercase mb-2 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                Tidak Termasuk
                            </p>
                            <ul className="space-y-2">
                                {selectedDetail.excludes.map((exc, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                        <span className="block w-1 h-1 rounded-full bg-red-300 mt-1.5 shrink-0"></span>
                                        {exc}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                 </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                <button onClick={() => setSelectedDetail(null)} className="w-full h-11 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
                    Tutup Detail
                </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Conflict Modal (Minimal) */}
      {isConflictModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-white w-full max-w-xs rounded-2xl p-6 text-center shadow-2xl animate-zoom-in">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Ganti Order Baru?</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                  Menambahkan layanan ini akan <strong>menghapus keranjang Anda saat ini</strong> karena berbeda kategori atau mitra.
              </p>
              <div className="flex gap-3">
                  <button onClick={() => { setIsConflictModalOpen(false); setPendingItem(null); }} className="flex-1 h-10 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      Batal
                  </button>
                  <button onClick={handleConfirmReplaceCart} className="flex-1 h-10 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-colors">
                      Ya, Ganti
                  </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
        </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}