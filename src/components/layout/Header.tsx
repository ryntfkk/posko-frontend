'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigasi untuk halaman statis
  // Landing/Home biasanya menggunakan Navbar transparan sendiri, tapi header ini untuk halaman lain (About, Terms, dll)
  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Tentang Kami', href: '/about' },
    { name: 'Artikel', href: '/blog' },
    { name: 'Bantuan', href: '/help' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black text-gray-900 tracking-tight">Posko<span className="text-red-600">.</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="https://app.poskojasa.com"
            className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-full shadow-sm transition-all hover:shadow-red-200"
          >
            Masuk / Daftar
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-gray-600 p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg p-4 flex flex-col gap-4 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-base font-medium text-gray-700 py-2 hover:text-red-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-gray-50" />
          <Link
            href="https://app.poskojasa.com"
            className="text-center px-5 py-3 text-base font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Masuk / Daftar
          </Link>
        </div>
      )}
    </header>
  );
}
