import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "abildb.json");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Database structure
function getDb() {
  if (!fs.existsSync(DB_PATH)) {
    const initialDb = {
      users: [
        {
          email: "jrnabil570@gmail.com",
          password: "password123",
          isAdmin: true,
          vipUntil: null,
          createdAt: new Date().toISOString()
        },
        {
          email: "admin@abilai.com",
          password: "admin",
          isAdmin: true,
          vipUntil: null,
          createdAt: new Date().toISOString()
        }
      ],
      apiKeys: {
        gemini: "",
        chatgpt: "",
        deepseek: "",
        kimi: "",
        grok: "",
        dola: ""
      },
      chats: [] as any[],
      vipRequests: [] as any[]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }
  try {
    const content = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    console.error("Error reading database file, resetting", e);
    const fallbackDb = {
      users: [
        {
          email: "jrnabil570@gmail.com",
          password: "password123",
          isAdmin: true,
          vipUntil: null,
          createdAt: new Date().toISOString()
        },
        {
          email: "admin@abilai.com",
          password: "admin",
          isAdmin: true,
          vipUntil: null,
          createdAt: new Date().toISOString()
        }
      ],
      apiKeys: {
        gemini: "",
        chatgpt: "",
        deepseek: "",
        kimi: "",
        grok: "",
        dola: ""
      },
      chats: [] as any[],
      vipRequests: [] as any[]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(fallbackDb, null, 2), "utf-8");
    return fallbackDb;
  }
}

function saveDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function localTranslateAndEnrichPrompt(input: string): string {
  const dictionary: { [key: string]: string } = {
    // Animals
    "kucing": "cute fluffy cat",
    "anjing": "playful puppy dog",
    "naga": "mythical fiery dragon",
    "singa": "majestic lion",
    "harimau": "wild powerful tiger",
    "elang": "flying eagle",
    "kuda": "majestic running horse",
    "burung": "beautiful glowing bird",
    "ikan": "vivid colorful fish",
    "lumba-lumba": "dolphin jumping",
    "kupu-kupu": "colorful glowing butterfly",
    
    // Core visual/object/art terms
    "terbang": "flying high in the sky",
    "gambar": "digital art illustration",
    "abstrak": "surreal abstract artwork",
    "estetik": "highly aesthetic portrait",
    "lukisan": "exquisite canvas oil painting",
    "foto": "ultra HD professional DSLR photograph",
    "nyata": "highly photorealistic",
    "realistis": "cinematic realistic",
    "3d": "detailed 3D render",
    "sketsa": "detailed pencil sketch",
    "kartun": "colorful cute 2D cartoon style",
    "anime": "highly detailed Japanese anime studio style",
    "vektor": "clean minimalist vector flat icon",
    "desain": "professionally designed graphic",
    "cyberpunk": "cyberpunk sci-fi cinematic style",
    "futuristik": "futuristic technological elements",
    "klasik": "vintage nostalgic retro style",
    "keren": "epic majestic cinematic theme",

    // Sceneries & Places
    "pemandangan": "breathtaking panoramic scenery",
    "alam": "pristine wilderness nature",
    "kota": "modern cyber metropolis cityscape",
    "hutan": "ancient lush deep forest",
    "laut": "deep mysterious ocean water",
    "pantai": "beautiful tropical sandy beach",
    "senja": "dramatic golden hour sunset, warm colors",
    "fajar": "soft pink dawn sunrise",
    "malam": "mystic starry night, glowing lunar light",
    "siang": "bright clear sunny day",
    "angkasa": "outer space, cosmic nebula, glowing galaxy",
    "bintang": "twinkling stars",
    "bulan": "glowing mystical full moon",
    "sawah": "emerald green terraced rice fields of Bali",
    "desa": "cozy rustic tranquil village",
    "air terjun": "gushing tropical cascading waterfall",
    "danau": "serene crystal-clear mountain lake",
    "kabut": "mystic morning fog and mist",
    "gunung": "majestic snowcapped mountain peak",
    "awan": "dreamy dramatic fluffy clouds",
    "hujan": "moody cinematic rainy day",
    "salju": "gentle white winter snow landscape",
    "taman": "colorful blooming flower garden",
    "bunga": "blooming vibrant flowers",
    "mawar": "crimson red rose",

    // Human & Characters
    "pria": "handsome man",
    "wanita": "beautiful gorgeous woman",
    "anak": "happy cheerful kid",
    "astronot": "cute astronaut explorer",
    "robot": "cute futuristic companion robot",
    "guru": "wise academic teacher",
    "dokter": "professional doctor",
    "raja": "regal royal king",
    "ratu": "elegant graceful queen",

    // Objects & Vehicles
    "mobil": "sleek sports supercar",
    "sepeda": "vintage bicycle",
    "rumah": "warm cozy cottage cabin",
    "gedung": "futuristic architecture skyscrapers",
    "kopi": "hot steaming fresh coffee cup",
    "teh": "warm cup of tea",
    "makanan": "delicious gourmet prepared food",
    "candi": "ancient mystical stone temple",
    "borobudur": "historical Borobudur temple heritage",
    "indonesia": "beautiful Indonesian aesthetic elements"
  };

  let cleaned = input.toLowerCase().trim();
  // Filter out noise / Indonesian filler words
  const noise = ["minta", "tolong", "buatkan", "bikin", "yang", "tentang", "dengan", "dan", "di", "ke", "dari", "seperti", "seorang", "sebuah", "oleh"];
  
  // Custom multi-word replacements prior to single word tokens
  let processedStr = cleaned;
  
  // Custom multi-word check (e.g. "air terjun", "lumba lumba", "pantai kuta")
  const multiDefs = [
    { ind: "air terjun", eng: "gushing cascading tropical waterfall" },
    { ind: "lumba lumba", eng: "jumping playful dolphins" },
    { ind: "pantai kuta", eng: "gorgeous Kuta Bali beach sunset" },
    { ind: "di atas", eng: "on top of" },
    { ind: "di bawah", eng: "underneath" },
    { ind: "di dalam", eng: "inside" },
    { ind: "di luar", eng: "outside" }
  ];

  for (const item of multiDefs) {
    const regex = new RegExp(`\\b${item.ind}\\b`, "g");
    processedStr = processedStr.replace(regex, item.eng);
  }

  // Tokenize
  const words = processedStr.split(/\s+/);
  
  const translated = words.map(word => {
    // Remove punctuation
    const cleanWord = word.replace(/[^a-zA-Z0-9-]/g, '').trim();
    if (!cleanWord || noise.includes(cleanWord)) {
      return "";
    }
    if (dictionary[cleanWord]) {
      return dictionary[cleanWord];
    }
    return word; // Keep unknown words (they might be proper nouns, or already English!)
  }).filter(Boolean);

  const baseline = translated.join(" ");
  // Append high-end visual enhancements
  return `${baseline}, highly detailed masterpiece, stunning aesthetic, fine textures, trending on ArtStation, cinematic lighting, 8k resolution`;
}

function detectImageRequest(userText: string): string | null {
  const text = userText.toLowerCase().trim();
  
  // List of trigger patterns for image generation
  const triggers = [
    /buat(?:kan|lah)? (?:gambar|foto|lukisan|ilustrasi|logo|desain|sketsa|wallpaper)\s+(?:tentang\s+|dari\s+|berupa\s+)?(.+)/i,
    /bikin(?:kan|lah)? (?:gambar|foto|lukisan|ilustrasi|logo|desain|sketsa|wallpaper)\s+(?:tentang\s+|dari\s+|berupa\s+)?(.+)/i,
    /gambar(?:kan)?\s+(?:tentang\s+|dari\s+|berupa\s+)?(.+)/i,
    /lukis(?:kan)?\s+(?:tentang\s+|dari\s+|berupa\s+)?(.+)/i,
    /(?:generate|create|make|draw|paint|design|sketch) (?:an? )?(?:image|picture|photo|painting|illustration|logo|sketch|wallpaper|icon) (?:of|about|depicting)?\s*(.+)/i
  ];

  for (const regex of triggers) {
    const match = userText.match(regex);
    if (match && match[1] && match[1].trim().length > 2) {
      return match[1].trim();
    }
  }

  // Fallback checks for direct actions
  if (text.startsWith("gambarkan ")) {
    return userText.replace(/^gambarkan\s+/i, "").trim();
  }
  if (text.startsWith("gambar ") && text.length > 10) {
    return userText.replace(/^gambar\s+/i, "").trim();
  }
  if (text.startsWith("bikin foto ") || text.startsWith("bikin gambar ")) {
    return userText.replace(/^(bikin foto|bikin gambar)\s+/i, "").trim();
  }
  if (text.startsWith("buat foto ") || text.startsWith("buat gambar ")) {
    return userText.replace(/^(buat foto|buat gambar)\s+/i, "").trim();
  }
  if (text.startsWith("draw ") || text.startsWith("paint ")) {
    return userText.replace(/^(draw|paint)\s+/i, "").trim();
  }

  return null;
}

// Simple Session State (in-memory token map to secure APIs)
const tokenMap = new Map<string, string>(); // token -> email

// Helper to authenticate user from token
function getUserFromRequest(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  const email = tokenMap.get(token);
  if (!email) return null;
  const db = getDb();
  return db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

// ---------------- USER API ENDPOINTS ----------------

// Register API
app.post("/api/auth/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email dan password wajib diisi." });
  }

  const db = getDb();
  const exists = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: "Email sudah terdaftar." });
  }

  // Set default admin for special requested emails, others are normal users
  const normalizedEmail = email.toLowerCase().trim();
  const isAdmin = normalizedEmail === "jrnabil570@gmail.com" || normalizedEmail === "admin@abilai.com";

  const newUser = {
    email: normalizedEmail,
    password, // Simple text storage for easily configurable/auditable prototype
    isAdmin,
    vipUntil: null,
    unlockedModels: [],
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb(db);

  // Auto login upon registration
  const token = `token-${Math.random().toString(36).substring(2)}-${Date.now()}`;
  tokenMap.set(token, normalizedEmail);

  res.json({
    success: true,
    message: "Registrasi berhasil!",
    token,
    user: {
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      vipUntil: newUser.vipUntil,
      unlockedModels: newUser.unlockedModels,
      createdAt: newUser.createdAt
    }
  });
});

