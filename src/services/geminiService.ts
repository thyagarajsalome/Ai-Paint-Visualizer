import { auth } from "../firebase";
import type { PaintColor } from "../types";

// Construct the URL dynamically to avoid path doubling
const getBackendUrl = () => {
  const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  return `${base.replace(/\/$/, "")}/api/visualize`;
};

export const visualizePaint = async (
  base64ImageData: string,
  mimeType: string,
  color: PaintColor
): Promise<string> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be logged in to use this feature.");

    const token = await user.getIdToken();

    const response = await fetch(getBackendUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imageBase64: base64ImageData,
        mimeType: mimeType,
        color: color,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to visualize paint.");
    }

    const data = await response.json();
    return data.image;
  } catch (error) {
    console.error("Error calling Backend API:", error);
    throw error;
  }
};
