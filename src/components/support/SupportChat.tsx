// src/components/support/SupportChat.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Socket } from 'socket.io-client';
import api from '@/lib/axios';
import { User } from '@/features/auth/types';
import { ChatRoom } from '@/features/chat/types';
import { SupportTicket } from '@/features/support/types';
import { Order } from '@/features/orders/types';

interface SupportChatProps {
    ticket: SupportTicket;
    chatRoom: ChatRoom;
    currentUser: User | null;
    socket: Socket | null;
    order: Order | null;
}

const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>;
const SendIcon = () => <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const ImageIcon = () => <svg className="w-6 h-6 text-gray-500 hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const XIcon = () => <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;

const getStatusColor = (status: string) => {
    switch (status) {
        case 'open': return 'bg-yellow-100 text-yellow-700';
        case 'in_progress': return 'bg-blue-100 text-blue-700';
        case 'resolved': return 'bg-green-100 text-green-700';
        case 'closed': return 'bg-gray-100 text-gray-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'open': return 'Menunggu Admin';
        case 'in_progress': return 'Sedang Ditangani';
        case 'resolved': return 'Selesai';
        case 'closed': return 'Ditutup';
        default: return status;
    }
};

export default function SupportChat({ ticket, chatRoom, currentUser, socket, order }: SupportChatProps) {
    const [newMessage, setNewMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<{ file: File, url: string } | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const myId = currentUser?._id;
    const admin = typeof ticket.adminId === 'object' ? ticket.adminId : null;

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatRoom.messages, previewImage]);

    // Join chat room on mount
    useEffect(() => {
        if (socket && chatRoom?._id) {
            socket.emit('join_chat', chatRoom._id);
        }
    }, [socket, chatRoom?._id]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert("Ukuran file maksimal 5MB");
                return;
            }
            setPreviewImage({
                file,
                url: URL.createObjectURL(file)
            });
        }
    };

    const cancelPreview = () => {
        setPreviewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !previewImage) || !chatRoom || !socket) return;

        let attachmentData = null;

        if (previewImage) {
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', previewImage.file);

                const res = await api.post('/chat/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                attachmentData = res.data.data;
            } catch (error) {
                console.error("Upload failed", error);
                alert("Gagal mengupload gambar.");
                setIsUploading(false);
                return;
            } finally {
                setIsUploading(false);
            }
        }

        socket.emit('send_message', {
            roomId: chatRoom._id,
            content: newMessage,
            attachment: attachmentData
        });

        setNewMessage('');
        setPreviewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getSenderId = (sender: string | { _id: string }) => {
        return typeof sender === 'object' ? sender._id : sender;
    };

    const isMyMessage = (senderId: string) => {
        return getSenderId(senderId) === myId;
    };

    return (
        <div className="w-full bg-[#f0f2f5] md:bg-gray-50 flex flex-col h-screen md:h-auto relative">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-gray-200 flex flex-col sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <Link href="/support" className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                        <BackIcon />
                    </Link>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm">Customer Service</h3>
                        <p className="text-xs text-gray-500">{ticket.subject}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                    </span>
                </div>

                {/* Order Info */}
                {order && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <Link
                            href={`/orders/${order._id}`}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            Order #{typeof order === 'object' ? order.orderNumber : order}
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                )}

                {/* Admin Badge */}
                {admin ? (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-blue-600">A</span>
                        </div>
                        <span className="text-xs text-gray-600">Admin: {admin.fullName || 'Admin'}</span>
                    </div>
                ) : (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-yellow-600">Menunggu admin untuk menanggapi...</span>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatRoom.messages.map((msg, idx) => {
                    const senderId = getSenderId(msg.sender);
                    const isMine = isMyMessage(senderId);
                    const sender = typeof msg.sender === 'object' ? msg.sender : null;

                    return (
                        <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] flex gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!isMine && (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-bold text-blue-600">A</span>
                                    </div>
                                )}
                                <div className={`rounded-2xl px-4 py-2 ${isMine ? 'bg-red-600 text-white' : 'bg-white text-gray-900'}`}>
                                    {msg.attachment && (
                                        <div className="mb-2">
                                            <Image
                                                src={msg.attachment.url}
                                                alt="Attachment"
                                                width={200}
                                                height={200}
                                                className="rounded-lg"
                                            />
                                        </div>
                                    )}
                                    {msg.content && <p className="text-sm">{msg.content}</p>}
                                    <p className={`text-[10px] mt-1 ${isMine ? 'text-red-100' : 'text-gray-400'}`}>
                                        {new Date(msg.sentAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {ticket.status !== 'closed' && (
                <div className="bg-white border-t border-gray-200 p-3">
                    {previewImage && (
                        <div className="mb-2 relative inline-block">
                            <Image
                                src={previewImage.url}
                                alt="Preview"
                                width={100}
                                height={100}
                                className="rounded-lg"
                            />
                            <button
                                onClick={cancelPreview}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                            >
                                <XIcon />
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-gray-500 hover:text-red-600"
                        >
                            <ImageIcon />
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Tulis pesan..."
                            className="flex-1 px-4 py-2 bg-gray-100 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-red-500"
                            disabled={isUploading}
                        />
                        <button
                            type="submit"
                            disabled={(!newMessage.trim() && !previewImage) || isUploading}
                            className="p-2 bg-red-600 text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <SendIcon />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}





