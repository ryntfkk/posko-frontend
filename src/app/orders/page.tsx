// src/app/orders/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useInfiniteQuery } from '@tanstack/react-query'; 

import { listOrders } from '@/features/orders/api'; 
import { OrderStatus } from '@/features/orders/types';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function OrdersPage() {
  // [FIXED] useInfiniteQuery Configuration
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch 
  } = useInfiniteQuery({
    queryKey: ['orders', 'customer'], 
    queryFn: async ({ pageParam = 1 }) => {
      // API mengembalikan AxiosResponse
      const res = await listOrders('customer', pageParam as number, 10);
      return res; 
    },
    getNextPageParam: (lastPage: any) => {
      // [FIXED] Akses meta dari lastPage.data.meta (karena lastPage adalah AxiosResponse)
      const meta = lastPage?.data?.meta;
      if (meta && meta.page < meta.totalPages) {
        return meta.page + 1;
      }
      return undefined; 
    },
    initialPageParam: 1,
  });

  // [FIXED] Ratakan data: Ambil array dari property .data.data
  const orders = data?.pages.flatMap((page: any) => page.data.data).filter(Boolean) || [];

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      paid: 'bg-blue-50 text-blue-700 border-blue-200',
      searching: 'bg-purple-50 text-purple-700 border-purple-200',
      accepted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      on_the_way: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      working: 'bg-orange-50 text-orange-700 border-orange-200',
      waiting_approval: 'bg-pink-50 text-pink-700 border-pink-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      failed: 'bg-gray-50 text-gray-700 border-gray-200',
      disputed: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return colors[status] || colors.pending;
  };

  const formatStatus = (status: OrderStatus) => {
    const labels: Record<string, string> = {
      pending: 'Menunggu Bayar',
      paid: 'Dibayar',
      searching: 'Mencari Mitra',
      accepted: 'Diterima',
      on_the_way: 'Dalam Perjalanan',
      working: 'Dikerjakan',
      waiting_approval: 'Tunggu Konfirmasi',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
      failed: 'Gagal',
      disputed: 'Komplain',
    };
    return labels[status] || (status ? status.replace(/_/g, ' ') : '-');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="text-sm text-gray-500">Memuat riwayat pesanan...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Gagal memuat data pesanan.</p>
          <button 
            onClick={() => refetch()} 
            className="text-sm text-gray-500 underline hover:text-gray-900"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-red-600 p-1 rounded-full hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Pesanan Saya</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Pesanan</h2>
            <p className="text-sm text-gray-500 mb-6">Mulai pesan layanan sekarang! </p>
            <Link href="/" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
              Jelajahi Layanan
            </Link>
          </div>
        ) : (
          <>
            {orders.map((order: any, index: number) => {
              // [SAFETY] Defensive Checks
              if (!order) return null;
              
              const providerData = typeof order.providerId === 'object' ? order.providerId : null;
              const firstItem = order.items?.[0];
              const serviceIcon = firstItem?.serviceId?.iconUrl;
              const serviceName = firstItem?.name || 'Layanan';
              const moreItems = order.items && order.items.length > 1 
                ? `+${order.items.length - 1} lainnya` 
                : '';

              // [SAFETY] Gunakan index sebagai fallback key jika _id corrupt
              const safeKey = order._id || `temp-order-${index}`;
              const displayId = order.orderNumber || (order._id ? `#${order._id.slice(-6).toUpperCase()}` : '#PROCESSING');

              return (
                <Link
                  key={safeKey}
                  href={`/orders/${order._id || '#'}`}
                  className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 font-mono font-bold">
                        {displayId}
                      </span>
                      <span className="text-xs text-gray-500 block">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          hour12: false 
                        }) : '-'}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {serviceIcon ? (
                        <Image 
                          src={serviceIcon} 
                          alt="Icon" 
                          width={24} 
                          height={24} 
                          className="object-contain opacity-80" 
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400">SVC</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                        {serviceName}
                        {moreItems && <span className="text-gray-400 font-normal text-xs ml-1">{moreItems}</span>}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {providerData ? (
                          <>Mitra: {providerData.userId?.fullName}</>
                        ) : (
                          <>{order.orderType === 'basic' ? 'Mencari Mitra Otomatis' : 'Menunggu Konfirmasi'}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="text-xs text-gray-500">
                      {order.scheduledAt && (
                        <span>
                          Jadwal: {new Date(order.scheduledAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-red-600">{formatCurrency(order.totalAmount || 0)}</p>
                  </div>
                </Link>
              );
            })}

            {hasNextPage && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-6 py-2.5 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {isFetchingNextPage ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                      Memuat...
                    </span>
                  ) : (
                    'Tampilkan Lebih Banyak'
                  )}
                </button>
              </div>
            )}

            {!hasNextPage && orders.length > 0 && (
              <p className="text-center text-xs text-gray-400 mt-6 pb-6">Semua pesanan telah ditampilkan.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}