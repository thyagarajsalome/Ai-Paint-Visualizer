const express = require("express");
const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

// ---------------------------------------------------------
// 1. Initialize Firebase Admin (Fixed for Cloud Run)
// ---------------------------------------------------------
let serviceAccount;
let db;

/**
 * Checks if the service account JSON is provided as an environment variable (Production).
 * Otherwise, falls back to the local file (Development).
 */
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    console.log("Successfully parsed Service Account JSON from environment.");
  } catch (err) {
    console.error(
      "CRITICAL: Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON environment variable:",
      err
    );
    process.exit(1);
  }
} else {
  try {
    // Falls back to local file for development
    serviceAccount = require("./service-account-key.json");
    console.log("Using local service-account-key.json");
  } catch (err) {
    console.warn(
      "service-account-key.json not found. Ensure environment variables are set for production."
    );
  }
}

// Ensure Admin is initialized BEFORE creating db reference
if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    console.log("Firestore initialized successfully.");
  } catch (err) {
    console.error("CRITICAL: Firebase initialization failed:", err);
    process.exit(1);
  }
}

// ---------------------------------------------------------
// 2. Initialize AI Clients
// ---------------------------------------------------------
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

const app = express();

// Enable CORS
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

// Health Check (Essential for Cloud Run)
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

    // Default 2 credits for new users
    if (!doc.exists) {
      await userRef.set({ credits: 2, email: req.user.email || "" });
      doc = await userRef.get();
    }

    if (doc.data().credits < 1)
      return res.status(403).json({ error: "Insufficient credits" });

    let { imageBase64, mimeType, color } = req.body;
    const cleanBase64 = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64.replace(/\s/g, "");

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      `Act as an interior design visualizer. Generate a photorealistic image of this room. Paint the walls exactly the color ${color.name} (Hex: ${color.hex}). Strictly preserve the original furniture, lighting, and perspective.`,
      { inlineData: { mimeType: mimeType || "image/jpeg", data: cleanBase64 } },
    ]);

    const response = await result.response;
    const imagePart = response.candidates[0].content.parts.find(
      (p) => p.inlineData
    );

    if (!imagePart) {
      throw new Error("AI failed to return an image.");
    }

    // Deduct credit only on AI success
    await userRef.update({ credits: admin.firestore.FieldValue.increment(-1) });

    res.json({ image: imagePart.inlineData.data });
  } catch (err) {
    console.error("Visualization Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// 4. Server Start (FIXED for Cloud Run)
// ---------------------------------------------------------
const PORT = process.env.PORT || 8080;

// MUST use '0.0.0.0' for Cloud Run
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server listening on port ${PORT}`);
});
