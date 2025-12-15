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
    maximumFractionDigits: 0, 
  }).format(amount);
};

export default function OrdersPage() {
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
      const res = await listOrders('customer', pageParam as number, 10);
      return res; 
    },
    getNextPageParam: (lastPage: any) => {
      const meta = lastPage?.data?.meta;
      if (meta && meta.page < meta.totalPages) {
        return meta.page + 1;
      }
      return undefined; 
    },
    initialPageParam: 1,
  });

  const orders = data?.pages.flatMap((page: any) => page.data.data).filter(Boolean) || [];

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700 border-amber-100',
      paid: 'bg-blue-50 text-blue-700 border-blue-100',
      searching: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      accepted: 'bg-cyan-50 text-cyan-700 border-cyan-100',
      on_the_way: 'bg-sky-50 text-sky-700 border-sky-100',
      working: 'bg-orange-50 text-orange-700 border-orange-100',
      waiting_approval: 'bg-pink-50 text-pink-700 border-pink-100',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      cancelled: 'bg-red-50 text-red-700 border-red-100',
      failed: 'bg-gray-50 text-gray-700 border-gray-100',
      disputed: 'bg-purple-50 text-purple-700 border-purple-100',
    };
    return colors[status] || colors.pending;
  };

  const formatStatus = (status: OrderStatus) => {
    const labels: Record<string, string> = {
      pending: 'Menunggu Bayar',
      paid: 'Dibayar',
      searching: 'Mencari Mitra',
      accepted: 'Diterima',
      on_the_way: 'Sedang Jalan',
      working: 'Dikerjakan',
      waiting_approval: 'Konfirmasi',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
      failed: 'Gagal',
      disputed: 'Komplain',
    };
    return labels[status] || (status ? status.replace(/_/g, ' ') : '-');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-red-600"></div>
          <p className="text-xs font-medium text-gray-500">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 font-medium">Gagal memuat data pesanan.</p>
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    // [UPDATE] Mengubah bg-gray-50/50 menjadi bg-white solid agar menutupi gradient global body
    <div className="min-h-screen bg-white pb-24 font-sans text-gray-900">
      {/* HEADER: Sticky & Compact */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 h-14 flex items-center justify-between border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-sm font-bold tracking-tight">Riwayat Pesanan</h1>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container max-w-5xl mx-auto px-4 py-4 space-y-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-4 text-gray-300 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-gray-900 mb-1">Belum Ada Pesanan</h2>
            <p className="text-xs text-gray-500 mb-5 max-w-[200px]">Semua riwayat transaksi layanan Anda akan muncul di halaman ini.</p>
            <Link href="/" className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all shadow-red-100 shadow-lg active:scale-95">
              Pesan Layanan
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {orders.map((order: any, index: number) => {
                if (!order) return null;
                
                const providerData = typeof order.providerId === 'object' ? order.providerId : null;
                const firstItem = order.items?.[0];
                const serviceIcon = firstItem?.serviceId?.iconUrl;
                const serviceName = firstItem?.name || 'Layanan';
                const moreItemsCount = order.items && order.items.length > 1 ? order.items.length - 1 : 0;
                const safeKey = order._id || `temp-order-${index}`;
                const displayId = order.orderNumber || (order._id ? `#${order._id.slice(-6).toUpperCase()}` : '#PROCESSING');

                return (
                  <Link
                    key={safeKey}
                    href={`/orders/${order._id || '#'}`}
                    className="group block bg-white rounded-xl border border-gray-100 p-3 hover:border-red-100 hover:shadow-md transition-all duration-200 relative overflow-hidden"
                  >
                    {/* Top Row: ID & Date */}
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-gray-50 border-dashed">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-mono font-bold tracking-wider group-hover:text-red-500 transition-colors">
                          {displayId}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit', 
                          }) : '-'}
                        </span>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </div>
                    </div>

                    {/* Middle Row: Service Info */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {serviceIcon ? (
                          <Image 
                            src={serviceIcon} 
                            alt="Icon" 
                            fill
                            sizes="40px"
                            className="object-contain p-1.5 opacity-90 group-hover:scale-110 transition-transform" 
                          />
                        ) : (
                          <span className="text-[8px] font-bold text-gray-300">SVC</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="text-sm font-bold text-gray-900 truncate pr-2">
                          {serviceName}
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-0.5 truncate flex items-center gap-1">
                           {providerData ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                              {providerData.userId?.fullName}
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block"></span>
                              {order.orderType === 'basic' ? 'Mencari...' : 'Menunggu'}
                            </>
                          )}
                          {moreItemsCount > 0 && (
                            <span className="ml-auto text-[9px] font-medium px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                              +{moreItemsCount} item
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Price & Schedule */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 bg-gray-50/30 -mx-3 -mb-3 px-3 py-2 mt-auto">
                       <div className="flex items-center gap-1.5 text-gray-500">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[10px] font-medium">
                            {order.scheduledAt ? new Date(order.scheduledAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'ASAP'}
                          </span>
                       </div>
                       <p className="font-bold text-xs text-gray-900 group-hover:text-red-600 transition-colors">
                          {formatCurrency(order.totalAmount || 0)}
                       </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {hasNextPage && (
              <div className="mt-8 flex justify-center pb-8">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-6 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isFetchingNextPage ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                      Memuat...
                    </span>
                  ) : (
                    'Tampilkan Lebih Banyak'
                  )}
                </button>
              </div>
            )}

            {!hasNextPage && orders.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-8 pb-8 opacity-50">
                 <div className="h-px w-12 bg-gray-300"></div>
                 <p className="text-[10px] font-medium text-gray-400">Semua pesanan ditampilkan</p>
                 <div className="h-px w-12 bg-gray-300"></div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}