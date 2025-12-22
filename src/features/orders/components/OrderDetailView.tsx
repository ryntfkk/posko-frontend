'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { fetchOrderById, updateOrderStatus, rejectAdditionalFee, cancelOrder, disputeOrder } from '@/features/orders/api';
import { createPayment } from '@/features/payments/api';
import { createReview } from '@/features/reviews/api';
import { Order, OrderStatus } from '@/features/orders/types';
import useMidtrans from '@/hooks/useMidtrans';
import { useSocket } from '@/context/SocketContext';
import ReviewModal from '@/components/ReviewModal';
import Receipt from '@/components/Receipt';
import CreateTicketModal from '@/components/support/CreateTicketModal';
import { getSupportTicketByOrder, createSupportTicket } from '@/features/support/api';
import 'leaflet/dist/leaflet.css';

// --- LEAFLET COMPONENTS (Client Only) ---
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

// Helper untuk recenter map jika driver bergerak jauh (opsional)
const MapRecenter = dynamic(() => import('react-leaflet').then((mod) => {
    const { useMap } = mod;
    return function Recenter({ lat, lng }: { lat: number; lng: number }) {
        const map = useMap();
        useEffect(() => {
            map.setView([lat, lng], 15);
        }, [lat, lng, map]);
        return null;
    };
}), { ssr: false });

// --- ICONS (SVG) ---
const Icons = {
    ChevronLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
    MapPin: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Phone: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    Calendar: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Clock: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    CheckCircle: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Chat: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    CreditCard: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    FileText: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586l5.414 5.414a1 1 0 01.586 1.414V19a2 2 0 01-2 2z" /></svg>,
    XCircle: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Parking: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10v9m4-9v9m-4-9h5a3 3 0 000-6H5v6z" /></svg>,
    Elevator: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>,
    Info: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Printer: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>,
    Help: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Zoom: () => <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>,
    Alert: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Clip: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
};

// --- HELPERS ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: '2-digit',
    });
};

const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatCountdown = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

interface OrderDetailViewProps {
    orderId: string;
    isSideView?: boolean;
}

