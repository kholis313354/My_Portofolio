import { describe, it, expect } from 'vitest';
import {
  isPlaceholder,
  parseCloudinaryUrl,
  resolveCloudinaryConfig,
  cloudinaryResourceType,
  isAllowedUpload,
  normalizeIp,
  resolveClientIp,
  isLocalIp,
  safeNumber,
  pickCoordinate,
  generateUsernameVariants,
  buildPlatformLinks,
  mergePlatformsWithApify,
  computeFoundCount,
  validateFullName,
  parseDailyLimit,
  computeRateLimit,
  resolveDbConfig,
} from '../lib/utils.js';

describe('isPlaceholder', () => {
  it('treats empty/undefined values as placeholders', () => {
    expect(isPlaceholder('')).toBe(true);
    expect(isPlaceholder(undefined)).toBe(true);
    expect(isPlaceholder(null)).toBe(true);
  });

  it('treats "isi_" template markers as placeholders', () => {
    expect(isPlaceholder('isi_cloud_name')).toBe(true);
  });

  it('accepts real values', () => {
    expect(isPlaceholder('real-cloud')).toBe(false);
  });
});

describe('parseCloudinaryUrl', () => {
  it('parses a valid cloudinary URL', () => {
    expect(parseCloudinaryUrl('cloudinary://key123:secret456@mycloud')).toEqual({
      cloudName: 'mycloud',
      apiKey: 'key123',
      apiSecret: 'secret456',
    });
  });

  it('handles secrets containing colons via lastIndexOf on @', () => {
    const parsed = parseCloudinaryUrl('cloudinary://key:sec:ret@cloud');
    expect(parsed).toEqual({ cloudName: 'cloud', apiKey: 'key', apiSecret: 'sec:ret' });
  });

  it('returns null for non-cloudinary or empty input', () => {
    expect(parseCloudinaryUrl('')).toBeNull();
    expect(parseCloudinaryUrl('https://example.com')).toBeNull();
    expect(parseCloudinaryUrl(undefined)).toBeNull();
  });

  it('returns null when the @ separator is missing', () => {
    expect(parseCloudinaryUrl('cloudinary://key:secret')).toBeNull();
  });

  it('returns null when the credentials colon is missing', () => {
    expect(parseCloudinaryUrl('cloudinary://keyonly@cloud')).toBeNull();
  });

  it('returns null when a component is empty', () => {
    expect(parseCloudinaryUrl('cloudinary://:secret@cloud')).toBeNull();
    expect(parseCloudinaryUrl('cloudinary://key:@cloud')).toBeNull();
  });
});

describe('resolveCloudinaryConfig', () => {
  it('uses separate vars when provided', () => {
    const cfg = resolveCloudinaryConfig({
      CLOUDINARY_CLOUD_NAME: 'c',
      CLOUDINARY_API_KEY: 'k',
      CLOUDINARY_API_SECRET: 's',
    });
    expect(cfg).toEqual({ cloudName: 'c', apiKey: 'k', apiSecret: 's', configured: true });
  });

  it('falls back to CLOUDINARY_URL when separate vars are missing', () => {
    const cfg = resolveCloudinaryConfig({
      CLOUDINARY_URL: 'cloudinary://k:s@c',
    });
    expect(cfg).toEqual({ cloudName: 'c', apiKey: 'k', apiSecret: 's', configured: true });
  });

  it('overrides placeholder separate vars with parsed URL values', () => {
    const cfg = resolveCloudinaryConfig({
      CLOUDINARY_CLOUD_NAME: 'isi_cloud',
      CLOUDINARY_API_KEY: 'isi_key',
      CLOUDINARY_API_SECRET: 'isi_secret',
      CLOUDINARY_URL: 'cloudinary://realk:reals@realc',
    });
    expect(cfg).toEqual({ cloudName: 'realc', apiKey: 'realk', apiSecret: 'reals', configured: true });
  });

  it('reports not configured when nothing is set', () => {
    expect(resolveCloudinaryConfig({}).configured).toBe(false);
  });

  it('reports not configured when values are placeholders', () => {
    const cfg = resolveCloudinaryConfig({
      CLOUDINARY_CLOUD_NAME: 'isi_c',
      CLOUDINARY_API_KEY: 'isi_k',
      CLOUDINARY_API_SECRET: 'isi_s',
    });
    expect(cfg.configured).toBe(false);
  });

  it('defaults to empty env object', () => {
    expect(resolveCloudinaryConfig().configured).toBe(false);
  });
});

