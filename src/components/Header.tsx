import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged, User, deleteUser } from "firebase/auth";
import { AuthModal } from "./AuthModal";

interface HeaderProps {
  onReset?: () => void;
  showReset?: boolean;
  credits?: number | null; // Tracks user credit balance
}

// Ensure ThemeToggle is defined BEFORE Header or properly exported
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
      {isDark ? "🌙" : "☀️"}
    </button>
  );
};

export const Header: React.FC<HeaderProps> = ({
  onReset,
  showReset,
  credits,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Logic for store-compliant account deletion
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This will permanently remove your credit balance and login data. This action cannot be undone."
    );

    if (confirmed && auth.currentUser) {
      try {
        await deleteUser(auth.currentUser);
        alert("Account deleted successfully.");
        window.location.reload();
      } catch (error: any) {
        console.error("Deletion failed:", error);
        if (error.code === "auth/requires-recent-login") {
          alert(
            "For security, please sign out and sign back in before deleting your account."
          );
        } else {
          alert("An error occurred. Please contact support@wallpaint.in.");
        }
      }
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md dark:shadow-black/20 sticky top-0 z-50">
      {/* Reduced vertical padding from py-4 to py-2 to keep navbar height in check with 2x logo */}
      <div className="container mx-auto px-4 py-2 md:px-8">
        <div className="flex justify-between items-center">
          {/* Reduced gap from gap-2 to gap-1 for a tighter brand lockup */}
          <a
            href="#"
            className="flex items-center gap-1 md:gap-2 cursor-pointer group"
          >
            <img
              src="/logo.png"
              alt="wallpaint logo"
              // Increased size: Original was w-12/16, now 2x (w-24/32). Added responsive sizing.
              className="w-24 h-24 md:w-32 md:h-32 object-contain transition-transform group-hover:scale-105"
            />
            {/* Added -ml-2 to reduce visual gap between logo and text */}
            <h1 className="text-xl md:text-3xl font-black text-gray-800 dark:text-gray-100 -ml-2 tracking-tighter">
              wallpaint
            </h1>
          </a>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 md:gap-6">
                {/* Credit Balance Badge */}
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800 shadow-sm">
                  <span className="text-[10px] md:text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Credits
                  </span>
                  <span className="text-sm font-black text-indigo-700 dark:text-indigo-200">
                    {credits ?? 0}
                  </span>
                  <a
                    href="#pricing"
                    className="ml-1 text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    title="Buy more credits"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden lg:flex flex-col items-end leading-tight">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user.displayName || user.email?.split("@")[0]}
                    </span>
                    <button
                      onClick={handleDeleteAccount}
                      className="text-[10px] text-red-400 hover:text-red-600 underline transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border border-gray-300 shadow-sm"
                    />
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-xs md:text-sm font-semibold text-gray-500 hover:text-red-500 dark:text-gray-400 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
              >
                Sign In
              </button>
            )}

            {showReset && onReset && (
              <button
                onClick={onReset}
                className="hidden md:block text-gray-500 hover:text-gray-700 dark:text-gray-400 font-medium"
                aria-label="Reset"
              >
                Reset
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
};
