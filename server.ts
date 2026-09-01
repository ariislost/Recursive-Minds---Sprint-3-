import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Fallback Rule-Based Navigation Intelligence
function generateFallbackResponse(
  message: string,
  currentTab: string,
  itemsCount: number,
  subsCount: number
) {
  const lower = message.toLowerCase();

  if (
    lower.includes("scan") || 
    lower.includes("camera") || 
    lower.includes("upload") || 
    lower.includes("receipt") || 
    lower.includes("ocr") ||
    lower.includes("snap") ||
    lower.includes("bill")
  ) {
    return {
      text: "I can take you directly to the **Snap Camera HUD**! You can snap or upload any paper or digital receipt to automatically extract the purchase date, store name, and warranty duration with OCR.",
      suggestedTab: "upload",
      actionLabel: "Open Snap Camera HUD",
    };
  }

  if (
    lower.includes("subscription") || 
    lower.includes("burn") || 
    lower.includes("monthly") || 
    lower.includes("recurring") || 
    lower.includes("netflix") || 
    lower.includes("spotify") || 
    lower.includes("cloud")
  ) {
    return {
      text: `You currently have **${subsCount}** active subscription${subsCount === 1 ? '' : 's'} tracked. You can manage your recurring charges, cycle presets, and burn rate in the **Subscriptions** tab.`,
      suggestedTab: "subscriptions",
      actionLabel: "Go to Subscriptions",
    };
  }

  if (
    lower.includes("offer") || 
    lower.includes("deal") || 
    lower.includes("perk") || 
    lower.includes("trade") || 
    lower.includes("renew") || 
    lower.includes("voucher") || 
    lower.includes("discount") || 
    lower.includes("applecare") ||
    lower.includes("care+")
  ) {
    return {
      text: "Check out the **Offers & Renewals** tab! We match verified brand perks, trade-in credits (Apple, Samsung, Sony, Bose, etc.), and extended care vouchers specifically for your hardware.",
      suggestedTab: "offers",
      actionLabel: "View Matched Offers & Renewals",
    };
  }

  if (
    lower.includes("claim") || 
    lower.includes("email") || 
    lower.includes("support") || 
    lower.includes("draft") || 
    lower.includes("warranty issue") ||
    lower.includes("broken")
  ) {
    return {
      text: "To file a claim, head to your **Dashboard**. Click on any tracked item and click **'Draft Claim Email'** to generate a pre-formatted warranty claim ready to send to manufacturer support.",
      suggestedTab: "dashboard",
      actionLabel: "Go to Dashboard",
    };
  }

  if (
    lower.includes("expire") || 
    lower.includes("expiring") || 
    lower.includes("urgent") || 
    lower.includes("due") || 
    lower.includes("warrant") || 
    lower.includes("dash") || 
    lower.includes("item") || 
    lower.includes("vault") || 
    lower.includes("home")
  ) {
    return {
      text: `You have **${itemsCount}** device${itemsCount === 1 ? '' : 's'} logged in your vault. Head over to the **Dashboard** to view warranty expiry countdowns, status tags, and item details.`,
      suggestedTab: "dashboard",
      actionLabel: "Open Dashboard",
    };
  }

  return {
    text: "I'm your **ClaimSync AI Guide**! I can help you navigate around the app:\n\n- 📸 **Snap Camera HUD**: Scan receipts & OCR warranty extraction\n- 📋 **Dashboard**: View your hardware vault, status tags & claim drafts\n- 💳 **Subscriptions**: Monthly recurring bill tracker & burn radar\n- 🎁 **Offers & Renewals**: Brand trade-ins, AppleCare/Care+ discounts & vouchers\n\nWhere would you like to go?",
    suggestedTab: currentTab === "dashboard" ? "upload" : "dashboard",
    actionLabel: currentTab === "dashboard" ? "Scan Receipt" : "View Dashboard",
  };
}

// AI Assistant Navigation & Guidance Endpoint
app.post("/api/assistant", async (req, res) => {
  try {
    const { 
      message, 
      currentTab = "dashboard", 
      items = [], 
      subscriptions = [] 
    } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "A message string is required." });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback if no API key is available
      const fallback = generateFallbackResponse(
        message, 
        currentTab, 
        items.length, 
        subscriptions.length
      );
      res.json(fallback);
      return;
    }

    const systemInstruction = `You are "ClaimSync AI Guide", a friendly, lightning-fast app navigation assistant and warranty co-pilot inside the ClaimSync web application.
The application has 4 main navigation tabs:
1. "dashboard": Hardware vault displaying all logged items, receipt photos, purchase dates, warranty expiry dates (Active, Expiring Soon, Expired), and warranty claim email generators.
2. "upload": Snap Camera HUD for live camera scanning and file uploads with real-time OCR extraction (product, purchase date, duration, retailer).
3. "subscriptions": Monthly recurring subscription burner, cycle tracker, and renewal manager.
4. "offers": Perks & Renewals hub for manufacturer trade-in credits, extended care programs (AppleCare+, Samsung Care+, Sony Protect Plus, Bose, LG, Dell, Dyson, Philips), and custom vouchers.

User Context:
- Current active tab: ${currentTab}
- Total items in vault: ${items.length} items (${items.map((i: any) => `${i.product || 'Item'} (${i.brand || 'Brand'})`).slice(0, 5).join(', ') || 'None'})
- Total subscriptions: ${subscriptions.length} subscriptions (${subscriptions.map((s: any) => s.name).slice(0, 5).join(', ') || 'None'})

Instructions:
- Keep your reply concise, friendly, and helpful (2-4 sentences max).
- If the user's intent relates to an app view or action (e.g. scanning receipts, seeing items, checking subscriptions, deals, filing a claim), determine which tab best matches.
- You MUST return a valid JSON object matching this schema:
{
  "text": "Your helpful natural language response explaining what to do or where to go.",
  "suggestedTab": "dashboard" | "upload" | "subscriptions" | "offers" | null,
  "actionLabel": "Short 2-4 word button text to jump there (e.g. 'Open Camera Scanner', 'Go to Dashboard', 'View Subscriptions', 'Explore Perks')"
}`;

    const MODELS_TO_TRY = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.0-flash"];
    let rawText = "";

    for (const modelName of MODELS_TO_TRY) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: message,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          },
        });
        if (response.text) {
          rawText = response.text.trim();
          break;
        }
      } catch (modelErr: any) {
        console.warn(`Model ${modelName} returned status: ${modelErr?.status || modelErr?.message || 'Error'}, trying next model...`);
      }
    }

    if (rawText) {
      try {
        const parsed = JSON.parse(rawText);
        res.json({
          text: parsed.text || "I can help you navigate ClaimSync!",
          suggestedTab: parsed.suggestedTab || null,
          actionLabel: parsed.actionLabel || null,
        });
        return;
      } catch {
        // Continue to fallback if parsing fails
      }
    }

    res.json(generateFallbackResponse(message, currentTab, items.length, subscriptions.length));
  } catch (err: any) {
    console.warn("Using smart fallback response for assistant request:", err?.message || err);
    // Graceful fallback response on error
    const fallback = generateFallbackResponse(
      req.body?.message || "", 
      req.body?.currentTab || "dashboard", 
      (req.body?.items || []).length, 
      (req.body?.subscriptions || []).length
    );
    res.json(fallback);
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "ClaimSync Server" });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
