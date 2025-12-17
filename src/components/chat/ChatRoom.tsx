import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Socket } from 'socket.io-client';
import api from '@/lib/axios';
import { User } from '@/features/auth/types';
import { ChatRoom, Attachment } from '@/features/chat/types';
import { Order } from '@/features/orders/types';

interface ChatRoomProps {
    activeRoom: ChatRoom;
    currentUser: User | null;
    socket: Socket | null;
    onBack: () => void;
    relatedOrder: Order | null;
}

// Icons
const BackIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>;
const SendIcon = () => <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const ImageIcon = () => <svg className="w-6 h-6 text-gray-500 hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const XIcon = () => <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;

export default function ChatRoom({ activeRoom, currentUser, socket, onBack, relatedOrder }: ChatRoomProps) {
    const router = useRouter();
    const [newMessage, setNewMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<{ file: File, url: string } | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const myId = currentUser?._id;

    // Helper: Get Opponent User
    const getOpponent = (room: ChatRoom | null) => {
        if (!room || !myId) return null;
        return room.participants.find(p => p._id !== myId) || room.participants[0];
    };

    const getSenderId = (sender: string | { _id: string }) => {
        return typeof sender === 'object' ? sender._id : sender;
    };

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeRoom.messages, previewImage]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Limit 5MB
            if (file.size > 5 * 1024 * 1024) {
                alert("Ukuran file maksimal 5MB");
                return;
            }
            // Set Preview
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
        if ((!newMessage.trim() && !previewImage) || !activeRoom || !socket) return;

        let attachmentData = null;

        // 1. Upload Image if exists
        if (previewImage) {
            setIsUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', previewImage.file);

                // Upload endpoint
                const res = await api.post('/chat/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                attachmentData = res.data.data; // { url, type }
            } catch (error) {
                console.error("Upload failed", error);
                alert("Gagal mengupload gambar.");
                setIsUploading(false);
                return;
            } finally {
                setIsUploading(false);
            }
        }

        // 2. Emit Socket Message
        socket.emit('send_message', {
            roomId: activeRoom._id,
            content: newMessage,
            attachment: attachmentData
        });

        // 3. Reset State
        setNewMessage('');
        setPreviewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`w-full md:w-2/3 bg-[#f0f2f5] md:bg-gray-50 flex-col ${activeRoom ? 'flex h-screen md:h-auto' : 'hidden md:flex'} relative`}>
            {/* 1. Header Chat */}
            <div className="bg-white px-4 py-3 border-b border-gray-200 flex flex-col sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"><BackIcon /></button>
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200 shrink-0">
                        <Image
                            src={getOpponent(activeRoom)?.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getOpponent(activeRoom)?.fullName}`}
                            alt="User"
                            width={40} height={40}
                            className="object-cover"
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-gray-900 truncate">{getOpponent(activeRoom)?.fullName}</span>
                        <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">● Online</span>
                    </div>
                </div>

                {/* Order Snippet (Context) */}
                {relatedOrder && (
                    <div
                        onClick={() => router.push(`/orders/${relatedOrder._id}`)}
                        className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 border border-blue-100 font-bold text-xs shrink-0">
                                {relatedOrder.orderNumber?.slice(-4) || 'ORD'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-blue-800 font-bold truncate">{relatedOrder.items[0]?.name}</p>
                                <p className="text-[10px] text-blue-600 truncate">Status: {relatedOrder.status.replace(/_/g, ' ').toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-xs font-black text-blue-900">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(relatedOrder.totalAmount)}</p>
                            <span className="text-[10px] text-blue-500 underline">Detail →</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-[140px] md:pb-4 custom-scrollbar">
                {activeRoom.messages.map((msg, idx) => {
                    const senderId = getSenderId(msg.sender);
                    const isMe = senderId === myId;

                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex flex-col max-w-[80%] md:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>

                                {/* Image Bubble */}
                                {msg.attachment?.type === 'image' && (
                                    <div className={`mb-1 overflow-hidden rounded-2xl border ${isMe ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
                                        <Image
                                            // Gunakan helper API URL agar gambar load benar di production
                                            src={msg.attachment.url.startsWith('http') ? msg.attachment.url : `${process.env.NEXT_PUBLIC_API_URL}${msg.attachment.url}`}
                                            alt="Attachment"
                                            width={200} height={200}
                                            className="w-full h-auto object-cover max-h-60"
                                        />
                                    </div>
                                )}

                                {/* Text Bubble */}
                                {msg.content && (
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm break-words ${isMe ? 'bg-red-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                                        }`}>
                                        {msg.content}
                                    </div>
                                )}

                                {/* Timestamp */}
                                <p className="text-[9px] mt-1 text-gray-400 px-1">
                                    {new Date(msg.sentAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* 3. Input Area (Fixed/Sticky) */}
            <div className="fixed bottom-[88px] left-0 right-0 md:static md:bottom-auto bg-white border-t border-gray-200 p-3 z-40">

                {/* Preview Image sebelum dikirim */}
                {previewImage && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                            <Image src={previewImage.url} alt="Preview" fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">{previewImage.file.name}</p>
                            <p className="text-[10px] text-gray-500">{(previewImage.file.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <button onClick={cancelPreview} className="p-1 bg-gray-400 rounded-full hover:bg-gray-600 transition-colors">
                            <XIcon />
                        </button>
                    </div>
                )}

                {/* Form Input */}
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
                    {/* Tombol Upload */}
                    <div className="pb-1.5">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-red-600 transition-all"
                            title="Kirim Gambar"
                        >
                            <ImageIcon />
                        </button>
                    </div>

                    {/* Text Field */}
                    <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-red-500 focus-within:bg-white transition-all">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={previewImage ? "Tambah keterangan..." : "Ketik pesan..."}
                            className="flex-1 bg-transparent border-none text-gray-900 text-sm focus:ring-0 outline-none max-h-24 py-1"
                            disabled={isUploading}
                        />
                    </div>

                    {/* Send Button */}
                    <div className="pb-1">
                        <button
                            type="submit"
                            disabled={(!newMessage.trim() && !previewImage) || isUploading}
                            className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 shadow-md transition-all disabled:bg-gray-300 disabled:shadow-none"
                        >
                            {isUploading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <SendIcon />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
