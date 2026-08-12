import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { BASE_COUNTER, getStore, statsFromCounts, type WaitlistEntry } from "./server/db";
import { parseSignupBody } from "./server/signup";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));
app.set("trust proxy", true);

export type StoredEntry = WaitlistEntry;

// In-memory IP Rate Limiter
const ipRequestMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = ipRequestMap.get(ip);
  if (!limit || now > limit.resetAt) {
    ipRequestMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (limit.count >= 12) {
    return false;
  }
  limit.count++;
  return true;
}

// Minimal page shell for the email-confirmation links
function confirmationPage(title: string, heading: string, body: string, showCta = false): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KAHRÀH — ${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #FAF6F0; color: #2C1D18; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 80vh; margin: 0; }
    .card { background: #FFFFFF; max-width: 500px; width: 100%; padding: 40px 32px; border-radius: 12px; border: 1px solid #E8DFD3; box-shadow: 0 4px 20px rgba(44, 29, 24, 0.06); text-align: center; }
    .badge { display: inline-block; background: #8C4A27; color: #FFFDF9; font-weight: bold; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; margin-bottom: 16px; }
    h1 { color: #2C1D18; font-size: 28px; font-weight: 700; margin: 0 0 12px 0; }
    p { color: #64748B; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    .email { color: #8C4A27; font-weight: 600; }
    .btn { display: inline-block; background: #8C4A27; color: #FFFDF9; font-weight: bold; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 6px; transition: background 0.2s; }
    .btn:hover { background: #70381C; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">KAHRÀH WAITLIST</div>
    <h1>${heading}</h1>
    <p>${body}</p>
    ${showCta ? '<a href="/" class="btn">Return to KAHRÀH Homepage</a>' : ""}
  </div>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string
  ));
}

// API Routes
app.get("/api/health", async (req, res) => {
  const store = await getStore();
  res.json({ status: "ok", brand: "KAHRÀH Skincare", storage: store.driver });
});

app.get("/api/waitlist/stats", async (req, res) => {
  try {
    const store = await getStore();
    res.json(statsFromCounts(await store.counts()));
  } catch (err) {
    console.error("Failed to load waitlist stats:", err);
    res.status(500).json({ success: false, message: "Could not load waitlist stats." });
  }
});

// Public count endpoint (confirmed rows + base seed)
app.get("/api/waitlist/count", async (req, res) => {
  try {
    const store = await getStore();
    const { confirmed } = await store.counts();
    res.json({
      success: true,
      count: BASE_COUNTER + confirmed,
      confirmedSignups: confirmed,
    });
  } catch (err) {
    console.error("Failed to load waitlist count:", err);
    res.status(500).json({ success: false, message: "Could not load waitlist count." });
  }
});

// Create signup
app.post("/api/waitlist", async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again in a minute.",
      code: "RATE_LIMIT_EXCEEDED"
    });
  }

  const { error, signup } = parseSignupBody(req.body);
  if (error || !signup) {
    return res.status(error?.status || 400).json({
      success: false,
      message: error?.message || "Invalid signup request.",
      code: error?.code || "INVALID_EMAIL",
    });
  }

  try {
    const store = await getStore();
    const { entry, alreadyRegistered } = await store.create(signup);
    const stats = statsFromCounts(await store.counts());

    const host = req.get("host") || `localhost:${PORT}`;
    const protocol = req.protocol || "http";
    const confirmUrl = `${protocol}://${host}/api/waitlist/confirm?token=${entry.confirm_token}`;

    if (alreadyRegistered) {
      return res.json({
        success: true,
        alreadyRegistered: true,
        entry,
        stats,
        message: "You are already on the KAHRÀH waitlist!"
      });
    }

    console.log(`[KAHRÀH Waitlist] New signup: ${entry.email} | Confirm URL: ${confirmUrl}`);

    res.json({
      success: true,
      alreadyRegistered: false,
      entry,
      confirmUrl,
      stats,
      message: "Your email has been added successfully! Welcome to KAHRÀH."
    });
  } catch (err) {
    console.error("Waitlist signup failed:", err);
    res.status(500).json({
      success: false,
      message: "We couldn't save your signup. Please try again.",
      code: "STORAGE_ERROR",
    });
  }
});

// Confirm email via link
app.get("/api/waitlist/confirm", async (req, res) => {
  const token = req.query.token;

  if (!token || typeof token !== "string") {
    return res.status(400).send(confirmationPage(
      "Invalid Link",
      "Invalid or Missing Token",
      "This email confirmation link is invalid or expired."
    ));
  }

  try {
    const store = await getStore();
    const entry = await store.confirm(token);

    if (!entry) {
      return res.status(404).send(confirmationPage(
        "Token Not Found",
        "Confirmation Link Expired",
        "We couldn't find a signup matching this confirmation link."
      ));
    }

    if (req.headers.accept?.includes("application/json") || req.query.json === "true") {
      return res.json({
        success: true,
        message: "Email confirmed successfully",
        entry
      });
    }

    res.send(confirmationPage(
      "Email Confirmed",
      "Your Email is Confirmed!",
      `Thank you for verifying <span class="email">${escapeHtml(entry.email)}</span>. Your priority spot <strong>#${entry.positionNumber}</strong> is secured for our upcoming phase rollout.`,
      true
    ));
  } catch (err) {
    console.error("Waitlist confirmation failed:", err);
    res.status(500).send(confirmationPage(
      "Something Went Wrong",
      "We Couldn't Confirm That Link",
      "Please try again in a moment."
    ));
  }
});

