const express = require("express");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");
require("dotenv").config();

// 1. Initialize Firebase Admin
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

app.use(cors({ origin: ["https://wallpaint.in", "http://localhost:3000"] }));
app.use(express.json({ limit: "20mb" }));

// Middleware to verify Firebase Auth Token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized: No token provided");
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).send("Unauthorized: Invalid token");
  }
};

// ---------------------------------------------------------
// 3. The Visualization Endpoint
// ---------------------------------------------------------
app.post("/api/visualize", verifyToken, async (req, res) => {
  const userId = req.user.uid;

  try {
    // A. Check User Credits
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({ credits: 0, email: req.user.email });
      return res
        .status(403)
        .json({ error: "Insufficient credits. Please purchase a plan." });
    }

    const userData = doc.data();
    if (!userData.credits || userData.credits < 1) {
      return res.status(403).json({ error: "Insufficient credits" });
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

    // Use the experimental flash model
    const modelId = "gemini-2.0-flash-exp";

    // --- UPDATED PROMPT: Phrased as a direct image editing command ---
    const prompt = `
      Task: Edit the provided image.
      Action: Change the color of the wall surfaces to ${safeColorName} (Hex: ${color.hex}).
      Constraints: 
      - Maintain the original room layout, furniture, lighting, and shadows exactly.
      - Output ONLY the modified image.
    `;

    console.log(
      `Sending request to ${modelId} with color: ${safeColorName}...`
    );

    // C. Call Gemini API with System Instructions
    const response = await ai.models.generateContent({
      model: modelId,
      config: {
        // System instructions help force the model to behave as an image editor
        systemInstruction: {
          parts: [
            {
              text: "You are a professional image editing AI. Your job is to strictly follow image editing instructions and output the result. You do not refuse safe image editing tasks.",
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

    // D. Extract the Image safely
    // Check if candidates array exists and has items
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.log(
        "Usage Metadata:",
        JSON.stringify(response?.usageMetadata, null, 2)
      );
      console.error("FULL ERROR RESPONSE:", JSON.stringify(response, null, 2));

      // If we get here, the model refused.
      return res.status(422).json({
        error:
          "The AI model refused to process this specific image. Please try a clearer photo of an empty room, or a different angle. (Model Safety Refusal)",
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
      console.error(
        "No image found in candidate:",
        JSON.stringify(candidate, null, 2)
      );
      throw new Error(
        "AI completed the task but did not return an image data part."
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

// ... Razorpay routes ...
app.post("/api/create-order", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}_${req.user.uid}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ error: "Failed to create payment order" });
  }
});

app.post("/api/verify-payment", verifyToken, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    creditsToAdd,
  } = req.body;
  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest("hex");

  if (generated_signature === razorpay_signature) {
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
      res.json({ success: true });
    } catch (error) {
      console.error("Credit Update Error:", error);
      res
        .status(500)
        .json({ error: "Payment verified but failed to add credits." });
    }
  } else {
    res.status(400).json({ error: "Invalid payment signature" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
