const express = require("express");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

// ---------------------------------------------------------
// 1. Initialize Firebase Admin
// ---------------------------------------------------------
let serviceAccount;
let db;

if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    console.log("Successfully parsed Service Account JSON from environment.");
  } catch (err) {
    console.error(
      "CRITICAL: Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:",
      err
    );
    process.exit(1);
  }
} else {
  try {
    serviceAccount = require("./service-account-key.json");
    console.log("Using local service-account-key.json");
  } catch (err) {
    console.warn(
      "service-account-key.json not found. Ensure environment variables are set."
    );
  }
}

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
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

app.get("/health", (req, res) =>
  res.json({ status: "ok", message: "Backend is live!" })
);

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

    if (!doc.exists) {
      await userRef.set({ credits: 2, email: req.user.email || "" });
      doc = await userRef.get();
    }

    if (doc.data().credits < 1)
      return res.status(403).json({ error: "Insufficient credits" });

    let { imageBase64, mimeType, color } = req.body;
    const cleanBase64 = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    // Use Imagen 3 for image editing with image output
    const model = genAI.getGenerativeModel({
      model: "imagen-3.0-generate-001",
    });

    const result = await model.generateContent([
      {
        text: `Edit this room photo. Change only the wall color to ${color.name} (${color.hex}). 
Keep all furniture, floor, ceiling, lighting, and shadows exactly as they are. 
Only recolor the walls to the specified color.`,
      },
      {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      },
    ]);

    const response = await result.response;

    // Log parts to Cloud Run for debugging
    if (response.candidates?.[0]?.content?.parts) {
      console.log(
        "Response Parts types:",
        response.candidates[0].content.parts.map((p) => Object.keys(p))
      );
    }

    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData
    );

    if (!imagePart) {
      console.error(
        "AI Response (No Image Data):",
        JSON.stringify(response, null, 2)
      );
      throw new Error(
        "AI failed to return a visual result. Please try a different photo or color."
      );
    }

    // Success: Deduct credit and send image
    await userRef.update({ credits: admin.firestore.FieldValue.increment(-1) });
    res.json({ image: imagePart.inlineData.data });
  } catch (err) {
    console.error("Visualization Error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server listening on port ${PORT}`);
});
