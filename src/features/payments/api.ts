import api from '@/lib/axios';

// [NEW] Interface untuk response payment
export interface PaymentResponse {
  message: string;
  data:  {
    paymentId: string;
    snapToken: string;
    redirectUrl: string;
    paymentType: 'initial' | 'additional_fee';
    expiryTime: string;
  };
}

// [NEW] Interface untuk error response
export interface PaymentErrorResponse {
  message:  string;
  messageKey?:  string;
  errors?:  Array<{
    field: string;
    message: string;
    messageKey:  string;
  }>;
  details?: string;
}

// [NEW] Custom error class untuk payment
export class PaymentError extends Error {
  public statusCode: number;
  public messageKey?:  string;
  public errors?: Array<{ field: string; message: string; messageKey: string }>;
  public details?: string;

  constructor(
    message: string,
    statusCode: number,
    messageKey?: string,
    errors?: Array<{ field: string; message: string; messageKey:  string }>,
    details?: string
  ) {
    super(message);
    this.name = 'PaymentError';
    this.statusCode = statusCode;
    this.messageKey = messageKey;
    this.errors = errors;
    this.details = details;
  }
}

// [FIX] Fungsi untuk validasi orderId di client-side
function validateOrderId(orderId: string | undefined | null): string {
  // Cek apakah orderId ada
  if (!orderId) {
    throw new PaymentError(
      'Order ID wajib diisi',
      400,
      'validation.order_id_required'
    );
  }

  // Cek tipe data
  if (typeof orderId !== 'string') {
    throw new PaymentError(
      'Order ID harus berupa string',
      400,
      'validation.order_id_invalid_type'
    );
  }

  // Trim dan cek kosong
  const trimmedOrderId = orderId.trim();
  if (trimmedOrderId === '') {
    throw new PaymentError(
      'Order ID tidak boleh kosong',
      400,
      'validation.order_id_empty'
    );
  }

  // Validasi format MongoDB ObjectId (24 karakter hex)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (! objectIdRegex.test(trimmedOrderId)) {
    throw new PaymentError(
      'Format Order ID tidak valid',
      400,
      'validation.order_id_invalid_format'
    );
  }

  return trimmedOrderId;
}

// [FIX] Create Payment dengan validasi dan error handling yang lebih baik
export const createPayment = async (orderId: string): Promise<PaymentResponse> => {
  console.log('[PaymentAPI] createPayment called with orderId:', orderId);

  try {
    // Validasi orderId di client-side terlebih dahulu
    const validatedOrderId = validateOrderId(orderId);
    console.log('[PaymentAPI] Validated orderId:', validatedOrderId);

    // Panggil endpoint backend
    const response = await api.post<PaymentResponse>('/payments', { 
      orderId: validatedOrderId 
    });

    console.log('[PaymentAPI] Payment created successfully:', response.data);
    return response.data;

  } catch (error:  any) {
    console.error('[PaymentAPI] Error creating payment:', error);

    // Jika error sudah PaymentError (dari validasi client-side), lempar langsung
    if (error instanceof PaymentError) {
      throw error;
    }

    // Handle error dari axios/backend
    if (error.response) {
      const { status, data } = error.response;
      console.error('[PaymentAPI] Backend error response:', status, data);

      // Ekstrak informasi error dari response backend
      const errorMessage = data?.message || 'Terjadi kesalahan saat memproses pembayaran';
      const messageKey = data?.messageKey;
      const errors = data?.errors;
      const details = data?.details;

      throw new PaymentError(errorMessage, status, messageKey, errors, details);
    }

    // Handle network error atau error lainnya
    if (error.request) {
      console.error('[PaymentAPI] Network error - no response received');
      throw new PaymentError(
        'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        0,
        'network.connection_error'
      );
    }

    // Error tidak diketahui
    throw new PaymentError(
      error.message || 'Terjadi kesalahan yang tidak diketahui',
      500,
      'unknown.error'
    );
  }
};

// [NEW] Fungsi helper untuk mendapatkan pesan error yang user-friendly
export const getPaymentErrorMessage = (error: unknown): string => {
  if (error instanceof PaymentError) {
    // Jika ada multiple validation errors, gabungkan
    if (error.errors && error.errors.length > 0) {
      return error.errors.map(e => e.message).join('. ');
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Terjadi kesalahan saat memproses pembayaran';
};

// [NEW] Fungsi untuk cek apakah error adalah karena expired
export const isPaymentExpiredError = (error: unknown): boolean => {
  if (error instanceof PaymentError) {
    return error.messageKey === 'payment.expired' || 
           error.message.toLowerCase().includes('expired') ||
           error.message.toLowerCase().includes('kadaluarsa');
  }
  return false;
};

// [NEW] Fungsi untuk cek apakah error adalah karena akses ditolak
export const isPaymentAccessDeniedError = (error: unknown): boolean => {
  if (error instanceof PaymentError) {
    return error.statusCode === 403;
  }
  return false;
};

// [NEW] Fungsi untuk cek apakah error adalah karena order tidak ditemukan
export const isOrderNotFoundError = (error: unknown): boolean => {
  if (error instanceof PaymentError) {
    return error.statusCode === 404;
  }
  return false;
};

// [NEW] Fungsi untuk cek apakah error adalah karena validasi
export const isValidationError = (error: unknown): boolean => {
  if (error instanceof PaymentError) {
    return error.statusCode === 400 && (error.errors !== undefined || error.messageKey?.startsWith('validation.'));
  }
  return false;
};

// [NEW] Fungsi untuk cek apakah error adalah karena server/midtrans
export const isServerError = (error: unknown): boolean => {
  if (error instanceof PaymentError) {
    return error.statusCode >= 500;
  }
  return false;
};

// [NEW] Fungsi untuk cek apakah error adalah karena network
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof PaymentError) {
    return error.statusCode === 0 || error.messageKey === 'network.connection_error';
  }
  return false;
};