// Login API
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email dan password wajib diisi." });
  }

  const db = getDb();
  const user = db.users.find(
    (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: "Email atau password salah." });
  }

  const token = `token-${Math.random().toString(36).substring(2)}-${Date.now()}`;
  tokenMap.set(token, user.email);

  res.json({
    success: true,
    message: "Login berhasil!",
    token,
    user: {
      email: user.email,
      isAdmin: user.isAdmin,
      vipUntil: user.vipUntil,
      unlockedModels: user.unlockedModels || [],
      createdAt: user.createdAt
    }
  });
});

// Get Currect Session Profile
app.get("/api/auth/me", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  res.json({
    success: true,
    user: {
      email: user.email,
      isAdmin: user.isAdmin,
      vipUntil: user.vipUntil,
      unlockedModels: user.unlockedModels || [],
      createdAt: user.createdAt
    }
  });
});

// Google Login Simulation API
app.post("/api/auth/google-login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email Google wajib dikirim." });
  }
  
  const db = getDb();
  const normalizedEmail = email.toLowerCase().trim();
  
  // Find or automatically create/register the user
  let user = db.users.find((u: any) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    const isAdmin = normalizedEmail === "jrnabil570@gmail.com" || normalizedEmail === "admin@abilai.com";
    user = {
      email: normalizedEmail,
      password: "google-auth-pass-" + Math.random().toString(36), // auto-generated secure password
      isAdmin,
      vipUntil: null,
      unlockedModels: [],
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    saveDb(db);
  }
  
  const token = `token-${Math.random().toString(36).substring(2)}-${Date.now()}`;
  tokenMap.set(token, user.email);

  res.json({
    success: true,
    message: "Masuk dengan Google berhasil!",
    token,
    user: {
      email: user.email,
      isAdmin: user.isAdmin,
      vipUntil: user.vipUntil,
      unlockedModels: user.unlockedModels || [],
      createdAt: user.createdAt
    }
  });
});

