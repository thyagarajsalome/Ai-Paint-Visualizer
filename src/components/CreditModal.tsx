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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Out of Credits!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You've used your free visualizations. Purchase more credits to keep
          exploring colors for your room!
        </p>

        <div className="space-y-3">
          <button
            onClick={() => (window.location.hash = "#terms")} // Direct to sales/pricing (using terms for now)
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-lg transform hover:scale-105"
          >
            Get More Credits
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-500 dark:text-gray-400 text-sm font-semibold hover:underline"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
