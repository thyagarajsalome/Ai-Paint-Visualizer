// src/components/ResultDisplay.tsx
import React from "react";
import { dataUrlToFile } from "../utils/fileUtils";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

interface ResultDisplayProps {
  originalImageUrl: string | null;
  processedImageUrl: string | null;
  isLoading: boolean;
  onDemoSelect?: (demoUrl: string) => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full py-20">
    <div className="w-16 h-16 border-4 border-t-4 border-t-indigo-500 border-gray-200 dark:border-gray-700 dark:border-t-indigo-400 rounded-full animate-spin"></div>
    <p className="mt-6 text-xl text-gray-700 dark:text-gray-200 font-bold">
      AI is painting your walls...
    </p>
    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
      Using Gemini 2.5 Flash to generate realistic textures.
    </p>
  </div>
);

const Placeholder: React.FC<{ onDemoSelect?: (url: string) => void }> = ({
  onDemoSelect,
}) => (
  <div className="w-full flex flex-col items-center">
    <div className="w-full aspect-video flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-center p-8">
      <svg
        className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">
        Your Visualization Appears Here
      </h3>
      <p className="mt-2 text-gray-400 dark:text-gray-500 max-w-sm">
        Upload a photo of your room and pick a color to see the magic happen.
      </p>
    </div>

    <div className="mt-10 w-full">
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center mb-6">
        Or try a demo image
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2].map((num) => (
          <button
            key={num}
            onClick={() => onDemoSelect?.(`/demo-${num}.jpg`)}
            className="group relative aspect-video rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all shadow-md"
          >
            <img
              src={`/demo-${num}.jpg`}
              alt="Demo"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded">
              Sample {num}
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  originalImageUrl,
  processedImageUrl,
  isLoading,
  onDemoSelect,
}) => {
  const handleShare = async () => {
    if (!processedImageUrl) return;
    try {
      const file = await dataUrlToFile(processedImageUrl, "wallpaint-room.png");
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My AI Painted Room",
          text: "Check out how my room looks with this new paint color, visualized with wallpaint!",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (!originalImageUrl && !isLoading) {
    return <Placeholder onDemoSelect={onDemoSelect} />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 min-h-[60vh] flex items-center justify-center">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="w-full flex flex-col items-center gap-6">
          {processedImageUrl ? (
            <BeforeAfterSlider
              before={originalImageUrl!}
              after={processedImageUrl}
            />
          ) : (
            <div className="w-full aspect-video bg-gray-100 dark:bg-gray-900/50 rounded-2xl flex items-center justify-center p-4">
              <img
                src={originalImageUrl!}
                alt="Original Preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              />
            </div>
          )}

          {processedImageUrl && (
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <a
                href={processedImageUrl}
                download="wallpaint-room.png"
                className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Download Result
              </a>
              {navigator.share && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2.5 px-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all active:scale-95"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 100.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share Image
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
