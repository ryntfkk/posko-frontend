'use client';

import Link from 'next/link';

export default function PartnerCTA() {
    return (
        <section className="py-24 bg-gray-900 relative overflow-hidden" id="partner">
            {/* Decor - Red Tinted */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-600/10 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]"></div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 text-center">
                <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                    Bergabung Sebagai Mitra Posko
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
                    Tingkatkan penghasilanmu dengan menjangkau lebih banyak pelanggan. Jadilah bagian dari ribuan profesional yang telah sukses bersama kami.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        href="#"
                        className="px-8 py-4 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/40 hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
                    >
                        Daftar Jadi Mitra Sekarang
                    </Link>
                    <Link
                        href="#"
                        className="px-8 py-4 bg-transparent border border-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
                    >
                        Pelajari Selengkapnya
                    </Link>
                </div>

                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t border-gray-800 pt-12">
                    <div>
                        <h4 className="text-3xl font-bold text-white mb-1">5rb+</h4>
                        <p className="text-gray-400 text-sm">Mitra Aktif</p>
                    </div>
                    <div>
                        <h4 className="text-3xl font-bold text-white mb-1">20+</h4>
                        <p className="text-gray-400 text-sm">Kota</p>
                    </div>
                    <div>
                        <h4 className="text-3xl font-bold text-white mb-1">100rb+</h4>
                        <p className="text-gray-400 text-sm">Order Selesai</p>
                    </div>
                    <div>
                        <h4 className="text-3xl font-bold text-white mb-1">4.8</h4>
                        <p className="text-gray-400 text-sm">Rata-rata Rating</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
