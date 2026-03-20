import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";

import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-3-flash-preview";

app.use(express.json());

// API Route for AI Post Generation
app.post("/api/generate-post", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: "Prompt is required" });

    const result = await genAI.models.generateContent({
      model,
      contents: `Você é um especialista em marketing para a JVV Store. 
      Gere uma descrição curta, impactante e galáctica para o seguinte produto: ${prompt}.
      Retorne um JSON com os campos: name (nome curto do produto), price (um preço sugerido em reais, apenas o número), description (a descrição gerada).`,
      config: { responseMimeType: "application/json" }
    });

    const postData = JSON.parse(result.text || "{}");
    
    // Sync with GAS
    const gasUrl = "https://script.google.com/macros/s/AKfycbxwN_95NZj9ATBVKSswXdfJboRXYYqOMyOJrL2HmJ3Tlu40XnQm68TFvxDIe4Vz2clc/exec";
    await axios.post(gasUrl, {
      action: "addProduct",
      name: postData.name,
      price: postData.price,
      image: "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?w=800&q=80", // Placeholder
      description: postData.description
    });

    res.json({ success: true, data: postData });
  } catch (error: any) {
    console.error("AI Generation error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

let cachedFeed: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// API Route for Instagram Feed
app.get("/api/instagram", async (req, res) => {
  const now = Date.now();
  if (cachedFeed && (now - lastFetchTime < CACHE_DURATION)) {
    return res.json(cachedFeed);
  }

  try {
    const username = "jvvpersonalizados";
    const url = `https://www.instagram.com/${username}/`;
    
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const $ = cheerio.load(response.data);
    let userData: any = null;
    
    $("script").each((i, el) => {
      const content = $(el).html() || "";
      if (content.includes("window.__additionalDataLoaded")) {
        try {
          const jsonStr = content.split("window.__additionalDataLoaded('feed',")[1].split(");")[0];
          const data = JSON.parse(jsonStr);
          userData = data.graphql?.user || data.user;
        } catch (e) {}
      }
      if (!userData && content.includes("window._sharedData =")) {
        try {
          const jsonStr = content.split("window._sharedData = ")[1].split("};")[0] + "}";
          const sharedData = JSON.parse(jsonStr);
          userData = sharedData.entry_data?.ProfilePage?.[0]?.graphql?.user || sharedData.entry_data?.ProfilePage?.[0]?.user;
        } catch (e) {}
      }
    });

    if (!userData) {
      // Try to find any JSON that looks like user data
      $("script[type='application/json']").each((i, el) => {
        try {
          const content = $(el).html() || "";
          const json = JSON.parse(content);
          // Look for user data in various possible paths
          const possibleUser = json.entry_data?.ProfilePage?.[0]?.graphql?.user || 
                             json.graphql?.user || 
                             json.user;
          if (possibleUser && possibleUser.edge_owner_to_timeline_media) {
            userData = possibleUser;
          }
        } catch (e) {}
      });
    }

    if (!userData || !userData.edge_owner_to_timeline_media) {
      // If we still don't have it, return fallback but don't cache it for long
      const fallbackResponse = {
        success: false,
        error: "Instagram blocked the request or data format changed.",
        fallback: [
          "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1614732484003-ef9881555dc3?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1572119865084-43c285814d63?auto=format&fit=crop&w=600&q=80"
        ]
      };
      return res.json(fallbackResponse);
    }

    const posts = userData.edge_owner_to_timeline_media.edges.map((edge: any) => ({
      id: edge.node.id,
      url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
      image: edge.node.display_url,
      thumbnail: edge.node.thumbnail_src,
      caption: edge.node.edge_media_to_caption?.edges[0]?.node?.text || "",
    }));

    cachedFeed = { success: true, posts };
    lastFetchTime = now;
    res.json(cachedFeed);
  } catch (error: any) {
    console.error("Instagram fetch error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API Route for Catalog Sync
app.get("/api/sync-catalog", async (req, res) => {
  try {
    const url = "https://www.jvvpersonalizados.com.br/";
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);
    const products: any[] = [];

    // This selector is a guess based on common e-commerce patterns, 
    // it might need adjustment based on the actual site structure.
    $(".product-item, .item, .product").each((i, el) => {
      const name = $(el).find(".product-name, .name, h2, h3").text().trim();
      const priceStr = $(el).find(".product-price, .price, .value").text().trim();
      const img = $(el).find("img").attr("src") || $(el).find("img").attr("data-src");
      
      if (name && priceStr) {
        products.push({
          name,
          price: priceStr.replace(/[^\d,.]/g, "").replace(",", "."),
          image: img?.startsWith("http") ? img : `https:${img}`
        });
      }
    });

    // If the above didn't work, try a more generic approach
    if (products.length === 0) {
      $("a").each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 5 && (text.includes("R$") || text.includes("$"))) {
           const img = $(el).find("img").attr("src");
           products.push({
             name: text.split("R$")[0].trim(),
             price: text.split("R$")[1]?.trim().replace(/[^\d,.]/g, "").replace(",", "."),
             image: img
           });
        }
      });
    }

    // Send to Google Apps Script
    const gasUrl = "https://script.google.com/macros/s/AKfycbxwN_95NZj9ATBVKSswXdfJboRXYYqOMyOJrL2HmJ3Tlu40XnQm68TFvxDIe4Vz2clc/exec";
    await axios.post(gasUrl, {
      action: "syncCatalog",
      products: products.filter(p => p.name && p.price)
    });

    res.json({ success: true, count: products.length, products: products.slice(0, 5) });
  } catch (error: any) {
    console.error("Catalog sync error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

async function startServer() {
  // Vite middleware for development
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

  if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;