describe('cloudinaryResourceType', () => {
  it('returns raw for PDFs', () => {
    expect(cloudinaryResourceType('application/pdf')).toBe('raw');
  });

  it('returns image for everything else', () => {
    expect(cloudinaryResourceType('image/png')).toBe('image');
    expect(cloudinaryResourceType('image/jpeg')).toBe('image');
    expect(cloudinaryResourceType(undefined)).toBe('image');
  });
});

describe('isAllowedUpload', () => {
  it('accepts allowed image/pdf types with matching extension and mimetype', () => {
    expect(isAllowedUpload('photo.PNG', 'image/png')).toBe(true);
    expect(isAllowedUpload('doc.pdf', 'application/pdf')).toBe(true);
    expect(isAllowedUpload('anim.gif', 'image/gif')).toBe(true);
    expect(isAllowedUpload('pic.webp', 'image/webp')).toBe(true);
  });

  it('rejects when extension is disallowed', () => {
    expect(isAllowedUpload('malware.exe', 'application/octet-stream')).toBe(false);
  });

  it('rejects when mimetype does not match', () => {
    expect(isAllowedUpload('photo.png', 'text/plain')).toBe(false);
  });
});

describe('normalizeIp', () => {
  it('strips the IPv6-mapped IPv4 prefix', () => {
    expect(normalizeIp('::ffff:192.168.1.1')).toBe('192.168.1.1');
  });

  it('leaves plain IPs untouched', () => {
    expect(normalizeIp('8.8.8.8')).toBe('8.8.8.8');
  });

  it('handles falsy input', () => {
    expect(normalizeIp('')).toBe('');
    expect(normalizeIp(undefined)).toBeUndefined();
  });
});

describe('resolveClientIp', () => {
  it('uses the first x-forwarded-for entry', () => {
    expect(resolveClientIp({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }, {})).toBe('1.2.3.4');
  });

  it('normalizes an IPv6-mapped forwarded IP', () => {
    expect(resolveClientIp({ 'x-forwarded-for': '::ffff:9.9.9.9' }, {})).toBe('9.9.9.9');
  });

  it('falls back to socket.remoteAddress', () => {
    expect(resolveClientIp({}, { remoteAddress: '10.0.0.1' })).toBe('10.0.0.1');
  });

  it('falls back to the default when nothing is available', () => {
    expect(resolveClientIp({}, {})).toBe('0.0.0.0');
    expect(resolveClientIp({}, {}, '127.0.0.1')).toBe('127.0.0.1');
  });
});

describe('isLocalIp', () => {
  it('detects loopback and private ranges', () => {
    expect(isLocalIp('::1')).toBe(true);
    expect(isLocalIp('127.0.0.1')).toBe(true);
    expect(isLocalIp('192.168.0.5')).toBe(true);
    expect(isLocalIp('10.1.2.3')).toBe(true);
    expect(isLocalIp('')).toBe(true);
  });

  it('treats public IPs as non-local', () => {
    expect(isLocalIp('8.8.8.8')).toBe(false);
    expect(isLocalIp('172.16.0.1')).toBe(false);
  });
});

