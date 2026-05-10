import express from 'express';
import cors from 'cors';
import axios from 'axios';
import pg from 'pg';
import dotenv from 'dotenv';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// ── CLOUDINARY CONFIG ─────────────────────────────────────────
// Support both formats:
//   1. Separate vars: CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET
//   2. CLOUDINARY_URL: cloudinary://<api_key>:<api_secret>@<cloud_name>  (Railway default)

let CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
let CLOUDINARY_API_KEY    = process.env.CLOUDINARY_API_KEY    || '';
let CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

// Auto-parse CLOUDINARY_URL if individual vars are missing/placeholder
const CLOUDINARY_URL_RAW = process.env.CLOUDINARY_URL || '';
if (CLOUDINARY_URL_RAW && CLOUDINARY_URL_RAW.startsWith('cloudinary://')) {
  try {
    // Format: cloudinary://api_key:api_secret@cloud_name
    const withoutScheme = CLOUDINARY_URL_RAW.replace('cloudinary://', '');
    const atIdx = withoutScheme.lastIndexOf('@');
    if (atIdx !== -1) {
      const credentials = withoutScheme.substring(0, atIdx);       // api_key:api_secret
      const cloudName   = withoutScheme.substring(atIdx + 1);      // cloud_name
      const colonIdx    = credentials.indexOf(':');
      if (colonIdx !== -1) {
        const parsedKey    = credentials.substring(0, colonIdx);
        const parsedSecret = credentials.substring(colonIdx + 1);
        // Only override if individual vars are empty/placeholder
        if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME.includes('isi_')) CLOUDINARY_CLOUD_NAME = cloudName;
        if (!CLOUDINARY_API_KEY    || CLOUDINARY_API_KEY.includes('isi_'))    CLOUDINARY_API_KEY    = parsedKey;
        if (!CLOUDINARY_API_SECRET || CLOUDINARY_API_SECRET.includes('isi_')) CLOUDINARY_API_SECRET = parsedSecret;
        console.log('[Cloudinary] 🔑 Parsed from CLOUDINARY_URL — cloud:', cloudName);
      }
    }
  } catch (parseErr) {
    console.error('[Cloudinary] ❌ Failed to parse CLOUDINARY_URL:', parseErr.message);
  }
}

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = Boolean(
  CLOUDINARY_CLOUD_NAME && !CLOUDINARY_CLOUD_NAME.includes('isi_') &&
  CLOUDINARY_API_KEY    && !CLOUDINARY_API_KEY.includes('isi_')    &&
  CLOUDINARY_API_SECRET && !CLOUDINARY_API_SECRET.includes('isi_')
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key:    CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  console.log('[Cloudinary] ✅ Configured — cloud_name:', CLOUDINARY_CLOUD_NAME);
} else {
  console.warn('[Cloudinary] ⚠️  NOT configured. Set CLOUDINARY_URL or (CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET) in Railway Variables.');
}

// Helper: Upload buffer ke Cloudinary
function uploadToCloudinary(buffer, mimetype) {
  if (!isCloudinaryConfigured) {
    return Promise.reject(new Error('Cloudinary belum dikonfigurasi. Hubungi admin untuk mengaktifkan upload.'));
  }
  return new Promise((resolve, reject) => {
    const resourceType = mimetype === 'application/pdf' ? 'raw' : 'image';
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'portfolio', resource_type: resourceType },

      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

// ── MULTER CONFIG (memory storage — file dikirim ke Cloudinary) ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only images and PDFs allowed'));
  }
});

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Sajikan file statis dari folder 'dist' (hasil build Vite)
app.use(express.static(path.join(__dirname, 'dist')));

const PORT = process.env.PORT || 5000;
const KERNEL_PASSWORD = process.env.KERNEL_PASSWORD || 'cyber123';

// ── DATABASE CONNECTION ──────────────────────────────────────
// Priority: 1) DATABASE_URL env var  2) Neon fallback (production)  3) Local PostgreSQL (dev)
const NEON_FALLBACK = 'postgresql://neondb_owner:npg_MiQ1Xay0lDvV@ep-green-resonance-ao5mmlnc-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const isProduction = process.env.NODE_ENV === 'production';
const resolvedDbUrl = process.env.DATABASE_URL || (isProduction ? NEON_FALLBACK : null);

