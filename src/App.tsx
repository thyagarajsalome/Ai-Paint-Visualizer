import React, { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { MainContent, MainContentProps } from "./components/MainContent";
import { AboutPage } from "./pages/About";
import { PolicyPage } from "./pages/Policy";
import { DisclaimerPage } from "./pages/Disclaimer";
import { FaqPage } from "./pages/Faq";
import { TermsPage } from "./pages/Terms";
import type { PaintColor } from "./types";
import { visualizePaint } from "./services/geminiService";
import { fileToBase64 } from "./utils/fileUtils";

const routes: { [key: string]: React.FC } = {
  "": MainContent,
  "#about": AboutPage,
  "#policy": PolicyPage,
  "#disclaimer": DisclaimerPage,
  "#faq": FaqPage,
  "#terms": TermsPage,
};

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || "");

  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<PaintColor | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    setOriginalImageFile(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setProcessedImageUrl(null);
    setError(null);
  };

  const handleColorSelect = (color: PaintColor) => {
    setSelectedColor(color);
  };

  const handleReset = () => {
    setOriginalImageFile(null);
    setOriginalImageUrl(null);
    setSelectedColor(null);
    setProcessedImageUrl(null);
    setIsLoading(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVisualize = useCallback(async () => {
    if (!originalImageFile || !selectedColor) {
      setError("Please upload an image and select a color first.");
      return;
    }

    setIsLoading(true);
    setProcessedImageUrl(null);
    setError(null);

    try {
      const base64Image = await fileToBase64(originalImageFile);
      const { data, mimeType } = base64Image;

      const resultBase64 = await visualizePaint(data, mimeType, selectedColor);

      if (resultBase64) {
        // --- FINAL FIX: Strict Cleanup Order ---

        // 1. FIRST, remove ALL whitespace, newlines, and carriage returns
        //    This ensures the regex in step 2 can actually match the start of the string.
        let cleanString = resultBase64.replace(/\s/g, "");

        // 2. SECOND, remove the data prefix if it exists.
        //    We use case-insensitive flag 'i' just in case.
        cleanString = cleanString.replace(/^data:image\/[a-z]+;base64,/i, "");

        // 3. FINALLY, add the correct prefix.
        setProcessedImageUrl(`data:image/png;base64,${cleanString}`);
      } else {
        throw new Error("Received empty image data from AI.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred during visualization."
      );
    } finally {
      setIsLoading(false);
    }
  }, [originalImageFile, selectedColor]);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || "");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const CurrentPage = routes[route] || MainContent;

  const mainContentProps: MainContentProps = {
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
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col">
      <Header
        onReset={handleReset}
        showReset={route === "" && originalImageUrl !== null}
      />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        {route === "" ? <MainContent {...mainContentProps} /> : <CurrentPage />}
      </main>
      <Footer />
    </div>
  );
};

export default App;