describe('safeNumber', () => {
  it('coerces numeric strings', () => {
    expect(safeNumber('42.5')).toBe(42.5);
  });

  it('returns 0 for non-numeric input', () => {
    expect(safeNumber('abc')).toBe(0);
    expect(safeNumber(undefined)).toBe(0);
    expect(safeNumber(NaN)).toBe(0);
  });
});

describe('pickCoordinate', () => {
  it('prefers a non-zero body value', () => {
    expect(pickCoordinate('12.34', 99)).toBe(12.34);
  });

  it('falls back to the lookup value when body is zero', () => {
    expect(pickCoordinate('0', 55)).toBe(55);
    expect(pickCoordinate(0, 55)).toBe(55);
  });

  it('falls back to the lookup value when body is not a number', () => {
    expect(pickCoordinate('nope', 55)).toBe(55);
  });

  it('returns 0 when neither is usable', () => {
    expect(pickCoordinate(undefined, undefined)).toBe(0);
    expect(pickCoordinate('x', 0)).toBe(0);
  });
});

describe('generateUsernameVariants', () => {
  it('produces slug/hyphen/underscore/dot/encoded variants', () => {
    expect(generateUsernameVariants('John Doe Smith')).toEqual({
      slug: 'johndoesmith',
      hyphen: 'john-doe-smith',
      underscore: 'john_doe_smith',
      dot: 'john.doe.smith',
      encoded: 'John%20Doe%20Smith',
    });
  });

  it('trims surrounding whitespace and collapses inner runs', () => {
    const v = generateUsernameVariants('  Jane   Roe  ');
    expect(v.slug).toBe('janeroe');
    expect(v.hyphen).toBe('jane-roe');
    expect(v.encoded).toBe('Jane%20%20%20Roe');
  });
});

describe('buildPlatformLinks', () => {
  const links = buildPlatformLinks('John Doe');

  it('returns the full static platform list', () => {
    expect(links).toHaveLength(20);
  });

  it('every entry has platform/category/url/icon', () => {
    for (const l of links) {
      expect(l).toHaveProperty('platform');
      expect(l).toHaveProperty('category');
      expect(l).toHaveProperty('url');
      expect(l).toHaveProperty('icon');
    }
  });

  it('embeds the slug in username-based URLs', () => {
    const gh = links.find((l) => l.platform === 'GitHub');
    expect(gh.url).toBe('https://github.com/johndoe');
  });

  it('embeds the encoded name in search URLs', () => {
    const fb = links.find((l) => l.platform === 'Facebook');
    expect(fb.url).toContain('q=John%20Doe');
  });
});

describe('mergePlatformsWithApify', () => {
  const platforms = buildPlatformLinks('John Doe');

  it('marks matches found by Apify as verified', () => {
    const merged = mergePlatformsWithApify(platforms, [
      { platform: 'instagram', url: 'https://instagram.com/johndoe' },
    ]);
    const ig = merged.find((p) => p.platform === 'Instagram');
    expect(ig.verified).toBe(true);
    expect(ig.apifyUrl).toBe('https://instagram.com/johndoe');
  });

  it('matches by url when platform is absent, using profileUrl fallback', () => {
    const merged = mergePlatformsWithApify(platforms, [
      { url: 'https://github.com/jd', profileUrl: 'https://github.com/jd' },
    ]);
    const gh = merged.find((p) => p.platform === 'GitHub');
    expect(gh.verified).toBe(true);
    expect(gh.apifyUrl).toBe('https://github.com/jd');
  });

  it('leaves unmatched platforms unverified with null apifyUrl', () => {
    const merged = mergePlatformsWithApify(platforms, []);
    expect(merged.every((p) => p.verified === false && p.apifyUrl === null)).toBe(true);
  });

  it('handles the compound platform name Twitter/X', () => {
    const merged = mergePlatformsWithApify(platforms, [{ platform: 'twitter' }]);
    const tw = merged.find((p) => p.platform === 'Twitter/X');
    expect(tw.verified).toBe(true);
  });

  it('defaults apifyResults to an empty array', () => {
    const merged = mergePlatformsWithApify(platforms);
    expect(merged).toHaveLength(20);
  });
});

