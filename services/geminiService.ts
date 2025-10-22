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
    const prompt = `You are an expert virtual interior painter. Your task is to digitally repaint ONLY the main wall surfaces in the provided room photo.

Color to apply:
- Name: "${color.name}"
- Hex Code: ${color.hex}

**CRITICAL RULES:**

1.  **SELECT WALLS ONLY:** First, mentally identify and select all primary structural walls.
2.  **DO NOT PAINT:** You must NOT change the color of ceilings, floors, baseboards, crown molding, window frames, door frames, doors, furniture, plants, artwork, light fixtures, outlets, switches, or any other non-wall objects.
3.  **MAINTAIN REALISM:** The final image MUST look photorealistic. You must preserve all original lighting, shadows, highlights, gradients, and textures from the original image. The new paint should look natural in the environment.
4.  **PRECISION IS KEY:** Be extremely precise with the edges where walls meet other surfaces. Do not let the paint bleed or overlap onto ceilings, trim, or floors.
5.  **FULL COVERAGE:** Apply the color evenly and consistently across all visible wall surfaces you have identified.

Execute this task with the highest level of precision and realism. The output should be only the modified image.`;

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
