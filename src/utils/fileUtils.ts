/**
 * Converts a File object to a Base64 string for the Gemini API.
 * This extracts only the raw data portion to avoid decoding errors on the backend.
 */
export const fileToBase64 = (
  file: File
): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;

      // Split the result: [0] is the header (data:image/png;base64), [1] is the raw data
      const splitResult = result.split(",");
      if (splitResult.length === 2) {
        resolve({
          data: splitResult[1], // This is the raw base64 string required by the API
          mimeType: file.type,
        });
      } else {
        reject(new Error("Failed to parse file data format."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Converts a Data URL back to a File object.
 * Useful for downloading or re-processing generated images.
 */
export const dataUrlToFile = async (
  dataUrl: string,
  filename: string
): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};
