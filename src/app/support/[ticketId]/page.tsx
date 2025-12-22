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
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/b5c4354d-7ec8-4b1e-8e61-b118b04e13c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'support/[ticketId]/page.tsx:80',message:'Socket connect error',data:{error:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                });

                newSocket.on('connect', () => {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/b5c4354d-7ec8-4b1e-8e61-b118b04e13c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'support/[ticketId]/page.tsx:84',message:'Socket connected',data:{socketId:newSocket.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
                });

                newSocket.on('receive_message', (data: { roomId: string; message: any }) => {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/b5c4354d-7ec8-4b1e-8e61-b118b04e13c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'support/[ticketId]/page.tsx:91',message:'Received message',data:{roomId:data.roomId,currentChatRoomId:chatRoom?._id,matches:data.roomId===chatRoom?._id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
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
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/b5c4354d-7ec8-4b1e-8e61-b118b04e13c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'support/[ticketId]/page.tsx:97',message:'Init error',data:{error:error?.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                // #endregion
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
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/b5c4354d-7ec8-4b1e-8e61-b118b04e13c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'support/[ticketId]/page.tsx:107',message:'Loading chat room',data:{ticketId:ticket._id,chatRoomId:ticket.chatRoomId,socketReady:!!socket},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            
            const loadChatRoom = async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/chat/${ticket.chatRoomId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('posko_token')}`
                        }
                    });
                    const data = await response.json();
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/b5c4354d-7ec8-4b1e-8e61-b118b04e13c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'support/[ticketId]/page.tsx:116',message:'Chat room loaded',data:{chatRoomId:data.data?._id,messagesCount:data.data?.messages?.length||0,hasMessages:!!data.data?.messages},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                    // #endregion
                    setChatRoom(data.data);
                    
                    // Join chat room after loading
                    if (socket && data.data?._id) {
                        // #region agent log
                        fetch('http://127.0.0.1:7242/ingest/b5c4354d-7ec8-4b1e-8e61-b118b04e13c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'support/[ticketId]/page.tsx:122',message:'Joining chat room',data:{roomId:data.data._id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                        // #endregion
                        socket.emit('join_chat', data.data._id);
                    }
                } catch (error) {
                    console.error('Failed to load chat room:', error);
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/b5c4354d-7ec8-4b1e-8e61-b118b04e13c3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'support/[ticketId]/page.tsx:127',message:'Failed to load chat room',data:{error:error?.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                    // #endregion
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

