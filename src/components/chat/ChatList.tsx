import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChatRoom, Message } from '@/features/chat/types';
import { User } from '@/features/auth/types';

interface ChatListProps {
    rooms: ChatRoom[];
    currentUser: User | null;
    activeRoomId?: string;
    onSelectRoom: (room: ChatRoom) => void;
}

const BackIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
    </svg>
);

export default function ChatList({ rooms, currentUser, activeRoomId, onSelectRoom }: ChatListProps) {
    const router = useRouter();
    const myId = currentUser?._id;

    const getOpponent = (room: ChatRoom | null) => {
        if (!room || !myId) return null;
        return room.participants.find(p => p._id !== myId) || room.participants[0];
    };

    const getSenderId = (sender: string | { _id: string }) => {
        return typeof sender === 'object' ? sender._id : sender;
    };

    return (
        <div className={`w-full md:w-1/3 bg-white flex flex-col ${activeRoomId ? 'hidden md:flex' : 'flex h-screen md:h-auto'}`}>
            {/* Header List */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="md:hidden text-gray-600 p-1">
                        <BackIcon />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Pesan</h1>
                </div>
                <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                    {currentUser && (
                        <Image
                            src={currentUser.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.fullName}`}
                            alt="Me"
                            width={36}
                            height={36}
                            className="object-cover"
                        />
                    )}
                </div>
            </div>

            {/* Room List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-0">
                {rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-sm">
                        <p>Belum ada pesan masuk.</p>
                    </div>
                ) : (
                    rooms.map(room => {
                        const opponent = getOpponent(room);
                        const lastMsg = room.messages[room.messages.length - 1];
                        const isActive = activeRoomId === room._id;
                        const isLastMsgImage = lastMsg?.attachment?.type === 'image';

                        return (
                            <button
                                key={room._id}
                                onClick={() => onSelectRoom(room)}
                                className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-all text-left border-b border-gray-50 ${isActive ? 'bg-red-50' : ''}`}
                            >
                                <div className="relative w-12 h-12 shrink-0">
                                    <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                                        <Image
                                            src={opponent?.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${opponent?.fullName}`}
                                            alt="User"
                                            width={48}
                                            height={48}
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className={`text-sm font-bold truncate ${isActive ? 'text-red-700' : 'text-gray-900'}`}>{opponent?.fullName}</h4>
                                        <span className="text-[10px] text-gray-400">
                                            {lastMsg ? new Date(lastMsg.sentAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate ${isActive ? 'text-red-600/70' : 'text-gray-500'}`}>
                                        {lastMsg ? (
                                            getSenderId(lastMsg.sender) === myId ? (
                                                <span className="flex items-center gap-1">Anda: {isLastMsgImage ? '📷 Foto' : lastMsg.content}</span>
                                            ) : (
                                                <span className="flex items-center gap-1">{isLastMsgImage ? '📷 Foto' : lastMsg.content}</span>
                                            )
                                        ) : (
                                            <span className="italic opacity-60">Mulai obrolan baru...</span>
                                        )}
                                    </p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
