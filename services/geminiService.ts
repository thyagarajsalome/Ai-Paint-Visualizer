import { GoogleGenAI, Modality } from "@google/genai";
import type { PaintColor } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const visualizePaint = async (
  base64ImageData: string,
  mimeType: string,
  color: PaintColor
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash-image';
    const prompt = `Your task is to act as a professional virtual painter. You must repaint all visible interior wall surfaces in this image with the color "${color.name}" (hex code: ${color.hex}).

**Crucial Instructions:**
1.  **Accuracy is paramount:** Be extremely precise with the edges where walls meet ceilings, floors, trim, windows, and doors. Do not let the color "bleed" onto these other surfaces.
2.  **Preserve Realism:** You MUST maintain all original lighting, shadows, highlights, and textures from the original photo. The new paint should look like it's naturally part of the room.
3.  **What NOT to paint:** Do NOT change the color of ceilings, floors, baseboards, crown molding, window frames, door frames, furniture, plants, decor items, light fixtures, or any object that is not a structural wall.
4.  **Comprehensive Coverage:** Apply the paint to all main wall surfaces visible in the image. If there are multiple walls visible, paint them all consistently.
5.  **Handle Obstructions:** Carefully paint around objects on the walls, like picture frames, light switches, or thermostats, without altering them.`;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const firstPart = response?.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && firstPart.inlineData) {
      return firstPart.inlineData.data;
    } else {
      throw new Error("No image data returned from the API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to visualize paint. The AI model may be unable to process this request.");
  }
};
