// src/components/support/CreateTicketModal.tsx
'use client';

import { useState } from 'react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (subject: string, initialMessage: string) => Promise<void>;
  isSubmitting: boolean;
  orderNumber: string;
}

export default function CreateTicketModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  orderNumber
}: CreateTicketModalProps) {
  const [subject, setSubject] = useState(`Bantuan untuk Order #${orderNumber}`);
  const [initialMessage, setInitialMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!subject.trim()) {
      alert('Mohon isi subject');
      return;
    }
    onSubmit(subject.trim(), initialMessage.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Mulai Chat dengan CS</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500">Jelaskan masalah yang Anda alami dengan order ini.</p>
          
          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Subject</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-gray-50"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Initial Message */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Pesan Awal (Opsional)</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none bg-gray-50"
              rows={4}
              placeholder="Jelaskan masalah Anda di sini..."
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 disabled:opacity-50"
          >
            Batal
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !subject.trim()}
            className="flex-1 py-2.5 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 disabled:bg-gray-400 disabled:shadow-none transition-all"
          >
            {isSubmitting ? 'Membuat...' : 'Mulai Chat'}
          </button>
        </div>

      </div>
    </div>
  );
}

