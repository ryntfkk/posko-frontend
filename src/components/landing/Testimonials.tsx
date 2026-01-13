'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Budi Santoso',
        role: 'Pengusaha UMKM',
        content: 'Aplikasi ini sangat membantu bisnis saya. Mencari teknisi AC untuk kantor jadi sangat cepat dan transparan harganya.',
        rating: 5,
    },
    {
        name: 'Siti Aminah',
        role: 'Ibu Rumah Tangga',
        content: 'Suka banget dengan fitur tracking-nya. Saya jadi tahu kapan tukang bersih-bersih akan sampai. Hasil kerjanya juga rapi.',
        rating: 5,
    },
    {
        name: 'Rian Pratama',
        role: 'Freelancer',
        content: 'Fitur chat-nya responsif dan sistem pembayarannya aman. Tukangnya juga ramah-ramah dan profesional. Recommended!',
        rating: 4,
    },
];

export default function Testimonials() {
    return (
        <section className="py-20 bg-white border-t border-gray-50">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Apa Kata Mereka?</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Kepuasan pelanggan adalah prioritas utama kami. Berikut adalah pengalaman mereka menggunakan Posko.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="bg-gray-50 p-8 rounded-2xl relative"
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-8 text-6xl text-gray-200 font-serif leading-none">"</div>

                            <div className="flex items-center gap-1 text-yellow-500 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < item.rating ? "currentColor" : "none"} className={i < item.rating ? "" : "text-gray-300"} />
                                ))}
                            </div>

                            <p className="text-gray-700 italic mb-8 relative z-10">"{item.content}"</p>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <span className="font-bold text-red-600 text-lg">{item.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                                    <p className="text-gray-500 text-xs">{item.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
