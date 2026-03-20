import express from "express";
import path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

// Lazy initialization of GenAI to prevent crash if API key is missing
let genAI: any = null;
const getGenAI = () => {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAI;
};

app.use(express.json());

// Health check / Ping endpoint
app.get("/api/ping", (req, res) => {
  res.json({ 
    success: true, 
    message: "Pong", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// API Route for AI Post Generation
app.post("/api/generate-post", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: "Prompt is required" });

    const ai = getGenAI();
    if (!ai) {
      return res.status(500).json({ success: false, error: "AI not configured. Please set GEMINI_API_KEY." });
    }

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é um especialista em marketing para a JVV Store. 
      Gere uma descrição curta, impactante e galáctica para o seguinte produto: ${prompt}.
      Retorne um JSON com os campos: name (nome curto do produto), price (um preço sugerido em reais, apenas o número), description (a descrição gerada).`,
      config: { responseMimeType: "application/json" }
    });

    const postData = JSON.parse(result.text || "{}");
    
    // Sync with GAS
    const gasUrl = "https://script.google.com/macros/s/AKfycbzDtuQJXDKbFkIjP4sMBKULwgAa90sJajyIPEzU3n5-pFOy9KD6BBLDAztbr4oEXP_IKw/exec";
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

    // More comprehensive selectors for common e-commerce platforms
    $(".product-item, .item, .product, .showcase-item, .list-item, [data-product-id]").each((i, el) => {
      const name = $(el).find(".product-name, .name, h2, h3, .title").text().trim();
      const priceStr = $(el).find(".product-price, .price, .value, .current-price, .price-value").text().trim();
      
      let img = $(el).find("img").attr("src") || 
                $(el).find("img").attr("data-src") || 
                $(el).find("img").attr("data-lazy") ||
                $(el).find("img").attr("srcset")?.split(" ")[0];
      
      if (name && priceStr) {
        // Clean price string
        const cleanPrice = priceStr.replace(/[^\d,.]/g, "").replace(",", ".");
        
        if (img && !img.startsWith("http")) {
          img = img.startsWith("//") ? `https:${img}` : `https://www.jvvpersonalizados.com.br${img.startsWith("/") ? "" : "/"}${img}`;
        }

        products.push({
          name,
          price: cleanPrice,
          image: img || "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?w=800&q=80"
        });
      }
    });

    // Deduplicate by name
    const uniqueProducts = Array.from(new Map(products.map(p => [p.name, p])).values());

    const gasUrl = "https://script.google.com/macros/s/AKfycbzDtuQJXDKbFkIjP4sMBKULwgAa90sJajyIPEzU3n5-pFOy9KD6BBLDAztbr4oEXP_IKw/exec";
    await axios.post(gasUrl, {
      action: "syncCatalog",
      products: uniqueProducts.filter(p => p.name && p.price)
    });

    res.json({ success: true, count: uniqueProducts.length, products: uniqueProducts.slice(0, 5) });
  } catch (error: any) {
    console.error("Catalog sync error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Proxy for Google Apps Script to avoid CORS issues
app.post("/api/gas-proxy", async (req, res) => {
  try {
    const gasUrl = "https://script.google.com/macros/s/AKfycbzDtuQJXDKbFkIjP4sMBKULwgAa90sJajyIPEzU3n5-pFOy9KD6BBLDAztbr4oEXP_IKw/exec";
    const response = await axios.post(gasUrl, req.body, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("GAS Proxy error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Middleware for static files and SPA fallback
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api/")) {
      // In Vercel, static files are handled by the platform, 
      // but we keep this for local production testing.
      try {
        res.sendFile(path.join(distPath, "index.html"));
      } catch (e) {
        res.status(404).send("Not found");
      }
    }
  });
} else {
  // Development mode with Vite - Dynamic import to avoid production issues
  const setupDev = async () => {
    const { createServer: createViteServer } = await import("vite");
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

