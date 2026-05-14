import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { nanoid } from "nanoid";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const UPLOADS_DIR = path.join(__dirname, "public", "uploads");
const DB_PATH = path.join(__dirname, "data", "db.json");

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
}
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ links: [] }));
}

interface ImageLink {
  id: string;
  filename: string;
  mimetype: string;
  originalName: string;
  createdAt: string;
}

function getDb(): { links: ImageLink[] } {
  const content = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(content);
}

function saveDb(data: { links: ImageLink[] }) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${nanoid(10)}${ext}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

async function startServer() {
  const app = express();

  // API Routes
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const id = nanoid(6);
    const db = getDb();
    const newLink: ImageLink = {
      id,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      originalName: req.file.originalname,
      createdAt: new Date().toISOString(),
    };

    db.links.push(newLink);
    saveDb(db);

    const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    res.json({ 
      id, 
      url: `${baseUrl}/v/${id}`,
      directUrl: `${baseUrl}/uploads/${req.file.filename}`
    });
  });

  // Discord Embed Route
  app.get("/r/:id", (req, res) => {
    const { id } = req.params;
    const db = getDb();
    const link = db.links.find((l) => l.id === id);

    if (!link) {
      return res.status(404).send("Not found");
    }

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${baseUrl}/uploads/${link.filename}`;

    // Discord checks for these meta tags
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vault.img</title>
    
    <!-- Primary Meta Tags -->
    <meta name="title" content="Vault.img - Shared Media">
    <meta name="description" content="Click to view shared media on Vault.img">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${baseUrl}/r/${id}">
    <meta property="og:title" content="Vault.img">
    <meta property="og:description" content="View shared media">
    <meta property="og:image" content="${imageUrl}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${baseUrl}/r/${id}">
    <meta property="twitter:title" content="Vault.img">
    <meta property="twitter:description" content="View shared media">
    <meta property="twitter:image" content="${imageUrl}">

    <style>
        body { background: #0A0A0B; color: #FAF1F1; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        img { max-width: 90vw; max-height: 80vh; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); }
        .container { text-align: center; }
        a { color: #A1A1AA; text-decoration: none; margin-top: 24px; display: block; font-size: 14px; font-weight: 500; }
        a:hover { color: #FFFFFF; }
    </style>
</head>
<body>
    <div class="container">
        <img src="${imageUrl}" alt="Shared image" />
        <a href="/">Upload your own at Vault.img</a>
    </div>
</body>
</html>
    `;
    res.send(html);
  });

  // Serve static files from public (including uploads)
  app.use(express.static(path.join(__dirname, "public")));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
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
