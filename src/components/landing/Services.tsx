'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const services = [
    {
        title: 'Cleaning Service',
        image: '/icons/janitor.png',
        desc: 'Pembersihan rumah, kantor, dan apartemen mendalam.'
    },
    {
        title: 'Reparasi Elektronik',
        image: '/icons/air-conditioner.png',
        desc: 'Service AC, kulkas, mesin cuci, dan elektronik lainnya.'
    },
    {
        title: 'Kecantikan',
        image: '/icons/make-up.png',
        desc: 'Relaksasi tubuh dengan terapis profesional bersertifikat.'
    },
    {
        title: 'Angkut Barang',
        image: '/icons/moving.png',
        desc: 'Jasa pindahan rumah dan pengiriman barang besar.'
    }
];

export default function Services() {
    return (
        <section className="py-20 bg-gray-50" id="services">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-xl">
                        <span className="text-primary font-bold text-sm tracking-wider uppercase mb-2 block">Layanan Kami</span>
                        <h2 className="text-3xl font-bold text-gray-900 leading-tight">Apapun Kebutuhanmu, <br /> Kami Siap Membantu</h2>
                    </div>
                    <Link
                        href="https://app.poskojasa.com"
                        className="text-primary font-semibold hover:text-primary-dark transition-colors flex items-center gap-1 group"
                    >
                        Lihat Semua Layanan
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-contain p-8 transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>

                            <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                                    {item.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
