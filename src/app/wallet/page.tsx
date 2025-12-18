'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchProfile } from '@/features/auth/api';
import { User } from '@/features/auth/types';
import BalanceCard from '@/features/wallet/components/BalanceCard';
import TransactionList from '@/features/wallet/components/TransactionList';

export default function WalletPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await fetchProfile();
                setUser(res.data.profile);
            } catch (error) {
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Memuat...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
                <Link href="/profile" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </Link>
                <h1 className="text-lg font-bold text-gray-900">Dompet Saya</h1>
            </div>

            <div className="p-4 space-y-6">
                {/* Balance Card */}
                {user && <BalanceCard balance={user.balance || 0} />}

                {/* Transaction History */}
                <div>
                    <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1 uppercase tracking-wider">Riwayat Transaksi</h2>
                    <TransactionList />
                </div>
            </div>
        </div>
    );
}
