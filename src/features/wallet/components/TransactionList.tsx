'use client';

import { useEffect, useState } from 'react';
import { getWalletHistory } from '../api';
import { WalletTransaction } from '../types';

export default function TransactionList() {
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const type = filter === 'ALL' ? undefined : filter;
                const res = await getWalletHistory(1, 20, type);
                setTransactions(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [filter]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getIcon = (category: string) => {
        switch (category) {
            case 'REFUND': return 'Existing icon path or svg';
            case 'TOPUP': return '...';
            default: return '...';
        }
    };

    if (loading) return <div className="text-center py-8 text-gray-400">Memuat riwayat...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Filter Tabs */}
            <div className="flex border-b border-gray-100">
                {(['ALL', 'CREDIT', 'DEBIT'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${filter === f ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {f === 'ALL' ? 'Semua' : f === 'CREDIT' ? 'Masuk' : 'Keluar'}
                        {filter === f && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {transactions.length === 0 ? (
                <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <p className="text-gray-500 text-sm">Belum ada transaksi</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                        <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    {tx.category === 'REFUND' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" /></svg>
                                    ) : tx.type === 'CREDIT' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{tx.description || tx.category}</p>
                                    <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                                </div>
                            </div>
                            <div className={`font-semibold text-sm ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-gray-900'}`}>
                                {tx.type === 'CREDIT' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
