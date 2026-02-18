'use client';

import { useEffect, useState } from 'react';

/**
 * StorageErrorToast Component
 * Displays a notification when localStorage quota is exceeded
 * Requirements: 12.3
 */
export default function StorageErrorToast() {
  const [showToast, setShowToast] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Listen for storage quota errors
    const handleStorageError = (event: Event) => {
      if (event instanceof ErrorEvent && event.error?.name === 'QuotaExceededError') {
        setMessage('Storage quota exceeded. Some data may not be saved. Try clearing your browser cache.');
        setShowToast(true);
      }
    };

    // Listen for custom storage events
    const handleCustomStorageError = (event: CustomEvent) => {
      setMessage(event.detail.message || 'Storage error occurred');
      setShowToast(true);
    };

    window.addEventListener('error', handleStorageError);
    window.addEventListener('storage-error' as any, handleCustomStorageError);

    return () => {
      window.removeEventListener('error', handleStorageError);
      window.removeEventListener('storage-error' as any, handleCustomStorageError);
    };
  }, []);

  const handleClose = () => {
    setShowToast(false);
  };

  if (!showToast) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-up">
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-yellow-900 mb-1">
              Storage Warning
            </h3>
            <p className="text-sm text-yellow-800">{message}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-yellow-600 hover:text-yellow-800 transition-colors"
            aria-label="Close notification"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
