'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fetchAddresses, deleteAddress, setDefaultAddress, createAddress, updateAddress } from '@/features/addresses/api';
import { Address } from '@/features/addresses/types';
import { fetchProvinces, fetchRegionChildren } from '@/features/regions/api';
import dynamic from 'next/dynamic';

// Load Component Map secara Dynamic (Client Side Only) untuk menghindari error SSR
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-50 animate-pulse rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2 border border-gray-200">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
      <span className="text-[10px] font-medium">Memuat Peta...</span>
    </div>
  )
});

export default function AddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadAddresses = async () => {
    try {
      const response = await fetchAddresses();
      if (response.success) {
        setAddresses(response.data);
        // If editId in URL, find and set editing address
        if (editId) {
          const addressToEdit = response.data.find(addr => addr._id === editId);
          if (addressToEdit) {
            setEditingAddress(addressToEdit);
            setShowForm(true);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [editId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
      return;
    }

    try {
      // Update local state first for instant feedback
      setAddresses(prev => prev.filter(addr => addr._id !== id));
      await deleteAddress(id);
      setSuccessMessage('Alamat berhasil dihapus');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Delete error:', error);
      setErrorMessage(error.response?.data?.message || 'Gagal menghapus alamat');
      setTimeout(() => setErrorMessage(null), 3000);
      // Reload addresses on error
      loadAddresses();
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // Update local state first for instant feedback
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr._id === id
      })));
      await setDefaultAddress(id);
      setSuccessMessage('Alamat utama berhasil diubah');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      console.error('Set default error:', error);
      setErrorMessage(error.response?.data?.message || 'Gagal mengubah alamat utama');
      setTimeout(() => setErrorMessage(null), 3000);
      // Reload addresses on error
      loadAddresses();
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
    router.push(`/profile/address?edit=${address._id}`);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowForm(true);
    router.push('/profile/address?new=true');
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingAddress(null);
    router.push('/profile/address');
    loadAddresses();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Show form if editing or adding new
  if (showForm || editId || searchParams?.get('new')) {
    return (
      <AddressForm
        address={editingAddress}
        onClose={handleFormClose}
        onSuccess={handleFormClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20 flex items-center gap-3">
        <Link href="/profile" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-base font-bold text-gray-900">Alamat Tersimpan</h1>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Address List */}
        {addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`bg-white rounded-2xl p-4 shadow-sm border ${
                  address.isDefault ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-bold text-gray-900">{address.label}</span>
                    {address.isDefault && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">
                        Utama
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(address._id)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Address Content */}
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900 mb-1">{address.detail}</p>
                  <p className="text-xs text-gray-600">
                    {[address.village, address.district, address.city].filter(Boolean).join(', ')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {address.province}, {address.postalCode}
                  </p>
                </div>

                {/* Set Default Button */}
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address._id)}
                    className="w-full pt-3 border-t border-gray-100 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                  >
                    Set sebagai Utama
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Alamat</h3>
            <p className="text-sm text-gray-600 text-center">
              Simpan alamat Anda untuk memudahkan proses pemesanan.
            </p>
          </div>
        )}

        {/* Floating Add Button */}
        <button
          onClick={handleAddNew}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-red-200 flex items-center gap-2 transition-all active:scale-95 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Alamat</span>
        </button>
      </div>
    </div>
  );
}

// Address Form Component
function AddressForm({ address, onClose, onSuccess }: { address: Address | null; onClose: () => void; onSuccess: () => void }) {
  const router = useRouter();
  const isEdit = !!address;
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State Data Wilayah untuk Dropdown
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  // State ID Wilayah yang dipilih
  const [selectedProvId, setSelectedProvId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');

  // State Form Data
  const [formData, setFormData] = useState({
    label: address?.label || 'Rumah',
    detail: address?.detail || '',
    village: address?.village || '',
    district: address?.district || '',
    city: address?.city || '',
    province: address?.province || '',
    postalCode: address?.postalCode || '',
    latitude: address?.location?.coordinates?.[1] || -6.2088,
    longitude: address?.location?.coordinates?.[0] || 106.8456,
    isDefault: address?.isDefault || false
  });

  // State Koordinat
  const [coordinates, setCoordinates] = useState<{ lat: number | null; lng: number | null }>({
    lat: formData.latitude,
    lng: formData.longitude
  });

  // State Loading untuk API Wilayah
  const [wilayahLoading, setWilayahLoading] = useState({
    cities: false,
    districts: false,
    villages: false
  });

  const [showMap, setShowMap] = useState(false);


  // Load initial data
  useEffect(() => {
    const initData = async () => {
      try {
        const provRes = await fetchProvinces();
        if (provRes.success) {
          setProvinces(provRes.data);
          // If editing, find and load regions
          if (isEdit && address) {
            const prov = provRes.data.find((p: any) => p.name === address.province);
            if (prov) {
              setSelectedProvId(prov.id);
              const cityRes = await fetchRegionChildren(prov.id);
              if (cityRes.success) {
                setCities(cityRes.data);
                const city = cityRes.data.find((c: any) => c.name === address.city);
                if (city) {
                  setSelectedCityId(city.id);
                  const districtRes = await fetchRegionChildren(city.id);
                  if (districtRes.success) {
                    setDistricts(districtRes.data);
                    const district = districtRes.data.find((d: any) => d.name === address.district);
                    if (district) {
                      setSelectedDistrictId(district.id);
                      const villageRes = await fetchRegionChildren(district.id);
                      if (villageRes.success) {
                        setVillages(villageRes.data);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Gagal memuat data:", error);
      }
    };
    initData();
  }, []);

  // Handler Perubahan Dropdown Wilayah
  const handleRegionChange = (type: 'province' | 'city' | 'district' | 'village', e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const text = index > 0 ? e.target.options[index].text : '';

    setErrorMessage(null);

    if (type === 'province') {
      setSelectedProvId(id);
      setSelectedCityId('');
      setSelectedDistrictId('');
      setSelectedVillageId('');
      setCities([]);
      setDistricts([]);
      setVillages([]);

      setFormData(prev => ({
        ...prev,
        province: text,
        city: '',
        district: '',
        village: '',
        postalCode: ''
      }));

      if (id) {
        setWilayahLoading(prev => ({ ...prev, cities: true }));
        fetchRegionChildren(id)
          .then((res: any) => {
            if (res.success) setCities(res.data);
          })
          .catch((err: any) => {
            console.error(err);
            setErrorMessage('Gagal memuat data kota. Silakan coba lagi.');
          })
          .finally(() => setWilayahLoading(prev => ({ ...prev, cities: false })));
      }
    }
    else if (type === 'city') {
      setSelectedCityId(id);
      setSelectedDistrictId('');
      setSelectedVillageId('');
      setDistricts([]);
      setVillages([]);

      setFormData(prev => ({
        ...prev,
        city: text,
        district: '',
        village: '',
        postalCode: ''
      }));

      if (id) {
        setWilayahLoading(prev => ({ ...prev, districts: true }));
        fetchRegionChildren(id)
          .then((res: any) => {
            if (res.success) setDistricts(res.data);
          })
          .catch((err: any) => {
            console.error(err);
            setErrorMessage('Gagal memuat data kecamatan. Silakan coba lagi.');
          })
          .finally(() => setWilayahLoading(prev => ({ ...prev, districts: false })));
      }
    }
    else if (type === 'district') {
      setSelectedDistrictId(id);
      setSelectedVillageId('');
      setVillages([]);

      setFormData(prev => ({
        ...prev,
        district: text,
        village: '',
        postalCode: ''
      }));

      if (id) {
        setWilayahLoading(prev => ({ ...prev, villages: true }));
        fetchRegionChildren(id)
          .then((res: any) => {
            if (res.success) setVillages(res.data);
          })
          .catch((err: any) => {
            console.error(err);
            setErrorMessage('Gagal memuat data kelurahan. Silakan coba lagi.');
          })
          .finally(() => setWilayahLoading(prev => ({ ...prev, villages: false })));
      }
    }
    else if (type === 'village') {
      setSelectedVillageId(id);

      setFormData(prev => ({
        ...prev,
        village: text,
        postalCode: ''
      }));
    }
  };

  // Handler Input Text
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  // Handler Lokasi dari Peta
  const handleLocationSelect = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    setShowMap(false);
    setErrorMessage(null);
  };

  // Validasi Form
  const validateForm = (): boolean => {
    if (!formData.label || formData.label.trim().length === 0) {
      setErrorMessage('Label alamat harus diisi (contoh: Rumah, Kantor)');
      return false;
    }

    if (!formData.detail || formData.detail.trim().length === 0) {
      setErrorMessage('Detail alamat harus diisi');
      return false;
    }

    if (!formData.province || formData.province.trim().length === 0) {
      setErrorMessage('Silakan pilih Provinsi');
      return false;
    }

    if (!formData.city || formData.city.trim().length === 0) {
      setErrorMessage('Silakan pilih Kota/Kabupaten');
      return false;
    }

    if (!formData.postalCode || formData.postalCode.trim().length === 0) {
      setErrorMessage('Kode pos harus diisi');
      return false;
    }

    if (!coordinates.lat || !coordinates.lng) {
      setErrorMessage('Silakan tentukan titik lokasi di peta');
      return false;
    }

    return true;
  };

  // Submit Data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // Backend can handle both latitude/longitude or location object
      // We send both for compatibility
      const payload: any = {
        label: formData.label.trim(),
        detail: formData.detail.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
        postalCode: formData.postalCode.trim(),
        latitude: coordinates.lat!,
        longitude: coordinates.lng!,
        isDefault: formData.isDefault
      };

      // Add optional fields if they exist
      if (formData.village.trim()) payload.village = formData.village.trim();
      if (formData.district.trim()) payload.district = formData.district.trim();

      if (isEdit && address) {
        await updateAddress(address._id, payload);
        setSuccessMessage('Alamat berhasil diperbarui!');
      } else {
        await createAddress(payload);
        setSuccessMessage('Alamat baru berhasil ditambahkan!');
      }

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      console.error('Error saat save:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Gagal menyimpan alamat. Silakan coba lagi.';
      setErrorMessage(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-20 flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-gray-900">
          {isEdit ? 'Edit Alamat' : 'Tambah Alamat Baru'}
        </h1>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-5">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          {/* Label */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Label Alamat *</label>
            <input
              type="text"
              name="label"
              value={formData.label}
              onChange={handleTextChange}
              placeholder="Contoh: Rumah, Kantor"
              className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
            />
          </div>

          {/* Map Picker */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Detail Alamat & Koordinat *</label>
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="w-full py-3 px-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors mb-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Pilih Lokasi di Peta
            </button>
            <textarea
              name="detail"
              value={formData.detail}
              onChange={handleTextChange}
              rows={3}
              placeholder="Jalan, No Rumah, Patokan"
              className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all resize-none"
            />
            {coordinates.lat && coordinates.lng && (
              <p className="text-xs text-gray-500 mt-1">
                Koordinat: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>

          {/* Provinsi */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Provinsi *</label>
            <div className="relative">
              <select
                className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none appearance-none"
                value={selectedProvId}
                onChange={(e) => handleRegionChange('province', e)}
              >
                <option value="">{formData.province || "Pilih Provinsi"}</option>
                {provinces.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Kota */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Kota / Kabupaten *</label>
            <div className="relative">
              <select
                className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={selectedCityId}
                onChange={(e) => handleRegionChange('city', e)}
                disabled={!selectedProvId || wilayahLoading.cities}
              >
                <option value="">{wilayahLoading.cities ? 'Memuat...' : formData.city || "Pilih Kota"}</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                {wilayahLoading.cities ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                )}
              </div>
            </div>
          </div>

          {/* Grid Kecamatan & Kelurahan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Kecamatan</label>
              <div className="relative">
                <select
                  className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={selectedDistrictId}
                  onChange={(e) => handleRegionChange('district', e)}
                  disabled={!selectedCityId || wilayahLoading.districts}
                >
                  <option value="">{wilayahLoading.districts ? 'Memuat...' : formData.district || "Pilih..."}</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
                  {wilayahLoading.districts ? (
                    <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Kelurahan</label>
              <div className="relative">
                <select
                  className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={selectedVillageId}
                  onChange={(e) => handleRegionChange('village', e)}
                  disabled={!selectedDistrictId || wilayahLoading.villages}
                >
                  <option value="">{wilayahLoading.villages ? 'Memuat...' : formData.village || "Pilih..."}</option>
                  {villages.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
                  {wilayahLoading.villages ? (
                    <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Kode Pos */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Kode Pos *</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleTextChange}
              placeholder="12345"
              maxLength={5}
              className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
            />
          </div>

          {/* Set Default Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Set sebagai alamat utama
            </label>
          </div>

          {/* Tombol Simpan */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2
                ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}
              `}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Alamat
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="h-full flex flex-col">
            <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Pilih Lokasi</h2>
              <button
                onClick={() => setShowMap(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 relative">
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialLat={coordinates.lat || -6.2088}
                initialLng={coordinates.lng || 106.8456}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
