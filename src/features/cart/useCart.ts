// src/features/cart/useCart.ts
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Tipe untuk satu item di Keranjang
export interface CartItem {
    id: string;
    serviceId: string;
    serviceName: string;
    category?: string;
    orderType: 'direct' | 'basic';
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
    providerId?: string;
    providerName?: string;
    requirements?: string[];
}

const CART_KEY = 'posko_cart';

export const getCartItemId = (serviceId: string, orderType: 'direct' | 'basic', providerId?: string | null) => {
    return `${serviceId}-${orderType}-${providerId || 'default'}`;
};

export const useCart = () => {
    // [HYDRATION FIX] State awal selalu kosong untuk menghindari mismatch Server vs Client
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Ref untuk melacak apakah perubahan state berasal dari event storage (tab lain)
    const isSyncingFromStorage = useRef(false);

    // 1. Initial Load & Storage Listener (Mount Only)
    useEffect(() => {
        // Load data awal dari LocalStorage
        try {
            const saved = localStorage.getItem(CART_KEY);
            if (saved) {
                setCart(JSON.parse(saved));
            }
        } catch (e) {
            console.error("[Cart] Failed to parse initial storage:", e);
        } finally {
            setIsInitialized(true);
        }

        // Listener untuk sinkronisasi antar Tab browser
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === CART_KEY) {
                try {
                    const newValue = event.newValue ? JSON.parse(event.newValue) : [];
                    isSyncingFromStorage.current = true; // Tandai flag
                    setCart(newValue);
                } catch (e) {
                    console.error("[Cart] Sync error:", e);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // 2. [CRITICAL FIX] Direct Save ke localStorage
    // Mekanisme debounce dihapus agar data PASTI tersimpan sebelum user navigasi (pindah halaman).
    // Ini mencegah kasus "Keranjang Kosong" saat user klik Checkout dengan cepat.
    useEffect(() => {
        // Jangan simpan jika belum inisialisasi atau update berasal dari tab lain
        if (!isInitialized) return;

        if (isSyncingFromStorage.current) {
            isSyncingFromStorage.current = false;
            return;
        }

        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (e) {
            console.error("[Cart] Save error:", e);
        }
    }, [cart, isInitialized]);

    // [HELPER] Cek konflik lebih robust (Strict Single Provider Rule)
    const checkConflict = useCallback((newItem: Omit<CartItem, 'totalPrice' | 'id'>): boolean => {
        if (cart.length === 0) return false;

        // Validasi quantity sebelum cek konflik
        if (!newItem.quantity || newItem.quantity <= 0) {
            return true; // Quantity invalid dianggap conflict
        }

        // Ambil sample item pertama dari cart yang ada
        const existingSample = cart[0];

        // 1. Cek Order Type Conflict (Basic vs Direct)
        if (existingSample.orderType !== newItem.orderType) {
            return true;
        }

        // 2. Cek Provider Conflict (Khusus Direct Order)
        // Jika type 'direct', providerId HARUS sama.
        if (newItem.orderType === 'direct') {
            if (existingSample.providerId !== newItem.providerId) {
                return true;
            }
        }

        // 3. Cek Duplicate ServiceId (Prevent duplicate items dengan service sama)
        // Jika serviceId sama dengan item yang sudah ada di cart, itu bukan conflict tapi update
        // Tapi jika serviceId berbeda dan orderType/providerId berbeda, itu conflict
        const hasDuplicateService = cart.some(existing => 
            existing.serviceId === newItem.serviceId && 
            existing.orderType === newItem.orderType &&
            (newItem.orderType === 'basic' || existing.providerId === newItem.providerId)
        );
        
        // Duplicate serviceId dengan kondisi sama adalah OK (akan di-update)
        // Tapi jika ada serviceId berbeda dengan orderType/providerId berbeda, itu conflict
        // Logic di atas sudah handle ini dengan cek orderType dan providerId terlebih dahulu

        return false;
    }, [cart]);

    // [ACTION] Update atau Tambah Item
    const upsertItem = useCallback((item: Omit<CartItem, 'totalPrice' | 'id'>) => {
        // Validasi quantity sebelum proses
        if (!item.quantity || item.quantity <= 0) {
            console.warn('[Cart] Invalid quantity:', item.quantity);
            return; // Jangan update jika quantity invalid
        }

        // Validasi konflik sebelum update state (Extra safety)
        // Idealnya UI sudah memanggil checkConflict sebelumnya
        if (checkConflict(item)) {
            console.warn('[Cart] Conflict detected, item not added:', item);
            return; // Jangan update jika ada conflict
        }

        const itemId = getCartItemId(item.serviceId, item.orderType, item.providerId);

        setCart(prevCart => {
            // Jika cart kosong, langsung tambah
            if (prevCart.length === 0) {
                const quantity = item.quantity;
                if (quantity <= 0) return [];

                return [{
                    ...item,
                    id: itemId,
                    totalPrice: quantity * item.pricePerUnit
                }];
            }

            // Logic Replace jika ada konflik provider (Optional: bisa dihandle di UI, 
            // tapi di sini kita asumsikan UI sudah confirm reset)
            // Namun fungsi ini 'upsert', jadi asumsinya item sudah valid untuk masuk.

            const existingIndex = prevCart.findIndex(existing => existing.id === itemId);
            const quantity = item.quantity;
            const totalPrice = quantity * item.pricePerUnit;

            // Hapus item jika quantity <= 0 (Validasi Defensive)
            if (quantity <= 0) {
                if (existingIndex >= 0) {
                    const updated = [...prevCart];
                    updated.splice(existingIndex, 1);
                    return updated;
                }
                return prevCart;
            }

            // Update item yang sudah ada
            if (existingIndex >= 0) {
                const updated = [...prevCart];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    ...item,
                    id: itemId,
                    totalPrice,
                };
                return updated;
            }

            // Tambah item baru
            const newItem: CartItem = {
                ...item,
                id: itemId,
                totalPrice,
            };

            return [...prevCart, newItem];
        });
    }, [checkConflict]);

    // [ACTION] Reset Cart dan Tambah Item Baru (Replace Cart)
    const resetAndAddItem = useCallback((item: Omit<CartItem, 'totalPrice' | 'id'>) => {
        const itemId = getCartItemId(item.serviceId, item.orderType, item.providerId);
        const totalPrice = item.quantity * item.pricePerUnit;

        const newItem: CartItem = {
            ...item,
            id: itemId,
            totalPrice,
        };

        setCart([newItem]);
    }, []);

    const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
        setCart(prevCart => {
            // Jika quantity 0, hapus item
            if (quantity <= 0) {
                return prevCart.filter(item => item.id !== itemId);
            }

            return prevCart.map(item => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        quantity,
                        totalPrice: quantity * item.pricePerUnit,
                    };
                }
                return item;
            });
        });
    }, []);

    const removeItem = useCallback((itemId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        // Force clear localStorage segera untuk kasus logout/checkout success
        localStorage.removeItem(CART_KEY);
    }, []);

    // [OPTIMIZATION] Memoize Derived State
    const { totalItems, totalAmount } = useMemo(() => {
        return cart.reduce((acc, item) => ({
            totalItems: acc.totalItems + item.quantity,
            totalAmount: acc.totalAmount + item.totalPrice
        }), { totalItems: 0, totalAmount: 0 });
    }, [cart]);

    return {
        cart,
        upsertItem,
        resetAndAddItem,
        checkConflict,
        removeItem,
        clearCart,
        totalItems,
        totalAmount,
        updateItemQuantity,
        isInitialized // Expose state ini jika UI butuh loading state saat hydration
    };
};