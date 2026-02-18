'use client';

import { useState, useEffect } from 'react';
import { storageService } from '@/lib/storage';

/**
 * SettingsModal Component
 * Provides cache management and app settings
 * Requirements: 19.2 - Cache management
 */

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [cacheSize, setCacheSize] = useState<string>('0 KB');
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      updateCacheSize();
    }
  }, [isOpen]);

  const updateCacheSize = () => {
    const size = storageService.getStorageSize();
    setCacheSize(formatBytes(size));
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached data? This will require re-fetching data from the API.')) {
      return;
    }

    setIsClearing(true);
    
    try {
      // Clear all cache entries
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('classic-caps-api-cache-')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      updateCacheSize();
      alert('Cache cleared successfully!');
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear cache. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-pitch"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cache Management Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cache Management</h3>
            <p className="text-sm text-gray-600 mb-4">
              Cached data helps reduce API requests and improves performance. Clear the cache if you&apos;re experiencing issues or want to refresh data.
            </p>
          </div>

          {/* Cache Size */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Cache Size</span>
              <span className="text-sm font-semibold text-pitch">{cacheSize}</span>
            </div>
          </div>

          {/* Clear Cache Button */}
          <button
            onClick={handleClearCache}
            disabled={isClearing}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {isClearing ? 'Clearing...' : 'Clear All Cache'}
          </button>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Clearing the cache will remove all stored API data. The app will need to fetch data again from the API, which may count against your daily API limit.
            </p>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
          <p className="text-sm text-gray-600">
            Classic Caps is a football lineup guessing game. Test your knowledge of historical matches by identifying the starting XI players.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Version 1.0.0
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