console.log(`[DB] Mode: ${isProduction ? 'production' : 'development'} | Using: ${resolvedDbUrl ? 'connection string (cloud)' : 'local PostgreSQL'}`);

const pool = new pg.Pool(
  resolvedDbUrl
    ? {
        connectionString: resolvedDbUrl,
        ssl: { rejectUnauthorized: false }, // required for Neon & Railway SSL
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      }
    : {
        user:     process.env.DB_USER     || process.env.PGUSER     || 'postgres',
        password: process.env.DB_PASSWORD || process.env.PGPASSWORD || 'Djokam354',
        host:     process.env.DB_HOST     || process.env.PGHOST     || 'localhost',
        port:     parseInt(process.env.DB_PORT || process.env.PGPORT || '5432'),
        database: process.env.DB_NAME     || process.env.PGDATABASE || 'portofolio_db',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      }
);

async function initDB() {
  const queries = [
    `DROP TABLE IF EXISTS visitor_logs`, // Force reset to fix schema mismatch
    `CREATE TABLE IF NOT EXISTS visitor_logs (
      id SERIAL PRIMARY KEY, ip VARCHAR(45) NOT NULL, city VARCHAR(100),
      country VARCHAR(100), lat DECIMAL(10,8), lon DECIMAL(11,8),
      user_agent TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY, title VARCHAR(200) NOT NULL, description TEXT,
      tech_stack VARCHAR(500), image_url VARCHAR(500), image_url_2 VARCHAR(500), image_url_3 VARCHAR(500),
      github_url VARCHAR(500), live_url VARCHAR(500), label VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url_2 VARCHAR(500)`,
    `ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url_3 VARCHAR(500)`,
    `CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, category VARCHAR(100),
      icon_key VARCHAR(100), level INTEGER DEFAULT 80,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS certifications (
      id SERIAL PRIMARY KEY, name VARCHAR(300) NOT NULL, issuer VARCHAR(200),
      issued_date VARCHAR(50), pdf_url VARCHAR(500), image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS experiences (
      id SERIAL PRIMARY KEY, title VARCHAR(300) NOT NULL, date VARCHAR(100),
      description TEXT, link_url VARCHAR(500), image_url VARCHAR(500),
      image_url_2 VARCHAR(500), image_url_3 VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE experiences ADD COLUMN IF NOT EXISTS image_url_2 VARCHAR(500)`,
    `ALTER TABLE experiences ADD COLUMN IF NOT EXISTS image_url_3 VARCHAR(500)`,
    `CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY, email VARCHAR(300) NOT NULL, content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS osint_scans (
      id SERIAL PRIMARY KEY,
      full_name   VARCHAR(300) NOT NULL,
      ip          VARCHAR(45),
      found_count INTEGER DEFAULT 0,
      platforms   JSONB,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];
  for (const q of queries) {
    try { await pool.query(q); } catch (err) { console.error('DB init error:', err.message); }
  }

  console.log('Database tables ensured.');
}
initDB();

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Portofolio API Server is running', version: '1.0.0' });
});

// ── DEBUG: Check environment config (no secrets exposed) ──────
app.get('/api/status', (req, res) => {
  res.json({
    server_version: '2.0',
    node_env: process.env.NODE_ENV || 'not set',
    cloudinary: {
      configured: isCloudinaryConfigured,
      cloud_name: CLOUDINARY_CLOUD_NAME || 'NOT_SET',
      api_key_set: CLOUDINARY_API_KEY ? `SET (${CLOUDINARY_API_KEY.length} chars, starts: ${CLOUDINARY_API_KEY.substring(0,4)}...)` : 'NOT_SET',
      api_secret_set: CLOUDINARY_API_SECRET ? `SET (${CLOUDINARY_API_SECRET.length} chars)` : 'NOT_SET',
      cloudinary_url_env: process.env.CLOUDINARY_URL ? `SET (${process.env.CLOUDINARY_URL.length} chars)` : 'NOT_SET',
      raw_cloud_name_env: process.env.CLOUDINARY_CLOUD_NAME || 'NOT_SET',
      raw_api_key_env: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT_SET',
      raw_api_secret_env: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT_SET',
    },
    database: {
      url_set: !!process.env.DATABASE_URL,
    }
  });
});

app.post('/api/breach', async (req, res) => {
  try {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    // Normalize IPv6 localhost
    if (ip && ip.includes('::ffff:')) ip = ip.split('::ffff:')[1];

    // If local/private IP, resolve real public IP via ipify
    const isLocal = !ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.') || ip.startsWith('10.');
    if (isLocal) {
      try {
        const ipRes = await axios.get('https://api.ipify.org?format=json', { timeout: 4000 });
        ip = ipRes.data.ip;
      } catch {
        ip = 'Unresolved';
      }
    }

    const { data } = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,city,lat,lon,query`, { timeout: 5000 });
    
    const clientIp = data.query || ip || 'Unknown';
    const city = data.city || 'Unknown';
    const country = data.country || 'Unknown';

    // Prioritaskan koordinat dari request body jika dikirimkan (dari Firefox Geolocation)
    const bodyLat = Number(req.body.lat);
    const bodyLon = Number(req.body.lon);

    const lat = (!isNaN(bodyLat) && bodyLat !== 0) ? bodyLat : (data.lat || 0);
    const lon = (!isNaN(bodyLon) && bodyLon !== 0) ? bodyLon : (data.lon || 0);

    let userAgent = req.headers['user-agent'] || 'Unknown Agent';
    if (req.body.source === 'firefox_esr') {
      userAgent = `[FIREFOX_OSINT] ${userAgent}`;
    }
    const safeLat = isNaN(Number(lat)) ? 0 : Number(lat);
    const safeLon = isNaN(Number(lon)) ? 0 : Number(lon);

    try {
      console.log(`[DB_INSERT] Attempting to log intruder: ${clientIp} (${city}, ${country})`);
      const insertQuery = `INSERT INTO visitor_logs (ip, city, country, lat, lon, user_agent) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
      const resDb = await pool.query(insertQuery, [clientIp, city, country, safeLat, safeLon, userAgent]);
      console.log(`[DB_INSERT] SUCCESS: New log ID ${resDb.rows[0].id}`);
    } catch (dbErr) {
      console.error('[DB_INSERT] FAILED:', dbErr.message);
    }
    
    res.json({ success: true, message: "Operative logged.", data: { ip: clientIp, city, country } });
  } catch (error) {
    console.error("[TRACHING_CRITICAL_FAIL]:", error.message);
    res.status(500).json({ success: false, error: "Tracking failed" });
  }
});

// ── FILE UPLOAD API (Cloudinary) ─────────────────────────────
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  // Early check: Cloudinary not configured
  if (!isCloudinaryConfigured) {
    console.warn('[UPLOAD] Cloudinary not configured — rejecting upload request');
    return res.status(500).json({
      error: 'Cloudinary belum dikonfigurasi. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET di Railway Environment Variables.',
      code: 'CLOUDINARY_NOT_CONFIGURED'
    });
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    res.json({ url: result.secure_url, filename: result.public_id });
  } catch (err) {
    console.error('[CLOUDINARY_UPLOAD_ERROR]', err.message);
    res.status(500).json({ error: 'Upload ke Cloudinary gagal: ' + err.message, code: 'CLOUDINARY_UPLOAD_FAILED' });
  }
});

app.post('/v1/kernel-access/login', (req, res) => {
  const { password } = req.body;
  if (password === KERNEL_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "ACCESS DENIED" });
  }
});

app.get('/v1/kernel-access/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitor_logs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// ── PROJECTS CRUD ──────────────────────────────────────────────
app.get('/api/projects', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
  res.json(rows);
});
app.post('/api/projects', async (req, res) => {
  const { title, description, tech_stack, image_url, image_url_2, image_url_3, github_url, live_url, label } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO projects (title,description,tech_stack,image_url,image_url_2,image_url_3,github_url,live_url,label) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
    [title, description, tech_stack, image_url, image_url_2, image_url_3, github_url, live_url, label]
  );
  res.json(rows[0]);
});
app.put('/api/projects/:id', async (req, res) => {
  const { title, description, tech_stack, image_url, image_url_2, image_url_3, github_url, live_url, label } = req.body;
  const { rows } = await pool.query(
    'UPDATE projects SET title=$1,description=$2,tech_stack=$3,image_url=$4,image_url_2=$5,image_url_3=$6,github_url=$7,live_url=$8,label=$9 WHERE id=$10 RETURNING *',
    [title, description, tech_stack, image_url, image_url_2, image_url_3, github_url, live_url, label, req.params.id]
  );
  res.json(rows[0]);
});
app.delete('/api/projects/:id', async (req, res) => {
  await pool.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// ── SKILLS CRUD ────────────────────────────────────────────────
app.get('/api/skills', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM skills ORDER BY created_at DESC');
  res.json(rows);
});
app.post('/api/skills', async (req, res) => {
  const { name, category, icon_key, level } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO skills (name,category,icon_key,level) VALUES($1,$2,$3,$4) RETURNING *',
    [name, category, icon_key, level || 80]
  );
  res.json(rows[0]);
});
app.put('/api/skills/:id', async (req, res) => {
  const { name, category, icon_key, level } = req.body;
  const { rows } = await pool.query(
    'UPDATE skills SET name=$1,category=$2,icon_key=$3,level=$4 WHERE id=$5 RETURNING *',
    [name, category, icon_key, level, req.params.id]
  );
  res.json(rows[0]);
});
app.delete('/api/skills/:id', async (req, res) => {
  await pool.query('DELETE FROM skills WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// ── CERTIFICATIONS CRUD ────────────────────────────────────────
app.get('/api/certifications', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM certifications ORDER BY created_at DESC');
  res.json(rows);
});
app.post('/api/certifications', async (req, res) => {
  const { name, issuer, issued_date, pdf_url, image_url } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO certifications (name,issuer,issued_date,pdf_url,image_url) VALUES($1,$2,$3,$4,$5) RETURNING *',
    [name, issuer, issued_date, pdf_url, image_url]
  );
  res.json(rows[0]);
});
app.put('/api/certifications/:id', async (req, res) => {
  const { name, issuer, issued_date, pdf_url, image_url } = req.body;
  const { rows } = await pool.query(
    'UPDATE certifications SET name=$1,issuer=$2,issued_date=$3,pdf_url=$4,image_url=$5 WHERE id=$6 RETURNING *',
    [name, issuer, issued_date, pdf_url, image_url, req.params.id]
  );
  res.json(rows[0]);
});
app.delete('/api/certifications/:id', async (req, res) => {
  await pool.query('DELETE FROM certifications WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// ── EXPERIENCES CRUD ───────────────────────────────────────────
app.get('/api/experiences', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM experiences ORDER BY created_at DESC');
  res.json(rows);
});
app.post('/api/experiences', async (req, res) => {
  const { title, date, description, link_url, image_url, image_url_2, image_url_3 } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO experiences (title,date,description,link_url,image_url,image_url_2,image_url_3) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [title, date, description, link_url, image_url, image_url_2, image_url_3]
  );
  res.json(rows[0]);
});
app.put('/api/experiences/:id', async (req, res) => {
  const { title, date, description, link_url, image_url, image_url_2, image_url_3 } = req.body;
  const { rows } = await pool.query(
    'UPDATE experiences SET title=$1,date=$2,description=$3,link_url=$4,image_url=$5,image_url_2=$6,image_url_3=$7 WHERE id=$8 RETURNING *',
    [title, date, description, link_url, image_url, image_url_2, image_url_3, req.params.id]
  );
  res.json(rows[0]);
});
app.delete('/api/experiences/:id', async (req, res) => {
  await pool.query('DELETE FROM experiences WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// ── MESSAGES CRUD ──────────────────────────────────────────────
app.get('/api/messages', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
  res.json(rows);
});
app.post('/api/messages', async (req, res) => {
  const { email, content } = req.body;
  if (!email || !content) return res.status(400).json({ error: 'Email and content required' });
  const { rows } = await pool.query(
    'INSERT INTO messages (email, content) VALUES($1, $2) RETURNING *',
    [email, content]
  );
  res.json(rows[0]);
});
app.delete('/api/messages/:id', async (req, res) => {
  await pool.query('DELETE FROM messages WHERE id=$1', [req.params.id]);
  res.json({ success: true });
});

// ── OSINT NAME SEARCH — RATE LIMIT CHECK ──────────────────────
app.get('/api/osint/rate-check', async (req, res) => {
  const DAILY_LIMIT = parseInt(process.env.OSINT_DAILY_LIMIT || '3');
  let ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '0.0.0.0';
  if (ip.includes('::ffff:')) ip = ip.split('::ffff:')[1];

  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS cnt FROM osint_scans
       WHERE ip = $1 AND created_at >= CURRENT_DATE`,
      [ip]
    );
    const used = parseInt(rows[0].cnt);
    res.json({ ip, used, limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - used), allowed: used < DAILY_LIMIT });
  } catch (err) {
    res.json({ ip, used: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT, allowed: true });
  }
});

