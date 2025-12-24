import { auth } from "../firebase";
import type { PaintColor } from "../types";

/**
 * FIXED BACKEND_URL CONSTRUCTION
 * This ensures the path is appended correctly regardless of whether
 * VITE_BACKEND_URL contains a trailing slash or just the base domain.
 */
const getBackendUrl = () => {
  const base = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  // Remove any trailing slash and append the specific visualization endpoint
  return `${base.replace(/\/$/, "")}/api/visualize`;
};

export const visualizePaint = async (
  base64ImageData: string,
  mimeType: string,
  color: PaintColor
): Promise<string> => {
  try {
    // 1. Get the current logged-in user
    const user = auth.currentUser;
    if (!user) {
      throw new Error("You must be logged in to use this feature.");
    }

    // 2. Get the secure Access Token (JWT) to send to the backend
    const token = await user.getIdToken();

    // 3. Send the request to your Backend
    const response = await fetch(getBackendUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Pass the token for security
      },
      body: JSON.stringify({
        imageBase64: base64ImageData,
        mimeType: mimeType,
        color: color,
      }),
    });

    // 4. Handle Errors (like insufficient credits)
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        throw new Error(
          errorData.error || "Insufficient credits. Please purchase more."
        );
      }
      throw new Error(errorData.error || "Failed to visualize paint.");
    }

    // 5. Return the image data from the backend
    const data = await response.json();
    return data.image;
  } catch (error) {
    console.error("Error calling Backend API:", error);
    throw error; // Re-throw to be handled by the UI
  }
};
