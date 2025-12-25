const express = require("express");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

// 1. Initialize Firebase Admin
let db;
try {
  if (!admin.apps.length) {
    const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
      : require("./service-account-key.json");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || "wallpaint-1b4e9",
    });
  }
  db = admin.firestore();
} catch (err) {
  console.error("CRITICAL: Firebase initialization failed:", err.message);
}

// 2. Initialize Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

const app = express();
app.use(
  cors({
    origin: [
      "https://wallpaint.in",
      "https://www.wallpaint.in",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json({ limit: "25mb" }));

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "No token" });
  try {
    const token = authHeader.split("Bearer ")[1];
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// 3. Visualization Endpoint (Using Gemini 2.5 Flash Image)
app.post("/api/visualize", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists || (userDoc.data().credits || 0) < 1) {
      return res.status(403).json({ error: "Insufficient credits" });
    }

    let { imageBase64, mimeType, color } = req.body;
    const cleanBase64 = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    // --- MODEL CONFIGURATION FOR IMAGE OUTPUT ---
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image", // Use the Nano Banana model
      generationConfig: {
        responseModalities: ["IMAGE"], // Request an image file back
      },
    });

    const prompt = `Edit this room photo. Change only the wall color to ${color.name} (Hex: ${color.hex}). 
    Keep all furniture, floor, ceiling, and shadows exactly as they are. 
    Only recolor the walls. Return only the edited image.`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: mimeType || "image/jpeg", data: cleanBase64 } },
    ]);

    const response = await result.response;
    // Extract the generated image data from the response parts
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData
    );

    if (!imagePart) throw new Error("AI failed to return an edited image.");

    // Deduct credit after successful generation
    await userRef.update({ credits: admin.firestore.FieldValue.increment(-1) });

    res.json({ image: imagePart.inlineData.data });
  } catch (err) {
    console.error("AI Visualization Error:", err.message);
    res.status(500).json({ error: `AI Service Error: ${err.message}` });
  }
});

// 4. Razorpay Endpoints (create-order and verify)
// ... remains same as your previous working version ...

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server listening on port ${PORT}`)
);
