/**
 * Ad Configuration
 * ================
 * Control all ad zones, frequencies, and providers from this single file.
 * Set enabled=false to turn off any ad zone.
 */

const adConfig = {
  // Master switch - disable ALL ads at once
  adsEnabled: false, // Set to true when ready to monetize

  // ─── Ad Provider ───────────────────────────────────
  provider: 'custom', // 'adsense' | 'mediavine' | 'admanager' | 'custom'
  adsenseClientId: '', // e.g. 'ca-pub-XXXXXXXXXXXXXXXX'
  adManagerNetworkId: '',

  // ─── Banner Ads ────────────────────────────────────
  bannerTop: {
    enabled: true,
    size: '728x90',
    slotId: 'banner-top-001',
    refreshInterval: 60, // seconds, 0 = no refresh
    placeholder: 'Your Ad Here - 728x90',
  },

  bannerSidebar: {
    enabled: true,
    size: '300x250',
    slotId: 'banner-sidebar-001',
    refreshInterval: 60,
    placeholder: 'Your Ad Here - 300x250',
  },

  bannerMobile: {
    enabled: true,
    size: '320x50',
    slotId: 'banner-mobile-001',
    refreshInterval: 30,
    placeholder: 'Your Ad Here - 320x50',
  },

  // ─── In-Feed Ads (between playlist items) ──────────
  inFeed: {
    enabled: true,
    frequency: 10,       // Show ad every N songs in list
    size: '728x90',
    slotId: 'infeed-001',
    placeholder: 'Sponsored',
  },

  // ─── Pre-Roll Video Ads ────────────────────────────
  preRoll: {
    enabled: true,
    frequency: 4,          // Play ad every N songs
    skipAfterSeconds: 5,   // Allow skip after N seconds
    maxDuration: 15,       // Max ad duration in seconds
    slotId: 'preroll-001',
    // For testing, use a placeholder. Replace with real VAST URL.
    vastUrl: '',
    fallbackMessage: 'Loading your free music...',
  },

  // ─── Native / Sponsored Content ────────────────────
  native: {
    enabled: true,
    sponsoredPlaylists: true,
    featuredTracks: true,
    label: 'Sponsored',     // Label shown on native ads
  },

  // ─── A/B Testing ───────────────────────────────────
  abTesting: {
    enabled: false,
    variant: 'A', // 'A' or 'B'
    // Variant A: standard layout
    // Variant B: alternative layout (customize per zone)
  },
};

export default adConfig;
