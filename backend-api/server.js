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
// Note: Ensure your GEMINI_API_KEY has access to the experimental models
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
      await userRef.set({ credits: 5, email: req.user.email });
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

    // Use the experimental flash model which supports native image generation
    const modelId = "gemini-2.0-flash-exp";

    // --- UPDATED PROMPT ---
    // Gemini 2.0 responds better to "Generate" instructions for image output
    const prompt = `
      Generate a photorealistic image of the provided room with the following change:
      Paint the walls with the color ${safeColorName} (approximate Hex: ${color.hex}).
      
      Strictly maintain the original furniture, lighting, shadows, and perspective. 
      The output must be a high-quality image of the room.
    `;

    console.log(
      `Sending request to ${modelId} with color: ${safeColorName}...`
    );

    // C. Call Gemini API with Config
    const response = await ai.models.generateContent({
      model: modelId,
      config: {
        // IMPORTANT: Force the model to consider IMAGE output
        responseModalities: ["IMAGE"],
        systemInstruction: {
          parts: [
            {
              text: "You are an expert interior design AI capable of photorealistic image generation. Your task is to visualize paint changes on walls accurately while preserving the room's original structure and lighting.",
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
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error("FULL ERROR RESPONSE:", JSON.stringify(response, null, 2));
      return res.status(422).json({
        error:
          "The AI model refused the request. Please try a different photo.",
      });
    }

    const candidate = response.candidates[0];

    if (candidate.finishReason === "SAFETY") {
      throw new Error("AI blocked the request due to Safety filters.");
    }

    let resultImage = null;

    // Check parts for the image
    if (candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          resultImage = part.inlineData.data;
          break;
        }
      }
    }

    if (!resultImage) {
      // LOGGING: If no image, print what the AI *did* say (usually text refusal)
      const textResponse =
        candidate.content?.parts?.[0]?.text || "No text content";
      console.error("AI Text Response (Failure Reason):", textResponse);

      throw new Error(
        "AI completed the task but returned text instead of an image. " +
          "It might be refusing to edit this specific photo."
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
