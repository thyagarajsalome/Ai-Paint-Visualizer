export const fileToBase64 = (
  file: File
): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
      if (data && mimeType) {
        resolve({ data, mimeType });
      } else {
        reject(new Error("Failed to parse file data."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const dataUrlToFile = async (
  dataUrl: string,
  filename: string
): Promise<File> => {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};
