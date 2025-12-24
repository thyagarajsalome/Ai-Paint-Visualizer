// backend-api/test-models.js
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function listModels() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    console.log(
      "Fetching available models with key:",
      process.env.GEMINI_API_KEY.substring(0, 10) + "..."
    );
    const response = await ai.models.list();

    console.log("\n--- MODELS YOU CAN USE ---");

    // The new SDK uses an async iterator for lists
    for await (const model of response) {
      // Check if the model supports content generation (text/image)
      if (
        model.supportedGenerationMethods &&
        model.supportedGenerationMethods.includes("generateContent")
      ) {
        console.log(`ID: ${model.name.replace("models/", "")}`);
        console.log(`    Display: ${model.displayName}`);
      }
    }
    console.log("--------------------------\n");
  } catch (error) {
    console.error("Error fetching models:", error.message);
    console.error("Full Error:", JSON.stringify(error, null, 2));
  }
}

listModels();
