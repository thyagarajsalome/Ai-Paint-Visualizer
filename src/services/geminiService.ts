import { auth } from "../firebase";
import type { PaintColor } from "../types";

/**
 * FIXED: URL SANITATION
 * Constructs the URL dynamically and prevents path doubling.
 * It removes trailing slashes and ensures /api/visualize is only added once.
 */
const getBackendUrl = () => {
  const rawBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // 1. Remove trailing slash
  // 2. Remove /api/visualize if it was accidentally included in the env variable
  const cleanBase = rawBase.replace(/\/$/, "").replace(/\/api\/visualize$/, "");

  return `${cleanBase}/api/visualize`;
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

    // Check for 404 or other non-OK responses
    if (!response.ok) {
      let errorMessage = "Failed to visualize paint.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Fallback if the response is not JSON (like an HTML 404 page)
        errorMessage = `Server Error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.image;
  } catch (error) {
    console.error("Error calling Backend API:", error);
    throw error;
  }
};
