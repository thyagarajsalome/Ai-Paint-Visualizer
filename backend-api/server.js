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
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase initialized via Environment Variable.");
  } else {
    try {
      const serviceAccount = require("./service-account-key.json");
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase initialized via local service-account-key.json.");
    } catch (e) {
      admin.initializeApp();
      console.log("Firebase initialized via Application Default Credentials.");
    }
  }
  db = admin.firestore();
} catch (err) {
  console.error("CRITICAL: Firebase initialization failed:", err.message);
}

// ---------------------------------------------------------
// 2. Initialize Clients (AI & Razorpay)
// ---------------------------------------------------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// For Test Mode, ensure your .env contains your rzp_test_... keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
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

app.get("/health", (req, res) =>
  res.json({ status: "ok", message: "Backend is live!" })
);

// ---------------------------------------------------------
// 3. Visualization Endpoint
// ---------------------------------------------------------
app.post("/api/visualize", verifyToken, async (req, res) => {
  try {
    if (!db) throw new Error("Database connection is not available.");

    const userId = req.user.uid;
    const userRef = db.collection("users").doc(userId);
    let userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({ credits: 2, email: req.user.email || "" });
      userDoc = await userRef.get();
    }

    if (userDoc.data().credits < 1) {
      return res.status(403).json({ error: "Insufficient credits" });
    }

    let { imageBase64, mimeType, color } = req.body;
    const cleanBase64 = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
      generationConfig: { responseModalities: ["IMAGE"] },
    });

    const result = await model.generateContent([
      {
        text: `Edit this room photo. Change only the wall color to ${color.name} (${color.hex}). 
        Keep all furniture, floor, ceiling, lighting, and shadows exactly as they are. 
        Only recolor the walls. Return only the edited image.`,
      },
      { inlineData: { mimeType: mimeType || "image/jpeg", data: cleanBase64 } },
    ]);

    const response = await result.response;
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData
    );

    if (!imagePart) throw new Error("AI failed to return an image result.");

    await userRef.update({ credits: admin.firestore.FieldValue.increment(-1) });
    res.json({ image: imagePart.inlineData.data });
  } catch (err) {
    console.error("Visualization Error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// ---------------------------------------------------------
// 4. Razorpay Payment Endpoints
// ---------------------------------------------------------

// Step 1: Create an Order
app.post("/api/payments/create-order", verifyToken, async (req, res) => {
  try {
    const { amount, currency } = req.body; // Amount should be in INR (not paise) from frontend

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
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

// Step 2: Verify Payment and Add Credits
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
      // Payment is valid, add credits to user profile
      const userRef = db.collection("users").doc(req.user.uid);
      await userRef.update({
        credits: admin.firestore.FieldValue.increment(creditAmount),
        lastPaymentId: razorpay_payment_id,
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server listening on port ${PORT}`);
});
