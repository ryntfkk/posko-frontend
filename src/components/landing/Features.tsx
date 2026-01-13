'use client';

import { MapPin, Wallet, MessageCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Features() {
    const features = [
        {
            icon: MapPin,
            title: 'Pencarian Lokasi',
            desc: 'Temukan tukang dan penyedia jasa profesional terdekat dari lokasimu dengan akurasi tinggi.',
            color: 'bg-red-50 text-red-600',
        },
        {
            icon: Wallet,
            title: 'Transaksi Aman',
            desc: 'Sistem pembayaran terintegrasi dan aman. Dana ditahan hingga pekerjaan selesai.',
            color: 'bg-blue-50 text-blue-600',
        },
        {
            icon: MessageCircle,
            title: 'Chat Langsung',
            desc: 'Komunikasi mudah dengan penyedia jasa melalui fitur chat in-app tanpa bertukar nomor pribadi.',
            color: 'bg-green-50 text-green-600',
        },
        {
            icon: Activity,
            title: 'Pelacakan Order',
            desc: 'Pantau status pengerjaan jasa secara real-time mulai dari perjalanan hingga selesai.',
            color: 'bg-purple-50 text-purple-600',
        },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Fitur Unggulan Kami</h2>
                    <p className="text-gray-600">
                        Kami menghadirkan fitur-fitur terbaik untuk memastikan pengalaman menyewa jasa Anda aman, nyaman, dan efisien.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:border-transparent transition-all duration-300 group"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color}`}>
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
