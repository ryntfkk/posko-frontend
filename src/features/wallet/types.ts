export interface WalletTransaction {
    _id: string;
    userId: string;
    type: 'CREDIT' | 'DEBIT';
    category: 'TOPUP' | 'PAYMENT' | 'REFUND' | 'WITHDRAWAL' | 'EARNINGS';
    amount: number;
    status: 'pending' | 'success' | 'failed';
    orderId?: {
        _id: string;
        orderNumber: string;
        status: string;
    } | null;
    description: string;
    createdAt: string;
}

export interface WalletHistoryResponse {
    success: boolean;
    data: WalletTransaction[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
