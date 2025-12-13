// backend-api/server.js
const express = require("express");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");
require("dotenv").config();

// 1. Initialize Firebase Admin (to talk to Firestore)
// You will need to download a service account key from Firebase Console
const serviceAccount = require("./service-account-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// 2. Initialize Gemini & Razorpay
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const app = express();
app.use(cors({ origin: "https://wallpaint.in" })); // Secure this later
app.use(express.json({ limit: "10mb" }));

// Middleware to check if user is logged in
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send("Nt authorized");
  }
};

// 3. The Visualization Endpoint (Replaces your frontend service)
app.post("/api/visualize", verifyToken, async (req, res) => {
  const userId = req.user.uid;

  // A. Check Credits
  const userRef = db.collection("users").doc(userId);
  const doc = await userRef.get();

  if (!doc.exists || doc.data().credits < 1) {
    return res.status(403).json({ error: "Insufficient credits" });
  }

  try {
    // B. Call Gemini (Logic moved from your frontend)
    const { imageBase64, mimeType, color } = req.body;
    const model = "gemini-2.5-flash-image";
    const prompt = `... your prompt here ...`;

    // ... Call Gemini API here ...
    // const resultImage = ...

    // C. Deduct Credit
    await userRef.update({
      credits: admin.firestore.FieldValue.increment(-1),
    });

    res.json({ image: resultImage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Razorpay - Create Order
app.post("/api/create-order", verifyToken, async (req, res) => {
  const { amount } = req.body; // e.g., 500 for 500 INR
  const options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };
  const order = await razorpay.orders.create(options);
  res.json(order);
});

// 5. Razorpay - Verify Payment & Add Credits
app.post("/api/verify-payment", verifyToken, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    creditsToAdd,
  } = req.body;

  // ... Verify signature logic using crypto ...
  // If valid:

  await db
    .collection("users")
    .doc(req.user.uid)
    .update({
      credits: admin.firestore.FieldValue.increment(creditsToAdd),
    });

  res.json({ success: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
