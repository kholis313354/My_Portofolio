// ── Pure helper functions extracted from server.js ────────────────
// These contain the core business logic of the backend and are kept
// side-effect free so they can be unit tested in isolation.

// A value is considered a placeholder if it is empty or still contains
// the Indonesian "isi_" ("fill in") template marker used in .env samples.
export function isPlaceholder(value) {
  return !value || value.includes('isi_');
}

// Parse a Railway-style CLOUDINARY_URL of the form
//   cloudinary://<api_key>:<api_secret>@<cloud_name>
// Returns { cloudName, apiKey, apiSecret } or null when it cannot be parsed.
export function parseCloudinaryUrl(rawUrl) {
  if (!rawUrl || !rawUrl.startsWith('cloudinary://')) return null;

  const withoutScheme = rawUrl.replace('cloudinary://', '');
  const atIdx = withoutScheme.lastIndexOf('@');
  if (atIdx === -1) return null;

  const credentials = withoutScheme.substring(0, atIdx); // api_key:api_secret
  const cloudName = withoutScheme.substring(atIdx + 1); // cloud_name
  const colonIdx = credentials.indexOf(':');
  if (colonIdx === -1) return null;

  const apiKey = credentials.substring(0, colonIdx);
  const apiSecret = credentials.substring(colonIdx + 1);
  if (!apiKey || !apiSecret || !cloudName) return null;

  return { cloudName, apiKey, apiSecret };
}

// Resolve the final Cloudinary configuration from an env-like object,
// merging separate vars with anything parsed from CLOUDINARY_URL.
// Returns { cloudName, apiKey, apiSecret, configured }.
export function resolveCloudinaryConfig(env = {}) {
  let cloudName = env.CLOUDINARY_CLOUD_NAME || '';
  let apiKey = env.CLOUDINARY_API_KEY || '';
  let apiSecret = env.CLOUDINARY_API_SECRET || '';

  const parsed = parseCloudinaryUrl(env.CLOUDINARY_URL || '');
  if (parsed) {
    if (isPlaceholder(cloudName)) cloudName = parsed.cloudName;
    if (isPlaceholder(apiKey)) apiKey = parsed.apiKey;
    if (isPlaceholder(apiSecret)) apiSecret = parsed.apiSecret;
  }

  const configured = Boolean(
    cloudName && !cloudName.includes('isi_') &&
    apiKey && !apiKey.includes('isi_') &&
    apiSecret && !apiSecret.includes('isi_')
  );

  return { cloudName, apiKey, apiSecret, configured };
}

// Map a mimetype to the Cloudinary resource_type ('raw' for PDFs, else 'image').
export function cloudinaryResourceType(mimetype) {
  return mimetype === 'application/pdf' ? 'raw' : 'image';
}

// Multer fileFilter logic: only images and PDFs are accepted, checked by
// both file extension and mimetype.
const UPLOAD_ALLOWED = /jpeg|jpg|png|gif|webp|pdf/;
export function isAllowedUpload(originalname, mimetype) {
  const ext = UPLOAD_ALLOWED.test(String(originalname).toLowerCase());
  const mime = UPLOAD_ALLOWED.test(String(mimetype).toLowerCase());
  return ext && mime;
}

// Strip the IPv6-mapped IPv4 prefix ("::ffff:") from an address.
export function normalizeIp(ip) {
  if (ip && ip.includes('::ffff:')) return ip.split('::ffff:')[1];
  return ip;
}

// Resolve the client IP from request headers/socket. Honours the first
// entry of x-forwarded-for, falling back to the socket remote address.
export function resolveClientIp(headers = {}, socket = {}, fallback = '0.0.0.0') {
  const forwarded = headers['x-forwarded-for'];
  let ip = forwarded?.split(',')[0].trim() || socket.remoteAddress || fallback;
  return normalizeIp(ip);
}

// Determine whether an IP is a loopback / private / unresolved address.
export function isLocalIp(ip) {
  return (
    !ip ||
    ip === '::1' ||
    ip.startsWith('127.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.')
  );
}

