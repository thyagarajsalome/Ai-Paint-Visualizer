// src/components/CreditModal.tsx
import React from "react";

interface CreditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditModal: React.FC<CreditModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700 relative animate-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-indigo-600 dark:text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Your credits are ended
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You've used your free visualizations. Purchase more credits to keep
          exploring colors for your room!
        </p>

        <div className="space-y-3">
          <button
            onClick={() => {
              window.location.hash = "#pricing"; // Redirects immediately to your new pricing page
              onClose();
            }}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
          >
            Get More Credits
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-500 dark:text-gray-400 text-sm font-semibold hover:text-indigo-600 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
