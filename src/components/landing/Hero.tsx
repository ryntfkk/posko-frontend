'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

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

                    <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                        <Link
                            href="#"
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-1"
                        >
                            <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L3.84,2.15C3.84,2.15 6.05,2.66 6.05,2.66Z" /></svg>
                            <div className="text-left leading-none">
                                <div className="text-[10px] uppercase font-medium text-gray-400">Get it on</div>
                                <div className="text-sm font-bold">Google Play</div>
                            </div>
                        </Link>

                        <Link
                            href="#"
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-1"
                        >
                            <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-1.23 3.91-1.12.92.05 1.78.32 2.44 1.18-.76.41-1.28 1.19-1.28 2.06 0 1.28 1.05 2.32 2.33 2.32.09 0 .19-.01.28-.02-.12 3.17-2.37 6.95-2.76 7.81zm-3.81-16c.35 1.57-1.32 3.12-2.84 2.87-.21-1.49 1.17-3.27 2.84-2.87z" /></svg>
                            <div className="text-left leading-none">
                                <div className="text-[10px] uppercase font-medium text-gray-400">Download on</div>
                                <div className="text-sm font-bold">App Store</div>
                            </div>
                        </Link>

                        <Link
                            href="https://app.poskojasa.com"
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-900 border border-gray-200 font-semibold rounded-xl hover:bg-gray-50 transition-all hover:border-gray-300"
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
                    {/* Phone Mockup with Image */}
                    <div className="relative mx-auto w-72 h-[580px] bg-gray-900 rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden z-10">
                        <Image
                            src="/images/partner-gathering/app-mockup.png"
                            alt="Aplikasi Posko"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                        />
                    </div>

                    {/* Decor Elements behind phone - Red Blur */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-red-500/20 to-transparent rounded-full blur-3xl -z-10"></div>

                    {/* Floating Badge 1 */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-24 -left-2 bg-white p-3 rounded-xl shadow-xl border border-gray-100 z-20 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                        <div>
                            <p className="text-xs text-gray-400">Status</p>
                            <p className="text-sm font-bold text-gray-900">Tersedia</p>
                        </div>
                    </motion.div>

                    {/* Floating Badge 2 */}
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-32 -right-2 bg-white p-3 rounded-xl shadow-xl border border-gray-100 z-20 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">⭐</div>
                        <div>
                            <p className="text-xs text-gray-400">Rating</p>
                            <p className="text-sm font-bold text-gray-900">4.6/5.0 (20) </p>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </section>
    );
}
