import React from 'react';
import { dataUrlToFile } from '../utils/fileUtils';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface ResultDisplayProps {
  originalImageUrl: string | null;
  processedImageUrl: string | null;
  isLoading: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-t-4 border-t-indigo-500 border-gray-200 dark:border-gray-700 dark:border-t-indigo-400 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300 font-semibold">AI is painting your walls...</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This can take a moment.</p>
    </div>
);

const Placeholder: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-center p-8">
      <svg className="w-20 h-20 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
      <h3 className="mt-4 text-xl font-semibold text-gray-500 dark:text-gray-400">Your Visualization Appears Here</h3>
      <p className="mt-2 text-gray-400 dark:text-gray-500">Upload an image and select a color to get started.</p>
  </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImageUrl, processedImageUrl, isLoading }) => {
  const handleDownload = () => {
    if (!processedImageUrl) return;
    const link = document.createElement('a');
    link.href = processedImageUrl;
    link.download = 'wallpaint-room.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!processedImageUrl) return;

    try {
      const file = await dataUrlToFile(processedImageUrl, 'wallpaint-room.png');
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My AI Painted Room',
          text: 'Check out how my room looks with this new paint color, visualized with wallpaint!',
        });
      } else {
        alert('Web Share API is not supported in your browser, or it cannot share files.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('An error occurred while trying to share the image.');
    }
  };


  if (!originalImageUrl) {
    return <Placeholder />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 min-h-[60vh] flex items-center justify-center">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="w-full flex flex-col items-center gap-6">
            {processedImageUrl ? (
            <BeforeAfterSlider before={originalImageUrl} after={processedImageUrl} />
            ) : (
                <div className="w-full aspect-video bg-gray-100 dark:bg-gray-900/50 rounded-2xl flex items-center justify-center p-4">
                    <img src={originalImageUrl} alt="Original Preview" className="max-w-full max-h-full object-contain rounded-lg" />
                </div>
            )}

            {processedImageUrl && (
            <div className="flex items-center justify-center gap-4 mt-2">
                <button onClick={handleDownload} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download
                </button>
                {navigator.share && (
                    <button onClick={handleShare} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        Share
                    </button>
                )}
            </div>
            )}
        </div>
      )}
    </div>
  );
};