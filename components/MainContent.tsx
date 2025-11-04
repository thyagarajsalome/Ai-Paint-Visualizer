import React from "react";
import { ImageUploader } from "./ImageUploader";
import { ColorPalette } from "./ColorPalette";
import { ResultDisplay } from "./ResultDisplay";
import { VisualizeButton } from "./VisualizeButton";
import type { PaintColor } from "../types";

// Define the props interface
export interface MainContentProps {
  originalImageFile: File | null;
  originalImageUrl: string | null;
  selectedColor: PaintColor | null;
  processedImageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (file: File) => void;
  handleColorSelect: (color: PaintColor) => void;
  handleVisualize: () => void;
}

export const MainContent: React.FC<MainContentProps> = ({
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
}) => {
  // All state and logic is now received as props

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-fit sticky top-24">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-3">
            Controls
          </h2>
          <div className="space-y-6">
            <ImageUploader
              onImageUpload={handleImageUpload}
              previewUrl={originalImageUrl}
              ref={fileInputRef}
            />
            <ColorPalette
              selectedColor={selectedColor}
              onColorSelect={handleColorSelect}
            />
            <VisualizeButton
              onClick={handleVisualize}
              isDisabled={!originalImageFile || !selectedColor || isLoading}
            />
          </div>
        </div>
        <div className="lg:col-span-8">
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4"
              role="alert"
            >
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
