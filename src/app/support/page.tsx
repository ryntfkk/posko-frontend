// src/app/support/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { listSupportTickets } from '@/features/support/api';
import { SupportTicket } from '@/features/support/types';

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

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'urgent': return 'bg-red-100 text-red-700';
        case 'high': return 'bg-orange-100 text-orange-700';
        case 'medium': return 'bg-yellow-100 text-yellow-700';
        case 'low': return 'bg-gray-100 text-gray-700';
        default: return 'bg-gray-100 text-gray-700';
    }
};

export default function SupportListPage() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<string>('');

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['support-tickets', statusFilter],
        queryFn: async () => {
            const response = await listSupportTickets({ status: statusFilter || undefined });
            return response;
        }
    });

    const tickets = data?.data || [];
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-20 px-4 h-14 flex items-center justify-between shadow-sm border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Link href="/orders" className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-50 text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-sm font-bold">Bantuan Customer Service</h1>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white px-4 py-3 border-b border-gray-100">
                <div className="flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => setStatusFilter('')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                            statusFilter === '' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => setStatusFilter('open')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                            statusFilter === 'open' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        Menunggu
                    </button>
                    <button
                        onClick={() => setStatusFilter('in_progress')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                            statusFilter === 'in_progress' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        Ditangani
                    </button>
                    <button
                        onClick={() => setStatusFilter('resolved')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                            statusFilter === 'resolved' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        Selesai
                    </button>
                </div>
            </div>

            {/* Tickets List */}
            <div className="p-4 space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-sm">Belum ada support ticket</p>
                    </div>
                ) : (
                    tickets.map((ticket: SupportTicket) => {
                        const order = typeof ticket.orderId === 'object' ? ticket.orderId : null;
                        const orderNumber = order?.orderNumber || 'N/A';

                        return (
                            <div
                                key={ticket._id}
                                onClick={() => router.push(`/support/${ticket._id}`)}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm text-gray-900 mb-1">{ticket.subject}</h3>
                                        <p className="text-xs text-gray-500">Order #{orderNumber}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${getStatusColor(ticket.status)}`}>
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityColor(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {formatDate(ticket.createdAt)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}





