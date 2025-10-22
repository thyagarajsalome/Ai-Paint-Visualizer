import React from 'react';

interface HeaderProps {
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-6 md:px-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
            AI Paint Visualizer
          </h1>
          <p className="mt-1 text-md text-gray-500">
            See your new room before you pick up a brush.
          </p>
        </div>
        <button
          onClick={onReset}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
          aria-label="Reset application"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l16 16" />
          </svg>
          Reset
        </button>
      </div>
    </header>
  );
};
