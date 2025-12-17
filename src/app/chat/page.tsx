// src/app/(customer)/chat/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/axios';
import { fetchProfile } from '@/features/auth/api';
import { listOrders } from '@/features/orders/api';
import { User } from '@/features/auth/types';
import { Order, PopulatedProvider } from '@/features/orders/types';
import { ChatRoom, Message } from '@/features/chat/types';
import ChatList from '@/components/chat/ChatList';
import ChatRoomComponent from '@/components/chat/ChatRoom';

// --- HELPER: SOCKET URL DETERMINATION ---
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

export default function ChatPage() {
  const router = useRouter();

  // Data State
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Chat State
  const [socket, setSocket] = useState<Socket | null>(null);

  const myId = user ? user._id : null;

  // 1. Initialize Chat & Socket
  useEffect(() => {
    const initChat = async () => {
      const token = localStorage.getItem('posko_token');
      if (!token) { router.push('/login'); return; }

      try {
        const profileRes = await fetchProfile();
        const currentUser = profileRes.data.profile;
        setUser(currentUser);

        const chatRes = await api.get('/chat');
        setRooms(chatRes.data.data);

        // Fetch orders untuk snippet info
        const ordersRes = await listOrders('customer');
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const activeOnly = orders.filter(o =>
          ['pending', 'paid', 'accepted', 'on_the_way', 'working', 'waiting_approval'].includes(o.status)
        );
        setActiveOrders(activeOnly);

        // Socket Connection
        const socketUrl = getSocketUrl();
        console.log('Connecting socket to:', socketUrl);

        const newSocket = io(socketUrl, {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5
        });

        newSocket.on('connect_error', (err) => {
          console.error('Socket connection error:', err.message);
        });

        newSocket.on('receive_message', (data: { roomId: string, message: Message }) => {
          // Update List Room (Move to top)
          setRooms(prev => {
            const roomIndex = prev.findIndex(r => r._id === data.roomId);
            if (roomIndex === -1) return prev;

            const updatedRoom = {
              ...prev[roomIndex],
              messages: [...prev[roomIndex].messages, data.message],
              updatedAt: new Date().toISOString()
            };

            const newRooms = [...prev];
            newRooms.splice(roomIndex, 1);
            newRooms.unshift(updatedRoom);
            return newRooms;
          });

          // Update Active Room if open
          setActiveRoom(current => {
            if (current && current._id === data.roomId) {
              return { ...current, messages: [...current.messages, data.message] };
            }
            return current;
          });
        });

        setSocket(newSocket);

      } catch (error) {
        console.error("Init Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
    return () => { socket?.disconnect(); };
  }, [router]);

  // Helper: Get Opponent User (Needed for relatedOrder)
  const getOpponent = useCallback((room: ChatRoom | null) => {
    if (!room || !myId) return null;
    return room.participants.find(p => p._id !== myId) || room.participants[0];
  }, [myId]);

  // Helper: Find Related Order
  const relatedOrder = useMemo(() => {
    if (!activeRoom || !user || activeOrders.length === 0) return null;
    const opponent = getOpponent(activeRoom);
    if (!opponent) return null;

    return activeOrders.find(order => {
      const pId = order.providerId;
      let provUserId = '';
      if (pId && typeof pId === 'object' && 'userId' in pId) {
        const u = (pId as PopulatedProvider).userId;
        provUserId = u._id;
      }
      return provUserId === opponent._id;
    });
  }, [activeRoom, activeOrders, user, getOpponent]);

  const openRoom = async (room: ChatRoom) => {
    try {
      const res = await api.get(`/chat/${room._id}`);
      setActiveRoom(res.data.data);
      socket?.emit('join_chat', room._id);
    } catch (error) { console.error(error); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white text-sm text-gray-500">Memuat percakapan...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col md:flex-row max-w-7xl mx-auto md:my-8 md:rounded-2xl border-gray-200 md:border md:h-[800px] md:overflow-hidden relative">

      {/* --- LIST ROOMS (SIDEBAR) --- */}
      <ChatList
        rooms={rooms}
        currentUser={user}
        activeRoomId={activeRoom?._id}
        onSelectRoom={openRoom}
      />

      {/* --- DETAIL CHAT (MAIN AREA) --- */}
      {activeRoom ? (
        <ChatRoomComponent
          activeRoom={activeRoom}
          currentUser={user}
          socket={socket}
          onBack={() => setActiveRoom(null)}
          relatedOrder={relatedOrder || null}
        />
      ) : (
        <div className="hidden md:flex w-full md:w-2/3 bg-gray-50 flex-col items-center justify-center h-full text-gray-300">
          <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          <p>Pilih percakapan untuk memulai</p>
        </div>
      )}
    </div>
  );
}