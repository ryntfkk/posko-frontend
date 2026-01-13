import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Posko - Jasa Terdekat",
  description: "Aplikasi penyedia jasa profesional terdekat",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} ${inter.variable} antialiased bg-gray-50 text-gray-900 pb-0`}
        suppressHydrationWarning={true}
      >
        {/* HEADER GLOBAL: Removed to prevent duplicates. Added manually to pages. */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}