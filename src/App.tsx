import React, { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { MainContent, MainContentProps } from "./components/MainContent";
import { CreditModal } from "./components/CreditModal";
import { PricingPage } from "./pages/Pricing";
import { AboutPage } from "./pages/About";
import { PolicyPage } from "./pages/Policy";
import { DisclaimerPage } from "./pages/Disclaimer";
import { FaqPage } from "./pages/Faq";
import { TermsPage } from "./pages/Terms";
import type { PaintColor } from "./types";
import { visualizePaint } from "./services/geminiService";
import { fileToBase64 } from "./utils/fileUtils";
import { auth, db } from "./firebase";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

const routes: { [key: string]: React.FC<any> } = {
  "": MainContent,
  "#about": AboutPage,
  "#policy": PolicyPage,
  "#disclaimer": DisclaimerPage,
  "#faq": FaqPage,
  "#terms": TermsPage,
  "#pricing": PricingPage,
};

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || "");
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<PaintColor | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- OPTIMIZED LIVE CREDIT TRACKING ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);

        // Use onSnapshot to listen for real-time changes in Firestore
        const unsubscribeCredits = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              // This force-updates the UI with whatever is in the actual database
              setUserCredits(data.credits);
              console.log("Syncing credits from Firestore:", data.credits);
            } else {
              // New user handling: Default to 2 if no doc exists yet
              setUserCredits(2);
            }
          },
          (err) => {
            console.error("Firestore Credit Listener Error:", err);
          }
        );

        return () => unsubscribeCredits();
      } else {
        setUserCredits(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // --- PASSWORDLESS SIGN-IN HANDLER ---
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email)
        email = window.prompt("Please confirm your email to complete sign-in:");

      if (email) {
        setIsLoading(true);
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            window.localStorage.removeItem("emailForSignIn");
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          })
          .catch(() => setError("The sign-in link has expired or is invalid."))
          .finally(() => setIsLoading(false));
      }
    }
  }, []);

  const handleImageUpload = (file: File) => {
    setOriginalImageFile(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setProcessedImageUrl(null);
    setError(null);
  };

  const handleDemoSelect = async (url: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "demo-room.jpg", { type: "image/jpeg" });
      handleImageUpload(file);
    } catch (e) {
      setError("Failed to load demo image.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorSelect = (color: PaintColor) => setSelectedColor(color);

  const handleReset = () => {
    setOriginalImageFile(null);
    setOriginalImageUrl(null);
    setSelectedColor(null);
    setProcessedImageUrl(null);
    setIsLoading(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleVisualize = useCallback(async () => {
    if (!originalImageFile || !selectedColor || isLoading) return;

    setIsLoading(true);
    setProcessedImageUrl(null);
    setError(null);

    try {
      const base64Image = await fileToBase64(originalImageFile);
      const { data, mimeType } = base64Image;

      let resultBase64 = await visualizePaint(data, mimeType, selectedColor);

      if (resultBase64) {
        resultBase64 = resultBase64
          .replace(/\s/g, "")
          .replace(/^data:image\/[a-z]+;base64,/i, "");
        setProcessedImageUrl(`data:image/png;base64,${resultBase64}`);
      } else {
        throw new Error("Received empty image data from AI.");
      }
    } catch (err: any) {
      if (err.message.includes("Insufficient credits")) {
        setIsCreditModalOpen(true);
      } else {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [originalImageFile, selectedColor, isLoading]);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || "");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const CurrentPage = routes[route] || MainContent;

  const mainContentProps: MainContentProps & {
    onDemoSelect: (url: string) => void;
  } = {
    originalImageFile,
    originalImageUrl,
    selectedColor,
    processedImageUrl,
    isLoading,
    error,
    fileInputRef,
    handleImageUpload,
    handleColorSelect,
    handleVisualize,
    onDemoSelect: handleDemoSelect,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col transition-colors duration-300">
      <Header
        onReset={handleReset}
        showReset={route === "" && originalImageUrl !== null}
        credits={userCredits}
      />
      <main className="container mx-auto p-2 md:p-6 flex-grow transition-all duration-300">
        {route === "" ? <MainContent {...mainContentProps} /> : <CurrentPage />}
      </main>
      <Footer />
      <CreditModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
      />
    </div>
  );
};

export default App;
