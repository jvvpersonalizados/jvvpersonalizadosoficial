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

// Health check / Ping endpoint
app.get("/api/ping", (req, res) => {
  res.json({ success: true, message: "Pong", timestamp: new Date().toISOString() });
});

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

// API Route for Social Feed (Pinterest fallback for Instagram)
app.get("/api/social-feed", async (req, res) => {
  const pinterestUrl = "https://br.pinterest.com/JVVPersonalizadosPinterest/_tpd_social/";
  const fallback = [
    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1614732484003-ef9881555dc3?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1572119865084-43c285814d63?auto=format&fit=crop&w=600&q=80"
  ].map((img, i) => ({
    id: `fallback-${i}`,
    url: pinterestUrl,
    image: img,
    thumbnail: img,
    caption: "JVV Personalizados"
  }));

  try {
    const response = await axios.get(pinterestUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      timeout: 8000
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const posts: any[] = [];

    // 1. Try to find images in img tags
    $("img").each((i, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("srcset")?.split(" ")[0];
      if (src && (src.includes("pinimg.com") || src.includes("/236x/") || src.includes("/474x/") || src.includes("/736x/"))) {
        const highRes = src.replace(/\/\d+x\//, "/736x/");
        posts.push({
          id: `pin-img-${i}-${Math.random().toString(36).substr(2, 5)}`,
          url: pinterestUrl,
          image: highRes,
          thumbnail: src,
          caption: $(el).attr("alt") || "JVV Personalizados"
        });
      }
    });

    // 2. Aggressive Regex search for pinimg URLs in the whole HTML
    const pinimgRegex = /https:\/\/i\.pinimg\.com\/[^\s"']+\.(jpg|jpeg|png|webp)/g;
    const matches = html.match(pinimgRegex) || [];
    matches.forEach((match: string, i: number) => {
      if (match.includes("/236x/") || match.includes("/474x/") || match.includes("/736x/")) {
        const highRes = match.replace(/\/\d+x\//, "/736x/");
        posts.push({
          id: `pin-regex-${i}-${Math.random().toString(36).substr(2, 5)}`,
          url: pinterestUrl,
          image: highRes,
          thumbnail: match,
          caption: "JVV Personalizados"
        });
      }
    });

    const uniquePosts = Array.from(new Map(posts.map(item => [item.image, item])).values());

    if (uniquePosts.length === 0) {
      return res.json({ success: true, posts: fallback });
    }

    res.json({ success: true, posts: uniquePosts.slice(0, 12) });
  } catch (error: any) {
    console.error("Pinterest fetch error:", error.message);
    res.json({ success: true, posts: fallback });
  }
});

// API Route for Instagram Feed
app.get("/api/instagram", (req, res) => {
  res.redirect("/api/social-feed");
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

// Middleware for static files and SPA fallback
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api/")) {
      res.sendFile(path.join(distPath, "index.html"));
    }
  });
} else {
  // Development mode with Vite
  const setupDev = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  };
  setupDev();
}

export default app;

