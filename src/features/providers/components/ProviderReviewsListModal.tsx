// src/features/providers/components/ProviderReviewsListModal.tsx

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchReviews, Review } from '@/features/reviews/api';

interface ProviderReviewsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
}

export default function ProviderReviewsListModal({
  isOpen,
  onClose,
  providerId,
}: ProviderReviewsListModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && providerId) {
      loadReviews();
    }
  }, [isOpen, providerId]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const data = await fetchReviews({ providerId });
      // Pastikan data adalah array (defensive)
      const reviewsData = Array.isArray(data) ? data : (data as any).data || [];
      setReviews(reviewsData);
    } catch (error) {
      console.error('Gagal memuat ulasan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h3 className="text-lg font-bold text-gray-900">Ulasan Pelanggan</h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
                    <div className="h-2 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="flex gap-3">
                  {/* Avatar User */}
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                    <Image
                      src={review.userId?.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userId?.fullName || 'User'}`}
                      alt={review.userId?.fullName || 'User'}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {review.userId?.fullName || 'Pengguna Posko'}
                      </p>
                      <span className="text-[10px] text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="flex mb-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Comment */}
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {review.comment || <span className="italic text-gray-400">Tidak ada komentar tertulis.</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl">💬</span>
              </div>
              <p className="text-sm font-bold text-gray-900">Belum Ada Ulasan</p>
              <p className="text-xs text-gray-500 max-w-[200px] mt-1">
                Jadilah yang pertama menggunakan jasa mitra ini dan berikan ulasan!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
           <button 
             onClick={onClose}
             className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
           >
             Tutup
           </button>
        </div>
      </div>
    </div>
  );
}