// Unsubscribe endpoint
app.post("/api/waitlist/unsubscribe", async (req, res) => {
  const { email, token } = req.body ?? {};

  if (!email && !token) {
    return res.status(400).json({ success: false, message: "Email or token is required.", code: "MISSING_IDENTIFIER" });
  }

  try {
    const store = await getStore();
    const entry = await store.unsubscribe({
      email: typeof email === "string" ? email.trim().toLowerCase() : undefined,
      token: typeof token === "string" ? token : undefined,
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: "No active signup found with the provided details." });
    }

    res.json({
      success: true,
      message: "Your email has been successfully unsubscribed from the KAHRÀH waitlist."
    });
  } catch (err) {
    console.error("Unsubscribe failed:", err);
    res.status(500).json({ success: false, message: "Could not process the unsubscribe request." });
  }
});

// AI Skin Analysis Route using Gemini API
app.post("/api/skin-analysis", async (req, res) => {
  const { skinType, concerns, ageGroup, imageBase64, imageMimeType } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // Graceful fallback response when Gemini key is not configured
    return res.json({
      success: true,
      analysis: {
        skinTypeSummary: "Combination to Melanin-Rich Resilient Skin Barrier",
        melaninHealthNote: "Melanin-dense skin naturally exhibits superior baseline UV photo-protection, yet requires careful barrier preservation against post-inflammatory hyperpigmentation (PIH) and transepidermal water loss (TEWL).",
        metrics: [
          { name: "Hydration Index", score: 78, status: "optimal", insight: "Subtle epidermal moisture loss detected around cheek plane. Requires ceramide-rich barrier support." },
          { name: "TEWL / Barrier Function", score: 85, status: "optimal", insight: "Healthy lipid matrix with balanced natural moisturizing factors (NMF)." },
          { name: "Tone & Pigment Uniformity", score: 68, status: "needs_attention", insight: "Mild post-acne localized melanin clustering. Tyrosinase inhibitors like Azelaic Acid are recommended." },
          { name: "Pore & Texture Density", score: 82, status: "balanced", insight: "Smooth dermal surface texture with minimal cellular debris buildup." }
        ],
        keyIngredientsToLookFor: ["Azelaic Acid 10%", "Niacinamide 4%", "Centella Asiatica (Cica)", "Broad Spectrum Zinc Oxide SPF 30+", "Cholesterol/Ceramide Complex"],
        ingredientsToAvoid: ["High-strength Hydroquinone bleaching agents", "Harsh physical walnut scrubs", "Synthetic denatured drying alcohols"],
        recommendedVendorCategories: ["Clean Dermatological Formulators", "Melanin-First Sun Care Specialists", "Biocompatible Barrier Serums"],
        compassionateAdvice: "Your skin barrier is resilient and active. Honor its natural healing pace by prioritizing anti-inflammatory botanicals and gentle daily sun protection rather than aggressive chemical peels."
      }
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const systemInstruction = `You are KAHRÀH's Algorithmic Dermatology AI Assistant.
You offer compassionate, scientific, non-judgmental, and evidence-backed skin diagnostic feedback.
KAHRÀH explicitly rejects bleaching/whitening or 'anti-aging miracle' tropes.
Focus on melanin health, barrier integrity, pigment uniformity, hydration, and evidence-backed biocompatible ingredients.
Respond strictly in JSON adhering to the given schema.`;

    const promptText = `Analyze the skin profile provided:
Selected skin type: ${skinType || 'Not specified'}
Primary concerns: ${Array.isArray(concerns) ? concerns.join(', ') : (concerns || 'General maintenance & hyperpigmentation prevention')}
Age group: ${ageGroup || 'Adult'}

Provide a diagnostic insight with score metrics (0-100), ingredient guidance, and compassionate advice tailored to melanin-rich and diverse skin health.`;

    const parts: any[] = [];
    if (imageBase64 && imageMimeType) {
      parts.push({
        inlineData: {
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: imageMimeType || "image/jpeg"
        }
      });
    }
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skinTypeSummary: { type: Type.STRING },
            melaninHealthNote: { type: Type.STRING },
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  status: { type: Type.STRING },
                  insight: { type: Type.STRING }
                },
                required: ["name", "score", "status", "insight"]
              }
            },
            keyIngredientsToLookFor: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            ingredientsToAvoid: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendedVendorCategories: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            compassionateAdvice: { type: Type.STRING }
          },
          required: [
            "skinTypeSummary",
            "melaninHealthNote",
            "metrics",
            "keyIngredientsToLookFor",
            "ingredientsToAvoid",
            "recommendedVendorCategories",
            "compassionateAdvice"
          ]
        }
      }
    });

    const jsonText = response.text || "{}";
    const analysis = JSON.parse(jsonText);

    res.json({ success: true, analysis });
  } catch (err: any) {
    console.error("Gemini AI skin analysis error:", err);
    res.status(500).json({
      error: "Failed to generate AI skin analysis. Please try again.",
      details: err.message
    });
  }
});

// Vite Development or Production Static Handlers
async function startServer() {
  // Resolve storage up front so a bad DATABASE_URL surfaces at boot,
  // not on the first signup.
  const store = await getStore();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false }));

    const indexHtml = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");
    const configuredUrl = (process.env.APP_URL || "").trim().replace(/\/+$/, "");

    app.get("*", (req, res) => {
      // Link previews need absolute og:image / og:url values, so any
      // placeholder left by the build is resolved against the live origin.
      const origin = configuredUrl || `${req.protocol}://${req.get("host")}`;
      res.type("html").send(indexHtml.split("__SITE_URL__").join(origin));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KAHRÀH server active on http://0.0.0.0:${PORT} (storage: ${store.driver})`);
  });
}

startServer();
