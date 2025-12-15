// src/context/SocketContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

// Helper untuk mendapatkan URL Socket (Sama seperti di Chat Page)
const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL.trim();
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_API_URL);
      return url.origin; 
    } catch (e) {
      console.warn('Invalid API URL for socket fallback');
    }
  }
  return 'http://localhost:4000';
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    // 1. Ambil Token
    // Pastikan kode ini berjalan di client
    const token = typeof window !== 'undefined' ? localStorage.getItem('posko_token') : null;
    
    if (!token) {
        // Jika tidak ada token, jangan connect socket (hemat resource)
        return;
    }

    // 2. Inisialisasi Socket
    const socketUrl = getSocketUrl();
    console.log('[Socket] Initializing connection to:', socketUrl);

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    // 3. Setup Listeners
    newSocket.on('connect', () => {
      console.log('[Socket] Connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Socket] Connection Error:', err.message);
    });

    // --- GLOBAL EVENT LISTENERS ---

    // A. Order Status Update (Realtime Engine Core)
    newSocket.on('order_status_update', (data: any) => {
        console.log('[Socket] Order Update Received:', data);

        // 1. Refresh Data Pesanan (List & Detail)
        // Ini akan memicu useQuery di halaman Orders/Detail untuk fetch ulang otomatis
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
        queryClient.invalidateQueries({ queryKey: ['incoming-orders'] }); // Untuk Mitra

        // 2. Tampilkan Notifikasi Sederhana (Browser Alert / Custom Toast)
        // Karena kita belum pasang library Toast, kita pakai Notification API native
        if (Notification.permission === 'granted') {
             new Notification(`Update Pesanan #${data.order?.orderNumber || ''}`, {
                 body: data.message,
                 icon: '/icons/logo-posko.png' // Pastikan icon ada atau hapus baris ini
             });
        } else if (Notification.permission !== 'denied') {
             Notification.requestPermission();
        }

        // Opsional: Alert visual jika user sedang membuka aplikasi
        // alert(`🔔 Update Pesanan: ${data.message}`); 
        // (Saya comment agar tidak mengganggu UX flow, react-query akan handle UI update)
    });

    // B. Notifikasi Chat Masuk
    newSocket.on('notification:new_message', (data: any) => {
        console.log('[Socket] New Message:', data);
        
        // Refresh List Chat
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        
        if (Notification.permission === 'granted') {
            new Notification(`Pesan dari ${data.senderName}`, {
                body: data.content
            });
        }
    });

    setSocket(newSocket);

    // Cleanup saat unmount
    return () => {
      newSocket.disconnect();
    };
  }, [queryClient, router]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};