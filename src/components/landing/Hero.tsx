'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Elements - Warm/Red Toned */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#fef2f2_1px,transparent_1px),linear-gradient(to_bottom,#fef2f2_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute top-1/2 -left-24 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-50"></div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Badge - Red */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold mb-6 border border-red-100">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        Solusi Jasa #1 di Indonesia
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
                        Solusi Jasa Terpercaya dalam <span className="text-red-600">Satu Genggaman</span>
                    </h1>

                    <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                        Temukan penyedia jasa profesional di sekitarmu, lacak pesanan secara real-time, dan bayar dengan aman. Semua jadi lebih mudah dengan Posko.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="#"
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-1"
                        >
                            <Play className="fill-white" size={20} />
                            Download Aplikasi
                        </Link>
                        <Link
                            href="https://app.poskojasa.com"
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 border border-gray-200 font-semibold rounded-xl hover:bg-gray-50 transition-all hover:border-gray-300"
                        >
                            Gunakan Versi Web
                        </Link>
                    </div>

                    <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                            ))}
                        </div>
                        <p>Dipercaya oleh 10.000+ pengguna</p>
                    </div>
                </motion.div>

                {/* Visual / Mockup */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="relative"
                >
                    {/* Abstract Phone Mockup */}
                    <div className="relative mx-auto w-72 h-[580px] bg-gray-900 rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden z-10">
                        {/* Screen Content Placeholder */}
                        <div className="w-full h-full bg-white flex flex-col">
                            <div className="h-6 bg-gray-100 border-b border-gray-200"></div> {/* Status Bar */}
                            {/* Header Mockup - Red Tint */}
                            <div className="p-4 bg-red-50 flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-red-100"></div>
                                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                            </div>
                            {/* Body */}
                            <div className="p-4 space-y-3">
                                {/* Hero Banner Mockup - Red Gradient */}
                                <div className="h-32 rounded-xl bg-gradient-to-br from-red-500 to-orange-400"></div>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square rounded-lg bg-gray-100"></div>)}
                                </div>
                                <div className="h-24 rounded-xl bg-gray-50 border border-gray-100"></div>
                                <div className="h-24 rounded-xl bg-gray-50 border border-gray-100"></div>
                            </div>
                            {/* Bottom Nav */}
                            <div className="mt-auto h-16 border-t border-gray-200 flex justify-around items-center">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-6 h-6 rounded bg-gray-200"></div>)}
                            </div>
                        </div>
                    </div>

                    {/* Decor Elements behind phone - Red Blur */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-red-500/20 to-transparent rounded-full blur-3xl -z-10"></div>

                    {/* Floating Badge 1 */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-20 -left-12 bg-white p-3 rounded-xl shadow-xl border border-gray-100 z-20 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                        <div>
                            <p className="text-xs text-gray-400">Status</p>
                            <p className="text-sm font-bold text-gray-900">Pembayaran Berhasil</p>
                        </div>
                    </motion.div>

                    {/* Floating Badge 2 */}
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-32 -right-8 bg-white p-3 rounded-xl shadow-xl border border-gray-100 z-20 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">⭐</div>
                        <div>
                            <p className="text-xs text-gray-400">Rating</p>
                            <p className="text-sm font-bold text-gray-900">4.9/5.0 (2k+)</p>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </section>
    );
}
