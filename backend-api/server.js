const express = require("express");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
require("dotenv").config();

// ---------------------------------------------------------
// 1. Initialize Firebase Admin
// ---------------------------------------------------------
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
    console.log("Firebase Admin SDK initialized successfully.");
  }
  db = admin.firestore();
} catch (err) {
  console.error("CRITICAL: Firebase initialization failed:", err.message);
}

// ---------------------------------------------------------
// 2. Initialize Clients
// ---------------------------------------------------------
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

// Improved Auth Middleware to prevent 500 errors if SDK is not ready
const verifyToken = async (req, res, next) => {
  if (!admin.apps.length) {
    return res.status(500).json({ error: "Auth system not initialized" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const token = authHeader.split("Bearer ")[1];
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

app.get("/health", (req, res) => res.json({ status: "ok" }));

// ---------------------------------------------------------
// 3. Visualization Endpoint (Gemini 2.5 Flash Image)
// ---------------------------------------------------------
app.post("/api/visualize", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    // Credit Check
    if (!userDoc.exists || (userDoc.data().credits || 0) < 1) {
      return res.status(403).json({ error: "Insufficient credits" });
    }

    let { imageBase64, mimeType, color } = req.body;
    const cleanBase64 = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    // Keep the requested AI Model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image",
      generationConfig: {
        responseModalities: ["IMAGE"],
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
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData
    );

    if (!imagePart) throw new Error("AI failed to return an edited image.");

    // Deduct credit after success
    await userRef.update({ credits: admin.firestore.FieldValue.increment(-1) });

    res.json({ image: imagePart.inlineData.data });
  } catch (err) {
    console.error("AI Visualization Error:", err.message);
    res.status(500).json({ error: `AI Service Error: ${err.message}` });
  }
});

// ---------------------------------------------------------
// 4. Razorpay Endpoints (FIXES THE 404 ERROR)
// ---------------------------------------------------------

// Step 1: Create Order
app.post("/api/payments/create-order", verifyToken, async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: Math.round(amount * 100), // INR to paise
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

// Step 2: Verify and Add Credits
app.post("/api/payments/verify", verifyToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      creditAmount,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const userRef = db.collection("users").doc(req.user.uid);
      await userRef.update({
        credits: admin.firestore.FieldValue.increment(creditAmount),
      });
      res.json({ status: "ok", message: "Credits updated successfully" });
    } else {
      res.status(400).json({ error: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// ---------------------------------------------------------
// 5. Server Configuration
// ---------------------------------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server listening on port ${PORT}`);
});