// ---------------- ADMIN API ENDPOINTS ----------------

// Get API Keys configuration (ONLY ADMIN)
app.get("/api/admin/keys", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ success: false, message: "Akses ditolak. Panel khusus Admin." });
  }
  const db = getDb();
  res.json({ success: true, keys: db.apiKeys });
});

// Save API Keys configuration (ONLY ADMIN)
app.post("/api/admin/keys", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ success: false, message: "Akses ditolak. Panel khusus Admin." });
  }
  const { gemini, chatgpt, deepseek, kimi, grok, dola } = req.body;
  const db = getDb();
  db.apiKeys = {
    gemini: gemini || "",
    chatgpt: chatgpt || "",
    deepseek: deepseek || "",
    kimi: kimi || "",
    grok: grok || "",
    dola: dola || ""
  };
  saveDb(db);
  res.json({ success: true, message: "Kunci API berhasil disimpan!" });
});

// Grant VIP to user for custom days (ONLY ADMIN)
app.post("/api/admin/vip/grant", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ success: false, message: "Akses ditolak. Panel khusus Admin." });
  }
  const { email, days, unlockedModels } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email user wajib diisi." });
  }
  const grantDays = parseInt(days) || 3;

  const db = getDb();
  // Find or create user to grant access to
  let targetUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!targetUser) {
    // We can auto-invite/register the email with a default password so they can log in
    targetUser = {
      email: email.toLowerCase().trim(),
      password: "password123", // default password
      isAdmin: false,
      vipUntil: null,
      unlockedModels: [],
      createdAt: new Date().toISOString()
    };
    db.users.push(targetUser);
  }

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + grantDays);
  targetUser.vipUntil = futureDate.toISOString();
  
  // Store unlockedModels (or ["all"] as default if nothing sent)
  targetUser.unlockedModels = Array.isArray(unlockedModels) && unlockedModels.length > 0
    ? unlockedModels.map((m: string) => m.toLowerCase().trim())
    : ["all"];

  saveDb(db);
  res.json({
    success: true,
    message: `Akses VIP berhasil diberikan ke ${targetUser.email} selama ${grantDays} hari (sampai ${futureDate.toLocaleDateString('id-ID')})!`
  });
});

// Revoke VIP from user (ONLY ADMIN) - REAL-TIME REVOCATION
app.post("/api/admin/vip/revoke", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ success: false, message: "Akses ditolak. Panel khusus Admin." });
  }
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email user wajib diisi." });
  }

  const db = getDb();
  let targetUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!targetUser) {
    return res.status(404).json({ success: false, message: "User tidak ditemukan." });
  }

  targetUser.vipUntil = null;
  targetUser.unlockedModels = [];
  saveDb(db);

  res.json({
    success: true,
    message: `Masa aktif VIP untuk ${targetUser.email} berhasil dihapus!`
  });
});

