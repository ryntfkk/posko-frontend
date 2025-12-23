// src/app/order/summary/page.tsx
'use client';

import { useMemo, useState, Suspense, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

import { useCart } from '@/features/cart/useCart';
import { createOrder, cancelOrder, previewOrder } from '@/features/orders/api';
import { createPayment } from '@/features/payments/api';
import { CreateOrderPayload, CustomerContact, PropertyDetails, Attachment } from '@/features/orders/types';
import useMidtrans from '@/hooks/useMidtrans';
import { fetchProfile, updateProfile } from '@/features/auth/api';
import { User, Address, GeoLocation } from '@/features/auth/types';
import { getDefaultAddress } from '@/features/addresses/api';

// Import API Provider & Types
import { fetchProviderById } from '@/features/providers/api';
import { Provider } from '@/features/providers/types';
import api from '@/lib/axios';

// Import API & Types Settings & Vouchers
import { settingsApi } from '@/features/settings/api';
import { voucherApi } from '@/features/vouchers/api';
import { Voucher } from '@/features/vouchers/types';
import { fetchProvinces, fetchRegionChildren, Region } from '@/features/regions/api';

// Import komponen lokal
import { AttachmentUploader } from '@/components/OrderComponents';

// Import Dynamic untuk Map
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

// Konstanta Slot Waktu untuk UX yang lebih baik
const TIME_SLOTS = [
  { id: 'morning', label: 'Pagi', range: '08:00 - 11:00', start: '08:00', end: '11:00' },
  { id: 'noon', label: 'Siang', range: '11:00 - 14:00', start: '11:00', end: '14:00' },
  { id: 'afternoon', label: 'Sore', range: '14:00 - 17:00', start: '14:00', end: '17:00' },
  { id: 'evening', label: 'Malam', range: '19:00 - 21:00', start: '19:00', end: '21:00' },
];

const MIN_LEAD_TIME_HOURS = 2; // Minimal 2 jam sebelum kedatangan
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

function OrderSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { cart, clearCart, isInitialized } = useCart();

  const isSnapLoaded = useMidtrans();

  // State Data User
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // State Provider (Untuk Foto Profil)
  const [providerDetail, setProviderDetail] = useState<Provider | null>(null);

  // State Settings & Vouchers
  const [adminFee, setAdminFee] = useState(0);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);

  // State Form/Input
  const [isProcessing, setIsProcessing] = useState(false);

  // State Jadwal Baru (Date + Slot)
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // State Promo (Modal & Code)
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string, discount: number } | null>(null);
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);

  // [NEW] State for Preview Price from Backend
  const [pricePreview, setPricePreview] = useState<{
    subtotal: number;
    adminFee: number;
    discount: number;
    total: number;
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isValidationVisible, setIsValidationVisible] = useState(false);

  // State UI Toggle
  const [isContactEditMode, setIsContactEditMode] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Alamat & Lokasi
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>(undefined);
  const [tempAddress, setTempAddress] = useState<Address>({
    detail: '',
    province: '',
    city: '',
    district: '',
    village: '',
    postalCode: ''
  });
  const [orderLocation, setOrderLocation] = useState<GeoLocation | undefined>(undefined);

  // [NEW] Region States
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [selectedVillageId, setSelectedVillageId] = useState<string>(''); // Not strictly needed for logic if we just save name, but good for UI consistency

  // Customer Contact
  const [customerContact, setCustomerContact] = useState<CustomerContact>({
    name: '',
    phone: '',
    alternatePhone: ''
  });
  const [showAlternatePhone, setShowAlternatePhone] = useState(false);

  // Property Details
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>({
    type: '',
    floor: null,
    hasParking: true,
    hasElevator: false,
    accessNote: ''
  });

  // Attachments 
  interface UIAttachment extends Attachment {
    file?: File;
  }
  const [attachments, setAttachments] = useState<UIAttachment[]>([]);

  // Parse Query Params
  const checkoutType = searchParams?.get('type') as 'direct' | 'basic' || 'basic';
  const selectedProviderId = searchParams?.get('providerId') || null;
  const categoryParam = searchParams?.get('category') || null;

  // Filter Keranjang
  const activeCartItems = useMemo(() => {
    return cart.filter((item) => {
      if (item.quantity <= 0) return false;

      if (checkoutType === 'basic') {
        if (item.orderType !== 'basic') return false;

        // [PERBAIKAN] Normalisasi kategori agar pencocokan string lebih robust (service-ac == Service AC)
        if (categoryParam) {
          const itemCategoryNormalized = (item.category ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const filterCategoryNormalized = categoryParam.toLowerCase().replace(/[^a-z0-9]/g, '');

          return itemCategoryNormalized === filterCategoryNormalized;
        }
        return true;
      } else {
        return item.orderType === 'direct' && item.providerId === selectedProviderId;
      }
    });
  }, [cart, checkoutType, selectedProviderId, categoryParam]);

  const currentTotalAmount = activeCartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Ekstrak provider data untuk validasi tanggal (Fallback data dari Cart)
  const providerData = useMemo(() => {
    if (checkoutType === 'direct' && activeCartItems.length > 0) {
      const firstItem = activeCartItems[0];
      return {
        name: firstItem.providerName || 'Mitra Posko',
        bookedDates: (firstItem as any).bookedDates || [],
        blockedDates: (firstItem as any).blockedDates || []
      };
    }
    return { name: '', bookedDates: [], blockedDates: [] };
  }, [checkoutType, activeCartItems]);

  // Load Provider Detail
  useEffect(() => {
    if (checkoutType === 'direct' && activeCartItems.length > 0) {
      const firstItem = activeCartItems[0];
      if (firstItem.providerId) {
        fetchProviderById(firstItem.providerId)
          .then((res) => {
            if (res.data) setProviderDetail(res.data);
          })
          .catch((err) => console.error("[OrderSummary] Failed to load provider detail:", err));
      }
    }
  }, [checkoutType, activeCartItems]);

  // Helper function untuk cek apakah tanggal tidak tersedia
  const isDateUnavailable = useCallback((dateString: string, slotStart?: string): { unavailable: boolean; reason: string } => {
    if (!dateString) return { unavailable: false, reason: '' };

    const selectedDateObj = new Date(dateString);
    const dateOnly = selectedDateObj.toISOString().split('T')[0];

    // Cek apakah tanggal sudah lewat
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDateObj < today) {
      return { unavailable: true, reason: 'Tanggal sudah lewat' };
    }

    // [NEW] Validasi Lead Time 2 Jam
    if (slotStart) {
      const [hours, minutes] = slotStart.split(':').map(Number);
      const slotDateTime = new Date(selectedDateObj);
      slotDateTime.setHours(hours, minutes, 0, 0);

      const diffInHours = (slotDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffInHours < MIN_LEAD_TIME_HOURS) {
        return { unavailable: true, reason: `Minimal pemesanan ${MIN_LEAD_TIME_HOURS} jam sebelum jam kedatangan` };
      }
    }

    const currentBlockedDates = providerDetail?.blockedDates || providerData.blockedDates;
    const currentBookedDates = providerDetail?.bookedDates || providerData.bookedDates;

    const isBlocked = currentBlockedDates.some((d: string) => {
      const blockedDate = d.split('T')[0];
      return blockedDate === dateOnly;
    });

    if (isBlocked) {
      return { unavailable: true, reason: 'Mitra sedang libur pada tanggal ini' };
    }

    const isBooked = currentBookedDates.some((d: string) => {
      const bookedDate = d.split('T')[0];
      return bookedDate === dateOnly;
    });

    if (isBooked) {
      return { unavailable: true, reason: 'Mitra sudah penuh pada tanggal ini' };
    }

    return { unavailable: false, reason: '' };
  }, [providerData, providerDetail]);

  // Load User Profile, Settings, & Vouchers
  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await fetchProfile();
        const profile = profileRes.data.profile;
        setUserProfile(profile);

        // [UPDATE] Load default address from Address API instead of profile
        const defaultAddress = await getDefaultAddress();
        if (defaultAddress) {
          const addressObj = {
            province: defaultAddress.province,
            city: defaultAddress.city,
            district: defaultAddress.district || '',
            village: defaultAddress.village || '',
            postalCode: defaultAddress.postalCode,
            detail: defaultAddress.detail
          };
          setSelectedAddress(addressObj);
          setTempAddress(addressObj);
        }
        if (defaultAddress?.location && defaultAddress.location.coordinates && defaultAddress.location.coordinates[0] !== 0) {
          setOrderLocation(defaultAddress.location);
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

  // Handler update lokasi dari Map
  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setOrderLocation({
      type: 'Point',
      coordinates: [lng, lat]
    });
  }, []);


  // [NEW] Fetch Price Preview
  useEffect(() => {
    const fetchPreview = async () => {
      if (activeCartItems.length === 0) {
        setPricePreview(null);
        return;
      }
      setIsLoadingPreview(true);
      try {
        const response = await previewOrder({
          items: activeCartItems.map(item => ({
            serviceId: item.serviceId,
            quantity: item.quantity
          })),
          voucherCode: appliedPromo?.code,
          orderType: checkoutType,
          providerId: activeCartItems[0].providerId
        });
        setPricePreview(response.data.data);
      } catch (error) {
        console.error('Preview error:', error);
        setPricePreview(null);
      } finally {
        setIsLoadingPreview(false);
      }
    };
    fetchPreview();
  }, [activeCartItems, appliedPromo?.code]);


  // Handler Simpan Alamat (Modal)
  const handleSaveAddress = async () => {
    // Validasi Lengkap
    if (!tempAddress.detail || !tempAddress.province || !tempAddress.city || !tempAddress.district || !tempAddress.village) {
      alert("Mohon lengkapi semua field alamat (Provinsi, Kota, Kecamatan, Kelurahan, & Detail).");
      return;
    }

    try {
      // Update local state untuk order ini
      setSelectedAddress(tempAddress);

      // Update ke profil user agar tersimpan
      await updateProfile({ address: tempAddress });

      setIsAddressModalOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan alamat:", error);
      alert("Gagal menyimpan alamat, namun akan tetap digunakan untuk pesanan ini.");
      setSelectedAddress(tempAddress);
      setIsAddressModalOpen(false);
    }
  };

  // [NEW] Region Handlers
  useEffect(() => {
    // Fetch provinces when modal opens or component mounts
    if (isAddressModalOpen && provinces.length === 0) {
      fetchProvinces().then(res => {
        if (res.success) setProvinces(res.data);
      });
    }
  }, [isAddressModalOpen, provinces.length]);

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedProvinceId(id);

    // Reset lower levels
    setCities([]); setDistricts([]); setVillages([]);
    setSelectedCityId(''); setSelectedDistrictId(''); setSelectedVillageId('');

    // Update Name in tempAddress
    const region = provinces.find(p => p.id === id);
    setTempAddress(prev => ({
      ...prev,
      province: region?.name || '',
      city: '', district: '', village: ''
    }));

    if (id) {
      const res = await fetchRegionChildren(id);
      if (res.success) setCities(res.data);
    }
  };

  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCityId(id);

    setDistricts([]); setVillages([]);
    setSelectedDistrictId(''); setSelectedVillageId('');

    const region = cities.find(c => c.id === id);
    setTempAddress(prev => ({
      ...prev,
      city: region?.name || '',
      district: '', village: ''
    }));

    if (id) {
      const res = await fetchRegionChildren(id);
      if (res.success) setDistricts(res.data);
    }
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedDistrictId(id);

    setVillages([]);
    setSelectedVillageId('');

    const region = districts.find(d => d.id === id);
    setTempAddress(prev => ({
      ...prev,
      district: region?.name || '',
      village: ''
    }));

    if (id) {
      const res = await fetchRegionChildren(id);
      if (res.success) setVillages(res.data);
    }
  };

  const handleVillageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedVillageId(id);

    const region = villages.find(v => v.id === id);
    setTempAddress(prev => ({
      ...prev,
      village: region?.name || ''
    }));
  };

  // Handler Date Change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSelectedDate(newValue);

    // Reset slot jika tidak valid
    if (selectedSlotId) {
      const slot = TIME_SLOTS.find(s => s.id === selectedSlotId);
      if (slot) {
        const validation = isDateUnavailable(newValue, slot.start);
        if (validation.unavailable) {
          setSelectedSlotId(null);
        }
      }
    }

    if (checkoutType === 'direct' && newValue) {
      const validation = isDateUnavailable(newValue);
      if (validation.unavailable) {
        setTimeout(() => {
          alert(`⚠️ Peringatan: ${validation.reason}. Silakan pilih tanggal lain.`);
          setSelectedDate('');
          setSelectedSlotId(null);
        }, 100);
      }
    }
  };

  // [NEW] Handler Slot Selection
  const handleSlotSelect = (slotId: string, slotStart: string) => {
    if (!selectedDate) return;

    const validation = isDateUnavailable(selectedDate, slotStart);
    if (validation.unavailable) {
      alert(`⚠️ ${validation.reason}`);
      return;
    }

    setSelectedSlotId(slotId);
  };

  // [NEW] Handler Order Sekarang (Auto +2h 10m)
  const handleOrderNow = () => {
    const now = new Date();
    const targetTime = new Date(now.getTime() + 2 * 60 * 60 * 1000 + 10 * 60 * 1000); // Now + 2h 10m

    const targetDateStr = targetTime.toISOString().split('T')[0];
    const targetHour = targetTime.getHours();

    let foundSlot = null;
    let finalDateStr = targetDateStr;

    // Cari slot yang mencakup targetHour atau setelahnya hari ini
    // Iterasi TIME_SLOTS (urut pagi -> malam)
    for (const slot of TIME_SLOTS) {
      const startH = parseInt(slot.start.split(':')[0]);
      const endH = parseInt(slot.end.split(':')[0]);

      // Target sebelum slot berakhir?
      if (targetHour < endH) {
        // Cek validitas lead time (redundant but safe)
        const check = isDateUnavailable(targetDateStr, slot.start);
        if (!check.unavailable) {
          foundSlot = slot;
          break;
        }
      }
    }

    // Jika tidak ada slot hari ini, cek besok pagi
    if (!foundSlot) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      finalDateStr = tomorrow.toISOString().split('T')[0];
      foundSlot = TIME_SLOTS[0]; // Pagi besok
    }

    setSelectedDate(finalDateStr);
    if (foundSlot) {
      setSelectedSlotId(foundSlot.id);
    }
  };

  // Handler Promo
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
        alert(`Promo ${code.toUpperCase()} valid! Hemat ${formatCurrency(estimatedDiscount)}.`);
      } else {
        alert(`Promo ${code.toUpperCase()} valid! Hemat ${formatCurrency(estimatedDiscount)}.`);
      }

    } catch (error: any) {
      console.error("Voucher Error:", error);
      alert(error.response?.data?.message || 'Kode promo tidak valid.');
      setAppliedPromo(null);
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  const handlePlaceOrderAndPay = async () => {
    setIsValidationVisible(true);

    if (!selectedDate || !selectedSlotId || !selectedAddress || !orderLocation || orderLocation.coordinates[0] === 0 || !customerContact.phone.trim()) {
      // Validasi UI akan muncul di bottom bar
      return;
    }

    const selectedSlot = TIME_SLOTS.find(s => s.id === selectedSlotId);
    if (!selectedSlot) return;

    const scheduledDateTime = new Date(`${selectedDate}T${selectedSlot.start}:00`);
    const scheduledAtISO = scheduledDateTime.toISOString();

    // [FRONTEND] Lead Time validation for UX (instant feedback)
    const timeValidation = isDateUnavailable(selectedDate, selectedSlot.start);
    if (timeValidation.unavailable) {
      alert(`❌ ${timeValidation.reason}`);
      return;
    }

    if (checkoutType === 'direct') {
      const validation = isDateUnavailable(selectedDate);
      if (validation.unavailable) {
        alert(`❌ ${validation.reason}. Silakan pilih tanggal lain.`);
        return;
      }
    }

    // [NEW] SERVER-SIDE schedule validation (Security - Cannot be bypassed)
    try {
      const scheduleValidation = await api.post('/orders/validate-schedule', {
        providerId: checkoutType === 'direct' ? selectedProviderId : null,
        scheduledAt: scheduledAtISO,
        slotStart: selectedSlot.start
      });

      if (!scheduleValidation.data?.data?.valid) {
        alert(`❌ ${scheduleValidation.data?.data?.reason || 'Jadwal tidak valid'}`);
        return;
      }
    } catch (error: any) {
      console.error('[VALIDATION] Schedule validation failed:', error);
      alert(`❌ ${error.response?.data?.message || 'Gagal memvalidasi jadwal. Silakan coba lagi.'}`);
      return;
    }

    // [NEW] Validasi Phone Regex
    const cleanPhone = customerContact.phone.trim();
    if (!PHONE_REGEX.test(cleanPhone)) {
      alert("❌ Format nomor telepon tidak valid. Gunakan 10-15 digit angka (cth: 08123456789).");
      setIsContactEditMode(true);
      return;
    }

    if (!isSnapLoaded) {
      alert('Sistem pembayaran sedang dimuat, mohon tunggu sebentar...');
      return;
    }

    setIsProcessing(true);

    // [FIX] Move orderId and orderNumber outside try block for callback access
    let orderId: string | null = null;
    let orderNumber: string | null = null;

    try {
      const mainItem = activeCartItems[0];

      // [SECURITY UPDATE] Backend akan menghitung semua nilai finansial
      // totalAmount, adminFee, dan discountAmount TIDAK DIKIRIM lagi
      // Backend akan recalculate dari items dan voucherCode untuk keamanan
      const orderPayload: any = {
        orderType: mainItem.orderType,
        providerId: mainItem.orderType === 'direct' ? mainItem.providerId : null,
        // Removed: totalAmount, adminFee, discountAmount (backend will calculate)

        scheduledAt: scheduledAtISO,
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
          alternatePhone: showAlternatePhone ? (customerContact.alternatePhone?.trim() || '') : ''
        },

        orderNote: '',
        propertyDetails: propertyDetails,
        scheduledTimeSlot: {
          preferredStart: selectedSlot.start,
          preferredEnd: selectedSlot.end,
          isFlexible: true
        },
        attachments: attachments.map(att => ({
          url: att.url,
          type: att.type,
          description: att.description,
          file: null // [FIX] Jangan kirim file object ke API, hanya URL
        })),
        voucherCode: appliedPromo?.code
      };

      console.log("1. Membuat Order...", orderPayload);

      const orderRes = await createOrder(orderPayload);

      // [FIX] Mengambil data ID dan Number dengan benar dari struktur response Axios (createOrder masih return AxiosResponse)
      // Response backend: { message: "...", data: { _id: "...", orderNumber: "..." } }
      const orderData = orderRes.data.data;
      orderId = orderData._id;
      orderNumber = orderData.orderNumber;

      console.log("2. Meminta Token Pembayaran...", { orderId });

      if (!orderId) {
        throw new Error("Gagal mendapatkan Order ID dari server.");
      }

      // [ROLLBACK MECHANISM] Jika createPayment gagal, cancel order yang sudah dibuat
      try {
        // [FIX CRITICAL] createPayment di api.ts mengembalikan response.data langsung (sudah unwrapped)
        const paymentRes = await createPayment(orderId);

        // [FIX] Karena sudah unwrapped, strukturnya langsung { message: '...', data: { snapToken: '...' } }
        const paymentData = paymentRes.data;
        const snapToken = paymentData.snapToken;

        console.log("3. Membuka Snap Midtrans...", { snapToken });
        if (!snapToken) {
          throw new Error("Gagal mendapatkan Snap Token dari server pembayaran.");
        }

        if (window.snap) {
          window.snap.pay(snapToken, {
            onSuccess: (result) => {
              console.log('✅ Pembayaran Berhasil:', result);
              alert(`Pembayaran Berhasil! Order: ${orderNumber}`);
              clearCart();
              router.push('/orders');
            },
            onPending: (result) => {
              console.log('⏳ Menunggu Pembayaran:', result);
              alert(`Menunggu pembayaran untuk order ${orderNumber}...`);
              router.push(`/orders/${orderId}`);
            },
            onError: (result) => {
              console.error('❌ Gagal Bayar:', result);
              alert('Pembayaran gagal. Silakan coba lagi dari halaman detail order.');
              router.push(`/orders/${orderId}`);
            },
            onClose: () => {
              console.log('📦 Popup Ditutup. Order tersimpan.');
              router.push(`/orders/${orderId}`);
            }
          });
        }
      } catch (paymentError: any) {
        // [ROLLBACK] Jika createPayment gagal setelah createOrder sukses, cancel order
        console.error("❌ Error saat membuat payment:", paymentError);

        if (orderId) {
          try {
            console.log(`[ROLLBACK] Membatalkan order ${orderId} karena payment gagal...`);
            await cancelOrder(orderId, 'Pembayaran gagal dibuat - rollback otomatis');
            console.log(`[ROLLBACK] Order ${orderId} berhasil dibatalkan`);
          } catch (cancelError: any) {
            console.error(`[ROLLBACK] Gagal membatalkan order ${orderId}:`, cancelError);
            // Tetap lanjutkan untuk menunjukkan error payment ke user
          }
        }

        throw paymentError; // Re-throw untuk ditangani di catch block utama
      }

    } catch (error: any) {
      console.error("❌ Error saat membuat order:", error);

      // Tampilkan pesan error yang lebih informatif
      const errorMessage = error.response?.data?.message || error.message || 'Terjadi kesalahan saat memproses pesanan.';

      // Jika order sudah dibuat tapi payment gagal, beri tahu user untuk cek order mereka
      if (orderId) {
        alert(`${errorMessage}\n\nOrder #${orderNumber || orderId} telah dibuat. Silakan cek halaman order untuk mencoba pembayaran ulang.`);
        router.push(`/orders/${orderId}`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddAttachment = useCallback((file: File, desc: string) => {
    const previewUrl = URL.createObjectURL(file);
    setAttachments(prev => [...prev, { url: previewUrl, type: 'photo', description: desc.trim(), file: file }]);
  }, []);

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

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
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm0 0H7"></path>
        </svg>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Keranjang Kosong</h2>
        <Link href="/checkout" className="inline-block mt-4 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
          Kembali ke Layanan
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans relative">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-red-600 p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 block">Langkah Terakhir</span>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Ringkasan Pesanan</h1>
          </div>
        </div>
      </header>

      {/* Main Content Single Column */}
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* BAGIAN 1: INFO PROVIDER / TIPE ORDER */}
        {checkoutType === 'direct' ? (
          <section className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/5 rounded-bl-full -mr-2 -mt-2"></div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden relative border border-gray-200">
              {providerDetail?.userId?.profilePictureUrl ? (
                <Image src={providerDetail.userId.profilePictureUrl} alt="Provider" fill className="object-cover" />
              ) : (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              )}
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Direct Order</p>
              <h2 className="text-base font-bold text-gray-900">{providerDetail?.userId?.fullName || providerData.name}</h2>
              <p className="text-xs text-gray-500">Mitra Pilihan Anda</p>
            </div>
          </section>
        ) : (
          <section className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide">Basic Order</p>
              <h2 className="text-base font-bold text-gray-900">Pencarian Mitra Otomatis</h2>
              <p className="text-xs text-gray-500">Kami akan mencarikan mitra terdekat untuk Anda.</p>
            </div>
          </section>
        )}

        {/* BAGIAN 2: DETAIL ITEM */}
        <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
            <h2 className="text-sm font-bold text-gray-900">Item Layanan</h2>
            <button onClick={() => router.back()} className="text-xs font-semibold text-red-600 hover:underline">Ubah</button>
          </div>
          <div className="space-y-3">
            {activeCartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{item.serviceName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.quantity} x {formatCurrency(item.pricePerUnit)}</p>
                </div>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(item.totalPrice)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* BAGIAN: PERSYARATAN LAYANAN (JIKA ADA) */}
        {activeCartItems.some(item => item.requirements && item.requirements.length > 0) && (
          <section className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">⚠️</span>
              <h2 className="text-sm font-bold text-yellow-800">Persyaratan Pelanggan</h2>
            </div>
            <div className="space-y-4">
              {activeCartItems.map((item) => (
                item.requirements && item.requirements.length > 0 && (
                  <div key={`req-${item.id}`} className="space-y-1">
                    <p className="text-xs font-bold text-gray-800">{item.serviceName}</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {item.requirements.map((req, idx) => (
                        <li key={idx} className="text-xs text-gray-700">{req}</li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          </section>
        )}

        {/* BAGIAN 3: KONTAK PENERIMA */}
        <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h2 className="text-sm font-bold text-gray-900">Kontak Penerima</h2>
          </div>

          {!isContactEditMode ? (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p className="text-sm font-bold text-gray-900">{customerContact.name || 'Nama Belum Diisi'}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {customerContact.phone || 'No. HP Belum Diisi'}
                  {customerContact.alternatePhone ? ` / ${customerContact.alternatePhone}` : ''}
                </p>
              </div>
              <button onClick={() => setIsContactEditMode(true)} className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-700 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors shadow-sm">Ubah</button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Nama Penerima</label>
                  <input type="text" value={customerContact.name} onChange={(e) => setCustomerContact(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">No. HP Utama <span className="text-red-500">*</span></label>
                  <input type="tel" value={customerContact.phone} onChange={(e) => setCustomerContact(prev => ({ ...prev, phone: e.target.value }))} placeholder="08xx-xxxx-xxxx" className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input type="checkbox" checked={showAlternatePhone} onChange={(e) => setShowAlternatePhone(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span className="text-xs text-gray-600">Nomor cadangan</span>
                </label>
                {showAlternatePhone && (
                  <input type="tel" value={customerContact.alternatePhone} onChange={(e) => setCustomerContact(prev => ({ ...prev, alternatePhone: e.target.value }))} placeholder="Nomor HP Alternatif" className="w-full md:w-1/2 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none" />
                )}
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => setIsContactEditMode(false)} className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800">Simpan Kontak</button>
              </div>
            </div>
          )}
        </section>

        {/* BAGIAN 4: JADWAL KUNJUNGAN (IMPROVED UX) */}
        <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h2 className="text-sm font-bold text-gray-900">Jadwal Kunjungan</h2>
            </div>
            <button
              onClick={handleOrderNow}
              className="px-3 py-1.5 bg-red-50 text-xs font-bold text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Order Sekarang
            </button>
          </div>

          <div className="space-y-4">
            {/* 1. Pilih Tanggal */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Pilih Tanggal <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* 2. Pilih Slot Waktu */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Pilih Waktu Kedatangan <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isUnavailable = selectedDate ? isDateUnavailable(selectedDate, slot.start).unavailable : false;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot.id, slot.start)}
                      disabled={!selectedDate || isUnavailable}
                      className={`p-2.5 rounded-xl border text-left transition-all ${selectedSlotId === slot.id
                        ? 'bg-red-50 border-red-500 ring-1 ring-red-500'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                        } ${(!selectedDate || isUnavailable) ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                    >
                      <span className={`block text-xs font-bold ${selectedSlotId === slot.id ? 'text-red-700' : 'text-gray-900'}`}>
                        {slot.label}
                      </span>
                      <span className="block text-[10px] text-gray-500 mt-0.5">
                        {slot.range}
                      </span>
                      {isUnavailable && selectedDate && (
                        <span className="block text-[9px] text-red-500 mt-0.5">Tidak tersedia</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {!selectedDate && <p className="text-[10px] text-gray-400 mt-1 italic">Pilih tanggal dulu untuk melihat slot.</p>}
            </div>
          </div>
        </section>

        {/* BAGIAN 5: LOKASI & PROPERTI (DENGAN MODAL ALAMAT) */}
        <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h2 className="text-sm font-bold text-gray-900">Lokasi Pelayanan</h2>
            </div>
            <button
              onClick={() => {
                // Pre-fill temp address saat modal dibuka
                if (selectedAddress) setTempAddress(selectedAddress);
                setIsAddressModalOpen(true);
              }}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              {selectedAddress ? 'Ganti Alamat' : 'Tambah Alamat'}
            </button>
          </div>

          {/* Info Alamat Text */}
          {selectedAddress ? (
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800">
              <p className="font-bold">{selectedAddress.detail}</p>
              <p className="text-xs text-gray-500 mt-1">
                Kel. {selectedAddress.village}, Kec. {selectedAddress.district}, {selectedAddress.city}
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 text-xs text-yellow-800 flex items-center gap-2 cursor-pointer" onClick={() => setIsAddressModalOpen(true)}>
              <span>⚠️</span>
              <span className="underline">Alamat belum diset. Klik untuk menambah.</span>
            </div>
          )}

          {/* Peta - Selalu Render */}
          <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 relative z-0">
            <LocationPicker
              initialLat={orderLocation?.coordinates[1]}
              initialLng={orderLocation?.coordinates[0]}
              onLocationSelect={handleLocationChange}
            />
          </div>

          <p className="text-[10px] text-gray-500 text-center">Geser pin merah untuk akurasi posisi teknisi.</p>

          {/* Detail Properti */}
          <div className="pt-2 border-t border-gray-50 mt-4">
            <p className="text-xs font-bold text-gray-900 mb-3">Detail Properti</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <select value={propertyDetails.type} onChange={(e) => setPropertyDetails(prev => ({ ...prev, type: e.target.value as PropertyDetails['type'] }))} className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none">
                <option value="">Tipe Properti...</option>
                <option value="rumah">Rumah</option>
                <option value="apartemen">Apartemen</option>
                <option value="kantor">Kantor</option>
                <option value="ruko">Ruko</option>
              </select>
              <input type="text" value={propertyDetails.accessNote} onChange={(e) => setPropertyDetails(prev => ({ ...prev, accessNote: e.target.value }))} placeholder="Patokan / Catatan akses..." className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={propertyDetails.hasParking} onChange={(e) => setPropertyDetails(prev => ({ ...prev, hasParking: e.target.checked }))} className="w-3.5 h-3.5 text-red-600 rounded border-gray-300" />
                <span className="text-xs text-gray-600">Ada Parkir</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={propertyDetails.hasElevator} onChange={(e) => setPropertyDetails(prev => ({ ...prev, hasElevator: e.target.checked }))} className="w-3.5 h-3.5 text-red-600 rounded border-gray-300" />
                <span className="text-xs text-gray-600">Ada Lift</span>
              </label>
            </div>
          </div>
        </section>

        {/* BAGIAN 6: DOKUMENTASI */}
        <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Dokumentasi Kondisi (Wajib/Opsional)</h3>
            <p className="text-xs text-gray-500 mt-1">Upload foto barang/lokasi dan berikan keterangan.</p>
          </div>
          <AttachmentUploader attachments={attachments} onAdd={handleAddAttachment} onRemove={handleRemoveAttachment} />
        </section>

        {/* BAGIAN 7: RINCIAN PEMBAYARAN */}
        <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Rincian Pembayaran</h2>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal Layanan</span>
              <span className="font-medium text-gray-900">{formatCurrency(currentTotalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Aplikasi</span>
              <span className={adminFee === 0 ? 'text-green-600' : ''}>{adminFee === 0 ? 'Gratis' : formatCurrency(adminFee)}</span>
            </div>
            {appliedPromo ? (
              <div className="flex justify-between text-green-600 font-medium bg-green-50 p-2 rounded-lg mt-1">
                <div className="flex items-center gap-2">
                  <span>Voucher: {appliedPromo.code}</span>
                  <button onClick={() => setAppliedPromo(null)} className="text-red-500 hover:text-red-700">(Hapus)</button>
                </div>
                <span>-{formatCurrency(appliedPromo.discount)}</span>
              </div>
            ) : (
              <button onClick={() => setIsPromoModalOpen(true)} className="text-red-600 font-bold hover:underline text-left mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                Gunakan Voucher / Promo
              </button>
            )}
          </div>

          {/* Indikator Metode Pembayaran */}
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 mt-2">
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Metode:</div>
            <div className="text-xs font-bold text-gray-700 flex items-center gap-1">
              <span>💳</span> Midtrans (QRIS / VA / E-Wallet)
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900">Total Tagihan</span>
            <span className="text-lg font-black text-red-600">{formatCurrency(Math.max(0, currentTotalAmount + adminFee - (appliedPromo?.discount || 0)))}</span>
          </div>
        </section>

      </main>

      {/* BOTTOM FIXED CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto">
          {/* Validation Warning */}
          {isValidationVisible && (!selectedDate || !selectedSlotId || !selectedAddress || !customerContact.phone.trim()) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 flex items-start gap-2 animate-in slide-in-from-bottom-2">
              <span className="text-lg">⚠️</span>
              <div className="text-xs text-yellow-800">
                <p className="font-bold">Mohon lengkapi data berikut:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {!selectedDate && <li>Pilih Tanggal Kunjungan</li>}
                  {!selectedSlotId && <li>Pilih Waktu Kedatangan</li>}
                  {!selectedAddress && <li>Alamat Pelayanan</li>}
                  {!customerContact.phone.trim() && <li>Nomor HP Kontak</li>}
                </ul>
              </div>
            </div>
          )}

          <button
            onClick={handlePlaceOrderAndPay}
            disabled={isProcessing}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 ${isProcessing
              ? 'bg-gray-400 shadow-none'
              : 'bg-red-600 hover:bg-red-700 shadow-red-200'
              }`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Memproses...
              </>
            ) : (
              <>Bayar Sekarang <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
            )}
          </button>
        </div>
      </div>

      {/* MODAL PROMO (Tetap sama) */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-20 transition-opacity">
          <div className="bg-white w-full max-w-sm mx-auto rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900">Pakai Promo</h3>
              <button onClick={() => setIsPromoModalOpen(false)} className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-900 shadow-sm"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <input type="text" value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())} placeholder="Kode Voucher..." className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none uppercase text-sm" />
                <button onClick={() => handleApplyPromo(promoCodeInput)} disabled={!promoCodeInput || isCheckingVoucher} className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl disabled:bg-gray-300 hover:bg-gray-800 text-sm">{isCheckingVoucher ? '...' : 'Pakai'}</button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {availableVouchers.map((voucher) => (
                  <div key={voucher._id} onClick={() => { if (currentTotalAmount >= voucher.minPurchase) handleApplyPromo(voucher.code); }} className={`border border-gray-100 rounded-xl p-3 flex justify-between items-center hover:bg-red-50 hover:border-red-100 cursor-pointer transition-colors ${currentTotalAmount < voucher.minPurchase ? 'opacity-50 grayscale' : ''}`}>
                    <div><p className="font-bold text-gray-900 text-sm">{voucher.code}</p><p className="text-[10px] text-gray-500">{voucher.description}</p></div>
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">{voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : formatCurrency(voucher.discountValue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT ALAMAT (NEW) */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 animate-zoom-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">Edit Alamat Pelayanan</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Alamat Lengkap (Jalan/Gang/No)</label>
                <textarea
                  value={tempAddress.detail}
                  onChange={(e) => setTempAddress(prev => ({ ...prev, detail: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  rows={2}
                  placeholder="Contoh: Jl. Mawar No. 12, Pagar Hitam"
                />
              </div>

              {/* PROVINCE */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Provinsi</label>
                <select
                  value={selectedProvinceId}
                  onChange={handleProvinceChange}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
                >
                  <option value="">Pilih Provinsi...</option>
                  {provinces.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* KOTA/KABUPATEN */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Kota/Kabupaten</label>
                  <select
                    value={selectedCityId}
                    onChange={handleCityChange}
                    disabled={!selectedProvinceId}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Pilih Kota...</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* KECAMATAN */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Kecamatan</label>
                  <select
                    value={selectedDistrictId}
                    onChange={handleDistrictChange}
                    disabled={!selectedCityId}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Pilih Kecamatan...</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* KELURAHAN */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Kelurahan/Desa</label>
                  <select
                    value={selectedVillageId}
                    onChange={handleVillageChange}
                    disabled={!selectedDistrictId}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Pilih Kelurahan...</option>
                    {villages.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                {/* KODE POS */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={tempAddress.postalCode}
                    onChange={(e) => setTempAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Kode Pos"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsAddressModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 text-sm">Batal</button>
              <button onClick={handleSaveAddress} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 text-sm shadow-lg shadow-red-200">Simpan Alamat</button>
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