// ── OSINT NAME SEARCH — MAIN ENDPOINT ─────────────────────────
// Uses Apify Social Media Finder actor + static platform link generation
app.post('/api/osint/scan', async (req, res) => {
  const { full_name } = req.body;
  if (!full_name || full_name.trim().length < 2) {
    return res.status(400).json({ error: 'Nama lengkap minimal 2 karakter' });
  }

  const name = full_name.trim();
  const DAILY_LIMIT = parseInt(process.env.OSINT_DAILY_LIMIT || '3');
  const APIFY_TOKEN = process.env.APIFY_TOKEN || '';

  // ── Resolve client IP ──
  let ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '0.0.0.0';
  if (ip.includes('::ffff:')) ip = ip.split('::ffff:')[1];

  // ── Rate limit check (3 scans per IP per day) ──
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS cnt FROM osint_scans WHERE ip = $1 AND created_at >= CURRENT_DATE`,
      [ip]
    );
    const used = parseInt(rows[0].cnt);
    if (used >= DAILY_LIMIT) {
      return res.status(429).json({
        error: `Rate limit tercapai. IP ${ip} sudah melakukan ${used}/${DAILY_LIMIT} scan hari ini. Coba lagi besok.`,
        code: 'RATE_LIMIT',
        used, limit: DAILY_LIMIT
      });
    }
  } catch (_) { /* allow if rate check fails */ }

  // ── Generate username variants from name ──
  const nameLower   = name.toLowerCase().replace(/\s+/g, '');
  const nameHyphen  = name.toLowerCase().replace(/\s+/g, '-');
  const nameUnderscore = name.toLowerCase().replace(/\s+/g, '_');
  const nameDot     = name.toLowerCase().replace(/\s+/g, '.');
  const nameEncoded = encodeURIComponent(name);

  // ── Static platform link generation (always available, no API key needed) ──
  const PLATFORM_LINKS = [
    // Social
    { platform: 'Instagram',  category: 'Social',       url: `https://www.instagram.com/${nameLower}/`,                  icon: '📸' },
    { platform: 'Facebook',   category: 'Social',       url: `https://www.facebook.com/search/people/?q=${nameEncoded}`, icon: '👤' },
    { platform: 'Twitter/X',  category: 'Social',       url: `https://twitter.com/search?q=${nameEncoded}&f=user`,       icon: '🐦' },
    { platform: 'TikTok',     category: 'Social',       url: `https://www.tiktok.com/@${nameLower}`,                    icon: '🎵' },
    { platform: 'YouTube',    category: 'Social',       url: `https://www.youtube.com/@${nameLower}`,                   icon: '▶️'  },
    { platform: 'Snapchat',   category: 'Social',       url: `https://www.snapchat.com/add/${nameLower}`,               icon: '👻' },
    // Professional
    { platform: 'LinkedIn',   category: 'Professional', url: `https://www.linkedin.com/search/results/people/?keywords=${nameEncoded}`, icon: '💼' },
    { platform: 'GitHub',     category: 'Developer',    url: `https://github.com/${nameLower}`,                         icon: '🐙' },
    { platform: 'GitLab',     category: 'Developer',    url: `https://gitlab.com/${nameLower}`,                         icon: '🦊' },
    // Forums & Communities
    { platform: 'Reddit',     category: 'Community',    url: `https://www.reddit.com/search/?q=${nameEncoded}&type=user`, icon: '🤖' },
    { platform: 'Medium',     category: 'Blog',         url: `https://medium.com/@${nameLower}`,                        icon: '✍️'  },
    { platform: 'Tumblr',     category: 'Blog',         url: `https://www.tumblr.com/${nameLower}`,                     icon: '📝' },
    { platform: 'Pinterest',  category: 'Social',       url: `https://www.pinterest.com/${nameLower}/`,                 icon: '📌' },
    // Asia-focused
    { platform: 'Line',       category: 'Messaging',    url: `https://timeline.line.me/user/_${nameLower}`,             icon: '💬' },
    { platform: 'Telegram',   category: 'Messaging',    url: `https://t.me/${nameLower}`,                               icon: '✈️'  },
    // Cybersec / Tech
    { platform: 'HackTheBox', category: 'CyberSec',     url: `https://app.hackthebox.com/users/search?term=${nameEncoded}`, icon: '🟩' },
    { platform: 'TryHackMe',  category: 'CyberSec',     url: `https://tryhackme.com/p/${nameLower}`,                   icon: '🔐' },
    { platform: 'LeetCode',   category: 'Developer',    url: `https://leetcode.com/${nameLower}/`,                      icon: '⚡' },
    { platform: 'Steam',      category: 'Gaming',       url: `https://steamcommunity.com/search/users/#text=${nameEncoded}`, icon: '🎮' },
    { platform: 'Keybase',    category: 'Privacy',      url: `https://keybase.io/${nameLower}`,                         icon: '🔑' },
  ];

  // ── Call Apify Social Media Finder (if token available) ──
  let apifyResults = [];
  let apifyActive  = false;
  if (APIFY_TOKEN) {
    try {
      const apifyRes = await axios.post(
        `https://api.apify.com/v2/acts/tri_angle~social-media-finder/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=25`,
        { profileNames: [name], socials: ['instagram','twitter','linkedin','github','tiktok','youtube','facebook'] },
        { timeout: 30000, headers: { 'Content-Type': 'application/json' } }
      );
      if (Array.isArray(apifyRes.data)) {
        apifyResults = apifyRes.data.filter(r => r.url || r.profileUrl);
        apifyActive  = true;
      }
    } catch (e) {
      console.log('[APIFY] Not available or timed out:', e.message);
    }
  }

  // Merge Apify results into platforms (mark as 'verified' if found by Apify)
  const platformsData = PLATFORM_LINKS.map(p => {
    const apifyMatch = apifyResults.find(a =>
      (a.platform || '').toLowerCase().includes(p.platform.toLowerCase().split('/')[0].toLowerCase()) ||
      (a.url || '').toLowerCase().includes(p.platform.toLowerCase().split('/')[0].toLowerCase())
    );
    return {
      ...p,
      verified: !!apifyMatch,
      apifyUrl: apifyMatch?.url || apifyMatch?.profileUrl || null,
    };
  });

  const foundCount = apifyActive ? apifyResults.length : 0;

  // ── Save to DB (only name + ip + metadata) ──
  let savedRow = null;
  try {
    const { rows } = await pool.query(
      `INSERT INTO osint_scans (full_name, ip, found_count, platforms) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, ip, foundCount, JSON.stringify(platformsData)]
    );
    savedRow = rows[0];
  } catch (dbErr) {
    console.error('[OSINT_DB_INSERT] FAILED:', dbErr.message);
  }

  // ── Compute remaining scans ──
  let remaining = DAILY_LIMIT;
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS cnt FROM osint_scans WHERE ip = $1 AND created_at >= CURRENT_DATE`, [ip]
    );
    remaining = Math.max(0, DAILY_LIMIT - parseInt(rows[0].cnt));
  } catch (_) {}

  res.json({
    success:    true,
    id:         savedRow?.id,
    full_name:  name,
    ip,
    found_count: foundCount,
    apify_active: apifyActive,
    remaining_today: remaining,
    limit: DAILY_LIMIT,
    platforms:  platformsData,
    username_variants: { slug: nameLower, hyphen: nameHyphen, underscore: nameUnderscore, dot: nameDot },
  });
});

// ── OSINT SCANS LOG (Admin) ────────────────────────────────────
app.get('/api/osint/scans', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, full_name, ip, found_count, created_at FROM osint_scans ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch OSINT scans' });
  }
});

app.delete('/api/osint/scans/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM osint_scans WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete scan' });
  }
});

// Routing Catch-all untuk SPA: Kirim semua request yang bukan API ke index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log(`Backend server running on http://0.0.0.0:${PORT}`));


