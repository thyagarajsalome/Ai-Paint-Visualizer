import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ColorPalette } from './components/ColorPalette';
import { ResultDisplay } from './components/ResultDisplay';
import { VisualizeButton } from './components/VisualizeButton';
import type { PaintColor } from './types';
import { visualizePaint } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';

const App: React.FC = () => {
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
    // Reset the file input value
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header onReset={handleReset} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-3">Controls</h2>
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
      </main>
      <footer className="text-center p-4 mt-8 text-gray-500 text-sm">
        <p>Powered by Gemini. Built with React & Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;