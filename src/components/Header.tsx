import React, { useState, useEffect } from "react";
import { auth } from "../firebase"; // Import auth from your firebase file
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

interface HeaderProps {
  onReset?: () => void;
  showReset?: boolean;
}

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <a
    href={href}
    className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 font-medium"
  >
    {children}
  </a>
);

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? "🌙" : "Qs"}{" "}
      {/* You can replace with your SVGs if you prefer */}
    </button>
  );
};

export const Header: React.FC<HeaderProps> = ({ onReset, showReset }) => {
  const [user, setUser] = useState<User | null>(null);

  // Listen for login state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Check console for details.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md dark:shadow-black/20 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 md:px-8">
        <div className="flex justify-between items-center">
          <a href="#" className="cursor-pointer">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-gray-100">
              wallpaint
            </h1>
          </a>

          <div className="flex items-center gap-4">
            {/* Show User Info or Login Button */}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user.displayName}
                </span>
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-gray-300"
                  />
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm bg-red-100 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Sign In
              </button>
            )}

            {showReset && onReset && (
              <button
                onClick={onReset}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Reset"
              >
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
