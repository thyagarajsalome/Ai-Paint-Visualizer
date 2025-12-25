// backend-api/test-models.js
require("dotenv").config();

async function listAllModels() {
  const API_KEY = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    console.log("Checking available models for your API key...");
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    console.log("\n--- MODELS AVAILABLE TO YOUR KEY ---");
    data.models.forEach((m) => {
      // Look for models that support 'generateContent'
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log(`ID: ${m.name.split("/").pop()}`);
        console.log(`   Description: ${m.description}\n`);
      }
    });
    console.log("------------------------------------\n");
    console.log(
      "Look for an ID like 'gemini-1.5-flash-latest' or 'gemini-pro'."
    );
  } catch (error) {
    console.error("Error fetching models:", error.message);
  }
}

listAllModels();