export default function OrderDetailView({ orderId, isSideView = false }: OrderDetailViewProps) {
    const { socket } = useSocket();
    const router = useRouter();

    const {
        data: orderData,
        isLoading: isQueryLoading,
        error: queryError,
        refetch
    } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const res = await fetchOrderById(orderId);
            return res.data.data;
        },
        enabled: !!orderId,
    });

    const order = orderData || null;
    const isLoading = isQueryLoading;

    const [isActionLoading, setIsActionLoading] = useState(false);
    const isSnapLoaded = useMidtrans();

    // Review & Receipt State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Lightbox State
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    // Payment Timer State
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isPaymentExpired, setIsPaymentExpired] = useState(false);

    // Modal State
    const [activeModal, setActiveModal] = useState<'cancel' | 'dispute' | null>(null);
    const [actionReason, setActionReason] = useState('');
    const [disputeFiles, setDisputeFiles] = useState<File[]>([]);

    // Support Ticket State
    const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);
    const [hasActiveTicket, setHasActiveTicket] = useState(false);

    // Map & Realtime Driver State
    const [redIcon, setRedIcon] = useState<any>(null);
    const [driverIcon, setDriverIcon] = useState<any>(null);
    const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);

    // Init Leaflet Icons
    useEffect(() => {
        (async function initLeaflet() {
            const L = (await import('leaflet')).default;

            const rIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [20, 32],
                iconAnchor: [10, 32],
                popupAnchor: [1, -28],
                shadowSize: [32, 32]
            });

            const dIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            setRedIcon(rIcon);
            setDriverIcon(dIcon);
        })();
    }, []);

    // Socket Listener for Driver Location
    useEffect(() => {
        if (!socket || !order) return;

        // Listener untuk update lokasi driver
        const handleLocationUpdate = (data: { orderId: string, lat: number, lng: number }) => {
            if (data.orderId === order._id) {
                console.log('[Realtime] Driver Location Updated:', data);
                setDriverLocation([data.lat, data.lng]);
            }
        };

        socket.on('driver_location_update', handleLocationUpdate);

        return () => {
            socket.off('driver_location_update', handleLocationUpdate);
        };
    }, [socket, order]);

    // Effect untuk menghitung mundur waktu pembayaran
    useEffect(() => {
        if (order?.status === 'pending' && order.snapExpiryTime) {
            const expiryTimestamp = new Date(order.snapExpiryTime).getTime();

            const updateTimer = () => {
                const now = new Date().getTime();
                const diff = expiryTimestamp - now;

                if (diff <= 0) {
                    setTimeLeft(0);
                    setIsPaymentExpired(true);
                } else {
                    setTimeLeft(diff);
                    setIsPaymentExpired(false);
                }
            };

            updateTimer();
            const timerInterval = setInterval(updateTimer, 1000);
            return () => clearInterval(timerInterval);
        } else {
            setTimeLeft(null);
            setIsPaymentExpired(false);
        }
    }, [order]);

    const handlePayment = async () => {
        if (!isSnapLoaded) return alert("Sistem sedang memuat...");
        setIsActionLoading(true);
        try {
            const res = await createPayment(orderId);

            if (window.snap) {
                window.snap.pay(res.data.snapToken, {
                    onSuccess: () => {
                        refetch();
                        alert('Pembayaran Berhasil! Mohon tunggu konfirmasi.');
                    },
                    onPending: () => {
                        refetch();
                        alert('Menunggu Pembayaran...');
                    },
                    onError: () => alert('Pembayaran Gagal.'),
                    onClose: () => setIsActionLoading(false)
                });
            }
        } catch (e) {
            alert('Gagal memproses pembayaran.');
            setIsActionLoading(false);
        }
    };

    const handleReject = async (feeId: string) => {
        if (!confirm('Tolak biaya ini?')) return;
        setIsActionLoading(true);
        try {
            await rejectAdditionalFee(orderId, feeId);
            refetch();
        } catch (e) {
            alert('Gagal menolak.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleConfirmComplete = async () => {
        if (!confirm('Pastikan Anda sudah memeriksa pekerjaan mitra secara langsung.\n\nKlik OK jika pekerjaan sudah sesuai.')) return;
        setIsActionLoading(true);
        try {
            await updateOrderStatus(orderId, 'completed');
            refetch();
        } catch (e) {
            alert('Gagal konfirmasi.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!actionReason.trim()) return alert("Mohon isi alasan pembatalan.");
        setIsActionLoading(true);
        try {
            await cancelOrder(orderId, actionReason);
            alert("Pesanan berhasil dibatalkan.");
            setActiveModal(null);
            refetch();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal membatalkan pesanan.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDisputeOrder = async () => {
        if (!actionReason.trim()) return alert("Mohon jelaskan masalah yang Anda alami.");
        setIsActionLoading(true);
        try {
            // Panggil API dengan file
            await disputeOrder(orderId, actionReason, disputeFiles);
            alert("Komplain berhasil diajukan. Admin akan segera memeriksa.");
            setActiveModal(null);
            setDisputeFiles([]); // Reset
            refetch();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal mengajukan komplain.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setDisputeFiles(prev => [...prev, ...files]);
        }
    };

    const removeDisputeFile = (index: number) => {
        setDisputeFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitReview = async (rating: number, comment: string) => {
        if (!order) return;

        const providerId = typeof order.providerId === 'object'
            ? order.providerId?._id
            : order.providerId;

        if (!providerId) {
            alert("Provider tidak valid.");
            return;
        }

        setIsSubmittingReview(true);
        try {
            await createReview({
                userId: typeof order.userId === 'object' ? order.userId._id : order.userId,
                providerId: providerId,
                orderId: order._id,
                rating,
                comment
            });
            alert("Ulasan terkirim!");
            setIsReviewModalOpen(false);
            refetch();
        } catch (error) {
            alert("Gagal mengirim ulasan.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    // Check for existing support ticket
    useEffect(() => {
        if (order?._id) {
            getSupportTicketByOrder(order._id)
                .then((response) => {
                    if (response.data && ['open', 'in_progress'].includes(response.data.status)) {
                        setHasActiveTicket(true);
                    } else {
                        setHasActiveTicket(false);
                    }
                })
                .catch((error) => {
                    // 404 is expected when no ticket exists, no need to log
                    setHasActiveTicket(false);
                });
        }
    }, [order?._id]);

    const openSupportChat = async () => {
        if (!order?._id) return;

        try {
            // Cek apakah sudah ada ticket
            const existingTicket = await getSupportTicketByOrder(order._id);

            if (existingTicket.data && ['open', 'in_progress'].includes(existingTicket.data.status)) {
                // Redirect ke chat support yang sudah ada
                router.push(`/support/${existingTicket.data._id}`);
            } else {
                // Buka modal untuk create ticket baru
                setIsCreateTicketModalOpen(true);
            }
        } catch (error) {
            // 404 is expected when no ticket exists - open create ticket modal
            setIsCreateTicketModalOpen(true);
        }
    };

    const handleCreateTicket = async (subject: string, initialMessage: string) => {
        if (!order?._id) return;

        setIsCreatingTicket(true);
        try {
            const response = await createSupportTicket({
                orderId: order._id,
                subject,
                initialMessage
            });

            setIsCreateTicketModalOpen(false);
            setHasActiveTicket(true);

            // Redirect ke chat support
            router.push(`/support/${response.data._id}`);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Gagal membuat support ticket');
        } finally {
            setIsCreatingTicket(false);
        }
    };

    const getStatusInfo = (status: OrderStatus) => {
        const map: Record<OrderStatus, { label: string; color: string; bg: string }> = {
            pending: { label: 'Menunggu Bayar', color: 'text-amber-600', bg: 'bg-amber-50' },
            paid: { label: 'Dibayar', color: 'text-blue-600', bg: 'bg-blue-50' },
            searching: { label: 'Mencari Mitra', color: 'text-indigo-600', bg: 'bg-indigo-50' },
            accepted: { label: 'Mitra Ditemukan', color: 'text-cyan-600', bg: 'bg-cyan-50' },
            on_the_way: { label: 'Mitra OTW', color: 'text-sky-600', bg: 'bg-sky-50' },
            working: { label: 'Dikerjakan', color: 'text-orange-600', bg: 'bg-orange-50' },
            waiting_approval: { label: 'Konfirmasi Selesai', color: 'text-pink-600', bg: 'bg-pink-50' },
            completed: { label: 'Selesai', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            cancelled: { label: 'Batal', color: 'text-red-600', bg: 'bg-red-50' },
            failed: { label: 'Gagal', color: 'text-gray-600', bg: 'bg-gray-50' },
            disputed: { label: 'Dalam Komplain', color: 'text-purple-600', bg: 'bg-purple-50' },
        };
        return map[status] || map.pending;
    };

    if (isLoading) return <div className="h-full min-h-[500px] flex items-center justify-center bg-white"><div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /></div>;

    if (queryError || !order) return (
        <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white p-4 gap-4">
            <p className="text-gray-500 font-medium">Pesanan tidak ditemukan atau gagal dimuat.</p>
            <button onClick={() => refetch()} className="text-sm text-red-600 underline">Coba Lagi</button>
        </div>
    );

    const unpaidAdditionalFees = order.additionalFees
        ? order.additionalFees
            .filter(f => f.status === 'pending_approval')
            .reduce((acc, f) => acc + f.amount, 0)
        : 0;

    const hasUnpaidFees = unpaidAdditionalFees > 0;

    const autoCompleteDeadline = order.status === 'waiting_approval' && order.waitingApprovalAt
        ? new Date(new Date(order.waitingApprovalAt).getTime() + 48 * 60 * 60 * 1000)
        : null;

    const statusInfo = getStatusInfo(order.status);
    const providerData = typeof order.providerId === 'object' ? order.providerId : null;

    const subtotal = (order.items || []).reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const totalAdditionalFees = order.additionalFees?.reduce((acc, fee) => {
        if (fee.status === 'rejected' || fee.status === 'voided') return acc;
        return acc + fee.amount;
    }, 0) || 0;

    const displayGrandTotal = order.totalAmount + totalAdditionalFees;

    const mapCenter: [number, number] = order.location?.coordinates
        ? [order.location.coordinates[1], order.location.coordinates[0]]
        : [-6.200000, 106.816666];

    const canShowReceipt = !['pending', 'cancelled', 'failed'].includes(order.status);
    const canCancel = ['pending', 'searching', 'paid'].includes(order.status);

    return (
        <div className={`bg-white font-sans text-gray-900 ${isSideView ? '' : 'min-h-screen pb-40'}`}>

            {/* 1. COMPACT NAVBAR - Only show on mobile or when not in side view */}
            {!isSideView && (
                <div className="bg-white sticky top-0 z-20 px-4 h-12 flex items-center justify-between shadow-sm border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Link href="/orders" className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-50 text-gray-600">
                            <Icons.ChevronLeft />
                        </Link>
                        <h1 className="text-sm font-bold">Rincian Pesanan</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {canCancel && (
                            <button
                                onClick={() => { setActionReason(''); setActiveModal('cancel'); }}
                                className="text-[10px] font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                            >
                                Batalkan
                            </button>
                        )}
                        <button
                            onClick={openSupportChat}
                            className="text-[10px] font-bold text-gray-500 hover:text-red-600 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full border border-gray-200 relative"
                            title="Chat dengan Customer Service"
                        >
                            <Icons.Help /> Bantuan
                            {hasActiveTicket && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Header for Side View */}
            {isSideView && (
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h2 className="text-sm font-bold text-gray-800">Detail Pesanan</h2>
                    <div className="flex items-center gap-2">
                        {canCancel && (
                            <button
                                onClick={() => { setActionReason(''); setActiveModal('cancel'); }}
                                className="text-[10px] font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                            >
                                Batalkan
                            </button>
                        )}
                        <button
                            onClick={openSupportChat}
                            className="text-[10px] font-bold text-gray-500 hover:text-red-600 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full border border-gray-200 relative"
                            title="Chat dengan Customer Service"
                        >
                            <Icons.Help /> Bantuan
                            {hasActiveTicket && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <main className={`p-3 space-y-3 ${isSideView ? 'w-full pb-24' : 'max-w-xl mx-auto'}`}>

                {/* 2. COMPACT STATUS CARD */}
                <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${statusInfo.bg} ${statusInfo.color}`}>
                                {statusInfo.label}
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1 font-mono tracking-wider">
                                #{order.orderNumber}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-1 text-gray-800">
                                <Icons.Calendar />
                                <span className="text-xs font-semibold">{formatDate(order.scheduledAt)}</span>
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                                {formatTime(order.scheduledAt)}
                                {order.scheduledTimeSlot?.preferredStart ? ` (${order.scheduledTimeSlot.preferredStart}-${order.scheduledTimeSlot.preferredEnd})` : ''}
                            </div>
                        </div>
                    </div>

                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex">
                        <div className={`h-full ${['paid', 'searching', 'accepted', 'on_the_way', 'working', 'waiting_approval', 'completed'].includes(order.status) ? 'bg-green-500 w-1/4' : 'w-0'} transition-all duration-500`}></div>
                        <div className={`h-full ${['accepted', 'on_the_way', 'working', 'waiting_approval', 'completed'].includes(order.status) ? 'bg-green-500 w-1/4' : 'w-0'} transition-all duration-500`}></div>
                        <div className={`h-full ${['working', 'waiting_approval', 'completed'].includes(order.status) ? 'bg-green-500 w-1/4' : 'w-0'} transition-all duration-500`}></div>
                        <div className={`h-full ${['completed'].includes(order.status) ? 'bg-green-500 w-1/4' : 'w-0'} transition-all duration-500`}></div>
                    </div>
                </div>

                {/* WARNING BANNER (PAYMENT EXPIRY) */}
                {order.status === 'pending' && timeLeft !== null && (
                    <div className={`rounded-xl p-3 flex items-start gap-3 shadow-sm border ${isPaymentExpired ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div className={`shrink-0 mt-0.5 ${isPaymentExpired ? 'text-red-600' : 'text-amber-600'}`}>
                            <Icons.Clock />
                        </div>
                        <div>
                            <p className={`text-[10px] font-bold uppercase mb-0.5 ${isPaymentExpired ? 'text-red-800' : 'text-amber-800'}`}>
                                {isPaymentExpired ? 'Pembayaran Kadaluarsa' : 'Selesaikan Pembayaran'}
                            </p>
                            <p className={`text-xs leading-relaxed ${isPaymentExpired ? 'text-red-900' : 'text-amber-900'}`}>
                                {isPaymentExpired
                                    ? 'Batas waktu pembayaran telah habis. Pesanan ini akan dibatalkan otomatis.'
                                    : <>Sisa waktu pembayaran: <span className="font-bold font-mono text-sm ml-1">{formatCountdown(timeLeft)}</span></>
                                }
                            </p>
                        </div>
                    </div>
                )}

                {/* WARNING BANNER (AUTO COMPLETE DEADLINE) */}
                {order.status === 'waiting_approval' && (
                    <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 flex items-start gap-3 shadow-sm">
                        <div className="shrink-0 text-pink-600 mt-0.5">
                            <Icons.CheckCircle />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-pink-800 uppercase mb-0.5">Konfirmasi Pekerjaan</p>
                            <p className="text-xs text-pink-900 leading-relaxed mb-2">
                                Mitra telah menandai pekerjaan selesai. Mohon <strong>periksa fisik</strong> hasil pengerjaan sebelum konfirmasi.
                            </p>
                            {autoCompleteDeadline && (
                                <p className="text-[10px] text-pink-700 italic">
                                    Otomatis selesai pada: {formatDate(autoCompleteDeadline.toISOString())}, {formatTime(autoCompleteDeadline.toISOString())}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. COMPACT PROVIDER CARD */}
                {providerData && (
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0">
                            <Image
                                src={providerData.userId?.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${providerData.userId?.fullName}`}
                                alt="Provider" fill className="object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400">Mitra Pelaksana</p>
                            <p className="font-bold text-xs truncate">{providerData.userId?.fullName}</p>
                            {providerData.rating && (
                                <div className="flex items-center gap-1 text-[10px] text-yellow-600">
                                    <span>★</span><span>{providerData.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {providerData.userId?.phoneNumber && (
                                <a href={`tel:${providerData.userId.phoneNumber}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-green-600 transition-colors">
                                    <Icons.Phone />
                                </a>
                            )}
                            <Link href="/chat" className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                <Icons.Chat />
                            </Link>
                        </div>
                    </div>
                )}

                {/* 4. DETAILS & FEES */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="p-3 border-b border-gray-50 bg-gray-50/30">
                        <h3 className="text-xs font-bold flex items-center gap-1.5 text-gray-700">
                            <Icons.FileText /> Rincian Biaya
                        </h3>
                    </div>

                    <div className="p-3 space-y-3">
                        {(order.items || []).map((item, i) => (
                            <div key={i} className="flex flex-col gap-1 text-xs">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-2">
                                        <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500 shrink-0 mt-0.5">
                                            {item.quantity}x
                                        </div>
                                        <span className="text-gray-700 font-medium">{item.name}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                                {item.note && (
                                    <p className="text-[10px] text-gray-400 italic ml-6 pl-1 border-l-2 border-gray-200">
                                        "{item.note}"
                                    </p>
                                )}
                            </div>
                        ))}

                        {/* Additional Fees */}
                        {order.additionalFees && order.additionalFees.length > 0 && (
                            <div className="border-t border-dashed border-gray-200 pt-2 mt-2 bg-orange-50/40 p-2 rounded-lg border-orange-100/50">
                                <p className="text-[10px] font-bold text-orange-400 mb-1.5 uppercase">Biaya Tambahan</p>
                                {order.additionalFees.map((fee, idx) => {
                                    if (fee.status === 'voided') return null;
                                    return (
                                        <div key={idx} className="flex flex-col mb-2 last:mb-0">
                                            <div className="flex justify-between items-start text-xs">
                                                <span className={`${fee.status === 'rejected' ? 'text-gray-400 line-through' : 'text-gray-700'} flex-1`}>
                                                    {fee.description}
                                                </span>
                                                <span className={`font-bold ml-2 ${fee.status === 'rejected' ? 'text-gray-400' : 'text-orange-600'}`}>
                                                    +{formatCurrency(fee.amount)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded ${fee.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    fee.status === 'rejected' ? 'bg-gray-200 text-gray-500' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {fee.status === 'pending_approval' ? 'Konfirmasi...' :
                                                        fee.status === 'rejected' ? 'Ditolak' : fee.status}
                                                </span>
                                                {fee.status === 'pending_approval' && (
                                                    <button
                                                        onClick={() => handleReject(fee._id)}
                                                        disabled={isActionLoading}
                                                        className="text-[9px] border border-red-200 text-red-600 px-1.5 py-0.5 rounded hover:bg-red-50"
                                                    >
                                                        Tolak
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {hasUnpaidFees && (
                                    <button
                                        onClick={handlePayment}
                                        disabled={isActionLoading}
                                        className="mt-2 w-full py-1.5 bg-orange-600 text-white text-[10px] font-bold rounded shadow-sm hover:bg-orange-700 active:scale-95 flex items-center justify-center gap-1.5"
                                    >
                                        <Icons.CreditCard /> Bayar Tagihan Tambahan ({formatCurrency(unpaidAdditionalFees)})
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-3 space-y-1.5 text-xs border-t border-gray-100">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Biaya Layanan</span>
                            <span>{formatCurrency(order.adminFee || 0)}</span>
                        </div>
                        {order.discountAmount && order.discountAmount > 0 ? (
                            <div className="flex justify-between text-green-600">
                                <span>Diskon</span>
                                <span>-{formatCurrency(order.discountAmount)}</span>
                            </div>
                        ) : null}
                        <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200 text-gray-900">
                            <span>Total Bayar</span>
                            <span>{formatCurrency(displayGrandTotal)}</span>
                        </div>

                        {canShowReceipt && (
                            <div className="pt-3 flex justify-center">
                                <button
                                    onClick={() => setIsReceiptOpen(true)}
                                    className="text-xs text-blue-600 font-bold flex items-center gap-1.5 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100"
                                >
                                    <Icons.Printer /> Lihat Kuitansi / Nota
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 5. LOCATION & PROPERTY DETAILS */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <div className="p-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                            <Icons.MapPin /> Lokasi Pelayanan (Customer)
                        </h3>
                        <a
                            href={`http://maps.google.com/maps?q=${mapCenter[0]},${mapCenter[1]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-600 font-bold flex items-center gap-1"
                        >
                            Buka Maps <Icons.ChevronLeft />
                        </a>
                    </div>

                    {order.shippingAddress && (
                        <div className="p-3 text-xs border-b border-gray-50">
                            <p className="font-semibold text-gray-900 mb-0.5">{order.shippingAddress.detail}</p>
                            <p className="text-gray-500">
                                {order.shippingAddress.village}, {order.shippingAddress.district}, {order.shippingAddress.city}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">Patokan: {order.shippingAddress.postalCode}</p>
                        </div>
                    )}

                    {order.propertyDetails && (
                        <div className="p-3 bg-blue-50/30 flex flex-wrap gap-2 border-b border-gray-50">
                            {order.propertyDetails.type && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-[10px] text-gray-600 font-medium shadow-sm">
                                    <span>🏠</span> {order.propertyDetails.type}
                                </span>
                            )}
                            {order.propertyDetails.floor && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-[10px] text-gray-600 font-medium shadow-sm">
                                    <span>↕️</span> Lt. {order.propertyDetails.floor}
                                </span>
                            )}
                            {order.propertyDetails.hasParking && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-[10px] text-green-700 font-medium shadow-sm">
                                    <Icons.Parking /> Parkir Ada
                                </span>
                            )}
                            {order.propertyDetails.hasElevator && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-[10px] text-green-700 font-medium shadow-sm">
                                    <Icons.Elevator /> Ada Lift
                                </span>
                            )}
                        </div>
                    )}

                    {order.propertyDetails?.accessNote && (
                        <div className="p-3 bg-yellow-50/50 text-[10px] text-yellow-800 flex gap-2">
                            <div className="shrink-0 mt-0.5"><Icons.Info /></div>
                            <div>
                                <span className="font-bold">Catatan Akses: </span>
                                {order.propertyDetails.accessNote}
                            </div>
                        </div>
                    )}

                    <div className="h-40 w-full z-0 relative">
                        <MapContainer
                            key={mapCenter.toString()}
                            center={mapCenter}
                            zoom={15}
                            scrollWheelZoom={false}
                            dragging={false}
                            zoomControl={false}
                            className="h-full w-full"
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MapRecenter lat={mapCenter[0]} lng={mapCenter[1]} />
                            {redIcon && (
                                <Marker position={mapCenter} icon={redIcon}>
                                    <Popup>Lokasi Anda</Popup>
                                </Marker>
                            )}
                            {driverLocation && driverIcon && (
                                <Marker position={driverLocation} icon={driverIcon}>
                                    <Popup>Lokasi Mitra</Popup>
                                </Marker>
                            )}
                        </MapContainer>
                    </div>
                </div>

                {/* 6. CONTACT & NOTE */}
                <div className="grid grid-cols-1 gap-3">
                    {order.customerContact && (
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex justify-between items-center">
                            <div className="text-xs">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Kontak Penerima</p>
                                <p className="font-bold text-gray-900">{order.customerContact.name || 'Sesuai Akun'}</p>
                                <p className="text-gray-500">{order.customerContact.phone}</p>
                            </div>
                            <a href={`tel:${order.customerContact.phone}`} className="h-8 w-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-100">
                                <Icons.Phone />
                            </a>
                        </div>
                    )}

                    {order.orderNote && (
                        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 text-xs text-amber-900">
                            <p className="font-bold text-[10px] text-amber-700 uppercase mb-1 flex items-center gap-1">
                                <Icons.FileText /> Catatan Pesanan
                            </p>
                            <p className="italic leading-relaxed">"{order.orderNote}"</p>
                        </div>
                    )}
                </div>

                {/* 7. ATTACHMENTS */}
                {order.attachments && order.attachments.length > 0 && (
                    <div className="space-y-2 pt-1">
                        <h3 className="text-[10px] font-bold text-gray-400 px-1 uppercase tracking-wide">Foto Kondisi Awal</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {order.attachments.map((att, i) => (
                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm cursor-pointer" onClick={() => setLightboxImage(att.url)}>
                                    <Image src={att.url} alt="Att" fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 8. COMPLETION EVIDENCE (WITH LIGHTBOX TRIGGER) */}
                {order.completionEvidence && order.completionEvidence.length > 0 && (
                    <div className="bg-green-50 rounded-xl p-3 border border-green-100 space-y-2 mt-2">
                        <h3 className="text-xs font-bold text-green-800 flex items-center gap-1.5">
                            <Icons.CheckCircle /> Bukti Pekerjaan Selesai
                        </h3>
                        <p className="text-[10px] text-green-700">Klik foto untuk memperbesar dan memeriksa detail.</p>
                        <div className="grid grid-cols-3 gap-2">
                            {order.completionEvidence.map((ev, i) => (
                                <div key={i} className="space-y-1">
                                    <div
                                        className="relative aspect-square rounded-lg overflow-hidden border border-green-200 shadow-sm bg-white cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setLightboxImage(ev.url)}
                                    >
                                        <Image src={ev.url} alt="Bukti" fill className="object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-opacity">
                                            <Icons.Zoom />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>

            {/* 9. FLOATING BOTTOM ACTION BAR */}
            <div className={`
         ${isSideView ? 'absolute bottom-0 w-full' : 'fixed bottom-0 left-0 right-0'}
         p-3 bg-white border-t border-gray-100 flex gap-2 z-[900] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]
      `}>

                {order.status === 'pending' && (
                    <button
                        onClick={handlePayment}
                        disabled={isActionLoading || isPaymentExpired}
                        className={`flex-1 h-10 text-white text-xs font-bold rounded-lg shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 ${isPaymentExpired
                            ? 'bg-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-red-600 shadow-red-100 hover:bg-red-700'
                            }`}
                    >
                        {isActionLoading ? '...' : (
                            isPaymentExpired ? 'Kadaluarsa' : <><Icons.CreditCard /> Bayar Sekarang {timeLeft && `(${formatCountdown(timeLeft)})`}</>
                        )}
                    </button>
                )}

                {/* Tombol Dispute & Confirm */}
                {order.status === 'waiting_approval' && !hasUnpaidFees && (
                    <div className="flex-1 flex gap-2">
                        <button
                            onClick={() => { setActionReason(''); setDisputeFiles([]); setActiveModal('dispute'); }}
                            disabled={isActionLoading}
                            className="w-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                            title="Ajukan Komplain"
                        >
                            <Icons.Alert />
                        </button>
                        <button
                            onClick={handleConfirmComplete}
                            disabled={isActionLoading}
                            className="flex-1 h-10 bg-green-600 text-white text-xs font-bold rounded-lg shadow-md shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Icons.CheckCircle /> Konfirmasi Selesai
                        </button>
                    </div>
                )}

                {order.status === 'completed' && (
                    <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="flex-1 h-10 bg-gray-900 text-white text-xs font-bold rounded-lg active:scale-95 transition-all hover:bg-gray-800"
                    >
                        Beri Ulasan
                    </button>
                )}

                {/* Fallback Status */}
                {!['pending', 'waiting_approval', 'completed'].includes(order.status) && (
                    <div className="flex-1 h-10 flex items-center justify-center text-xs text-gray-400 font-medium bg-gray-50 rounded-lg border border-gray-100">
                        {order.status === 'cancelled' ? 'Pesanan Dibatalkan' :
                            order.status === 'disputed' ? 'Dalam Proses Komplain' :
                                order.status === 'searching' ? 'Sedang Mencari Mitra...' :
                                    'Dalam Proses Pengerjaan'
                        }
                    </div>
                )}
            </div>

            {/* 10. MODALS (Cancel & Dispute) */}
            {activeModal && (
                <div className="fixed inset-0 z-[1050] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">
                                {activeModal === 'cancel' ? 'Batalkan Pesanan' : 'Ajukan Komplain'}
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600"><Icons.XCircle /></button>
                        </div>
                        <div className="p-4">
                            <p className="text-sm text-gray-600 mb-3">
                                {activeModal === 'cancel'
                                    ? 'Apakah Anda yakin ingin membatalkan pesanan ini? Mohon berikan alasannya.'
                                    : 'Jelaskan masalah yang Anda alami dengan pekerjaan mitra.'
                                }
                            </p>
                            <textarea
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                placeholder="Tulis alasan di sini..."
                                className="w-full h-24 p-3 bg-white border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none"
                            />

                            {/* [NEW] File Upload Input for Dispute */}
                            {activeModal === 'dispute' && (
                                <div className="mt-3">
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Bukti Foto (Opsional)</label>
                                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-red-200 hover:bg-red-50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-3 pb-4">
                                            <Icons.Clip />
                                            <p className="text-[10px] text-gray-500 mt-1">Klik untuk upload foto</p>
                                        </div>
                                        <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileSelect} />
                                    </label>
                                    {disputeFiles.length > 0 && (
                                        <div className="mt-2 grid grid-cols-4 gap-2">
                                            {disputeFiles.map((file, i) => (
                                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                    <Image src={URL.createObjectURL(file)} alt="preview" fill className="object-cover" />
                                                    <button onClick={() => removeDisputeFile(i)} className="absolute top-0 right-0 bg-red-600 text-white p-0.5 rounded-bl shadow">
                                                        <Icons.XCircle />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 flex gap-3 border-t border-gray-100">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold text-sm rounded-xl"
                            >
                                Batal
                            </button>
                            <button
                                onClick={activeModal === 'cancel' ? handleCancelOrder : handleDisputeOrder}
                                disabled={!actionReason.trim() || isActionLoading}
                                className="flex-1 py-2.5 bg-red-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-100 disabled:bg-gray-300 disabled:shadow-none"
                            >
                                {isActionLoading ? 'Memproses...' : 'Kirim'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LIGHTBOX MODAL */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-[1100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center">
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-50"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div className="relative w-full h-[80vh]">
                            <Image
                                src={lightboxImage}
                                alt="Preview"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <p className="text-white text-sm mt-4 text-center">Ketuk di mana saja untuk menutup</p>
                    </div>
                </div>
            )}

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleSubmitReview}
                isSubmitting={isSubmittingReview}
            />

            <Receipt
                order={order}
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
            />

            <CreateTicketModal
                isOpen={isCreateTicketModalOpen}
                onClose={() => setIsCreateTicketModalOpen(false)}
                onSubmit={handleCreateTicket}
                isSubmitting={isCreatingTicket}
                orderNumber={order?.orderNumber || ''}
            />
        </div>
    );
}
