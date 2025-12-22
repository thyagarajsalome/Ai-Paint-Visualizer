const express = require("express");
const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");
require("dotenv").config();

// CRITICAL: Ensure this file is IN your backend-api folder during deployment
const serviceAccount = require("./service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
const app = express();

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

// 1. Health Check - Visit this in your browser to test: https://your-url.a.run.app/health
app.get("/health", (req, res) =>
  res.json({ status: "ok", message: "Backend is live!" })
);

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

app.post("/api/visualize", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRef = db.collection("users").doc(userId);
    let doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({ credits: 5, email: req.user.email || "" });
      doc = await userRef.get();
    }

    if (doc.data().credits < 1)
      return res.status(403).json({ error: "No credits" });

    const { imageBase64, mimeType, color } = req.body;
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: { responseModalities: ["IMAGE"] },
    });

    const prompt = `Generate a photorealistic image of this room. Paint the walls ${color.name} (Hex: ${color.hex}). Keep everything else identical.`;
    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data: imageBase64 } },
    ]);
    const response = await result.response;
    const imagePart = response.candidates[0].content.parts.find(
      (p) => p.inlineData
    );

    if (!imagePart) throw new Error("AI failed to return an image.");

    await userRef.update({ credits: admin.firestore.FieldValue.increment(-1) });
    res.json({ image: imagePart.inlineData.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
// CRITICAL: Bind to 0.0.0.0
app.listen(PORT, "0.0.0.0", () =>
  console.log(`US Backend live on port ${PORT}`)
);