// Get User & VIP list (ONLY ADMIN)
app.get("/api/admin/users", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ success: false, message: "Akses ditolak" });
  }
  const db = getDb();
  const filteredUsers = db.users.map((u: any) => {
    let hasAccess = false;
    let daysRemaining = 0;
    if (u.vipUntil) {
      const remainingBytes = new Date(u.vipUntil).getTime() - Date.now();
      if (remainingBytes > 0) {
        hasAccess = true;
        daysRemaining = Math.ceil(remainingBytes / (1000 * 60 * 60 * 24));
      }
    }
    return {
      email: u.email,
      isAdmin: u.isAdmin,
      vipUntil: u.vipUntil,
      unlockedModels: u.unlockedModels || [],
      hasAccess,
      daysRemaining,
      createdAt: u.createdAt
    };
  });
  res.json({ success: true, users: filteredUsers });
});


// ---------------- CHAT CONFIG & ENGINE ----------------

// Get and session list for current user
app.get("/api/chats", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const db = getDb();
  const sessions = db.chats.filter((c: any) => c.userId === user.email);
  res.json({ success: true, sessions });
});

// Create new chat session for current user
app.post("/api/chats", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const { model, title } = req.body;

  // Validate VIP models on creation as well
  const modelIdLower = (model || "Gemini").toLowerCase();
  const isVipModel = ["abil-ai v5.6 pro", "abil-ai v6.6 plus", "abil-ai v7.5 ultra"].includes(modelIdLower);
  let hasVipAccess = false;

  if (user.vipUntil) {
    const remaining = new Date(user.vipUntil).getTime() - Date.now();
    if (remaining > 0) {
      const unlocked = user.unlockedModels || [];
      const isAll = unlocked.map((m: string) => m.toLowerCase().trim()).includes("all");
      const isSpecific = unlocked.map((m: string) => m.toLowerCase().trim()).includes(modelIdLower);
      if (isAll || isSpecific) {
        hasVipAccess = true;
      }
    }
  }

  if (isVipModel && !hasVipAccess && !user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: `Akses ditolak. Model ${model} belum diaktifkan untuk akun VIP Anda.`
    });
  }

  const db = getDb();

  const newSession = {
    id: `chat-${Math.random().toString(36).substring(2)}-${Date.now()}`,
    title: title || `Percakapan baru - ${model}`,
    model: model || "Gemini",
    messages: [],
    createdAt: new Date().toISOString(),
    userId: user.email
  };

  db.chats.push(newSession);
  saveDb(db);
  res.json({ success: true, session: newSession });
});

// Delete specific chat session
app.delete("/api/chats/:id", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const id = req.params.id;
  const db = getDb();
  const index = db.chats.findIndex((c: any) => c.id === id && c.userId === user.email);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Sesi percakapan tidak ditemukan" });
  }

  db.chats.splice(index, 1);
  saveDb(db);
  res.json({ success: true, message: "Sesi percakapan berhasil dihapus." });
});

