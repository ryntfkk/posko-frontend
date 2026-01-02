import {
  Ticket,
  ClipboardList,
  User,
  MapPin,
  Shield,
  HelpCircle,
  FileText,
  Home,
  MessageCircle,
  Bell
} from "lucide-react";

// [UPDATED] ONE SOURCE OF TRUTH UNTUK NAVIGASI UTAMA (HEADER & BOTTOM NAV)
// Digunakan untuk merender menu di Header Desktop agar konsisten
export const MAIN_NAV_ITEMS = [
  { label: 'nav.home', href: '/', icon: Home },
  { label: 'nav.orders', href: '/orders', icon: ClipboardList },
  { label: 'nav.chat', href: '/chat', icon: MessageCircle },
];

export const PROFILE_MENU_ITEMS = [
  {
    group: 'Aktivitas Saya',
    items: [
      { label: 'Voucher Saya', href: '/profile/vouchers', icon: Ticket, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Pesanan Saya', href: '/orders', icon: ClipboardList, color: 'text-red-600', bg: 'bg-red-50' },
    ]
  },
  {
    group: 'Akun Saya',
    items: [
      { label: 'Edit Profil', href: '/profile/edit', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Alamat Tersimpan', href: '/profile/address', icon: MapPin, color: 'text-orange-600', bg: 'bg-orange-50' },
      { label: 'Keamanan Akun', href: '/profile/security', icon: Shield, color: 'text-gray-600', bg: 'bg-gray-50' },
    ]
  },
  {
    group: 'Lainnya',
    items: [
      { label: 'Pusat Bantuan', href: '/help', icon: HelpCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: 'Syarat & Ketentuan', href: '/terms', icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50' },
    ]
  }
];