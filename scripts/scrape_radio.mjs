#!/usr/bin/env node

/**
 * Radio Station Scraper for AudioVerse
 * =====================================
 * Fetches live radio stations from Radio Browser API
 * and merges them into catalog.json
 *
 * Usage: node scripts/scrape_radio.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, '..', 'src', 'data', 'catalog.json');

// ─── Configuration ──────────────────────────────────────────

const API_BASE = 'https://de1.api.radio-browser.info/json';

const GENRE_MAP = {
  jazz:        ['jazz', 'smooth jazz', 'acid jazz', 'jazz fusion', 'bebop', 'swing'],
  classical:   ['classical', 'classic', 'opera', 'symphony', 'baroque', 'chamber music', 'orchestral'],
  blues:       ['blues', 'rhythm and blues', 'r&b', 'soul blues', 'delta blues'],
  ambient:     ['ambient', 'chillout', 'chill', 'chillwave', 'downtempo', 'lounge', 'new age', 'relaxation', 'meditation'],
  world:       ['world', 'world music', 'latin', 'reggae', 'afrobeat', 'celtic', 'bossa nova', 'flamenco', 'indian', 'arabic'],
  folk:        ['folk', 'folk rock', 'country folk', 'singer-songwriter', 'bluegrass', 'americana'],
  electronic:  ['electronic', 'techno', 'house', 'trance', 'edm', 'drum and bass', 'dubstep', 'synthwave', 'electronica'],
};

const COUNTRY_TARGETS = {
  'US': 100,
  'GB': 50,
  'FR': 30,
  'DE': 30,
  'IL': 20,
  'CA': 20,
};

const COUNTRY_NAMES = {
  'US': 'USA', 'GB': 'UK', 'FR': 'France', 'DE': 'Germany',
  'IL': 'Israel', 'CA': 'Canada',
};

const MIN_BITRATE = 64;
const MIN_VOTES = 10;
const STREAM_TEST_TIMEOUT = 5000;

// ─── Helpers ────────────────────────────────────────────────

function progressBar(current, total, label = '') {
  const width = 30;
  const pct = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(width - filled);
  process.stdout.write(`\r  [${bar}] ${pct}% ${label}`.padEnd(80));
  if (current === total) process.stdout.write('\n');
}

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'AudioVerse/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function testStreamURL(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), STREAM_TEST_TIMEOUT);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);
    return res.ok || res.status === 405; // some streams don't support HEAD
  } catch {
    // Try GET with range if HEAD failed
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), STREAM_TEST_TIMEOUT);
      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: { Range: 'bytes=0-1' },
        redirect: 'follow',
      });
      clearTimeout(timeout);
      return res.ok || res.status === 206;
    } catch {
      return false;
    }
  }
}

function mapGenre(tags) {
  if (!tags) return null;
  const tagLower = tags.toLowerCase();
  for (const [genre, keywords] of Object.entries(GENRE_MAP)) {
    for (const kw of keywords) {
      if (tagLower.includes(kw)) return genre;
    }
  }
  return null;
}

function deduplicateStations(stations) {
  const seen = new Map();
  for (const s of stations) {
    const key = `${s.name.toLowerCase().trim()}|${s.url}`;
    if (!seen.has(key)) {
      seen.set(key, s);
    }
  }
  return [...seen.values()];
}

// ─── Fetching ───────────────────────────────────────────────

async function fetchByGenre(genre, keywords, limit = 100) {
  const stations = [];
  for (const tag of keywords.slice(0, 3)) { // top 3 keywords per genre
    try {
      const data = await fetchJSON(
        `${API_BASE}/stations/bytag/${encodeURIComponent(tag)}?order=votes&reverse=true&limit=${limit}&hidebroken=true`
      );
      for (const s of data) {
        if (s.bitrate >= MIN_BITRATE && s.votes >= MIN_VOTES && s.url_resolved) {
          stations.push({ ...s, mappedGenre: genre });
        }
      }
    } catch (e) {
      console.warn(`    Warning: failed to fetch tag "${tag}": ${e.message}`);
    }
  }
  return stations;
}

async function fetchByCountry(countryCode, limit) {
  try {
    const data = await fetchJSON(
      `${API_BASE}/stations/bycountrycodeexact/${countryCode}?order=votes&reverse=true&limit=${limit * 2}&hidebroken=true`
    );
    return data.filter(s => s.bitrate >= MIN_BITRATE && s.votes >= MIN_VOTES && s.url_resolved);
  } catch (e) {
    console.warn(`    Warning: failed to fetch country "${countryCode}": ${e.message}`);
    return [];
  }
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log('\n  \u{1F4FB} AudioVerse Radio Scraper');
  console.log('  ==========================\n');

  let allStations = [];

  // ── Step 1: Fetch by genre ──
  console.log('  Step 1: Fetching stations by genre...\n');
  const genres = Object.entries(GENRE_MAP);
  for (let i = 0; i < genres.length; i++) {
    const [genre, keywords] = genres[i];
    progressBar(i, genres.length, genre);
    const stations = await fetchByGenre(genre, keywords, 150);
    allStations.push(...stations);
    // Small delay to be polite to the API
    await new Promise(r => setTimeout(r, 300));
  }
  progressBar(genres.length, genres.length, 'done');
  console.log(`    Found ${allStations.length} stations by genre\n`);

  // ── Step 2: Fetch by country ──
  console.log('  Step 2: Fetching popular stations by country...\n');
  const countries = Object.entries(COUNTRY_TARGETS);
  for (let i = 0; i < countries.length; i++) {
    const [code, limit] = countries[i];
    progressBar(i, countries.length, COUNTRY_NAMES[code] || code);
    const stations = await fetchByCountry(code, limit);
    for (const s of stations) {
      // Map genre from tags if not already mapped
      if (!s.mappedGenre) {
        s.mappedGenre = mapGenre(s.tags) || 'world';
      }
    }
    allStations.push(...stations);
    await new Promise(r => setTimeout(r, 300));
  }
  progressBar(countries.length, countries.length, 'done');
  console.log(`    Total raw stations: ${allStations.length}\n`);

  // ── Step 3: Deduplicate ──
  console.log('  Step 3: Deduplicating...');
  // Map to intermediate format first
  let mapped = allStations.map(s => ({
    name: s.name?.trim(),
    url: s.url_resolved || s.url,
    genre: s.mappedGenre || mapGenre(s.tags) || 'world',
    country: s.country || '',
    countryCode: s.countrycode || '',
    language: s.language || '',
    bitrate: s.bitrate || 0,
    homepage: s.homepage || '',
    favicon: s.favicon || '',
    votes: s.votes || 0,
    tags: s.tags || '',
    codec: s.codec || '',
  }));

  mapped = deduplicateStations(mapped);
  console.log(`    After dedup: ${mapped.length} stations\n`);

  // ── Step 4: Test streams ──
  console.log('  Step 4: Testing stream URLs (this may take a while)...\n');
  const working = [];
  const batchSize = 20;
  for (let i = 0; i < mapped.length; i += batchSize) {
    const batch = mapped.slice(i, i + batchSize);
    progressBar(Math.min(i + batchSize, mapped.length), mapped.length, `${working.length} working`);

    const results = await Promise.all(
      batch.map(async (station) => {
        const ok = await testStreamURL(station.url);
        return ok ? station : null;
      })
    );
    working.push(...results.filter(Boolean));
  }
  progressBar(mapped.length, mapped.length, `${working.length} working`);
  console.log(`    Working streams: ${working.length}\n`);

  // ── Step 5: Sort by popularity and assign IDs ──
  console.log('  Step 5: Sorting and finalizing...');
  working.sort((a, b) => b.votes - a.votes);

  // Limit to ~300-500 stations, balanced across genres
  const genreLimits = {
    jazz: 80, classical: 80, blues: 50, ambient: 60,
    world: 60, folk: 50, electronic: 70,
  };

  const genreCounts = {};
  const finalStations = [];

  for (const station of working) {
    const genre = station.genre;
    const limit = genreLimits[genre] || 40;
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    if (genreCounts[genre] <= limit) {
      finalStations.push(station);
    }
  }

  // Format for catalog
  const radioEntries = finalStations.map((s, i) => ({
    id: `r${String(i + 1).padStart(3, '0')}`,
    name: s.name,
    url: s.url,
    genre: s.genre,
    country: s.country,
    countryCode: s.countryCode,
    language: s.language,
    cover: s.favicon || '',
    bitrate: s.bitrate,
    homepage: s.homepage,
    votes: s.votes,
    tags: s.tags,
    codec: s.codec,
    isLive: true,
    type: 'radio',
  }));

  console.log(`    Final station count: ${radioEntries.length}\n`);

  // Print genre breakdown
  console.log('  Genre breakdown:');
  const breakdown = {};
  for (const s of radioEntries) {
    breakdown[s.genre] = (breakdown[s.genre] || 0) + 1;
  }
  for (const [genre, count] of Object.entries(breakdown).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${genre.padEnd(15)} ${count} stations`);
  }

  // Print country breakdown
  console.log('\n  Country breakdown (top 10):');
  const countryBreakdown = {};
  for (const s of radioEntries) {
    const c = s.country || 'Unknown';
    countryBreakdown[c] = (countryBreakdown[c] || 0) + 1;
  }
  const topCountries = Object.entries(countryBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [country, count] of topCountries) {
    console.log(`    ${country.padEnd(25)} ${count} stations`);
  }

  // ── Step 6: Merge into catalog.json ──
  console.log('\n  Step 6: Merging into catalog.json...');

  let catalog;
  try {
    catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
  } catch (e) {
    console.error(`    Error reading catalog: ${e.message}`);
    process.exit(1);
  }

  catalog.radio = radioEntries;

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`    Saved ${radioEntries.length} radio stations to catalog.json`);

  console.log('\n  \u2705 Done! Radio stations added to AudioVerse.\n');
}

main().catch(e => {
  console.error('\n  Error:', e.message);
  process.exit(1);
});
