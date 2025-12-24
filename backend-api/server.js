const express = require("express");
const admin = require("firebase-admin");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");
const Razorpay = require("razorpay"); // Added Razorpay
const crypto = require("crypto"); // Built-in node module for signature verification
require("dotenv").config();

// 1. Initialize Firebase Admin
const serviceAccount = require("./service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 2. Initialize Razorpay (Test Mode)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 3. Initialize the GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

// Health Check
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
// 4. Payment Endpoints
// ---------------------------------------------------------

// A. Create a Razorpay Order
app.post("/api/payments/create-order", verifyToken, async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise/cents)
      currency: currency || "INR",
      receipt: `receipt_${req.user.uid.substring(0, 10)}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// B. Verify Signature and Add Credits
app.post("/api/payments/verify", verifyToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      creditAmount,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    // Verify signature using crypto
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment is authentic, update user credits
      const userRef = db.collection("users").doc(req.user.uid);

      await userRef.update({
        credits: admin.firestore.FieldValue.increment(creditAmount),
        lastPurchase: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({
        status: "ok",
        message: "Payment verified and credits added.",
      });
    } else {
      res.status(400).json({ error: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------
// 5. The Visualization Endpoint
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
      : imageBase64.replace(/\s/g, "");

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
                data: cleanBase64,
              },
            },
          ],
        },
      ],
    });

    const candidate = response.candidates[0];
    const imagePart = candidate.content.parts.find((p) => p.inlineData);

    if (!imagePart) {
      const textReason = candidate.content.parts.find((p) => p.text);
      throw new Error(textReason?.text || "AI failed to return an image.");
    }

    // Deduct credit only on AI success
    await userRef.update({
      credits: admin.firestore.FieldValue.increment(-1),
    });

    res.json({ image: imagePart.inlineData.data });
  } catch (err) {
    console.error("Visualization Error:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`Backend live on port ${PORT}`));
