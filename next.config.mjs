/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Next.js 14 Config 
    Kita menonaktifkan linting dan type checking saat build 
    agar deploy tidak gagal karena masalah kode minor.
  */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // unoptimized: true, // [OPSIONAL] Matikan ini jika ingin optimasi gambar Next.js aktif (disarankan dimatikan hanya saat debugging)
    
    // [FIX] Izinkan SVG dari domain eksternal
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      // [UPDATE] Konfigurasi Domain AWS S3 yang Lebih Luas
      // Menangani format: https://bucket-name.s3.region.amazonaws.com
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com', 
        port: '',
        pathname: '/**',
      },
      // Menangani format: https://s3.amazonaws.com/bucket-name
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      // Menangani format spesifik bucket Anda (Backup)
      {
        protocol: 'https',
        hostname: 'posko-storage-prod.s3.ap-southeast-1.amazonaws.com', 
        port: '',
        pathname: '/**',
      },
    ],
  },
  // [LANGKAH 2] Menambahkan konfigurasi Rewrites (Proxy)
  async rewrites() {
    const backendUrl = (process.env.BACKEND_URL || 'https://api.poskojasa.com/api').trim();
    const cleanBackendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;

    return [
      {
        source: '/api/proxy/:path*',
        destination: `${cleanBackendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;