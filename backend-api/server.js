const express = require("express");
const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai"); // New unified SDK
const cors = require("cors");
require("dotenv").config();

// 1. Initialize Firebase Admin
// CRITICAL: Ensure this file is IN your backend-api folder during deployment
const serviceAccount = require("./service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 2. Initialize the GoogleGenAI client
// Uses the unified SDK structure
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();

// Enable CORS for your production domains and local testing
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

// High limit required for base64 image data
app.use(express.json({ limit: "20mb" }));

// Health Check to verify connectivity
app.get("/health", (req, res) =>
  res.json({ status: "ok", message: "Backend is live!" })
);

// Middleware to verify Firebase Auth Token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "No token provided" });
  try {
    const token = authHeader.split("Bearer ")[1];
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ---------------------------------------------------------
// 3. The Visualization Endpoint
// ---------------------------------------------------------
app.post("/api/visualize", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRef = db.collection("users").doc(userId);
    let doc = await userRef.get();

    // Initialize new users with free credits
    if (!doc.exists) {
      await userRef.set({ credits: 50, email: req.user.email || "" });
      doc = await userRef.get();
    }

    if (doc.data().credits < 1)
      return res.status(403).json({ error: "Insufficient credits" });

    let { imageBase64, mimeType, color } = req.body;

    // --- FIX: Clean the Base64 string ---
    // Extract only the raw data portion if a Data URL header is present
    const cleanBase64 = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64.replace(/\s/g, "");

    // 4. Call Gemini 2.5 Flash Image Model
    // This model supports native IMAGE output modalities
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      config: {
        responseModalities: ["IMAGE"],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Act as an interior design visualizer. Generate a photorealistic image of this room. Paint the walls exactly the color ${color.name} (Hex: ${color.hex}). Strictly preserve the original furniture, lighting, and perspective.`,
            },
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: cleanBase64, // Use the cleaned variable
              },
            },
          ],
        },
      ],
    });

    // 5. Extract the generated image from the response parts
    const candidate = response.candidates[0];
    const imagePart = candidate.content.parts.find((p) => p.inlineData);

    if (!imagePart) {
      const textReason = candidate.content.parts.find((p) => p.text);
      throw new Error(textReason?.text || "AI failed to return an image.");
    }

    // Deduct 1 Credit on success
    await userRef.update({
      credits: admin.firestore.FieldValue.increment(-1),
    });

    res.json({ image: imagePart.inlineData.data });
  } catch (err) {
    console.error("Visualization Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// CRITICAL: Bind to 0.0.0.0 for Cloud Run compatibility
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`Backend live on port ${PORT}`));
