'use client';

import React from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  Clock, 
  Send,
  HelpCircle
} from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Section - Compact */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Hubungi Kami
          </h1>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl">
            Kami siap membantu kebutuhan layanan rumah Anda. Silakan hubungi kami melalui saluran di bawah ini.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT COLUMN: Contact Info & Quick Actions (Compact Density) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Quick Contact Cards - Grid 2 col di mobile agar hemat tempat vertical */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {/* WhatsApp / CS */}
              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:border-red-100 transition-colors flex items-start gap-3 group">
                <div className="bg-red-50 p-2 rounded-md text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <MessageSquare size={18} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Live Chat / WA</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Senin - Minggu, 08:00 - 21:00</p>
                  <a href="#" className="text-xs font-medium text-red-600 mt-1.5 block hover:underline">
                    +62 812 3456 7890
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:border-red-100 transition-colors flex items-start gap-3 group">
                <div className="bg-red-50 p-2 rounded-md text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <Mail size={18} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Email Support</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Respon dalam 1x24 jam</p>
                  <a href="mailto:support@posko.id" className="text-xs font-medium text-red-600 mt-1.5 block hover:underline">
                    support@posko.id
                  </a>
                </div>
              </div>

              {/* Office */}
              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:border-red-100 transition-colors flex items-start gap-3 group sm:col-span-2 lg:col-span-1">
                <div className="bg-red-50 p-2 rounded-md text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <MapPin size={18} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Kantor Pusat</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Jl. Posko Layanan No. 123<br />
                    Jakarta Selatan, DKI Jakarta 12430
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Teaser - Deflect unnecessary tickets */}
            <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <HelpCircle size={18} className="text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Punya pertanyaan umum?</h4>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    Hemat waktu Anda dengan mengecek halaman FAQ kami sebelum mengirim pesan.
                  </p>
                  <Link 
                    href="/faq" 
                    className="mt-2 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Lihat FAQ &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Map Embed (Small & Compact) */}
            <div className="bg-gray-200 rounded-lg overflow-hidden h-48 lg:h-auto lg:flex-1 border border-gray-300 relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126907.08660387656!2d106.789178!3d-6.2293867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3e945e34b9d%3A0x5371bf0fdad786a2!2sJakarta%20Selatan%2C%20South%20Jakarta%20City%2C%20Jakarta!5e0!3m2!1sen!2sid!4v1708499283421!5m2!1sen!2sid" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              ></iframe>
            </div>

          </div>

          {/* RIGHT COLUMN: The Form (Action Oriented) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 sm:p-6 lg:p-8">
                <h2 className="text-base font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-1 h-5 bg-red-600 rounded-full block"></span>
                  Kirim Pesan
                </h2>
                
                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="block w-full rounded-md border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-all duration-200 outline-none"
                        placeholder="Contoh: Budi Santoso"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Alamat Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="block w-full rounded-md border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-all duration-200 outline-none"
                        placeholder="nama@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label htmlFor="phone" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        className="block w-full rounded-md border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-all duration-200 outline-none"
                        placeholder="0812..."
                      />
                    </div>

                    {/* Topic */}
                    <div className="space-y-1.5">
                      <label htmlFor="topic" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Topik
                      </label>
                      <select
                        id="topic"
                        className="block w-full rounded-md border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-all duration-200 outline-none appearance-none"
                      >
                        <option>Pertanyaan Umum</option>
                        <option>Kendala Pemesanan</option>
                        <option>Keluhan Layanan</option>
                        <option>Kemitraan</option>
                        <option>Lainnya</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Pesan
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      className="block w-full rounded-md border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500 transition-all duration-200 outline-none resize-none"
                      placeholder="Jelaskan detail kebutuhan atau kendala Anda di sini..."
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-md bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-all active:scale-[0.98]"
                    >
                      <Send size={16} className="mr-2" />
                      Kirim Pesan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}