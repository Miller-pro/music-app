#!/usr/bin/env node
/**
 * Archive.org Public Domain Music Scraper (v2)
 * Scrapes copyright-free music from Archive.org and generates catalog.json
 * for the AudioVerse music app.
 *
 * Key improvements over v1:
 * - Bulletproof license filtering (reject-first, empty = reject)
 * - Content filtering (talks, audiobooks, podcasts excluded)
 * - Expanded search queries (6-8 per genre, 3 pages each)
 * - Better deduplication (global + title|artist key)
 * - Improved metadata cleaning
 *
 * Usage: node scripts/scrape_archive.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, "..", "src", "data", "catalog.json");

// ── Config ──────────────────────────────────────────────────────────────────

const ARCHIVE_SEARCH_URL = "https://archive.org/advancedsearch.php";
const ARCHIVE_METADATA_URL = "https://archive.org/metadata";
const ARCHIVE_DOWNLOAD_URL = "https://archive.org/download";
const ARCHIVE_IMG_URL = "https://archive.org/services/img";

const MIN_BITRATE_KBPS = 128;
const MAX_DURATION_S = 1200; // 20 min cap
const MIN_DURATION_S = 30;
const TRACKS_PER_GENRE = 70;
const MIN_TRACKS_PER_GENRE = 50;
const MAX_TRACKS_PER_ITEM = 2;
const MAX_PAGES_PER_QUERY = 3;
const ROWS_PER_PAGE = 200;
const SEARCH_DELAY_MS = 800;
const METADATA_DELAY_MS = 1200;

// ── Genre search configs ────────────────────────────────────────────────────

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
      '"1920s jazz"',
      'subject:"jazz" AND (subject:"trumpet" OR subject:"saxophone")',
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
    ],
    moods: ["Energetic", "Peaceful", "Happy", "Inspiring", "Calm"],
    useCases: [
      ["youtube", "fitness"],
      ["meditation", "youtube", "work"],
      ["youtube", "podcasts"],
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
  // Empty/missing license = REJECT (this was the biggest bug in v1)
  if (!licenseUrl || !licenseUrl.trim()) return false;

  const lower = licenseUrl.toLowerCase().trim();

  // Reject-first: check NC/ND/copyright patterns BEFORE accept patterns
  for (const pattern of REJECT_LICENSE_PATTERNS) {
    if (lower.includes(pattern)) return false;
  }

  // Now check accept patterns
  for (const pattern of ACCEPT_LICENSE_PATTERNS) {
    if (lower.includes(pattern)) return true;
  }

  // Unknown license = reject
  return false;
}

function normalizeLicense(licenseUrl) {
  if (!licenseUrl) return null; // should never happen — filtered upstream
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
  return null; // should not happen
}

// ── Content Filtering ───────────────────────────────────────────────────────

const NON_MUSIC_TITLE_REGEX = /\b(lecture|speech|audiobook|sermon|podcast|sound\s*effect|librivox|chapter\s+\d|reading|narrat|spoken\s*word|interview|commentary|talk|radio\s*play|homily|recitation|testimony)\b/i;

const BLOCKED_COLLECTIONS = new Set([
  "librivoxaudio",
  "audio_bookspoetry",
  "audio_religion",
  "podcasts",
  "audio_tech",
  "audio_news",
  "audio_foreign",
  "opensource_audio",
  "audio_podcast",
  "community_audio",
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
  // Strip leading track numbers: "01 - ", "01. ", "Track 01 ", etc.
  cleaned = cleaned.replace(/^(\d{1,3}\s*[-–.)\]]\s*)/i, "");
  cleaned = cleaned.replace(/^(track\s*\d+\s*[-–.)\]]\s*)/i, "");
  // Strip .mp3 extension
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

    // Content-filter filenames
    if (!isLikelyMusicFile(name)) continue;

    // Filter by bitrate
    let bitrate = parseFloat(String(f.bitrate ?? "0").replace(/[kK]/g, ""));
    if (isNaN(bitrate)) bitrate = 0;
    if (bitrate > 0 && bitrate < MIN_BITRATE_KBPS) continue;

    // Duration
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

  // Prefer higher bitrate
  mp3s.sort((a, b) => b.bitrate - a.bitrate);
  return mp3s;
}

function buildMp3Url(identifier, filename) {
  return `${ARCHIVE_DOWNLOAD_URL}/${encodeURIComponent(identifier)}/${encodeURIComponent(filename)}`;
}

function buildCoverUrl(identifier) {
  return `${ARCHIVE_IMG_URL}/${encodeURIComponent(identifier)}`;
}

// ── Main Scraper ────────────────────────────────────────────────────────────

async function scrapeGenre(genre, config, globalSeenIdentifiers, globalSeenTitleArtist) {
  const tracks = [];
  const localSeenIds = new Set();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Scraping genre: ${genre.toUpperCase()}`);
  console.log(`${"=".repeat(60)}`);

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
        break; // no more pages for this query
      }

      console.log(`  Found ${items.length} items, filtering & fetching metadata...`);

      for (let i = 0; i < items.length; i++) {
        if (tracks.length >= TRACKS_PER_GENRE) break;

        const item = items[i];
        const identifier = item.identifier;
        if (!identifier) continue;

        // Global + local dedup by identifier
        if (localSeenIds.has(identifier) || globalSeenIdentifiers.has(identifier)) continue;
        localSeenIds.add(identifier);
        globalSeenIdentifiers.add(identifier);

        // Pre-filter: content check on title/identifier
        const searchTitle = firstStr(item.title, "");
        if (!isLikelyMusic(searchTitle, identifier)) continue;

        // Pre-filter: license from search results
        const searchLicense = item.licenseurl ?? "";
        if (searchLicense && !isCommercialSafe(searchLicense)) continue;
        // If searchLicense is empty, we'll check metadata license below

        // Get full metadata
        const meta = await getItemMetadata(identifier);
        if (!meta) continue;

        const itemMeta = meta.metadata ?? {};

        // Re-check license from metadata (authoritative)
        const licenseUrl = firstStr(itemMeta.licenseurl, searchLicense);
        if (!isCommercialSafe(licenseUrl)) continue;

        // Check collections for blocked content
        const collections = itemMeta.collection;
        if (hasBlockedCollection(collections)) continue;

        // Re-check title from metadata
        const metaTitle = firstStr(itemMeta.title, "");
        if (!isLikelyMusic(metaTitle, identifier)) continue;

        // Find MP3 files
        const mp3Files = findMp3Files(meta);
        if (!mp3Files.length) continue;

        const normalizedLicense = normalizeLicense(licenseUrl);
        if (!normalizedLicense) continue; // unknown license type

        // Take up to MAX_TRACKS_PER_ITEM tracks per item
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

          // Dedup by title+artist
          const key = dedupKey(title, artist);
          if (globalSeenTitleArtist.has(key)) continue;
          globalSeenTitleArtist.add(key);

          const album = firstStr(
            mp3.album || itemMeta.title,
            `${genre[0].toUpperCase() + genre.slice(1)} Collection`
          );
          const year = extractYear(itemMeta.year || itemMeta.date);

          tracks.push({
            title,
            artist,
            album,
            genre,
            mood: pick(config.moods),
            useCase: pick(config.useCases),
            duration: mp3.duration,
            url: buildMp3Url(identifier, mp3.name),
            cover: buildCoverUrl(identifier),
            license: normalizedLicense,
            year,
            plays: randInt(500, 50000),
            downloads: randInt(100, 20000),
            featured: false,
            dateAdded: generateDateAdded(),
          });
          tracksFromItem++;
        }

        // Progress
        process.stdout.write(
          `\r${progressBar(tracks.length, TRACKS_PER_GENRE)} ${genre}`
        );
      }

      // If this page returned fewer than ROWS_PER_PAGE, no more pages
      if (items.length < ROWS_PER_PAGE) break;
    }
  }

  console.log(`\n  Collected ${tracks.length} tracks for ${genre}`);
  if (tracks.length < MIN_TRACKS_PER_GENRE) {
    console.warn(`  WARNING: Only got ${tracks.length}/${MIN_TRACKS_PER_GENRE} minimum tracks for ${genre}`);
  }
  return tracks;
}

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
  };

  for (const [genre, [name, desc]] of Object.entries(genreNames)) {
    const ids = byGenre[genre] ?? [];
    if (ids.length >= 5) {
      const selected = ids.sort(() => Math.random() - 0.5).slice(0, 15);
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
  ];

  for (const [name, desc, filterFn] of moodPlaylists) {
    const matching = tracks.filter(filterFn).map((t) => t.id);
    if (matching.length >= 5) {
      const selected = matching.sort(() => Math.random() - 0.5).slice(0, 15);
      const coverTrack = tracks.find((t) => t.id === selected[0]);
      playlists.push({
        id: `pl${String(playlists.length + 1).padStart(3, "0")}`,
        name,
        description: desc,
        cover: coverTrack?.cover ?? "",
        trackIds: selected,
        featured: playlists.length < 6,
        sponsored: false,
      });
    }
  }

  return playlists;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║  Archive.org Public Domain Music Scraper v2           ║
  ║  Building catalog for AudioVerse                      ║
  ╚═══════════════════════════════════════════════════════╝
  `);

  const allTracks = [];
  let totalDuration = 0;

  // Global dedup sets shared across all genres
  const globalSeenIdentifiers = new Set();
  const globalSeenTitleArtist = new Set();

  for (const [genre, config] of Object.entries(GENRE_CONFIGS)) {
    try {
      const genreTracks = await scrapeGenre(genre, config, globalSeenIdentifiers, globalSeenTitleArtist);
      allTracks.push(...genreTracks);
    } catch (e) {
      console.error(`\n  ERROR scraping ${genre}: ${e.message}`);
    }
  }

  if (!allTracks.length) {
    console.error("\nERROR: No tracks were scraped. Check your internet connection.");
    process.exit(1);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Post-processing ${allTracks.length} tracks...`);
  console.log(`${"=".repeat(60)}`);

  // Shuffle and assign IDs
  allTracks.sort(() => Math.random() - 0.5);
  for (let i = 0; i < allTracks.length; i++) {
    allTracks[i].id = `t${String(i + 1).padStart(4, "0")}`;
    totalDuration += allTracks[i].duration;
  }

  // Mark ~10% as featured
  allTracks.sort((a, b) => b.plays - a.plays);
  const featuredCount = Math.max(1, Math.floor(allTracks.length / 10));
  for (let i = 0; i < featuredCount; i++) {
    allTracks[i].featured = true;
  }

  // Sort by ID
  allTracks.sort((a, b) => a.id.localeCompare(b.id));

  // Build playlists
  const playlists = buildPlaylists(allTracks);

  // Sponsored playlist
  const topTracks = [...allTracks].sort((a, b) => b.plays - a.plays).slice(0, 8);
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

  const catalog = { tracks: allTracks, playlists, sponsoredPlaylists };

  // Write output
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(catalog, null, 2), "utf-8");

  // Summary
  const totalHours = (totalDuration / 3600).toFixed(1);
  const genreCounts = {};
  for (const t of allTracks) {
    genreCounts[t.genre] = (genreCounts[t.genre] ?? 0) + 1;
  }

  // License audit
  const licenseCounts = {};
  for (const t of allTracks) {
    licenseCounts[t.license] = (licenseCounts[t.license] ?? 0) + 1;
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  SCRAPE COMPLETE`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  Total tracks:     ${allTracks.length}`);
  console.log(`  Total duration:   ${totalHours} hours`);
  console.log(`  Total playlists:  ${playlists.length}`);
  console.log(`  Output:           ${OUTPUT_PATH}`);
  console.log(`\n  Tracks per genre:`);
  for (const [genre, count] of Object.entries(genreCounts).sort()) {
    const genreDur = (
      allTracks
        .filter((t) => t.genre === genre)
        .reduce((s, t) => s + t.duration, 0) / 3600
    ).toFixed(1);
    console.log(`    ${genre.padEnd(12)} ${String(count).padStart(4)} tracks  (${genreDur}h)`);
  }
  console.log(`\n  Licenses:`);
  for (const [license, count] of Object.entries(licenseCounts).sort()) {
    console.log(`    ${license.padEnd(16)} ${String(count).padStart(4)} tracks`);
  }
  console.log();
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