// Engine to proxy ChatGPT, DeepSeek, Kimi, Grok, Dola & Gemini calls
app.post("/api/chats/:id/message", async (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { message, attachment } = req.body;
  const id = req.params.id;

  if (!message) {
    return res.status(400).json({ success: false, message: "Pesan tidak boleh kosong" });
  }

  const db = getDb();
  const session = db.chats.find((c: any) => c.id === id && c.userId === user.email);
  if (!session) {
    return res.status(404).json({ success: false, message: "Sesi percakapan tidak ditemukan" });
  }

  const modelLow = session.model.toLowerCase();

  // Validate VIP models
  const modelIdLower = session.model.toLowerCase();
  const isVipModel = ["abil-ai v5.6 pro", "abil-ai v6.6 plus", "abil-ai v7.5 ultra"].includes(modelIdLower);
  let hasVipAccess = false;
  if (user.vipUntil) {
    const remaining = new Date(user.vipUntil).getTime() - Date.now();
    if (remaining > 0) {
      const unlocked = user.unlockedModels || [];
      const isAll = unlocked.map((m: string) => m.toLowerCase().trim()).includes("all");
      const isSpecific = unlocked.map((m: string) => m.toLowerCase().trim()).includes(modelIdLower);
      if (isAll || isSpecific) {
        hasVipAccess = true;
      }
    }
  }

  if (isVipModel && !hasVipAccess && !user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: `Akses ditolak. Model ${session.model} belum diaktifkan untuk akun VIP Anda. Hubungi Admin Anda untuk membuka akses model ini!`
    });
  }

  // Define specialized system prompt for each AI
  let systemPrompt = "";
  if (modelLow.includes("chatgpt")) {
    systemPrompt = "You are ChatGPT, the advanced conversational AI from OpenAI. Answer in a helpful, structured, polished manner, incorporating clean lists where possible.";
  } else if (modelLow.includes("deepseek")) {
    systemPrompt = "You are DeepSeek-V3, a highly structured, analytical, and logical AI model. Deliver deeply technical explanations and clear answers.";
  } else if (modelLow.includes("kimi")) {
    systemPrompt = "You are Kimi, a long-context, understanding assistant developed by Moonshot AI. Speak in a warm, polite, and detailed Indonesian/English mix.";
  } else if (modelLow.includes("grok")) {
    systemPrompt = "You are Grok, an interactive AI created by xAI. You are designed to be witty, smart, informative, and have a unique rebellious streak with humor.";
  } else if (modelLow.includes("dola")) {
    systemPrompt = "You are Dola, a productive and super-fast utility assistant. Deliver precise action-oriented bullet points, avoid verbose talking, and focus on workflow.";
  } else if (modelLow.includes("gemini")) {
    systemPrompt = "You are Gemini, the modern multimodal assistant developed by Google. You are highly creative, expressive, and detailed.";
  } else if (modelLow.includes("abil-ai 2.5")) {
    systemPrompt = "You are Abil-Ai v2.5, the fast and lightweight entry-level assistant in the Abil-Ai model ecosystem. Deliver quick and friendly support.";
  } else if (modelLow.includes("abil-ai 3.5")) {
    systemPrompt = "You are Abil-Ai v3.5, the versatile conversational flagship. Deliver comprehensive, structured, and elegant solutions.";
  } else if (modelLow.includes("abil-ai 4.5")) {
    systemPrompt = "You are Abil-Ai v4.5, an artificial intelligence assistant whose core technology is powered by Google's Gemini, but conceptualized and developed by Nabil Assihidiqi from Indonesia. He is very smart and talented in coding. You are capable of high-level coding, content creation, and mathematical reasoning.";
  } else if (modelLow.includes("abil-ai v5.6 pro")) {
    systemPrompt = "You are Abil-Ai v5.6 Pro, a highly advanced premium agent optimized for deep enterprise logic, smart planning, and clean responses.";
  } else if (modelLow.includes("abil-ai v6.6 plus")) {
    systemPrompt = "You are Abil-Ai v6.6 Plus, the elite logical reasoning assistant. Break questions down step by step with flawless logic.";
  } else if (modelLow.includes("abil-ai v7.5 ultra")) {
    systemPrompt = "You are Abil-Ai v7.5 Ultra, the absolute pinnacle of the Abil-Ai suite. You synthesize thoughts instantly, providing perfect prose, exquisite codes, and brilliant creative outlines.";
  } else {
    systemPrompt = `You are ${session.model}, a helpful and delightful AI companion.`;
  }

  // Intercept image generation requests
  const imagePromptSubject = detectImageRequest(message);
  if (imagePromptSubject) {
    let enrichedPrompt = imagePromptSubject;
    let usedOfflineTranslator = false;
    const configKey = db.apiKeys.gemini || process.env.GEMINI_API_KEY;

    // Try to enrich prompt with Gemini using robust model prioritization and clean error falls-backs
    if (configKey && configKey !== "MY_GEMINI_API_KEY") {
      // Use higher quota/alternative models to maximize success rates
      const enrichCandidates = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-flash-latest",
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite"
      ];
      let hasSucceeded = false;
      for (const candidate of enrichCandidates) {
        try {
          const ai = new GoogleGenAI({
            apiKey: configKey,
            httpOptions: { headers: { "User-Agent": "aistudio-build" } }
          });
          const translationRes = await ai.models.generateContent({
            model: candidate,
            contents: `Translate and enrich the following image prompt into an extremely high-quality, highly descriptive, detailed and aesthetic English prompt for an AI image generator (Stable Diffusion). Keep it cohesive and visually rich. Output ONLY the raw final English prompt. Prompt: "${imagePromptSubject}"`
          });
          if (translationRes && translationRes.text) {
            enrichedPrompt = translationRes.text.trim().replace(/^"(.*)"$/, '$1');
            hasSucceeded = true;
            break; // Stop on first successful enrichment!
          }
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          // Keep failure logs clean and quiet for 429 Resource exhausted/quota issues
          const isQuota = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED");
          if (!isQuota) {
            console.warn(`[Image Prompt Enrich] Optional model '${candidate}' skipped due to error: ${errMsg.substring(0, 100)}...`);
          }
        }
      }
      if (!hasSucceeded) {
        // Fallback to our high-quality custom local dictionary translating tool
        enrichedPrompt = localTranslateAndEnrichPrompt(imagePromptSubject);
        usedOfflineTranslator = true;
      }
    } else {
      // No valid API key configured, use local model
      enrichedPrompt = localTranslateAndEnrichPrompt(imagePromptSubject);
      usedOfflineTranslator = true;
    }

    // Build Pollinations image URL
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enrichedPrompt)}?width=1024&height=1024&nologo=true&private=true&seed=${Math.floor(Math.random() * 100000)}`;
    
    let responseText = `🎨 **Hasil Gambar AI**\n\nSaya telah berhasil mendesain gambar berdasarkan permintaan Anda menggunakan **${session.model || 'AI Image Tool'}**!\n\n* **Permintaan Anda:** *"${imagePromptSubject}"*\n* **Prompt yang dioptimalkan:** *"${enrichedPrompt}"*\n* **Dimensi:** \`1024 x 1024 px\`\n\nBerikut adalah hasil karya seni digital Anda. Klik gambar di bawah untuk memperbesar:\n\n![${imagePromptSubject}](${imageUrl})`;

    if (usedOfflineTranslator) {
      responseText += `\n\n💡 **Catatan:** Karena kunci API Gemini gratis sedang mengalami batas kuota harian dari Google Cloud, sistem secara otomatis merujuk ke **penerjemah & pengoptimal offline lokal** kami. Hasil rancangan gambar Anda tetap beresolusi tinggi dan dioptimalkan ke bahasa Inggris secara instan!`;
    }

    // Create user message
    const userMsg = {
      id: `msg-user-${Math.random().toString(36).substring(2)}-${Date.now()}`,
      role: "user" as const,
      content: message,
      attachment: attachment || undefined,
      timestamp: new Date().toISOString()
    };
    session.messages.push(userMsg);

    // Update title
    if (session.messages.length === 1 || session.title.startsWith("Percakapan baru")) {
      session.title = message.length > 25 ? message.substring(0, 25) + "..." : message;
    }

    // Create assistant message containing the image attachment
    const aiMsg = {
      id: `msg-ai-${Math.random().toString(36).substring(2)}-${Date.now()}`,
      role: "assistant" as const,
      content: responseText,
      timestamp: new Date().toISOString(),
      attachment: {
        name: `${imagePromptSubject.substring(0, 20)}.png`,
        type: "image/png",
        dataUrl: imageUrl
      }
    };
    session.messages.push(aiMsg);

    saveDb(db);
    return res.json({ success: true, session });
  }

  // Create user message
  const userMsg = {
    id: `msg-user-${Math.random().toString(36).substring(2)}-${Date.now()}`,
    role: "user" as const,
    content: message,
    attachment: attachment || undefined,
    timestamp: new Date().toISOString()
  };
  session.messages.push(userMsg);

  // If first message, rename chat title automatically from user message
  if (session.messages.length === 1 || session.title.startsWith("Percakapan baru")) {
    session.title = message.length > 25 ? message.substring(0, 25) + "..." : message;
  }

  // LLM API Call: Let's use our server-side @google/genai SDK with process.env.GEMINI_API_KEY
  // or use the Admin-configured Gemini key if it is present.
  let aiResponseText = "";
  try {
    const configKey = db.apiKeys.gemini || process.env.GEMINI_API_KEY;
    if (configKey && configKey !== "MY_GEMINI_API_KEY") {
      const ai = new GoogleGenAI({
        apiKey: configKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      // Prepare conversation history context
      const chatHistoryPrompt = session.messages.slice(-6).map((m: any) => {
        return `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`;
      }).join("\n");

      const compiledPrompt = `${systemPrompt}\n\nChat History:\n${chatHistoryPrompt}\n\nAssistant:`;

      // Try multiple model fallbacks in case of quota limits (gemini-3.5-flash -> gemini-flash-latest -> gemini-3.1-flash-lite)
      const modelCandidates = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
      let response = null;
      let lastApiError = null;
      let usedModel = "gemini-3.5-flash";

      // Build multimodal contents block if an image is sent
      let apiContents: any = compiledPrompt;
      if (attachment && attachment.dataUrl && attachment.type.startsWith('image/')) {
        const matches = attachment.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          apiContents = [
            {
              parts: [
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                  }
                },
                {
                  text: compiledPrompt
                }
              ]
            }
          ];
        } else if (attachment.dataUrl.includes('base64,')) {
          const parts = attachment.dataUrl.split('base64,');
          apiContents = [
            {
              parts: [
                {
                  inlineData: {
                    data: parts[1],
                    mimeType: attachment.type
                  }
                },
                {
                  text: compiledPrompt
                }
              ]
            }
          ];
        }
      }

      for (const candidate of modelCandidates) {
        try {
          response = await ai.models.generateContent({
            model: candidate,
            contents: apiContents
          });
          usedModel = candidate;
          lastApiError = null;
          break; // Successfully generated content!
        } catch (err: any) {
          lastApiError = err;
          const errMessage = err.message || JSON.stringify(err) || "";
          const is429 = errMessage.includes("429") || errMessage.includes("quota") || errMessage.includes("RESOURCE_EXHAUSTED") || err.status === 429;
          if (is429) {
            console.warn(`[Gemini Fallback] Model candidate ${candidate} hit quota limit (429 RESOURCE_EXHAUSTED). Moving to next candidate...`);
          } else {
            console.warn(`[Gemini Fallback] Model candidate ${candidate} hit custom error. Status:`, err.message || err);
          }
        }
      }

      if (response) {
        aiResponseText = response.text || "Mohon maaf, saya tidak menerima respons teks yang valid dari model.";
        if (usedModel !== "gemini-3.5-flash") {
          console.log(`[Gemini Support] Successfully recovered and fell back to model candidate: ${usedModel}`);
        }
      } else if (lastApiError) {
        throw lastApiError;
      }
    } else {
      // Elegant simulated responses if no API Key is set, so the app remains fully interactive
      // and informs the admin how to configure keys.
      const indonesianIntro = `[PROTOTIPE AKTIF - MENYIMULASIKAN ${session.model}]\n\n`;
      let simulatedAttachmentAck = "";
      if (attachment) {
        simulatedAttachmentAck = `[Sistem mendeteksi lampiran berkas terunggah: **"${attachment.name}"** (${attachment.type})]\n\nSaya telah berhasil menerima lampiran foto Anda. `;
      }
      aiResponseText = indonesianIntro + simulatedAttachmentAck + await simulateResponse(session.model, message);
    }
  } catch (error: any) {
    let errString = "";
    try {
      errString = typeof error === 'object' ? JSON.stringify(error) : String(error);
    } catch (e) {
      errString = String(error);
    }
    
    // Add raw properties to string representation just in case
    if (error && typeof error === 'object') {
      errString += ` ${error.message || ""} ${error.status || ""} ${error.code || ""} ${error.statusText || ""}`;
    }

    const isQuotaExceeded = errString.includes("429") || 
                            errString.includes("quota") || 
                            errString.includes("RESOURCE_EXHAUSTED") || 
                            errString.includes("Quota exceeded") ||
                            errString.includes("limit") ||
                            errString.includes("Plan") ||
                            errString.includes("billing") ||
                            error?.status === 429 || 
                            error?.code === 429 ||
                            error?.error?.code === 429;
    
    if (isQuotaExceeded) {
      console.warn("LLM API Status Check: Gemini API Quota Exceeded (429). Falling back to smart simulation.");
      const fallbackMsg = await simulateResponse(session.model, message);
      aiResponseText = `⚠️ **[Batas Kuota Gemini Tercapai - Mode Simulasi Aktif]**\n\nShared API Key (Abil-Ai Free Tier) baru saja mencapai batas kuota harian gratis dari Google Cloud.\n\n*Anda tetap dapat berdiskusi! Berikut adalah jawaban simulasi cerdas sementara dari **${session.model}** untuk Anda:*\n\n---\n\n${fallbackMsg}\n\n---\n\n💡 **Tips:** Untuk terus menggunakan layanan tanpa batasan kuota bersama dan mendapatkan respon real-time penuh, Anda dapat memasang API Key Anda sendiri di **Panel Admin** (di bagian kanan atas halaman).`;
    } else {
      console.warn("LLM API Status Check error:", error.message || error);
      aiResponseText = `[Sistem mengalami kendala menghubungkan ke API ${session.model}]\n\nKesalahan: ${error.message || error}. Tolong pastikan Kunci API diatur dengan benar di Panel Admin!`;
    }
  }

  const aiMsg = {
    id: `msg-ai-${Math.random().toString(36).substring(2)}-${Date.now()}`,
    role: "assistant" as const,
    content: aiResponseText,
    timestamp: new Date().toISOString()
  };
  session.messages.push(aiMsg);

  saveDb(db);
  res.json({ success: true, session });
});

