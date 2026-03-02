/**
 * AudioVerse Configuration
 * ========================
 * Non-developers can edit this file to customize the app.
 * All branding, features, and settings are controlled here.
 */

const config = {
  // ─── Branding ───────────────────────────────────────
  branding: {
    name: 'AudioVerse',
    tagline: 'Free Music Player - Thousands of Copyright-Free Tracks',
    shortTagline: 'No Copyright. Download Anytime.',
    logo: '/favicon.svg',
    colors: {
      primary: '#FF6B35',    // Sunset Orange
      secondary: '#FFB4A2',  // Soft Peach
      accent: '#FFD700',     // Golden Yellow
      background: '#1A1A2E', // Deep Navy
    },
  },

  // ─── Feature Toggles ───────────────────────────────
  features: {
    downloads: true,
    playlists: true,
    queue: true,
    search: true,
    shuffle: true,
    repeat: true,
    animations: true,       // Framer Motion (set false for perf)
    keyboardShortcuts: true,
    mobileGestures: true,
    toastNotifications: true,
  },

  // ─── Music Sources ─────────────────────────────────
  music: {
    catalogFile: '/src/data/catalog.json',
    sources: {
      archiveOrg: true,
      musopen: true,
    },
    defaultGenre: 'all',
    itemsPerPage: 24,
    searchDebounceMs: 300,
  },

  // ─── Categories ────────────────────────────────────
  genres: [
    { id: 'classical', name: 'Classical', icon: '🎻' },
    { id: 'jazz', name: 'Jazz', icon: '🎷' },
    { id: 'ambient', name: 'Ambient', icon: '🌊' },
    { id: 'folk', name: 'Folk', icon: '🪕' },
    { id: 'electronic', name: 'Electronic', icon: '🎹' },
    { id: 'world', name: 'World', icon: '🌍' },
    { id: 'cinematic', name: 'Cinematic', icon: '🎬' },
    { id: 'acoustic', name: 'Acoustic', icon: '🎸' },
  ],

  useCases: [
    { id: 'youtube', name: 'For YouTube', icon: '📹' },
    { id: 'podcasts', name: 'For Podcasts', icon: '🎙️' },
    { id: 'work', name: 'For Work', icon: '💼' },
    { id: 'gaming', name: 'For Gaming', icon: '🎮' },
    { id: 'meditation', name: 'For Meditation', icon: '🧘' },
    { id: 'fitness', name: 'For Fitness', icon: '💪' },
  ],

  moods: [
    'Energetic', 'Calm', 'Happy', 'Melancholic', 'Inspiring',
    'Dark', 'Romantic', 'Peaceful', 'Epic', 'Playful',
  ],

  // ─── Player ────────────────────────────────────────
  player: {
    defaultVolume: 0.7,
    crossfadeDuration: 0,    // seconds, 0 = disabled
    preloadNext: true,
  },

  // ─── LocalStorage Keys ─────────────────────────────
  storage: {
    playlists: 'audioverse_playlists',
    history: 'audioverse_history',
    downloads: 'audioverse_downloads',
    volume: 'audioverse_volume',
    queue: 'audioverse_queue',
    preferences: 'audioverse_preferences',
  },

  // ─── Analytics ─────────────────────────────────────
  analytics: {
    enabled: false,
    googleAnalyticsId: '', // e.g. 'G-XXXXXXXXXX'
  },

  // ─── Future: Backend ───────────────────────────────
  api: {
    enabled: false,
    baseUrl: '',
    // When ready: set enabled=true, baseUrl='https://api.audioverse.com'
  },
};

export default config;
