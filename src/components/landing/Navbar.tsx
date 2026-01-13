'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Beranda', href: '#' },
        { name: 'Layanan', href: '#services' },
        { name: 'Tentang Kami', href: '/about' },
        { name: 'Gabung Mitra', href: '/partner-gathering' },
        { name: 'Bantuan', href: '/help' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/80 backdrop-blur-lg shadow-sm py-4'
                : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between">
                {/* Logo - UPDATED: Black text + Red Dot */}
                <div className="flex items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="Posko Logo"
                        width={120}
                        height={40}
                        className="h-10 w-auto object-contain"
                        style={{ width: 'auto' }}
                        priority
                    />
                </div>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="hidden lg:block">
                    <Link
                        href="https://app.poskojasa.com"
                        className="px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-red-600/30 hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
                    >
                        Masuk / Login
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="lg:hidden text-gray-600"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white/90 backdrop-blur-md border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 py-6 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-base font-medium text-gray-700 block"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <hr className="border-gray-100 my-2" />
                            <Link
                                href="https://app.poskojasa.com"
                                className="w-full block text-center px-6 py-3 bg-red-600 text-white text-base font-semibold rounded-xl shadow-lg shadow-red-600/20"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Masuk / Login
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
