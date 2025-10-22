import React from 'react';

interface HeaderProps {
  onReset?: () => void; // Make onReset optional
  showReset?: boolean;
}

const NavLink: React.FC<{ href: string, children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 font-medium">
        {children}
    </a>
);


export const Header: React.FC<HeaderProps> = ({ onReset, showReset }) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 md:px-8">
        <div className="flex justify-between items-center">
            <a href="#" className="cursor-pointer">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                AI Paint Visualizer
              </h1>
              <p className="hidden md:block mt-1 text-sm text-gray-500">
                Visualize your new room instantly.
              </p>
            </a>
            <div className="flex items-center gap-4 md:gap-8">
                <nav className="hidden md:flex items-center gap-6">
                    <NavLink href="#about">About</NavLink>
                    <NavLink href="#faq">FAQ</NavLink>
                    <NavLink href="#contact">Contact</NavLink>
                </nav>
                 {showReset && onReset && (
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
                 )}
            </div>
        </div>
      </div>
    </header>
  );
};