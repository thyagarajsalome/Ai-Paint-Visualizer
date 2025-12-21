const express = require("express");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");
const crypto = require("crypto"); // Added missing crypto requirement
require("dotenv").config();

// 1. Initialize Firebase Admin
const serviceAccount = require("./service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 2. Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Razorpay is currently disabled for testing AI generation.
 * You can enable this later by providing actual environment variables.
 */
/*
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
*/

const app = express();

// Enable CORS for production and local testing
app.use(
  cors({
    origin: [
      "https://wallpaint.in",
      "https://www.wallpaint.in",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));

// Middleware to verify Firebase Auth Token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// ---------------------------------------------------------
// 3. The Visualization Endpoint
// ---------------------------------------------------------
app.post("/api/visualize", verifyToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    // A. Check/Initialize User Credits
    const userRef = db.collection("users").doc(userId);
    let doc = await userRef.get();

    // If user doesn't exist, create them with 5 free credits
    if (!doc.exists) {
      const newUser = { credits: 5, email: req.user.email || "" };
      await userRef.set(newUser);
      doc = await userRef.get(); // Refresh doc to proceed
    }

    const userData = doc.data();
    if (!userData.credits || userData.credits < 1) {
      return res
        .status(403)
        .json({ error: "Insufficient credits. Please purchase a plan." });
    }

    // B. Prepare Data
    const { imageBase64, mimeType, color } = req.body;

    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!color.hex || !hexRegex.test(color.hex)) {
      return res.status(400).json({ error: "Invalid color hex code." });
    }

    const safeColorName = (color.name || "paint")
      .replace(/[^a-zA-Z\s]/g, "")
      .substring(0, 30);

    const modelId = "gemini-2.0-flash-exp";

    const prompt = `
      Generate a photorealistic image of the provided room with the following change:
      Paint the walls with the color ${safeColorName} (approximate Hex: ${color.hex}).
      
      Strictly maintain the original furniture, lighting, shadows, and perspective. 
      The output must be a high-quality image of the room.
    `;

    console.log(
      `Sending request to ${modelId} with color: ${safeColorName}...`
    );

    // C. Call Gemini API with Config
    const response = await ai.models.generateContent({
      model: modelId,
      config: {
        responseModalities: ["IMAGE"],
        systemInstruction: {
          parts: [
            {
              text: "You are an expert interior design AI capable of photorealistic image generation. Your task is to visualize paint changes on walls accurately while preserving the room's original structure and lighting.",
            },
          ],
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
      },
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mimeType, data: imageBase64 } },
          ],
        },
      ],
    });

    console.log("Gemini Response Received.");

    if (!response || !response.candidates || response.candidates.length === 0) {
      return res.status(422).json({
        error:
          "The AI model refused the request. Please try a different photo.",
      });
    }

    const candidate = response.candidates[0];

    if (candidate.finishReason === "SAFETY") {
      throw new Error("AI blocked the request due to Safety filters.");
    }

    let resultImage = null;

    if (candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          resultImage = part.inlineData.data;
          break;
        }
      }
    }

    if (!resultImage) {
      const textResponse =
        candidate.content?.parts?.[0]?.text || "No text content";
      console.error("AI Text Response (Failure Reason):", textResponse);
      throw new Error(
        "AI returned text instead of an image. It might be refusing to edit this specific photo."
      );
    }

    // E. Deduct 1 Credit
    await userRef.update({
      credits: admin.firestore.FieldValue.increment(-1),
    });

    res.json({ image: resultImage });
  } catch (err) {
    console.error("Visualizer Error:", err);
    res.status(500).json({ error: err.message || "Failed to process image." });
  }
});

// ... Razorpay routes (Simulated for testing) ...
app.post("/api/create-order", verifyToken, async (req, res) => {
  // Return dummy order ID for testing frontend flow without actual Razorpay keys
  res.json({
    id: `test_order_${Date.now()}`,
    amount: req.body.amount * 100,
    currency: "INR",
  });
});

app.post("/api/verify-payment", verifyToken, async (req, res) => {
  const { creditsToAdd } = req.body;

  // BYPASSING RAZORPAY SIGNATURE CHECK FOR TESTING AI GENERATION
  try {
    const userRef = db.collection("users").doc(req.user.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({ credits: creditsToAdd, email: req.user.email });
    } else {
      await userRef.update({
        credits: admin.firestore.FieldValue.increment(creditsToAdd),
      });
    }
    res.json({
      success: true,
      message: "Test Mode: Credits added without payment",
    });
  } catch (error) {
    console.error("Credit Update Error:", error);
    res.status(500).json({ error: "Failed to add credits." });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
