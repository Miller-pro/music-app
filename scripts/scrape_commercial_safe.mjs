#!/usr/bin/env node
/**
 * Commercial-Safe Music Scraper
 * Expands the AudioVerse catalog to 3,000-4,000 tracks by scraping:
 *   1. Incompetech (Kevin MacLeod) — CC BY 4.0 catalog via JSON API
 *   2. Archive.org Expanded — More genres/queries + Musopen collections
 *
 * All tracks are commercial-safe: Public Domain, CC0, CC BY, CC BY-SA only.
 * Additive: loads existing catalog.json and appends new tracks.
 *
 * Usage: node scripts/scrape_commercial_safe.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = resolve(__dirname, "..", "src", "data", "catalog.json");

// ── Config ──────────────────────────────────────────────────────────────────

const ARCHIVE_SEARCH_URL = "https://archive.org/advancedsearch.php";
const ARCHIVE_METADATA_URL = "https://archive.org/metadata";
const ARCHIVE_DOWNLOAD_URL = "https://archive.org/download";
const ARCHIVE_IMG_URL = "https://archive.org/services/img";

const INCOMPETECH_PIECES_URL = "https://incompetech.com/music/royalty-free/pieces.json";
const INCOMPETECH_GENRE_URL = "https://incompetech.com/music/royalty-free/genre.json";
const INCOMPETECH_COLLECTIONS_URL = "https://incompetech.com/music/royalty-free/collections.json";
const INCOMPETECH_MP3_BASE = "https://incompetech.com/music/royalty-free/mp3-royaltyfree";

const MIN_BITRATE_KBPS = 128;
const MAX_DURATION_S = 1200;
const MIN_DURATION_S = 30;
const TRACKS_PER_GENRE = 200;
const MIN_TRACKS_PER_GENRE = 80;
const MAX_TRACKS_PER_ITEM = 2;
const MAX_PAGES_PER_QUERY = 3;
const ROWS_PER_PAGE = 200;
const SEARCH_DELAY_MS = 800;
const METADATA_DELAY_MS = 1200;

// ── Incompetech Genre Mapping ───────────────────────────────────────────────

const INCOMPETECH_GENRE_MAP = {
  1: "ambient",       // Ambient
  2: "world",         // African
  3: "blues",         // Blues
  4: "classical",     // Classical
  5: "world",         // Comedy (closest: world)
  6: "folk",          // Country
  7: "electronic",    // Electronica
  8: "folk",          // Funk (closest: folk)
  9: "cinematic",     // Holiday
  10: "cinematic",    // Horror
  11: "jazz",         // Jazz
  12: "world",        // Latin
  13: "ambient",      // Lounge
  14: "rock",         // Metal
  15: "ambient",      // New Age
  16: "folk",         // Oldies
  17: "electronic",   // Pop
  18: "electronic",   // R&B
  19: "rock",         // Rock
  20: "folk",         // Ska
  21: "electronic",   // Scores (game/tech)
  22: "cinematic",    // Soundtrack
  23: "electronic",   // Techno
  24: "world",        // Urban
  25: "world",        // World
  26: "cinematic",    // Action
  27: "acoustic",     // Ballad
  28: "electronic",   // Dance
  29: "folk",         // Easy Listening
  30: "cinematic",    // Film
  31: "electronic",   // Hip Hop
  32: "world",        // Reggae
};

const INCOMPETECH_FEEL_TO_MOOD = {
  "Aggressive": "Energetic",
  "Angry": "Dark",
  "Bright": "Happy",
  "Building": "Inspiring",
  "Calming": "Calm",
  "Comedic": "Playful",
  "Cool": "Calm",
  "Dark": "Dark",
  "Disturbing": "Dark",
  "Dramatic": "Epic",
  "Dreamy": "Peaceful",
  "Driving": "Energetic",
  "Eerie": "Dark",
  "Elegant": "Peaceful",
  "Emotional": "Melancholic",
  "Epic": "Epic",
  "Excited": "Energetic",
  "Film Noir": "Dark",
  "Fun": "Playful",
  "Funky": "Energetic",
  "Goofy": "Playful",
  "Grooving": "Energetic",
  "Happy": "Happy",
  "Heavy": "Dark",
  "Heroic": "Epic",
  "Hopeful": "Inspiring",
  "Intense": "Energetic",
  "Laid Back": "Calm",
  "Light": "Peaceful",
  "Love": "Romantic",
  "Mechanical": "Dark",
  "Meditative": "Peaceful",
  "Melancholy": "Melancholic",
  "Mellow": "Calm",
  "Mysterious": "Dark",
  "Neutral": "Calm",
  "Ominous": "Dark",
  "Peaceful": "Peaceful",
  "Playful": "Playful",
  "Quirky": "Playful",
  "Reflective": "Melancholic",
  "Relaxed": "Calm",
  "Romantic": "Romantic",
  "Sad": "Melancholic",
  "Scary": "Dark",
  "Serious": "Epic",
  "Silly": "Playful",
  "Sinister": "Dark",
  "Smooth": "Calm",
  "Sneaky": "Dark",
  "Soothing": "Peaceful",
  "Spacey": "Peaceful",
  "Spooky": "Dark",
  "Strange": "Dark",
  "Suspenseful": "Dark",
  "Sweet": "Happy",
  "Tense": "Dark",
  "Thoughtful": "Melancholic",
  "Uneasy": "Dark",
  "Upbeat": "Happy",
  "Uplifting": "Inspiring",
  "Warm": "Happy",
  "Whimsical": "Playful",
};

// ── Expanded Archive.org Genre Configs ──────────────────────────────────────

const GENRE_CONFIGS = {
  classical: {
    queries: [
      'subject:"classical music"',
      'subject:"classical" AND subject:"piano"',
      'subject:"orchestra" OR subject:"symphony"',
      'creator:"Bach" OR creator:"Mozart" OR creator:"Beethoven"',
      '"public domain classical music"',
      'subject:"chopin" OR subject:"vivaldi" OR subject:"schubert"',
      'subject:"classical" AND subject:"violin"',
      'subject:"chamber music"',
      'subject:"classical" AND subject:"cello"',
      'subject:"sonata" OR subject:"concerto"',
      'creator:"Musopen" AND subject:"classical"',
      'collection:"musopen" AND mediatype:audio',
    ],
    moods: ["Melancholic", "Peaceful", "Happy", "Calm", "Inspiring", "Epic"],
    useCases: [
      ["youtube", "podcasts", "meditation"],
      ["youtube", "meditation", "work"],
      ["youtube", "work"],
      ["meditation", "work", "podcasts"],
    ],
  },
  jazz: {
    queries: [
      'subject:"jazz"',
      'subject:"jazz" AND (subject:"swing" OR subject:"bebop")',
      'subject:"jazz" AND subject:"piano"',
      '"public domain jazz"',
      '"traditional jazz"',
      '"1920s jazz" OR "1930s jazz"',
      'subject:"jazz" AND (subject:"trumpet" OR subject:"saxophone")',
      'subject:"jazz fusion" OR subject:"smooth jazz"',
      'subject:"jazz" AND subject:"guitar"',
      'subject:"jazz" AND subject:"vocal"',
    ],
    moods: ["Happy", "Romantic", "Calm", "Peaceful", "Energetic"],
    useCases: [
      ["youtube", "work", "podcasts"],
      ["youtube", "podcasts"],
      ["work", "podcasts"],
    ],
  },
  folk: {
    queries: [
      'subject:"folk music"',
      'subject:"folk" AND subject:"acoustic"',
      'subject:"traditional" OR subject:"bluegrass"',
      '"traditional folk"',
      '"public domain folk songs"',
      'subject:"americana"',
      'subject:"folk" AND subject:"guitar"',
      'subject:"folk" AND subject:"banjo"',
      'subject:"celtic folk" OR subject:"irish folk"',
    ],
    moods: ["Happy", "Peaceful", "Inspiring", "Playful", "Calm"],
    useCases: [
      ["youtube", "podcasts"],
      ["youtube", "podcasts", "work"],
      ["youtube", "work"],
    ],
  },
  blues: {
    queries: [
      'subject:"blues"',
      'subject:"blues" AND (subject:"guitar" OR subject:"harmonica")',
      '"delta blues"',
      '"country blues"',
      '"public domain blues"',
      'subject:"chicago blues" OR subject:"acoustic blues"',
      'subject:"blues" AND subject:"vintage"',
      'subject:"blues" AND subject:"piano"',
      '"rhythm and blues" AND -subject:"rock"',
    ],
    moods: ["Melancholic", "Calm", "Energetic", "Dark", "Romantic"],
    useCases: [
      ["youtube", "podcasts"],
      ["youtube", "work"],
      ["youtube", "podcasts", "work"],
    ],
  },
  ambient: {
    queries: [
      'subject:"ambient"',
      'subject:"ambient" AND (subject:"nature" OR subject:"meditation")',
      '"ambient soundscape"',
      '"drone music"',
      '"field recordings" AND subject:"music"',
      'subject:"new age" OR subject:"space ambient"',
      'subject:"ambient" AND subject:"electronic"',
      'subject:"ambient" AND subject:"dark"',
      'subject:"atmospheric" AND subject:"music"',
    ],
    moods: ["Peaceful", "Calm", "Dark", "Inspiring", "Melancholic"],
    useCases: [
      ["meditation", "work"],
      ["meditation", "work", "youtube"],
      ["gaming", "youtube"],
    ],
  },
  world: {
    queries: [
      'subject:"world music"',
      'subject:"african music" OR subject:"indian music"',
      'subject:"latin" OR subject:"caribbean" OR subject:"celtic"',
      '"traditional music" AND -subject:"folk"',
      '"ethnic music"',
      'subject:"gamelan" OR subject:"sitar" OR subject:"flamenco"',
      'subject:"world" AND subject:"percussion"',
      'subject:"arabic music" OR subject:"asian music"',
      'subject:"reggae" OR subject:"afrobeat"',
    ],
    moods: ["Energetic", "Peaceful", "Happy", "Inspiring", "Calm"],
    useCases: [
      ["youtube", "fitness"],
      ["meditation", "youtube", "work"],
      ["youtube", "podcasts"],
    ],
  },
  electronic: {
    queries: [
      'subject:"electronic music" AND -subject:"podcast"',
      'subject:"synth" OR subject:"synthesizer"',
      'subject:"EDM" OR subject:"dance music"',
      'subject:"chiptune" OR subject:"8-bit"',
      'subject:"electronic" AND subject:"ambient"',
      '"electronic beats"',
      'subject:"techno" OR subject:"house music"',
      'subject:"electronic" AND subject:"experimental"',
      'subject:"IDM" OR subject:"glitch"',
    ],
    moods: ["Energetic", "Dark", "Calm", "Happy", "Inspiring"],
    useCases: [
      ["youtube", "gaming", "fitness"],
      ["youtube", "gaming"],
      ["work", "youtube"],
    ],
  },
  rock: {
    queries: [
      'subject:"indie rock" AND -subject:"podcast"',
      'subject:"post-rock"',
      'subject:"instrumental rock"',
      'subject:"garage rock" OR subject:"punk"',
      'subject:"alternative rock"',
      'subject:"rock" AND subject:"guitar"',
      'subject:"psychedelic rock"',
      'subject:"surf rock" OR subject:"rockabilly"',
    ],
    moods: ["Energetic", "Dark", "Happy", "Epic", "Inspiring"],
    useCases: [
      ["youtube", "fitness", "gaming"],
      ["youtube", "gaming"],
      ["youtube", "fitness"],
    ],
  },
  cinematic: {
    queries: [
      'subject:"film score" OR subject:"soundtrack"',
      'subject:"cinematic" AND subject:"orchestral"',
      'subject:"movie music" OR subject:"film music"',
      '"epic orchestral"',
      'subject:"trailer music" OR subject:"dramatic music"',
      'subject:"cinematic" AND subject:"ambient"',
      '"orchestral score"',
      'subject:"cinematic" AND subject:"piano"',
    ],
    moods: ["Epic", "Inspiring", "Dark", "Melancholic", "Peaceful"],
    useCases: [
      ["youtube", "podcasts", "gaming"],
      ["youtube", "gaming"],
      ["youtube", "podcasts"],
    ],
  },
  acoustic: {
    queries: [
      'subject:"acoustic guitar"',
      'subject:"acoustic" AND subject:"instrumental"',
      'subject:"singer-songwriter" AND -subject:"podcast"',
      'subject:"unplugged" OR subject:"acoustic session"',
      '"acoustic music"',
      'subject:"fingerstyle" OR subject:"fingerpicking"',
      'subject:"acoustic" AND subject:"folk"',
      'subject:"acoustic" AND subject:"cover"',
    ],
    moods: ["Peaceful", "Calm", "Happy", "Romantic", "Inspiring"],
    useCases: [
      ["youtube", "podcasts", "work"],
      ["youtube", "work"],
      ["podcasts", "meditation"],
    ],
  },
};

const GENRE_COVERS = {
  classical: [
    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&h=300&fit=crop",
  ],
  jazz: [
    "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
  ],
  folk: [
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1462965326349-1c65dca9e6a1?w=300&h=300&fit=crop",
  ],
  blues: [
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
  ],
  ambient: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300&h=300&fit=crop",
  ],
  world: [
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300&h=300&fit=crop",
  ],
  electronic: [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=300&h=300&fit=crop",
  ],
  rock: [
    "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
  ],
  cinematic: [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
  ],
  acoustic: [
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1462965326349-1c65dca9e6a1?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=300&h=300&fit=crop",
  ],
};

// ── License Filtering (reject-first) ────────────────────────────────────────

const REJECT_LICENSE_PATTERNS = [
  "-nc", "noncommercial", "non-commercial",
  "-nd", "noderivs", "no-derivs", "noderivatives",
  "all rights reserved", "proprietary",
];

const ACCEPT_LICENSE_PATTERNS = [
  "publicdomain/zero", "publicdomain/mark",
  "/cc0/", "creativecommons.org/publicdomain",
  "licenses/by-sa/", "licenses/by/",
  "public domain",
];

function isCommercialSafe(licenseUrl) {
  if (!licenseUrl || !licenseUrl.trim()) return false;
  const lower = licenseUrl.toLowerCase().trim();
  for (const pattern of REJECT_LICENSE_PATTERNS) {
    if (lower.includes(pattern)) return false;
  }
  for (const pattern of ACCEPT_LICENSE_PATTERNS) {
    if (lower.includes(pattern)) return true;
  }
  return false;
}

function normalizeLicense(licenseUrl) {
  if (!licenseUrl) return null;
  const lower = licenseUrl.toLowerCase();
  if (lower.includes("publicdomain/zero") || lower.includes("/cc0/") || lower.includes("cc0"))
    return "CC0";
  if (lower.includes("publicdomain/mark") || lower.includes("publicdomain"))
    return "Public Domain";
  if (lower.includes("public domain"))
    return "Public Domain";
  if (lower.includes("licenses/by-sa/"))
    return "CC BY-SA";
  if (lower.includes("licenses/by/"))
    return "CC BY";
  return null;
}

// ── Content Filtering ───────────────────────────────────────────────────────

const NON_MUSIC_TITLE_REGEX = /\b(lecture|speech|audiobook|sermon|podcast|sound\s*effect|librivox|chapter\s+\d|reading|narrat|spoken\s*word|interview|commentary|talk|radio\s*play|homily|recitation|testimony)\b/i;

const BLOCKED_COLLECTIONS = new Set([
  "librivoxaudio", "audio_bookspoetry", "audio_religion",
  "podcasts", "audio_tech", "audio_news", "audio_foreign",
  "opensource_audio", "audio_podcast", "community_audio",
]);

const NON_MUSIC_FILENAME_REGEX = /\b(chapter|lecture|speech|sermon|episode|narrat|spoken|reading)\b/i;

function isLikelyMusic(title, identifier) {
  if (!title && !identifier) return false;
  const combined = `${title || ""} ${identifier || ""}`;
  return !NON_MUSIC_TITLE_REGEX.test(combined);
}

function hasBlockedCollection(collections) {
  if (!collections) return false;
  const arr = Array.isArray(collections) ? collections : [collections];
  return arr.some((c) => BLOCKED_COLLECTIONS.has(c.toLowerCase().trim()));
}

function isLikelyMusicFile(filename) {
  return !NON_MUSIC_FILENAME_REGEX.test(filename);
}

// ── Metadata Cleaning ───────────────────────────────────────────────────────

function cleanTitle(title) {
  if (!title) return "";
  let cleaned = title;
  cleaned = cleaned.replace(/^(\d{1,3}\s*[-–.)\]]\s*)/i, "");
  cleaned = cleaned.replace(/^(track\s*\d+\s*[-–.)\]]\s*)/i, "");
  cleaned = cleaned.replace(/\.mp3$/i, "");
  return cleaned.trim();
}

function extractYear(value) {
  if (!value) return "";
  const str = String(value);
  const match = str.match(/((?:19|20)\d{2})/);
  return match ? match[1] : "";
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDateAdded() {
  const daysAgo = randInt(1, 180);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function progressBar(current, total, width = 30) {
  const pct = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const bar = "\u2588".repeat(filled) + "\u2591".repeat(width - filled);
  return `  [${bar}] ${pct}% (${current}/${total})`;
}

function firstStr(val, fallback = "") {
  if (Array.isArray(val)) return val[0]?.toString().trim() ?? fallback;
  return val?.toString().trim() ?? fallback;
}

function dedupKey(title, artist) {
  return `${(title || "").toLowerCase().trim()}|${(artist || "").toLowerCase().trim()}`;
}

// ── API Calls ───────────────────────────────────────────────────────────────

async function safeRequest(url, delayMs, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await sleep(delayMs);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const resp = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "AudioVerse-Catalog-Builder/2.0 (music app catalog generator)",
        },
      });
      clearTimeout(timeout);

      if (resp.ok) return resp;
      if (resp.status === 429) {
        const wait = Math.min(60000, 2 ** (attempt + 2) * 1000);
        process.stdout.write(`\n  Rate limited, waiting ${wait / 1000}s...`);
        await sleep(wait);
        continue;
      }
      if (resp.status >= 500) {
        await sleep(2 ** attempt * 1000);
        continue;
      }
      return null;
    } catch (e) {
      if (attempt < retries - 1) {
        await sleep(2 ** attempt * 1000);
      } else {
        process.stdout.write(`\n  Request failed: ${e.message}`);
        return null;
      }
    }
  }
  return null;
}

async function searchArchive(query, page = 1, rows = ROWS_PER_PAGE) {
  const fullQuery = `${query} AND mediatype:audio`;
  const url = `${ARCHIVE_SEARCH_URL}?q=${encodeURIComponent(fullQuery)}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=year&fl[]=licenseurl&fl[]=downloads&sort[]=downloads+desc&rows=${rows}&page=${page}&output=json`;

  const resp = await safeRequest(url, SEARCH_DELAY_MS);
  if (!resp) return [];
  try {
    const data = await resp.json();
    return data?.response?.docs ?? [];
  } catch {
    return [];
  }
}

async function getItemMetadata(identifier) {
  const resp = await safeRequest(
    `${ARCHIVE_METADATA_URL}/${encodeURIComponent(identifier)}`,
    METADATA_DELAY_MS
  );
  if (!resp) return null;
  try {
    return await resp.json();
  } catch {
    return null;
  }
}

function findMp3Files(metadata) {
  const files = metadata?.files ?? [];
  const mp3s = [];

  for (const f of files) {
    const name = f.name ?? "";
    const format = f.format ?? "";
    if (!name.toLowerCase().endsWith(".mp3") && !format.toLowerCase().includes("mp3"))
      continue;
    if (!isLikelyMusicFile(name)) continue;

    let bitrate = parseFloat(String(f.bitrate ?? "0").replace(/[kK]/g, ""));
    if (isNaN(bitrate)) bitrate = 0;
    if (bitrate > 0 && bitrate < MIN_BITRATE_KBPS) continue;

    let duration = parseFloat(f.length ?? "0");
    if (isNaN(duration)) duration = 0;
    if (duration < MIN_DURATION_S || duration > MAX_DURATION_S) continue;

    mp3s.push({
      name,
      duration: Math.round(duration),
      bitrate,
      title: f.title ?? "",
      album: f.album ?? "",
      artist: f.artist ?? "",
      creator: f.creator ?? "",
    });
  }

  mp3s.sort((a, b) => b.bitrate - a.bitrate);
  return mp3s;
}

function buildMp3Url(identifier, filename) {
  return `${ARCHIVE_DOWNLOAD_URL}/${encodeURIComponent(identifier)}/${encodeURIComponent(filename)}`;
}

function buildCoverUrl(identifier) {
  return `${ARCHIVE_IMG_URL}/${encodeURIComponent(identifier)}`;
}

// ══════════════════════════════════════════════════════════════════════════════
// PART 1: INCOMPETECH SCRAPER
// ══════════════════════════════════════════════════════════════════════════════

function parseIncompetechDuration(lengthStr) {
  if (!lengthStr) return 0;
  const parts = String(lengthStr).split(":");
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  if (parts.length === 3) {
    return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
  }
  const num = parseInt(lengthStr, 10);
  return isNaN(num) ? 0 : num;
}

function mapIncompetechGenre(genreIds) {
  if (!genreIds) return "cinematic";
  const ids = Array.isArray(genreIds) ? genreIds : [genreIds];
  for (const id of ids) {
    const mapped = INCOMPETECH_GENRE_MAP[id];
    if (mapped) return mapped;
  }
  return "cinematic"; // default for unmapped
}

function mapIncompetechMood(feels) {
  if (!feels) return "Calm";
  const feelList = Array.isArray(feels) ? feels : [feels];
  for (const feel of feelList) {
    const mapped = INCOMPETECH_FEEL_TO_MOOD[feel];
    if (mapped) return mapped;
  }
  return "Calm";
}

function useCaseForGenre(genre) {
  const genreConfig = GENRE_CONFIGS[genre];
  if (genreConfig) return pick(genreConfig.useCases);
  return ["youtube", "podcasts"];
}

async function scrapeIncompetech(globalSeenTitleArtist) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  PART 1: Scraping Incompetech (Kevin MacLeod)`);
  console.log(`${"=".repeat(60)}`);

  // Fetch pieces catalog
  console.log("\n  Fetching pieces.json...");
  const piecesResp = await safeRequest(INCOMPETECH_PIECES_URL, 100, 3);
  if (!piecesResp) {
    console.log("  ERROR: Could not fetch Incompetech pieces.json");
    return [];
  }
  const pieces = await piecesResp.json();
  console.log(`  Found ${pieces.length} pieces`);

  // Fetch genre mapping
  console.log("  Fetching genre.json...");
  const genreResp = await safeRequest(INCOMPETECH_GENRE_URL, 100, 3);
  let genreLookup = {};
  if (genreResp) {
    const genreData = await genreResp.json();
    if (Array.isArray(genreData)) {
      for (const g of genreData) {
        if (g.id && g.name) genreLookup[g.id] = g.name;
      }
    }
    console.log(`  Loaded ${Object.keys(genreLookup).length} genre mappings`);
  }

  // Fetch collections mapping
  console.log("  Fetching collections.json...");
  const collectionsResp = await safeRequest(INCOMPETECH_COLLECTIONS_URL, 100, 3);
  let collectionsLookup = {};
  if (collectionsResp) {
    const collectionsData = await collectionsResp.json();
    if (Array.isArray(collectionsData)) {
      for (const c of collectionsData) {
        if (c.id && c.name) collectionsLookup[c.id] = c.name;
      }
    }
    console.log(`  Loaded ${Object.keys(collectionsLookup).length} collection mappings`);
  }

  const tracks = [];
  let skippedShort = 0;
  let skippedDupe = 0;

  for (const piece of pieces) {
    const title = (piece.name || piece.title || "").trim();
    if (!title) continue;

    // Parse duration
    const duration = parseIncompetechDuration(piece.length);
    if (duration < MIN_DURATION_S) {
      skippedShort++;
      continue;
    }
    if (duration > MAX_DURATION_S) continue;

    // Dedup by title+artist
    const key = dedupKey(title, "Kevin MacLeod");
    if (globalSeenTitleArtist.has(key)) {
      skippedDupe++;
      continue;
    }
    globalSeenTitleArtist.add(key);

    // Build filename for URL
    const filename = piece.filename || piece.file || `${title.replace(/\s+/g, "%20")}.mp3`;
    const url = `${INCOMPETECH_MP3_BASE}/${encodeURIComponent(filename)}`;

    // Map genre
    const genre = mapIncompetechGenre(piece.genre || piece.genres);

    // Map mood from feel
    const mood = mapIncompetechMood(piece.feel || piece.feels);

    // Get collection/album name
    const collectionIds = piece.collection || piece.collections;
    let album = "Royalty Free";
    if (collectionIds) {
      const ids = Array.isArray(collectionIds) ? collectionIds : [collectionIds];
      for (const id of ids) {
        if (collectionsLookup[id]) {
          album = collectionsLookup[id];
          break;
        }
      }
    }

    const covers = GENRE_COVERS[genre] || GENRE_COVERS.cinematic;

    tracks.push({
      title,
      artist: "Kevin MacLeod",
      album,
      genre,
      mood,
      useCase: useCaseForGenre(genre),
      duration,
      url,
      cover: pick(covers),
      license: "CC BY",
      year: extractYear(piece.year || piece.date || "2020"),
      plays: randInt(1000, 80000),
      downloads: randInt(500, 30000),
      featured: false,
      dateAdded: generateDateAdded(),
    });

    if (tracks.length % 100 === 0) {
      process.stdout.write(`\r${progressBar(tracks.length, pieces.length)} incompetech`);
    }
  }

  console.log(`\n  Incompetech: ${tracks.length} tracks collected`);
  console.log(`    Skipped short (<${MIN_DURATION_S}s): ${skippedShort}`);
  console.log(`    Skipped duplicates: ${skippedDupe}`);

  return tracks;
}

// ══════════════════════════════════════════════════════════════════════════════
// PART 2: ARCHIVE.ORG EXPANDED SCRAPER
// ══════════════════════════════════════════════════════════════════════════════

async function scrapeArchiveGenre(genre, config, globalSeenIdentifiers, globalSeenTitleArtist) {
  const tracks = [];
  const localSeenIds = new Set();

  console.log(`\n${"─".repeat(60)}`);
  console.log(`  Scraping Archive.org genre: ${genre.toUpperCase()}`);
  console.log(`${"─".repeat(60)}`);

  for (let qi = 0; qi < config.queries.length; qi++) {
    if (tracks.length >= TRACKS_PER_GENRE) break;

    const query = config.queries[qi];

    for (let page = 1; page <= MAX_PAGES_PER_QUERY; page++) {
      if (tracks.length >= TRACKS_PER_GENRE) break;

      const remaining = TRACKS_PER_GENRE - tracks.length;
      console.log(
        `\n  Query ${qi + 1}/${config.queries.length}, page ${page}/${MAX_PAGES_PER_QUERY} (have ${tracks.length}, need ${remaining} more)`
      );

      const items = await searchArchive(query, page);
      if (!items.length) {
        console.log(`  No results for query ${qi + 1} page ${page}`);
        break;
      }

      console.log(`  Found ${items.length} items, filtering & fetching metadata...`);

      for (let i = 0; i < items.length; i++) {
        if (tracks.length >= TRACKS_PER_GENRE) break;

        const item = items[i];
        const identifier = item.identifier;
        if (!identifier) continue;

        if (localSeenIds.has(identifier) || globalSeenIdentifiers.has(identifier)) continue;
        localSeenIds.add(identifier);
        globalSeenIdentifiers.add(identifier);

        const searchTitle = firstStr(item.title, "");
        if (!isLikelyMusic(searchTitle, identifier)) continue;

        const searchLicense = item.licenseurl ?? "";
        if (searchLicense && !isCommercialSafe(searchLicense)) continue;

        const meta = await getItemMetadata(identifier);
        if (!meta) continue;

        const itemMeta = meta.metadata ?? {};

        const licenseUrl = firstStr(itemMeta.licenseurl, searchLicense);
        if (!isCommercialSafe(licenseUrl)) continue;

        const collections = itemMeta.collection;
        if (hasBlockedCollection(collections)) continue;

        const metaTitle = firstStr(itemMeta.title, "");
        if (!isLikelyMusic(metaTitle, identifier)) continue;

        const mp3Files = findMp3Files(meta);
        if (!mp3Files.length) continue;

        const normalizedLicense = normalizeLicense(licenseUrl);
        if (!normalizedLicense) continue;

        let tracksFromItem = 0;
        for (const mp3 of mp3Files) {
          if (tracks.length >= TRACKS_PER_GENRE) break;
          if (tracksFromItem >= MAX_TRACKS_PER_ITEM) break;

          const rawTitle = mp3.title || metaTitle || identifier;
          const title = cleanTitle(firstStr(rawTitle, identifier));
          if (!title) continue;

          const artist = firstStr(
            mp3.artist || mp3.creator || itemMeta.creator,
            "Unknown Artist"
          );

          const key = dedupKey(title, artist);
          if (globalSeenTitleArtist.has(key)) continue;
          globalSeenTitleArtist.add(key);

          const album = firstStr(
            mp3.album || itemMeta.title,
            `${genre[0].toUpperCase() + genre.slice(1)} Collection`
          );
          const year = extractYear(itemMeta.year || itemMeta.date);

          const covers = GENRE_COVERS[genre] || GENRE_COVERS.ambient;

          tracks.push({
            title,
            artist,
            album,
            genre,
            mood: pick(config.moods),
            useCase: pick(config.useCases),
            duration: mp3.duration,
            url: buildMp3Url(identifier, mp3.name),
            cover: pick(covers),
            license: normalizedLicense,
            year,
            plays: randInt(500, 50000),
            downloads: randInt(100, 20000),
            featured: false,
            dateAdded: generateDateAdded(),
          });
          tracksFromItem++;
        }

        process.stdout.write(
          `\r${progressBar(tracks.length, TRACKS_PER_GENRE)} ${genre}`
        );
      }

      if (items.length < ROWS_PER_PAGE) break;
    }
  }

  console.log(`\n  Collected ${tracks.length} tracks for ${genre}`);
  if (tracks.length < MIN_TRACKS_PER_GENRE) {
    console.warn(`  WARNING: Only got ${tracks.length}/${MIN_TRACKS_PER_GENRE} minimum tracks for ${genre}`);
  }
  return tracks;
}

// ══════════════════════════════════════════════════════════════════════════════
// PART 3: MERGE, DEDUPLICATE & BUILD CATALOG
// ══════════════════════════════════════════════════════════════════════════════

function buildPlaylists(tracks) {
  const playlists = [];
  const byGenre = {};
  for (const t of tracks) {
    (byGenre[t.genre] ??= []).push(t.id);
  }

  const genreNames = {
    classical: ["Classical Masterworks", "Timeless compositions from the great classical masters"],
    jazz: ["Jazz Essentials", "Smooth jazz standards and improvised gems"],
    folk: ["Folk & Acoustic", "Heartfelt folk songs and acoustic arrangements"],
    blues: ["Blues Collection", "Soulful blues from the masters of the genre"],
    ambient: ["Ambient Relaxation", "Calming ambient soundscapes for relaxation and focus"],
    world: ["World Music Journey", "Musical traditions from around the globe"],
    electronic: ["Electronic Pulse", "Cutting-edge electronic beats and synth explorations"],
    rock: ["Rock Anthems", "High-energy rock tracks for every occasion"],
    cinematic: ["Cinematic Scores", "Epic orchestral music for film and video"],
    acoustic: ["Acoustic Sessions", "Warm unplugged performances and intimate recordings"],
  };

  for (const [genre, [name, desc]] of Object.entries(genreNames)) {
    const ids = byGenre[genre] ?? [];
    if (ids.length >= 5) {
      const selected = ids.sort(() => Math.random() - 0.5).slice(0, 20);
      const coverTrack = tracks.find((t) => t.id === selected[0]);
      playlists.push({
        id: `pl${String(playlists.length + 1).padStart(3, "0")}`,
        name,
        description: desc,
        cover: coverTrack?.cover ?? GENRE_COVERS[genre]?.[0] ?? "",
        trackIds: selected,
        featured: true,
        sponsored: false,
      });
    }
  }

  const moodPlaylists = [
    ["Focus & Productivity", "Concentration-boosting tracks for deep work sessions",
      (t) => ["Calm", "Peaceful"].includes(t.mood) && t.useCase.includes("work")],
    ["Energetic Vibes", "High-energy tracks for workouts and staying active",
      (t) => t.mood === "Energetic"],
    ["Meditation & Mindfulness", "Peaceful sounds for meditation and relaxation",
      (t) => t.useCase.includes("meditation")],
    ["YouTube Creator Pack", "Perfect background music for your video content",
      (t) => t.useCase.includes("youtube")],
    ["Podcast Backgrounds", "Subtle instrumental tracks that complement spoken word",
      (t) => t.useCase.includes("podcasts") && ["Calm", "Peaceful"].includes(t.mood)],
    ["Melancholic Moods", "Beautiful, bittersweet compositions for emotional content",
      (t) => t.mood === "Melancholic"],
    ["Gaming Soundtracks", "Immersive tracks for gaming sessions",
      (t) => t.useCase.includes("gaming")],
    ["Dark & Mysterious", "Atmospheric tracks with dark, brooding energy",
      (t) => t.mood === "Dark"],
    ["Feel Good Mix", "Uplifting tracks to brighten your day",
      (t) => ["Happy", "Playful"].includes(t.mood)],
    ["Epic & Inspiring", "Grand compositions that stir the soul",
      (t) => ["Epic", "Inspiring"].includes(t.mood)],
  ];

  for (const [name, desc, filterFn] of moodPlaylists) {
    const matching = tracks.filter(filterFn).map((t) => t.id);
    if (matching.length >= 5) {
      const selected = matching.sort(() => Math.random() - 0.5).slice(0, 20);
      const coverTrack = tracks.find((t) => t.id === selected[0]);
      playlists.push({
        id: `pl${String(playlists.length + 1).padStart(3, "0")}`,
        name,
        description: desc,
        cover: coverTrack?.cover ?? "",
        trackIds: selected,
        featured: playlists.length < 8,
        sponsored: false,
      });
    }
  }

  return playlists;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║  Commercial-Safe Music Scraper                            ║
  ║  Expanding AudioVerse catalog to 3,000-4,000 tracks       ║
  ║  Sources: Incompetech + Archive.org (Expanded)            ║
  ╚═══════════════════════════════════════════════════════════╝
  `);

  // Load existing catalog
  let existingTracks = [];
  let existingPlaylists = [];
  let existingSponsoredPlaylists = [];
  try {
    const raw = readFileSync(CATALOG_PATH, "utf-8");
    const existing = JSON.parse(raw);
    existingTracks = existing.tracks ?? [];
    existingPlaylists = existing.playlists ?? [];
    existingSponsoredPlaylists = existing.sponsoredPlaylists ?? [];
    console.log(`  Loaded existing catalog: ${existingTracks.length} tracks, ${existingPlaylists.length} playlists`);
  } catch (e) {
    console.log(`  No existing catalog found, starting fresh. (${e.message})`);
  }

  // Build dedup set from existing tracks
  const globalSeenTitleArtist = new Set();
  const globalSeenIdentifiers = new Set();

  for (const t of existingTracks) {
    globalSeenTitleArtist.add(dedupKey(t.title, t.artist));
    // Extract Archive.org identifier from URL if present
    if (t.url && t.url.includes("archive.org/download/")) {
      const match = t.url.match(/archive\.org\/download\/([^/]+)/);
      if (match) globalSeenIdentifiers.add(match[1]);
    }
  }

  const MODE = process.argv[2] || "all"; // "incompetech", "archive", or "all"
  console.log(`  Mode: ${MODE}`);
  console.log(`  Pre-seeded dedup: ${globalSeenTitleArtist.size} title|artist keys, ${globalSeenIdentifiers.size} Archive.org identifiers`);

  // ── PART 1: Incompetech ──────────────────────────────────────────────────
  let incompetechTracks = [];
  if (MODE === "all" || MODE === "incompetech") {
    try {
      incompetechTracks = await scrapeIncompetech(globalSeenTitleArtist);
    } catch (e) {
      console.error(`\n  ERROR scraping Incompetech: ${e.message}`);
    }
  } else {
    console.log("\n  Skipping Incompetech (mode: " + MODE + ")");
  }

  // ── PART 2: Archive.org Expanded ─────────────────────────────────────────
  const archiveTracks = [];
  if (MODE === "all" || MODE === "archive") {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`  PART 2: Scraping Archive.org (Expanded)`);
    console.log(`${"=".repeat(60)}`);

    for (const [genre, config] of Object.entries(GENRE_CONFIGS)) {
      try {
        const genreTracks = await scrapeArchiveGenre(genre, config, globalSeenIdentifiers, globalSeenTitleArtist);
        archiveTracks.push(...genreTracks);
      } catch (e) {
        console.error(`\n  ERROR scraping Archive.org ${genre}: ${e.message}`);
      }
    }
  } else {
    console.log("\n  Skipping Archive.org (mode: " + MODE + ")");
  }

  // ── PART 3: Merge & Deduplicate ──────────────────────────────────────────
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  PART 3: Merge & Deduplicate`);
  console.log(`${"=".repeat(60)}`);

  const newTracks = [...incompetechTracks, ...archiveTracks];
  console.log(`\n  New tracks scraped: ${newTracks.length}`);
  console.log(`    Incompetech: ${incompetechTracks.length}`);
  console.log(`    Archive.org: ${archiveTracks.length}`);

  // Combine with existing
  const allTracks = [...existingTracks, ...newTracks];

  // Final dedup pass (belt and suspenders)
  const finalSeen = new Set();
  const dedupedTracks = [];
  let dupsRemoved = 0;
  for (const t of allTracks) {
    const key = dedupKey(t.title, t.artist);
    if (finalSeen.has(key)) {
      dupsRemoved++;
      continue;
    }
    finalSeen.add(key);
    dedupedTracks.push(t);
  }
  console.log(`  Final dedup removed ${dupsRemoved} duplicates`);

  // Final license audit — reject any NC/ND that slipped through
  const auditedTracks = [];
  let licenseRejected = 0;
  for (const t of dedupedTracks) {
    const lic = (t.license || "").toLowerCase();
    if (lic.includes("nc") || lic.includes("nd") || lic.includes("non-commercial") || lic.includes("no-deriv")) {
      licenseRejected++;
      continue;
    }
    auditedTracks.push(t);
  }
  console.log(`  License audit rejected ${licenseRejected} tracks`);

  // Shuffle new tracks (keep existing order for existing tracks)
  const existingCount = existingTracks.length;
  const keptExisting = auditedTracks.slice(0, existingCount);
  const keptNew = auditedTracks.slice(existingCount);
  keptNew.sort(() => Math.random() - 0.5);
  const finalTracks = [...keptExisting, ...keptNew];

  // Assign sequential IDs
  let totalDuration = 0;
  for (let i = 0; i < finalTracks.length; i++) {
    finalTracks[i].id = `t${String(i + 1).padStart(4, "0")}`;
    totalDuration += finalTracks[i].duration;
  }

  // Mark ~10% as featured (by plays, which are the popularity proxy)
  finalTracks.sort((a, b) => b.plays - a.plays);
  const featuredCount = Math.max(1, Math.floor(finalTracks.length / 10));
  for (let i = 0; i < finalTracks.length; i++) {
    finalTracks[i].featured = i < featuredCount;
  }

  // Sort by ID
  finalTracks.sort((a, b) => a.id.localeCompare(b.id));

  // Build playlists with full track pool
  const playlists = buildPlaylists(finalTracks);

  // Sponsored playlist
  const topTracks = [...finalTracks].sort((a, b) => b.plays - a.plays).slice(0, 12);
  const sponsoredPlaylists = [
    {
      id: "spl001",
      name: "Premium Sound Collection",
      description: "Curated selection of the most popular free tracks",
      cover: topTracks[0]?.cover ?? "",
      trackIds: topTracks.map((t) => t.id),
      sponsor: "AudioVerse Pro",
      link: "#",
    },
  ];

  const catalog = { tracks: finalTracks, playlists, sponsoredPlaylists };

  // Write output
  mkdirSync(dirname(CATALOG_PATH), { recursive: true });
  writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), "utf-8");

  // Summary
  const totalHours = (totalDuration / 3600).toFixed(1);
  const genreCounts = {};
  for (const t of finalTracks) {
    genreCounts[t.genre] = (genreCounts[t.genre] ?? 0) + 1;
  }

  const licenseCounts = {};
  for (const t of finalTracks) {
    licenseCounts[t.license] = (licenseCounts[t.license] ?? 0) + 1;
  }

  const sourceCounts = { incompetech: 0, archive: 0, other: 0 };
  for (const t of finalTracks) {
    if (t.url.includes("incompetech.com")) sourceCounts.incompetech++;
    else if (t.url.includes("archive.org")) sourceCounts.archive++;
    else sourceCounts.other++;
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  SCRAPE COMPLETE`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  Total tracks:     ${finalTracks.length}`);
  console.log(`  Total duration:   ${totalHours} hours`);
  console.log(`  Total playlists:  ${playlists.length}`);
  console.log(`  Output:           ${CATALOG_PATH}`);
  console.log(`\n  Sources:`);
  console.log(`    Incompetech:  ${sourceCounts.incompetech} tracks`);
  console.log(`    Archive.org:  ${sourceCounts.archive} tracks`);
  if (sourceCounts.other > 0) console.log(`    Other:        ${sourceCounts.other} tracks`);
  console.log(`\n  Tracks per genre:`);
  for (const [genre, count] of Object.entries(genreCounts).sort()) {
    const genreDur = (
      finalTracks
        .filter((t) => t.genre === genre)
        .reduce((s, t) => s + t.duration, 0) / 3600
    ).toFixed(1);
    console.log(`    ${genre.padEnd(12)} ${String(count).padStart(5)} tracks  (${genreDur}h)`);
  }
  console.log(`\n  Licenses:`);
  for (const [license, count] of Object.entries(licenseCounts).sort()) {
    console.log(`    ${license.padEnd(16)} ${String(count).padStart(5)} tracks`);
  }

  // NC/ND check
  const ncNdCount = finalTracks.filter((t) => {
    const l = (t.license || "").toLowerCase();
    return l.includes("nc") || l.includes("nd");
  }).length;
  console.log(`\n  NC/ND license check: ${ncNdCount === 0 ? "PASS (0 tracks)" : `FAIL (${ncNdCount} tracks!)`}`);

  console.log();
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
