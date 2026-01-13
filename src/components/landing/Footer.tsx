import Link from 'next/link';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <span className="text-2xl font-bold text-primary tracking-tight block mb-4">Posko</span>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Solusi jasa terpercaya dalam satu genggaman. Temukan profesional terbaik di sekitarmu dengan mudah dan aman.
                        </p>
                        <div className="flex gap-4">
                            {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-primary hover:border-primary transition-colors">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links 1 */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Perusahaan</h4>
                        <ul className="space-y-4">
                            {['Tentang Kami', 'Karir', 'Blog', 'Hubungi Kami'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Layanan</h4>
                        <ul className="space-y-4">
                            {['Cleaning Service', 'Reparasi Elektronik', 'Pijat & Spa', 'Angkut Barang'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links 3 */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Dukungan</h4>
                        <ul className="space-y-4">
                            {['Pusat Bantuan', 'Syarat & Ketentuan', 'Kebijakan Privasi', 'Panduan Pengguna'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-sm text-gray-500 hover:text-primary transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} Posko Indonesia. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-sm text-gray-400">Bahasa Indonesia</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