// Coerce a value to a finite number, returning 0 for NaN.
export function safeNumber(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

// Choose a coordinate: prefer a non-zero value from the request body,
// otherwise fall back to the geo-lookup value (then 0).
export function pickCoordinate(bodyValue, lookupValue) {
  const body = Number(bodyValue);
  if (!isNaN(body) && body !== 0) return body;
  return lookupValue || 0;
}

// Generate username variants from a full name.
export function generateUsernameVariants(name) {
  const trimmed = String(name).trim();
  const lower = trimmed.toLowerCase();
  return {
    slug: lower.replace(/\s+/g, ''),
    hyphen: lower.replace(/\s+/g, '-'),
    underscore: lower.replace(/\s+/g, '_'),
    dot: lower.replace(/\s+/g, '.'),
    encoded: encodeURIComponent(trimmed),
  };
}

// Build the static list of OSINT platform links for a given name.
export function buildPlatformLinks(name) {
  const { slug: nameLower, encoded: nameEncoded } = generateUsernameVariants(name);
  return [
    { platform: 'Instagram', category: 'Social', url: `https://www.instagram.com/${nameLower}/`, icon: '📸' },
    { platform: 'Facebook', category: 'Social', url: `https://www.facebook.com/search/people/?q=${nameEncoded}`, icon: '👤' },
    { platform: 'Twitter/X', category: 'Social', url: `https://twitter.com/search?q=${nameEncoded}&f=user`, icon: '🐦' },
    { platform: 'TikTok', category: 'Social', url: `https://www.tiktok.com/@${nameLower}`, icon: '🎵' },
    { platform: 'YouTube', category: 'Social', url: `https://www.youtube.com/@${nameLower}`, icon: '▶️' },
    { platform: 'Snapchat', category: 'Social', url: `https://www.snapchat.com/add/${nameLower}`, icon: '👻' },
    { platform: 'LinkedIn', category: 'Professional', url: `https://www.linkedin.com/search/results/people/?keywords=${nameEncoded}`, icon: '💼' },
    { platform: 'GitHub', category: 'Developer', url: `https://github.com/${nameLower}`, icon: '🐙' },
    { platform: 'GitLab', category: 'Developer', url: `https://gitlab.com/${nameLower}`, icon: '🦊' },
    { platform: 'Reddit', category: 'Community', url: `https://www.reddit.com/search/?q=${nameEncoded}&type=user`, icon: '🤖' },
    { platform: 'Medium', category: 'Blog', url: `https://medium.com/@${nameLower}`, icon: '✍️' },
    { platform: 'Tumblr', category: 'Blog', url: `https://www.tumblr.com/${nameLower}`, icon: '📝' },
    { platform: 'Pinterest', category: 'Social', url: `https://www.pinterest.com/${nameLower}/`, icon: '📌' },
    { platform: 'Line', category: 'Messaging', url: `https://timeline.line.me/user/_${nameLower}`, icon: '💬' },
    { platform: 'Telegram', category: 'Messaging', url: `https://t.me/${nameLower}`, icon: '✈️' },
    { platform: 'HackTheBox', category: 'CyberSec', url: `https://app.hackthebox.com/users/search?term=${nameEncoded}`, icon: '🟩' },
    { platform: 'TryHackMe', category: 'CyberSec', url: `https://tryhackme.com/p/${nameLower}`, icon: '🔐' },
    { platform: 'LeetCode', category: 'Developer', url: `https://leetcode.com/${nameLower}/`, icon: '⚡' },
    { platform: 'Steam', category: 'Gaming', url: `https://steamcommunity.com/search/users/#text=${nameEncoded}`, icon: '🎮' },
    { platform: 'Keybase', category: 'Privacy', url: `https://keybase.io/${nameLower}`, icon: '🔑' },
  ];
}

// Merge Apify results into the static platform list, marking verified matches.
export function mergePlatformsWithApify(platformLinks, apifyResults = []) {
  return platformLinks.map((p) => {
    const key = p.platform.toLowerCase().split('/')[0].toLowerCase();
    const apifyMatch = apifyResults.find(
      (a) =>
        (a.platform || '').toLowerCase().includes(key) ||
        (a.url || '').toLowerCase().includes(key)
    );
    return {
      ...p,
      verified: !!apifyMatch,
      apifyUrl: apifyMatch?.url || apifyMatch?.profileUrl || null,
    };
  });
}

// Count total findings from active Apify + Google results.
export function computeFoundCount(apifyActive, apifyResults = [], googleResults = []) {
  return (apifyActive ? apifyResults.length : 0) + googleResults.length;
}

// Validate the OSINT scan full_name input. Returns { valid, name, error }.
export function validateFullName(fullName) {
  if (!fullName || String(fullName).trim().length < 2) {
    return { valid: false, name: '', error: 'Nama lengkap minimal 2 karakter' };
  }
  return { valid: true, name: String(fullName).trim(), error: null };
}

// Parse the OSINT daily limit from an env value, defaulting to 3.
export function parseDailyLimit(value, fallback = 3) {
  const n = parseInt(value, 10);
  return isNaN(n) ? fallback : n;
}

// Compute rate-limit state for a given used count and limit.
export function computeRateLimit(used, limit) {
  const usedNum = parseInt(used, 10) || 0;
  return {
    used: usedNum,
    limit,
    remaining: Math.max(0, limit - usedNum),
    allowed: usedNum < limit,
  };
}

// Resolve the database configuration object passed to pg.Pool.
export function resolveDbConfig(env = {}) {
  const isProduction = env.NODE_ENV === 'production';
  const NEON_FALLBACK =
    'postgresql://neondb_owner:npg_MiQ1Xay0lDvV@ep-green-resonance-ao5mmlnc-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  const resolvedDbUrl = env.DATABASE_URL || (isProduction ? NEON_FALLBACK : null);

  const common = { max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 };

  if (resolvedDbUrl) {
    return {
      usingConnectionString: true,
      config: { connectionString: resolvedDbUrl, ssl: { rejectUnauthorized: false }, ...common },
    };
  }

  return {
    usingConnectionString: false,
    config: {
      user: env.DB_USER || env.PGUSER || 'postgres',
      password: env.DB_PASSWORD || env.PGPASSWORD || 'Djokam354',
      host: env.DB_HOST || env.PGHOST || 'localhost',
      port: parseInt(env.DB_PORT || env.PGPORT || '5432', 10),
      database: env.DB_NAME || env.PGDATABASE || 'portofolio_db',
      ...common,
    },
  };
}