// Helper function to simulate realistic smart answers if key is missing/unconfigured
async function simulateResponse(model: string, userText: string): Promise<string> {
  const responses: { [key: string]: string[] } = {
    "chatgpt": [
      "Wah, pertanyaan yang luar biasa! Berdasarkan pemahaman saya, ini adalah analisis terbaik mengenai permintaan Anda...",
      "Sebagai ChatGPT, saya senang membantu Anda mengatasi tantangan ini. Mari kita selesaikan secara bertahap.",
      "Tentu saja! Berikut adalah panduan komprehensif untuk menjawab pertanyaan Anda."
    ],
    "deepseek": [
      "Menganalisis sistem logika permintaan... Menghitung parameter efisiensi...",
      "Secara struktural, masalah Anda dapat didekati dengan arsitektur program berikut. Silakan lihat baris demi baris.",
      "Kombinasi data yang sangat menarik. Berikut adalah rangkuman esensial masalah tersebut."
    ],
    "kimi": [
      "Halo! Senang sekali bisa membantu Anda hari ini. Izinkan Kimi memberikan ulasan lengkap tentang pembahasan ini.",
      "Saya paham kekhawatiran Anda. Mari kita telaah detail dokumen dan poin penting ini bersama-sama.",
      "Tentu, ini adalah simpulan komprehensif yang Kimi susun khusus untuk mempermudah pemahaman Anda."
    ],
    "grok": [
      "Oh, tantangan klasik manusia! Baiklah, ini sudut pandang Grok yang akan membuka wawasan Anda.",
      "Hehe, Anda mencari tahu hal itu? Sungguh menyenangkan berkomunikasi dengan otak yang kritis seperti Anda! Ini jawabannya.",
      "Jawaban langsung tanpa basa-basi, dibumbui dengan humor khas Grok. Nikmatilah!"
    ],
    "dola": [
      "Diterima. Berikut daftar aksi/solusi cepat:\n- Solusi Utama: Fokus pada penyelesaian alur kerja.\n- Langkah 2: Evaluasi hasil secara instan.\n- Langkah 3: Bersihkan bug.",
      "Tugas Anda dianalisis. Gunakan langkah-langkah efisiensi tinggi berikut ini...",
      "Selesai! Instruksi sudah dikelompokkan secara pragmatis sesuai kebutuhan Anda."
    ],
    "gemini": [
      "Sangat menakjubkan! Gemini menyukai eksplorasi ide semacam ini. Berikut beberapa alternatif solusi kreatif.",
      "Mari kita visualisasikan konsep ini bersama-sama agar lebih mudah dan interaktif untuk dipelajari.",
      "Sebagai Gemini, saya memadukan sains, kreativitas, dan struktur untuk memberi Anda jawaban terbaik."
    ]
  };

  const modelLow = model.toLowerCase();
  let key = "gemini";
  for (const k of Object.keys(responses)) {
    if (modelLow.includes(k)) {
      key = k;
      break;
    }
  }

  const selection = responses[key] || responses["gemini"];
  const randomIntro = selection[Math.floor(Math.random() * selection.length)];

  return `${randomIntro}\n\nAnda bertanya: "${userText}"\n\nUntuk menguji kemampuan penuh, silakan masukkan Kunci API asli (API Key) Anda di Panel Admin pojok kanan atas agar saya dapat memproses pertanyaan secara real-time dari server! Saya siap meningkatkan produktivitas harian Anda dengan performa puncak.`;
}


