'use client';

// --- LANDING PAGE COMPONENTS ---
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Services from '@/components/landing/Services';
import PartnerCTA from '@/components/landing/PartnerCTA';
import Footer from '@/components/Footer'; // Gunakan Footer asli aplikasi

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-blue-100">
      <Navbar />
      <Hero />
      <Features />
      <Services />
      <PartnerCTA />
      <Footer />
    </main>
  );
}