// src/context/SocketContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
  const socketRef = useRef<Socket | null>(null); // [PERBAIKAN] Gunakan ref untuk tracking instance
  
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

    // 2. Inisialisasi Socket (Hanya jika belum ada di ref)
    if (!socketRef.current) {
        const socketUrl = getSocketUrl();
        // console.log('[Socket] Initializing connection to:', socketUrl);

        const newSocket = io(socketUrl, {
          auth: { token },
          transports: ['websocket', 'polling'], // Prioritaskan websocket
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 3000,
          autoConnect: false, // [PERBAIKAN] Matikan autoConnect agar kita bisa kontrol manual
        });

        // 3. Setup Listeners
        newSocket.on('connect', () => {
          console.log('[Socket] Connected:', newSocket.id);
          setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
          // console.log('[Socket] Disconnected');
          setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
          // Suppress error log agar tidak spam di console saat dev
          console.warn('[Socket] Connection Warning:', err.message);
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
            // console.log('[Socket] New Message:', data);
            
            // Refresh List Chat
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            
            if (Notification.permission === 'granted') {
                new Notification(`Pesan dari ${data.senderName}`, {
                    body: data.content
                });
            }
        });

        // Simpan ke ref dan state
        socketRef.current = newSocket;
        setSocket(newSocket);
    }

    // [PERBAIKAN] Connect manual untuk memastikan single connection
    const activeSocket = socketRef.current;
    if (activeSocket && !activeSocket.connected) {
        activeSocket.connect();
    }

    // Cleanup saat unmount
    return () => {
      // Di React 18 Strict Mode, cleanup dipanggil saat mounting. 
      // Kita biarkan socket tetap hidup di ref, tapi remove listener jika perlu.
      // Untuk implementasi ini, kita tidak mendisconnect socket secara agresif 
      // agar tidak terjadi loop connect-disconnect.
      
      // Jika ingin benar-benar bersih saat pindah halaman (opsional):
      // if (activeSocket) {
      //   activeSocket.removeAllListeners();
      //   activeSocket.disconnect();
      //   socketRef.current = null;
      // }
    };
  }, [queryClient, router]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};