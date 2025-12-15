// src/app/order/summary/page.tsx
'use client';

import { useMemo, useState, Suspense, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic'; 

import { useCart } from '@/features/cart/useCart';
import { createOrder } from '@/features/orders/api';
import { createPayment } from '@/features/payments/api'; 
import { CreateOrderPayload, CustomerContact, PropertyDetails, ScheduledTimeSlot } from '@/features/orders/types';
import useMidtrans from '@/hooks/useMidtrans'; 
import { fetchProfile } from '@/features/auth/api';
import { User, Address, GeoLocation } from '@/features/auth/types';

import { settingsApi } from '@/features/settings/api';
import { voucherApi } from '@/features/vouchers/api';
import { Voucher } from '@/features/vouchers/types';

const LocationPicker = dynamic(
  () => import('@/components/LocationPicker'),
  { 
    ssr: false, 
    loading: () => <div className="w-full h-[300px] bg-gray-200 animate-pulse rounded-xl flex items-center justify-center text-gray-500 text-sm">Memuat Peta...</div>
  }
);

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess?: (result: unknown) => void;
        onPending?: (result: unknown) => void;
        onError?: (result: unknown) => void;
        onClose?: () => void;
      }) => void;
    };
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

function OrderSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  
  const { cart, clearCart, isInitialized } = useCart(); 
  
  const isSnapLoaded = useMidtrans();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [adminFee, setAdminFee] = useState(0);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);
  
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>(undefined);
  const [orderLocation, setOrderLocation] = useState<GeoLocation | undefined>(undefined);
  
  // State Kontak
  const [customerContact, setCustomerContact] = useState<CustomerContact>({
    name: '',
    phone: '',
    alternatePhone: ''
  });
  const [isEditingContact, setIsEditingContact] = useState(false); // New: Toggle edit mode
  
  // Property Details
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>({
    type: '',
    floor: null,
    hasParking: true,
    hasElevator: false,
    accessNote: ''
  });
  
  // Time Slot
  const [timeSlot, setTimeSlot] = useState<ScheduledTimeSlot>({
    preferredStart: '',
    preferredEnd: '',
    isFlexible: true
  });

  const checkoutType = searchParams?.get('type') as 'direct' | 'basic' || 'basic';
  const selectedProviderId = searchParams?.get('providerId') || null;

  // Filter Keranjang
  const activeCartItems = useMemo(() => {
    return cart.filter((item) => {
      if (item.quantity <= 0) return false;

      if (checkoutType === 'basic') {
        return item.orderType === 'basic';
      } else {
        return item.orderType === 'direct' && item.providerId === selectedProviderId;
      }
    });
  }, [cart, checkoutType, selectedProviderId]);

  const currentTotalAmount = activeCartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Helper untuk mendapatkan info Provider jika Direct Order
  const directProviderInfo = useMemo(() => {
    if (checkoutType === 'direct' && activeCartItems.length > 0) {
      const item = activeCartItems[0];
      return {
        id: item.providerId,
        name: item.providerName || 'Mitra Posko',
        bookedDates: (item as any).bookedDates || [],
        blockedDates: (item as any).blockedDates || []
      };
    }
    return null;
  }, [checkoutType, activeCartItems]);

  const providerData = useMemo(() => {
    if (directProviderInfo) {
      return {
        bookedDates: directProviderInfo.bookedDates,
        blockedDates: directProviderInfo.blockedDates
      };
    }
    return { bookedDates: [], blockedDates: [] };
  }, [directProviderInfo]);

  const isDateUnavailable = useCallback((dateString: string): { unavailable: boolean; reason: string } => {
    if (!dateString) return { unavailable: false, reason: '' };
    
    const selectedDate = new Date(dateString);
    const dateOnly = selectedDate.toISOString().split('T')[0];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return { unavailable: true, reason: 'Tanggal sudah lewat' };
    }
    
    const isBlocked = providerData.blockedDates.some((d: string) => {
      const blockedDate = d.split('T')[0];
      return blockedDate === dateOnly;
    });
    
    if (isBlocked) {
      return { unavailable: true, reason: 'Mitra sedang libur pada tanggal ini' };
    }
    
    const isBooked = providerData.bookedDates.some((d: string) => {
      const bookedDate = d.split('T')[0];
      return bookedDate === dateOnly;
    });
    
    if (isBooked) {
      return { unavailable: true, reason: 'Mitra sudah penuh pada tanggal ini' };
    }
    
    return { unavailable: false, reason: '' };
  }, [providerData]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await fetchProfile();
        const profile = profileRes.data.profile;
        setUserProfile(profile);

        if (profile.address) {
          setSelectedAddress(profile.address);
        }
        if (profile.location && profile.location.coordinates && profile.location.coordinates[0] !== 0) {
          setOrderLocation(profile.location);
        }
        
        setCustomerContact({
          name: profile.fullName || '',
          phone: profile.phoneNumber || '',
          alternatePhone: ''
        });

        const settingsRes = await settingsApi.getGlobalConfig();
        if (settingsRes.data) {
            setAdminFee(settingsRes.data.adminFee);
        }

        const vouchersRes = await voucherApi.getMyVouchers();
        if (vouchersRes.data) {
            setAvailableVouchers(vouchersRes.data);
        }

      } catch (error) {
        console.error("Gagal memuat data awal:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setOrderLocation({
        type: 'Point',
        coordinates: [lng, lat]
    });
  }, []);

  const handleApplyPromo = async (code: string) => {
    if (!code) return;
    setIsCheckingVoucher(true);
    try {
        const itemsPayload = activeCartItems.map(item => ({
            serviceId: item.serviceId,
            price: item.pricePerUnit,
            quantity: item.quantity
        }));

        const res = await voucherApi.checkVoucher({
            code: code,
            items: itemsPayload
        });
        
        const { estimatedDiscount, eligibleTotal } = res.data;
        
        setAppliedPromo({ code: code.toUpperCase(), discount: estimatedDiscount });
        setIsPromoModalOpen(false);
        setPromoCodeInput('');
        
        if (eligibleTotal < currentTotalAmount) {
             alert(`Promo ${code.toUpperCase()} berhasil! Hemat ${formatCurrency(estimatedDiscount)}.`);
        } else {
             alert(`Selamat! Promo ${code.toUpperCase()} berhasil digunakan.`);
        }

    } catch (error: any) {
        console.error("Voucher Error:", error);
        alert(error.response?.data?.message || 'Kode promo tidak valid.');
        setAppliedPromo(null);
    } finally {
        setIsCheckingVoucher(false);
    }
  };

  const handleRemovePromo = () => {
      setAppliedPromo(null);
  };

  const handleScheduledAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setScheduledAt(newValue);
    
    if (checkoutType === 'direct' && newValue) {
      const validation = isDateUnavailable(newValue);
      if (validation.unavailable) {
        setTimeout(() => {
          alert(`⚠️ Peringatan: ${validation.reason}.`);
          setScheduledAt('');
        }, 100);
      }
    }
  };

  const handlePlaceOrderAndPay = async () => {
    if (!scheduledAt) {
      alert("Mohon pilih tanggal dan jam kunjungan terlebih dahulu.");
      return;
    }
    
    if (checkoutType === 'direct') {
      const validation = isDateUnavailable(scheduledAt);
      if (validation.unavailable) {
        alert(`❌ ${validation.reason}.`);
        return;
      }
    }
    
    if (!selectedAddress || !orderLocation || orderLocation.coordinates[0] === 0) {
      alert("Mohon lengkapi alamat dan titik lokasi Anda.");
      return;
    }
    
    if (!customerContact.phone.trim()) {
      alert("Mohon isi nomor HP yang bisa dihubungi.");
      return;
    }

    if (!isSnapLoaded) {
      alert('Sistem pembayaran sedang dimuat, mohon tunggu sebentar...');
      return;
    }
    
    setIsProcessing(true);

    try {
      const mainItem = activeCartItems[0];
      const finalAmount = Math.max(0, currentTotalAmount + adminFee - (appliedPromo?.discount || 0));

      const orderPayload: CreateOrderPayload = {
        orderType: mainItem.orderType,
        providerId: mainItem.orderType === 'direct' ? mainItem.providerId : null,
        totalAmount: finalAmount, 
        scheduledAt: new Date(scheduledAt).toISOString(),
        shippingAddress: selectedAddress,
        location: orderLocation, 
        items: activeCartItems.map(item => ({
          serviceId: item.serviceId,
          name: item.serviceName,
          quantity: item.quantity,
          price: item.pricePerUnit,
          note: '' 
        })),
        customerContact: {
          name: customerContact.name.trim() || userProfile?.fullName || '',
          phone: customerContact.phone.trim(),
          alternatePhone: customerContact.alternatePhone?.trim() || ''
        },
        orderNote: '', // Removed note
        propertyDetails: propertyDetails,
        scheduledTimeSlot: timeSlot,
        attachments: [], // Removed attachments
        voucherCode: appliedPromo?.code
      };

      const orderRes = await createOrder(orderPayload);
      const orderId = orderRes.data.data._id;
      const orderNumber = orderRes.data.data.orderNumber;
      
      if (!orderId) throw new Error('Gagal mendapatkan ID Order.');
      
      const paymentRes = await createPayment(orderId);
      const snapToken = paymentRes.data.snapToken;

      if (window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: (result) => {
            alert(`Pembayaran Berhasil! Order: ${orderNumber}`);
            clearCart();
            router.push('/orders');
          },
          onPending: (result) => {
            alert(`Menunggu pembayaran untuk order ${orderNumber}...`);
            router.push(`/orders/${orderId}`);
          },
          onError: (result) => {
            alert('Pembayaran gagal. Silakan coba lagi.');
            router.push(`/orders/${orderId}`);
          },
          onClose: () => {
            router.push(`/orders/${orderId}`);
          }
        });
      }

    } catch (error: any) {
      console.error("❌ Error saat membuat order:", error);
      alert(error.response?.data?.message || error.message || 'Terjadi kesalahan.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProfileLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500">Memuat data...</p>
      </div>
    );
  }
  
  if (activeCartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Keranjang Kosong</h2>
        <Link href="/checkout" className="inline-block mt-4 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
          Kembali ke Layanan
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans relative">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center gap-3 md:gap-4">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-red-600 p-1">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wide text-gray-400 block">Langkah Terakhir</span>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">Ringkasan Pesanan</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Order Details */}
          <div className="md:col-span-2 space-y-6">

            {/* 1. SECTION TYPE ORDER & MITRA (If Direct) */}
            {checkoutType === 'direct' && directProviderInfo && (
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-32 bg-white/5 skew-x-12 transform translate-x-8"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Tipe Pesanan</p>
                            <div className="flex items-center gap-2">
                                <span className="bg-red-600 text-xs font-bold px-2 py-0.5 rounded text-white">Direct Booking</span>
                            </div>
                            <h2 className="text-xl font-bold mt-2">{directProviderInfo.name}</h2>
                            <p className="text-xs text-gray-300">Mitra Pilihan Anda</p>
                        </div>
                        <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 2. SECTION LOKASI & PROPERTI */}
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                   </div>
                   <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase">Destinasi</p>
                      <h2 className="text-base font-bold text-gray-900">Lokasi & Properti</h2>
                   </div>
                </div>
                <button onClick={() => router.push('/profile')} className="text-xs font-bold text-red-600 hover:underline">Ganti Alamat</button>
              </div>

              {selectedAddress && orderLocation ? (
                 <div className="space-y-4">
                     {/* Address Card */}
                     <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex gap-3">
                            <div className="mt-1">
                                <span className="block w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100"></span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">{userProfile?.fullName}</p>
                                <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                                    {selectedAddress.detail}, {selectedAddress.village}, {selectedAddress.district}, {selectedAddress.city}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 h-24 w-full rounded-lg overflow-hidden relative">
                             <LocationPicker 
                                initialLat={orderLocation.coordinates[1]} 
                                initialLng={orderLocation.coordinates[0]}
                                onLocationChange={handleLocationChange}
                            />
                        </div>
                     </div>

                     {/* Property Details Inputs */}
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Tipe</label>
                            <select 
                                value={propertyDetails.type}
                                onChange={(e) => setPropertyDetails(prev => ({...prev, type: e.target.value}))}
                                className="w-full text-sm bg-white border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-red-500 outline-none"
                            >
                                <option value="">Pilih...</option>
                                <option value="rumah">Rumah</option>
                                <option value="apartemen">Apartemen</option>
                                <option value="kantor">Kantor</option>
                                <option value="ruko">Ruko</option>
                            </select>
                         </div>
                         <div>
                             <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Lantai</label>
                             <input 
                                type="number" 
                                min="0"
                                value={propertyDetails.floor ?? ''}
                                onChange={(e) => setPropertyDetails(prev => ({...prev, floor: e.target.value ? parseInt(e.target.value) : null}))}
                                className="w-full text-sm bg-white border border-gray-200 rounded-lg p-2 outline-none"
                                placeholder="Dasar/1/2..."
                             />
                         </div>
                     </div>
                     <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={propertyDetails.hasParking} onChange={(e) => setPropertyDetails(prev => ({...prev, hasParking: e.target.checked}))} className="rounded text-red-600"/>
                            Ada Parkir
                        </label>
                        <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={propertyDetails.hasElevator} onChange={(e) => setPropertyDetails(prev => ({...prev, hasElevator: e.target.checked}))} className="rounded text-red-600"/>
                            Ada Lift
                        </label>
                     </div>
                     <input 
                        type="text" 
                        value={propertyDetails.accessNote}
                        onChange={(e) => setPropertyDetails(prev => ({...prev, accessNote: e.target.value}))}
                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none focus:bg-white focus:border-red-300"
                        placeholder="Catatan akses (misal: Pagar hitam, kunci dititip satpam)"
                     />
                 </div>
              ) : (
                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-200">
                    Mohon lengkapi alamat di profil Anda.
                </div>
              )}
            </div>

            {/* 3. SECTION JADWAL */}
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-gray-500 uppercase">Waktu</p>
                        <h2 className="text-base font-bold text-gray-900">Jadwal Kunjungan</h2>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                         <label className="text-xs font-medium text-gray-600 mb-1 block">Tanggal Kunjungan <span className="text-red-500">*</span></label>
                         <input 
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={handleScheduledAtChange}
                            min={new Date().toISOString().slice(0, 16)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                    <div>
                         <label className="text-xs font-medium text-gray-600 mb-1 block">Jam Mulai (Pref)</label>
                         <input type="time" value={timeSlot.preferredStart} onChange={(e) => setTimeSlot(prev => ({...prev, preferredStart: e.target.value}))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"/>
                    </div>
                    <div>
                         <label className="text-xs font-medium text-gray-600 mb-1 block">Jam Selesai (Pref)</label>
                         <input type="time" value={timeSlot.preferredEnd} onChange={(e) => setTimeSlot(prev => ({...prev, preferredEnd: e.target.value}))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"/>
                    </div>
                </div>
            </div>

            {/* 4. SECTION KONTAK (Preview Mode with Edit Toggle) */}
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-gray-500 uppercase">Penerima</p>
                            <h2 className="text-base font-bold text-gray-900">Info Kontak</h2>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsEditingContact(!isEditingContact)} 
                        className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded transition-colors"
                    >
                        {isEditingContact ? 'Selesai' : 'Ubah'}
                    </button>
                </div>

                {!isEditingContact ? (
                    // PREVIEW MODE
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Nama</p>
                            <p className="font-bold text-gray-900 text-base">{customerContact.name || '-'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Telepon</p>
                            <p className="font-bold text-gray-900 text-base">{customerContact.phone || '-'}</p>
                        </div>
                        {customerContact.alternatePhone && (
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Alt. Phone</p>
                                <p className="font-medium text-gray-700 text-sm">{customerContact.alternatePhone}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // EDIT MODE
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">Nama Penerima</label>
                                <input 
                                    type="text"
                                    value={customerContact.name}
                                    onChange={(e) => setCustomerContact(prev => ({...prev, name: e.target.value}))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">No. HP Utama <span className="text-red-500">*</span></label>
                                <input 
                                    type="tel"
                                    value={customerContact.phone}
                                    onChange={(e) => setCustomerContact(prev => ({...prev, phone: e.target.value}))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                             <label className="text-xs font-medium text-gray-600 mb-1 block">Nomor Darurat (Opsional)</label>
                             <input 
                                type="tel"
                                value={customerContact.alternatePhone}
                                onChange={(e) => setCustomerContact(prev => ({...prev, alternatePhone: e.target.value}))}
                                placeholder="Nomor cadangan..."
                                className="w-full md:w-1/2 px-4 py-2 border border-gray-200 rounded-xl text-sm outline-none"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 5. SECTION DETAIL ITEM */}
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                         </div>
                         <h2 className="text-base font-bold text-gray-900">Rincian Layanan</h2>
                    </div>
                </div>
                <div className="space-y-3">
                    {activeCartItems.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3 py-3 border-b border-gray-50 last:border-b-0">
                        <div>
                        <h3 className="text-sm font-bold text-gray-900">{item.serviceName}</h3>
                        <p className="text-xs text-gray-600 mt-1">{item.quantity} x {formatCurrency(item.pricePerUnit)}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(item.totalPrice)}</p>
                    </div>
                    ))}
                </div>
            </div>

          </div>

          {/* RIGHT COLUMN - Payment Summary */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm sticky top-24 space-y-5">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Ringkasan Pembayaran</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Harga Layanan</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(currentTotalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biaya Layanan (Admin)</span>
                  <span className="font-semibold text-gray-900">{adminFee === 0 ? 'Gratis' : formatCurrency(adminFee)}</span>
                </div>
                
                {/* Promo Section */}
                {appliedPromo ?  (
                   <div className="flex justify-between items-center text-green-600 bg-green-50 p-2.5 rounded-xl border border-green-100">
                     <div>
                        <span className="font-bold text-xs block">VOUCHER: {appliedPromo.code}</span>
                     </div>
                     <div className="flex items-center gap-2">
                         <span className="font-bold text-sm">-{formatCurrency(appliedPromo.discount)}</span>
                         <button onClick={handleRemovePromo} className="text-red-500 hover:text-red-700">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                     </div>
                   </div>
                ) : (
                    <button 
                        onClick={() => setIsPromoModalOpen(true)}
                        className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 text-xs font-semibold hover:border-red-300 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        Gunakan Kode Promo / Voucher
                    </button>
                )}
              </div>
              
              <div className="border-t border-dashed border-gray-200 pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-gray-900 font-bold text-sm mb-1">Total Tagihan</span>
                  <span className="text-2xl font-black text-red-600">
                      {formatCurrency(Math.max(0, currentTotalAmount + adminFee - (appliedPromo?.discount || 0)))}
                  </span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrderAndPay}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 ${
                  isProcessing 
                    ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-red-600 hover:bg-red-700 shadow-red-200 hover:-translate-y-1'
                }`}
              >
                {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
              </button>

              <p className="text-[10px] text-gray-400 text-center leading-tight">
                Dengan menekan tombol Bayar, pesanan akan diteruskan ke mitra dan Anda menyetujui S&K berlaku.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Promo (No changes needed just keeping structure) */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-900">Pakai Promo</h3>
                    <button onClick={() => setIsPromoModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="p-4 space-y-4">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                            placeholder="Ketik kode..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none uppercase font-bold"
                        />
                        <button 
                            onClick={() => handleApplyPromo(promoCodeInput)}
                            disabled={!promoCodeInput || isCheckingVoucher}
                            className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl disabled:bg-gray-300 hover:bg-red-700 transition-colors"
                        >
                            Pakai
                        </button>
                    </div>
                    
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Voucher Anda</p>
                        {availableVouchers.length > 0 ? (
                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {availableVouchers.map((voucher) => (
                                    <div 
                                        key={voucher._id} 
                                        onClick={() => {
                                            if (currentTotalAmount >= voucher.minPurchase) {
                                                handleApplyPromo(voucher.code);
                                            }
                                        }}
                                        className={`border rounded-xl p-3 flex justify-between items-center cursor-pointer transition-all ${currentTotalAmount < voucher.minPurchase ? 'opacity-50 grayscale border-gray-100' : 'hover:border-red-300 hover:bg-red-50 border-gray-200'}`}
                                    >
                                        <div>
                                            <p className="font-bold text-gray-900">{voucher.code}</p>
                                            <p className="text-xs text-gray-500">{voucher.description}</p>
                                        </div>
                                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                                            Hemat {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : formatCurrency(voucher.discountValue)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">Tidak ada voucher tersedia.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default function OrderSummaryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    }>
      <OrderSummaryContent />
    </Suspense>
  );
}