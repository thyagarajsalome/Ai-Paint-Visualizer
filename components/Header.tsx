import React, { useState, useEffect } from 'react';

interface HeaderProps {
  onReset?: () => void; // Make onReset optional
  showReset?: boolean;
}

const NavLink: React.FC<{ href: string, children: React.ReactNode }> = ({ href, children }) => (
    <a href={href} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 font-medium">
        {children}
    </a>
);

const ThemeToggle: React.FC = () => {
    const [isDark, setIsDark] = useState(() => {
        // This logic now mirrors the inline script in index.html for consistency.
        return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-gray-800"
            aria-label="Toggle theme"
        >
            {isDark ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
        </button>
    );
};


export const Header: React.FC<HeaderProps> = ({ onReset, showReset }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md dark:shadow-black/20 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 md:px-8">
        <div className="flex justify-between items-center">
            <a href="#" className="cursor-pointer">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-gray-100">
                wallpaint
              </h1>
              <p className="hidden md:block mt-1 text-sm text-gray-500 dark:text-gray-400">
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
                      className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      aria-label="Reset application"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l16 16" />
                      </svg>
                      Reset
                    </button>
                 )}
                 <ThemeToggle />
            </div>
        </div>
      </div>
    </header>
  );
};