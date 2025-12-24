// src/app/support/[ticketId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { getSupportTicket } from '@/features/support/api';
import { fetchOrderById } from '@/features/orders/api';
import { fetchProfile } from '@/features/auth/api';
import SupportChat from '@/components/support/SupportChat';
import { SupportTicket } from '@/features/support/types';
import { ChatRoom } from '@/features/chat/types';
import { Order } from '@/features/orders/types';
import { User } from '@/features/auth/types';

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

export default function SupportDetailPage() {
    const params = useParams();
    const ticketId = params.ticketId as string;
    const [socket, setSocket] = useState<Socket | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);

    const { data: ticketData, isLoading: ticketLoading } = useQuery({
        queryKey: ['support-ticket', ticketId],
        queryFn: async () => {
            const response = await getSupportTicket(ticketId);
            return response.data;
        },
        enabled: !!ticketId
    });

    const ticket = ticketData as SupportTicket | undefined;
    const orderId = ticket && typeof ticket.orderId === 'object' ? ticket.orderId._id : typeof ticket?.orderId === 'string' ? ticket.orderId : null;

    const { data: orderData } = useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            if (!orderId) return null;
            const response = await fetchOrderById(orderId);
            return response.data.data;
        },
        enabled: !!orderId
    });

    const order = orderData as Order | null;

    // Initialize user and socket
    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem('posko_token');
            if (!token) return;

            try {
                const profileRes = await fetchProfile();
                setUser(profileRes.data.profile);

                const socketUrl = getSocketUrl();
                const newSocket = io(socketUrl, {
                    auth: { token },
                    transports: ['websocket', 'polling'],
                    reconnection: true
                });

                newSocket.on('connect_error', (err) => {
                    console.error('Socket connection error:', err.message);
                });

                newSocket.on('connect', () => {
                    console.log('Socket connected:', newSocket.id);
                });

                newSocket.on('receive_message', (data: { roomId: string; message: any }) => {
                    if (chatRoom && data.roomId === chatRoom._id) {
                        setChatRoom(prev => prev ? {
                            ...prev,
                            messages: [...prev.messages, data.message]
                        } : null);
                    }
                });

                setSocket(newSocket);
            } catch (error) {
                console.error('Init error:', error);
            }
        };

        init();

        return () => {
            socket?.disconnect();
        };
    }, []);

    // Load chat room when ticket is loaded
    useEffect(() => {
        if (ticket && ticket.chatRoomId) {
            const loadChatRoom = async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/chat/${ticket.chatRoomId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('posko_token')}`
                        }
                    });
                    const data = await response.json();
                    setChatRoom(data.data);

                    // Join chat room after loading
                    if (socket && data.data?._id) {
                        socket.emit('join_chat', data.data._id);
                    }
                } catch (error) {
                    console.error('Failed to load chat room:', error);
                }
            };
            loadChatRoom();
        }
    }, [ticket, socket]);

    if (ticketLoading || !ticket || !chatRoom || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SupportChat
                ticket={ticket}
                chatRoom={chatRoom}
                currentUser={user}
                socket={socket}
                order={order}
            />
        </div>
    );
}