describe('computeFoundCount', () => {
  it('sums apify (when active) and google results', () => {
    expect(computeFoundCount(true, [1, 2], [3])).toBe(3);
  });

  it('ignores apify results when inactive', () => {
    expect(computeFoundCount(false, [1, 2, 3], [4])).toBe(1);
  });

  it('defaults empty arrays to zero', () => {
    expect(computeFoundCount(false)).toBe(0);
  });
});

describe('validateFullName', () => {
  it('accepts names of at least 2 characters', () => {
    expect(validateFullName('  Jo  ')).toEqual({ valid: true, name: 'Jo', error: null });
  });

  it('rejects too-short or missing names', () => {
    expect(validateFullName('a').valid).toBe(false);
    expect(validateFullName('   ').valid).toBe(false);
    expect(validateFullName('').valid).toBe(false);
    expect(validateFullName(undefined).valid).toBe(false);
  });

  it('returns the Indonesian error message', () => {
    expect(validateFullName('a').error).toBe('Nama lengkap minimal 2 karakter');
  });
});

describe('parseDailyLimit', () => {
  it('parses numeric strings', () => {
    expect(parseDailyLimit('10')).toBe(10);
  });

  it('defaults when unparseable', () => {
    expect(parseDailyLimit(undefined)).toBe(3);
    expect(parseDailyLimit('abc')).toBe(3);
    expect(parseDailyLimit('', 5)).toBe(5);
  });
});

describe('computeRateLimit', () => {
  it('computes remaining and allowed below the limit', () => {
    expect(computeRateLimit('1', 3)).toEqual({ used: 1, limit: 3, remaining: 2, allowed: true });
  });

  it('clamps remaining at zero and blocks at/over the limit', () => {
    expect(computeRateLimit(5, 3)).toEqual({ used: 5, limit: 3, remaining: 0, allowed: false });
    expect(computeRateLimit(3, 3).allowed).toBe(false);
  });

  it('treats unparseable used counts as zero', () => {
    expect(computeRateLimit('x', 3)).toEqual({ used: 0, limit: 3, remaining: 3, allowed: true });
  });
});

describe('resolveDbConfig', () => {
  it('uses DATABASE_URL when present', () => {
    const { usingConnectionString, config } = resolveDbConfig({ DATABASE_URL: 'postgres://u:p@h/db' });
    expect(usingConnectionString).toBe(true);
    expect(config.connectionString).toBe('postgres://u:p@h/db');
    expect(config.ssl).toEqual({ rejectUnauthorized: false });
  });

  it('uses the Neon fallback in production without DATABASE_URL', () => {
    const { usingConnectionString, config } = resolveDbConfig({ NODE_ENV: 'production' });
    expect(usingConnectionString).toBe(true);
    expect(config.connectionString).toContain('neon.tech');
  });

  it('uses local PostgreSQL defaults in development', () => {
    const { usingConnectionString, config } = resolveDbConfig({});
    expect(usingConnectionString).toBe(false);
    expect(config.host).toBe('localhost');
    expect(config.port).toBe(5432);
    expect(config.database).toBe('portofolio_db');
    expect(config.user).toBe('postgres');
  });

  it('honours custom DB_* and PG* env vars', () => {
    const { config } = resolveDbConfig({
      DB_USER: 'admin',
      DB_HOST: 'db.internal',
      DB_PORT: '6543',
      DB_NAME: 'mydb',
    });
    expect(config.user).toBe('admin');
    expect(config.host).toBe('db.internal');
    expect(config.port).toBe(6543);
    expect(config.database).toBe('mydb');
  });

  it('defaults to an empty env object', () => {
    expect(resolveDbConfig().usingConnectionString).toBe(false);
  });
});
