import React, { useState, useCallback, useRef } from 'react';
import { Header } from './Header'; // We'll render a contextual header inside
import { ImageUploader } from './ImageUploader';
import { ColorPalette } from './ColorPalette';
import { ResultDisplay } from './ResultDisplay';
import { VisualizeButton } from './VisualizeButton';
import type { PaintColor } from '../types';
import { visualizePaint } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';

export const MainContent: React.FC = () => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<PaintColor | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
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
    if(fileInputRef.current) {
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
      setProcessedImageUrl(`data:image/png;base64,${resultBase64}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during visualization.");
    } finally {
      setIsLoading(false);
    }
  }, [originalImageFile, selectedColor]);
  
  // Re-add the header inside the main content to show the reset button contextually
  // App.tsx renders the main header without the button
  // We can pass the reset logic to the header shown here
  // This is a bit of a workaround to keep App.tsx clean. A better way would be context or state management.
  // For now, we modify the main Header component to accept showReset prop and control it from App.tsx
  // Let's go back and adjust App.tsx and Header.tsx for that.
  // ... After re-thinking, it's better to just pass the reset handler down from App.tsx and control visibility there.
  // The current structure where App.tsx is the router is cleaner.
  // The logic below is what was in App.tsx originally.

  return (
    <>
    {/* The Header is now rendered in App.tsx. This component just contains the visualizer UI. */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-fit sticky top-24">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-3">Controls</h2>
        <div className="space-y-6">
          <ImageUploader 
            onImageUpload={handleImageUpload} 
            previewUrl={originalImageUrl} 
            ref={fileInputRef}
          />
          <ColorPalette selectedColor={selectedColor} onColorSelect={handleColorSelect} />
           <VisualizeButton 
                onClick={handleVisualize} 
                isDisabled={!originalImageFile || !selectedColor || isLoading} 
            />
        </div>
      </div>
      <div className="lg:col-span-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <ResultDisplay
          originalImageUrl={originalImageUrl}
          processedImageUrl={processedImageUrl}
          isLoading={isLoading}
        />
      </div>
    </div>
    </>
  );
};