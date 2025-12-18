import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BalanceCardProps {
    balance: number;
}

export default function BalanceCard({ balance }: BalanceCardProps) {
    const router = useRouter();

    const handleTopup = () => {
        alert('Fitur Topup akan segera hadir!');
    };

    return (
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12 pointer-events-none"></div>

            <div className="relative z-10">
                <p className="text-blue-100 text-sm font-medium mb-1">Saldo PoskoPay</p>
                <h2 className="text-3xl font-bold mb-6">
                    Rp {balance.toLocaleString('id-ID')}
                </h2>

                <div className="flex gap-3">
                    <button
                        onClick={handleTopup}
                        className="flex-1 bg-white text-blue-600 py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Isi Saldo
                    </button>

                    <Link href="/wallet" className="flex-1 bg-blue-700 bg-opacity-40 backdrop-blur-sm border border-blue-400 border-opacity-30 text-white py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-opacity-50 transition-colors flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Riwayat
                    </Link>
                </div>
            </div>
        </div>
    );
}