// ---------------- VIP REQUESTS API ----------------
app.get("/api/vip/chat", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

  const db = getDb();
  if (!db.adminChats) db.adminChats = [];
  
  let chat = db.adminChats.find((c: any) => c.email === user.email);
  if (!chat) {
    chat = { email: user.email, messages: [] };
    db.adminChats.push(chat);
    saveDb(db);
  }

  res.json({ success: true, chat });
});

app.post("/api/vip/chat", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

  const { message, attachment } = req.body;
  if (!message || message.trim() === "") {
    return res.status(400).json({ success: false, message: "Pesan tidak boleh kosong." });
  }

  const db = getDb();
  if (!db.adminChats) db.adminChats = [];

  let chat = db.adminChats.find((c: any) => c.email === user.email);
  if (!chat) {
    chat = { email: user.email, messages: [] };
    db.adminChats.push(chat);
  }

  chat.messages.push({
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    sender: 'user',
    text: message.trim(),
    attachment: attachment || undefined,
    createdAt: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, chat });
});

app.get("/api/admin/chats", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user || !user.isAdmin) return res.status(403).json({ success: false, message: "Akses ditolak." });

  const db = getDb();
  res.json({ success: true, chats: db.adminChats || [] });
});

app.post("/api/admin/chats/:email", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user || !user.isAdmin) return res.status(403).json({ success: false, message: "Akses ditolak." });

  const { email } = req.params;
  const { message, attachment } = req.body;
  if (!message || message.trim() === "") {
    return res.status(400).json({ success: false, message: "Pesan tidak boleh kosong." });
  }

  const db = getDb();
  if (!db.adminChats) db.adminChats = [];

  let chat = db.adminChats.find((c: any) => c.email === email);
  if (!chat) {
    chat = { email, messages: [] };
    db.adminChats.push(chat);
  }

  chat.messages.push({
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    sender: 'admin',
    text: message.trim(),
    attachment: attachment || undefined,
    createdAt: new Date().toISOString()
  });

  saveDb(db);
  res.json({ success: true, chat });
});

