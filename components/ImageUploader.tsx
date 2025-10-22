import React, { useRef, useCallback, forwardRef } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  previewUrl: string | null;
}

export const ImageUploader = forwardRef<HTMLInputElement, ImageUploaderProps>(({ onImageUpload, previewUrl }, ref) => {
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleButtonClick = () => {
    if (typeof ref === 'object' && ref?.current) {
        ref.current.click();
    }
  };
  
  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       onImageUpload(file);
    }
  }, [onImageUpload]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-600">1. Upload a Photo</h3>
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
        onClick={handleButtonClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <input
          type="file"
          ref={ref}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <p className="mt-2 text-sm text-gray-500">
            <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
        </div>
      </div>
      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Image Preview:</p>
          <img src={previewUrl} alt="Preview" className="w-full rounded-lg shadow-sm" />
        </div>
      )}
    </div>
  );
});