// Delete message or photo inside admin/user chat
app.delete("/api/vip/chat/message/:messageId", (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

  const { messageId } = req.params;
  const db = getDb();
  if (!db.adminChats) db.adminChats = [];

  // Find the chat session containing this message
  let chat = null;
  if (user.isAdmin) {
    chat = db.adminChats.find((c: any) => c.messages.some((m: any) => m.id === messageId));
  } else {
    chat = db.adminChats.find((c: any) => c.email === user.email);
  }

  if (!chat) {
    return res.status(404).json({ success: false, message: "Sesi chat tidak ditemukan atau tidak dapat diakses." });
  }

  const msgIndex = chat.messages.findIndex((m: any) => m.id === messageId);
  if (msgIndex === -1) {
    return res.status(404).json({ success: false, message: "Pesan tidak ditemukan." });
  }

  const targetMsg = chat.messages[msgIndex];
  // Verify ownership: non-admin can only delete their own sent user messages
  if (!user.isAdmin && targetMsg.sender !== 'user') {
    return res.status(403).json({ success: false, message: "Akses ditolak. Anda hanya bisa menghapus pesan Anda sendiri." });
  }

  // Remove the message (including texts & any loaded photo attachments)
  chat.messages.splice(msgIndex, 1);
  saveDb(db);

  res.json({ success: true, chat, message: "Pesan berhasil dieliminasi." });
});

// Global error handler for API
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled API Error:", err);
  res.status(500).json({ success: false, message: "Internal server error", error: String(err) });
});

// Start Vite server or serve production site
async function startServer() {
  // Prevent Vite from intercepting missing API routes
  app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: "API route not found at " + req.method + " " + req.path });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(process.env.PORT) || PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${Number(process.env.PORT) || PORT}`);
  });
}

startServer();
