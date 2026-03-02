// ═══════════════════════════════════════════════════════════════
// OpenRTB 2.5 Bid Request Data
// Realistic, IAB-compliant bid requests for each ad format.
// Educational reference for advertisers.
// ═══════════════════════════════════════════════════════════════

// ── Field tooltips (path → description) ──────────────────────

export const FIELD_TOOLTIPS = {
  id: 'Unique bid request ID generated per auction. Used to match bid responses.',
  imp: 'Array of impression objects representing ad placement opportunities.',
  'imp.id': 'Unique impression identifier within this bid request.',
  'imp.audio': 'Audio ad placement specifications per OpenRTB Audio Ad spec.',
  'imp.audio.mimes': 'Supported audio MIME types the publisher can accept.',
  'imp.audio.minduration': 'Minimum audio creative duration in seconds.',
  'imp.audio.maxduration': 'Maximum audio creative duration in seconds.',
  'imp.audio.startdelay': 'Start delay: 0 = pre-roll, -1 = mid-roll, -2 = post-roll.',
  'imp.audio.protocols': 'Supported VAST protocol versions. 2=VAST 2.0, 3=VAST 3.0, 5=DAAST 1.0, 6=DAAST 1.0 Wrapper.',
  'imp.audio.api': 'Supported API frameworks. 3=MRAID 1.0, 5=MRAID 2.0, 7=OMID 1.0.',
  'imp.audio.feed': 'Audio feed type. 1=Music Streaming, 2=FM/AM Broadcast, 3=Podcast.',
  'imp.audio.stitched': 'Ad stitching: 0=not stitched (client-side), 1=server-side stitched.',
  'imp.audio.nvol': 'Volume normalization mode. 0=None, 1=Ad vol avg normalized to content, 2=Ad vol peak normalized.',
  'imp.audio.companiontype': 'Supported companion ad types. 1=Static, 2=HTML, 3=iframe.',
  'imp.audio.companionad': 'Array of companion banner specifications.',
  'imp.banner': 'Companion display banner ad specifications.',
  'imp.banner.w': 'Banner width in device-independent pixels.',
  'imp.banner.h': 'Banner height in device-independent pixels.',
  'imp.banner.pos': 'Ad position on screen. 1=Above fold, 3=Below fold, 7=Fullscreen.',
  'imp.banner.btype': 'Blocked creative types. 1=XHTML Text, 2=XHTML Banner, 3=JS, 4=iframe.',
  'imp.banner.battr': 'Blocked creative attributes. 1=Audio auto-play, 2=Audio user-initiated.',
  'imp.banner.api': 'Supported API frameworks for the banner.',
  'imp.banner.format': 'Array of acceptable banner size objects.',
  'imp.bidfloor': 'Minimum CPM bid price for this impression in the specified currency.',
  'imp.bidfloorcur': 'ISO 4217 currency code for the bid floor value.',
  'imp.secure': 'Requires HTTPS creative URLs. 0=non-secure OK, 1=HTTPS required.',
  'imp.exp': 'Advisory: seconds the impression is expected to be valid.',
  app: 'Details about the publisher application making the ad request.',
  'app.id': 'Exchange-specific application identifier.',
  'app.name': 'Application display name.',
  'app.bundle': 'Platform-specific bundle or package name (e.g., com.example.app).',
  'app.domain': 'Application website domain.',
  'app.storeurl': 'App store URL for the application.',
  'app.cat': 'IAB content categories describing the app (IAB taxonomy).',
  'app.ver': 'Application version string.',
  'app.privacypolicy': 'Indicates if the app has a privacy policy. 0=No, 1=Yes.',
  'app.publisher': 'Details about the app publisher.',
  'app.publisher.id': 'Exchange-specific publisher identifier.',
  'app.publisher.name': 'Publisher display name.',
  'app.publisher.domain': 'Publisher website domain.',
  'app.content': 'Details about the content within the app being consumed.',
  'app.content.id': 'Content identifier.',
  'app.content.title': 'Content title or name.',
  'app.content.series': 'Content series or collection name.',
  'app.content.episode': 'Episode number within a series.',
  'app.content.cat': 'IAB content categories for this specific content.',
  'app.content.livestream': '0=not live/VOD, 1=live streaming content.',
  'app.content.len': 'Content duration in seconds.',
  'app.content.language': 'Content language (ISO 639-1 alpha-2).',
  'app.content.genre': 'Content genre for audio/music content.',
  device: 'Device information from which the ad request originated.',
  'device.ua': 'Browser or app User-Agent string for device identification.',
  'device.geo': 'Geographic location data derived from GPS, IP, or user registration.',
  'device.geo.lat': 'Latitude from -90.0 to 90.0 (negative = south).',
  'device.geo.lon': 'Longitude from -180.0 to 180.0 (negative = west).',
  'device.geo.type': 'Location source: 1=GPS/Location Services, 2=IP Geolocation, 3=User Provided.',
  'device.geo.accuracy': 'Estimated GPS accuracy in meters.',
  'device.geo.country': 'Country code using ISO 3166-1 Alpha-3.',
  'device.geo.region': 'Region/state code using ISO 3166-2.',
  'device.geo.city': 'City name (UN/LOCODE or similar).',
  'device.geo.zip': 'ZIP or postal code.',
  'device.geo.metro': 'Google metro code (Nielsen DMA in the US).',
  'device.dnt': 'Do Not Track flag from browser. 0=tracking OK, 1=do not track.',
  'device.lmt': 'Limit Ad Tracking flag from OS. 0=tracking OK, 1=limited.',
  'device.ip': 'IPv4 address closest to the device (may be truncated for privacy).',
  'device.ipv6': 'IPv6 address closest to the device.',
  'device.devicetype': 'Device type: 1=Mobile/Tablet, 2=PC, 3=Connected TV, 4=Phone, 5=Tablet, 6=Connected Device, 7=Set Top Box.',
  'device.make': 'Device manufacturer (e.g., Apple, Samsung).',
  'device.model': 'Device model (e.g., iPhone 14 Pro, Galaxy S23).',
  'device.os': 'Device operating system (e.g., iOS, Android).',
  'device.osv': 'Operating system version string.',
  'device.hwv': 'Hardware version of the device.',
  'device.w': 'Physical screen width in pixels.',
  'device.h': 'Physical screen height in pixels.',
  'device.ppi': 'Screen pixel density (pixels per inch).',
  'device.pxratio': 'Device pixel ratio (CSS pixels to physical pixels).',
  'device.js': 'JavaScript support. 0=no, 1=yes.',
  'device.language': 'Device language (ISO 639-1 alpha-2).',
  'device.carrier': 'Mobile carrier or ISP (derived from IP or MCC/MNC).',
  'device.connectiontype': 'Network connection type: 0=Unknown, 1=Ethernet, 2=WiFi, 3=Cell Unknown, 4=2G, 5=3G, 6=4G/LTE.',
  'device.ifa': 'ID for Advertising — the primary device ad identifier (IDFA on iOS, GAID on Android).',
  user: 'User information known to the exchange.',
  'user.id': 'Exchange-specific anonymized user identifier.',
  'user.buyeruid': 'Buyer-specific user ID mapped via cookie sync.',
  'user.yob': 'Year of birth (may be inferred, not necessarily declared).',
  'user.gender': 'Gender: M=Male, F=Female, O=Other.',
  'user.data': 'Additional user data segments from data providers.',
  'user.data.id': 'Data provider identifier.',
  'user.data.name': 'Data provider name.',
  'user.data.segment': 'Array of user segments from this provider.',
  'user.ext': 'Extension object for user-level data.',
  'user.ext.consent': 'IAB TCF v2.0 consent string encoding user GDPR preferences.',
  'user.ext.eids': 'Extended/Unified IDs — standardized cross-platform user identifiers.',
  regs: 'Regulatory conditions in effect for this request.',
  'regs.coppa': 'COPPA (Children\'s Online Privacy Protection Act). 0=not child-directed, 1=child-directed.',
  'regs.gdpr': 'GDPR applies to this request. 0=No (non-EU), 1=Yes (EU/EEA user).',
  'regs.ext': 'Extension object for additional regulatory signals.',
  'regs.ext.us_privacy': 'IAB US Privacy String (CCPA). Format: Version|Notice|OptOut|LSPA.',
  'regs.ext.gpp': 'IAB Global Privacy Platform string.',
  'regs.ext.gpp_sid': 'GPP Section IDs that apply to this transaction.',
  at: 'Auction type. 1=First Price (highest bid wins at bid price). 2=Second Price (winner pays second-highest bid + $0.01).',
  tmax: 'Maximum time in milliseconds the exchange will wait for a bid response before timing out.',
  cur: 'Array of allowed currencies for bids (ISO 4217 codes).',
  source: 'Request source and supply chain details.',
  'source.fd': 'Entity responsible for final impression sale decision. 0=Exchange, 1=Upstream.',
  'source.tid': 'Transaction ID — unique ID tied to this specific auction across the supply chain.',
  'source.pchain': 'Payment ID chain string (ads.txt / app-ads.txt authorization).',
  'source.ext': 'Source extensions.',
  'source.ext.schain': 'Supply chain object per IAB SupplyChain spec (sellers.json).',
  wseat: 'Array of allowed buyer seat IDs.',
  bseat: 'Array of blocked buyer seat IDs.',
  bcat: 'Blocked advertiser IAB categories.',
  badv: 'Blocked advertiser domains.',
  bapp: 'Blocked advertiser application bundles.',
};

// ── Highlight categories (path → color) ─────────────────────

export const HIGHLIGHT_CATEGORIES = {
  'imp.bidfloor': 'yellow',
  'imp.bidfloorcur': 'yellow',
  'device.geo': 'blue',
  'device.geo.lat': 'blue',
  'device.geo.lon': 'blue',
  'device.geo.type': 'blue',
  'device.geo.accuracy': 'blue',
  'device.geo.country': 'blue',
  'device.geo.region': 'blue',
  'device.geo.city': 'blue',
  'device.geo.zip': 'blue',
  'device.geo.metro': 'blue',
  'device.ifa': 'green',
  'device.lmt': 'green',
  'device.dnt': 'green',
  'imp.audio': 'purple',
  'imp.audio.mimes': 'purple',
  'imp.audio.minduration': 'purple',
  'imp.audio.maxduration': 'purple',
  'imp.audio.startdelay': 'purple',
  'imp.audio.protocols': 'purple',
  'imp.audio.feed': 'purple',
  'imp.audio.stitched': 'purple',
  'imp.audio.api': 'purple',
  'imp.audio.nvol': 'purple',
  'imp.audio.companiontype': 'purple',
  'imp.audio.companionad': 'purple',
  'imp.banner': 'purple',
  'imp.banner.w': 'purple',
  'imp.banner.h': 'purple',
  'imp.banner.pos': 'purple',
  'imp.banner.format': 'purple',
};

// ── Key field paths (for "Key Fields Only" view) ────────────

export const KEY_FIELD_PATHS = new Set([
  'id', 'at', 'tmax', 'cur',
  'imp',
  'imp.id', 'imp.bidfloor', 'imp.bidfloorcur', 'imp.secure',
  'imp.audio', 'imp.audio.mimes', 'imp.audio.minduration', 'imp.audio.maxduration',
  'imp.audio.startdelay', 'imp.audio.protocols', 'imp.audio.feed',
  'imp.banner', 'imp.banner.w', 'imp.banner.h', 'imp.banner.pos',
  'app', 'app.name', 'app.bundle', 'app.cat',
  'app.content', 'app.content.title', 'app.content.len', 'app.content.livestream',
  'device', 'device.make', 'device.model', 'device.os', 'device.osv',
  'device.devicetype', 'device.ifa', 'device.lmt',
  'device.geo', 'device.geo.country', 'device.geo.city',
  'user', 'user.id', 'user.gender',
  'user.ext', 'user.ext.consent',
  'regs', 'regs.gdpr', 'regs.coppa',
  'regs.ext', 'regs.ext.us_privacy',
  'source', 'source.tid',
]);

export function hasKeyFieldDescendant(path) {
  for (const kp of KEY_FIELD_PATHS) {
    if (kp === path || kp.startsWith(path + '.')) return true;
  }
  return false;
}

// ── Compute changed paths between two objects ───────────────

export function getChangedPaths(oldObj, newObj, prefix = '') {
  const changed = new Set();
  if (!oldObj || !newObj) return changed;
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  for (const key of allKeys) {
    const path = prefix ? `${prefix}.${key}` : key;
    const oldVal = oldObj[key];
    const newVal = newObj[key];
    if (oldVal === newVal) continue;
    if (
      typeof oldVal === 'object' && oldVal !== null && !Array.isArray(oldVal) &&
      typeof newVal === 'object' && newVal !== null && !Array.isArray(newVal)
    ) {
      const childChanges = getChangedPaths(oldVal, newVal, path);
      childChanges.forEach(p => changed.add(p));
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changed.add(path);
    }
  }
  return changed;
}

// ── Active section based on audio progress ──────────────────

export function getActiveSection(progress, isPlaying) {
  if (!isPlaying) return null;
  if (progress < 0.25) return 'imp';
  if (progress < 0.5) return 'device';
  if (progress < 0.75) return 'user';
  return 'regs';
}

export const SECTION_LABELS = {
  imp: 'Sending ad specifications...',
  device: 'Targeting device & location...',
  user: 'Matching audience segments...',
  regs: 'Verifying privacy compliance...',
};

// ═══════════════════════════════════════════════════════════════
// SHARED BASE DATA
// ═══════════════════════════════════════════════════════════════

const PUBLISHER = {
  id: 'pub-av-98765',
  name: 'AudioVerse Inc.',
  domain: 'audioverse.fm',
  cat: ['IAB1-7'],
};

const APP_BASE = {
  id: 'app-av-12345',
  name: 'AudioVerse',
  bundle: 'com.audioverse.music',
  domain: 'audioverse.fm',
  storeurl: 'https://apps.apple.com/app/audioverse/id1234567890',
  cat: ['IAB1-7'],
  ver: '3.2.1',
  privacypolicy: 1,
  publisher: PUBLISHER,
};

const SOURCE_BASE = {
  fd: 1,
  tid: 'txn-e7f8a9b0-1c2d-3e4f-5a6b-7c8d9e0f1a2b',
  pchain: 'a]b2c3d4e5:pub-av-98765',
  ext: {
    schain: {
      ver: '1.0',
      complete: 1,
      nodes: [
        {
          asi: 'audioverse.fm',
          sid: 'pub-av-98765',
          hp: 1,
          rid: 'req-a1b2c3d4',
        },
      ],
    },
  },
};

const REGS_BASE = {
  coppa: 0,
  gdpr: 1,
  ext: {
    us_privacy: '1YNN',
    gpp: 'DBACNYA~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA',
    gpp_sid: [7],
  },
};

// ═══════════════════════════════════════════════════════════════
// 1. STANDARD AUDIO (Pre-Roll)
// ═══════════════════════════════════════════════════════════════

export function getStandardAudioBidRequest() {
  return {
    id: 'req-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    imp: [
      {
        id: '1',
        audio: {
          mimes: ['audio/mp3', 'audio/mp4', 'audio/ogg'],
          minduration: 15,
          maxduration: 30,
          startdelay: 0,
          protocols: [2, 3, 5, 6],
          api: [3, 5, 7],
          feed: 1,
          stitched: 0,
          nvol: 1,
        },
        bidfloor: 0.75,
        bidfloorcur: 'USD',
        secure: 1,
        exp: 300,
      },
    ],
    app: {
      ...APP_BASE,
      content: {
        id: 'track-sunset-dreams-001',
        title: 'Sunset Dreams',
        cat: ['IAB1-7'],
        language: 'en',
        genre: 'Ambient',
      },
    },
    device: {
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      geo: {
        lat: 40.7128,
        lon: -74.006,
        type: 1,
        accuracy: 15,
        country: 'USA',
        region: 'NY',
        city: 'New York',
        zip: '10001',
        metro: '501',
      },
      dnt: 0,
      lmt: 0,
      ip: '72.229.28.xxx',
      devicetype: 4,
      make: 'Apple',
      model: 'iPhone 14 Pro',
      os: 'iOS',
      osv: '17.2',
      hwv: 'iPhone15,2',
      w: 1179,
      h: 2556,
      ppi: 460,
      pxratio: 3,
      js: 1,
      language: 'en',
      carrier: 'Verizon',
      connectiontype: 2,
      ifa: '6D92078A-8246-4BA4-AE5B-76104861E7DC',
    },
    user: {
      id: 'usr-f47ac10b-58cc-4372-a567-0e02b2c3d479',
      yob: 1994,
      gender: 'M',
      data: [
        {
          id: 'audiverse-segments',
          name: 'AudioVerse',
          segment: [
            { id: 'music-lover', name: 'Music Enthusiast', value: 'high' },
            { id: 'premium-listener', name: 'Premium Listener', value: 'active' },
          ],
        },
      ],
      ext: {
        consent: 'CPzHq4APzHq4AAHABBENAUEAALAAAAP_gAEPgAAAAIAAA',
        eids: [
          {
            source: 'liveramp.com',
            uids: [{ id: 'XY1000bBVcjkop', atype: 3 }],
          },
        ],
      },
    },
    regs: { ...REGS_BASE },
    at: 1,
    tmax: 500,
    cur: ['USD'],
    source: { ...SOURCE_BASE },
    bcat: ['IAB25-3', 'IAB26', 'IAB7-39'],
    badv: ['competitor1.com', 'blockedadvertiser.com'],
  };
}

// ═══════════════════════════════════════════════════════════════
// 2. IMMERSIVE AUDIO (Audio + Companion Banner)
// ═══════════════════════════════════════════════════════════════

export function getImmersiveAudioBidRequest() {
  return {
    id: 'req-b2c3d4e5-f6a7-8901-bcde-f12345678901',
    imp: [
      {
        id: '1',
        audio: {
          mimes: ['audio/mp3', 'audio/mp4'],
          minduration: 15,
          maxduration: 30,
          startdelay: 0,
          protocols: [2, 3, 5, 6],
          api: [3, 5, 7],
          feed: 1,
          stitched: 0,
          nvol: 1,
          companiontype: [1, 2],
          companionad: [
            {
              w: 300,
              h: 250,
              pos: 1,
              battr: [1, 2],
              api: [3, 5],
            },
          ],
        },
        banner: {
          w: 300,
          h: 250,
          pos: 1,
          btype: [4],
          battr: [1, 2, 9],
          api: [3, 5],
          format: [
            { w: 300, h: 250 },
            { w: 320, h: 480 },
          ],
        },
        bidfloor: 1.25,
        bidfloorcur: 'USD',
        secure: 1,
        exp: 300,
      },
    ],
    app: {
      ...APP_BASE,
      content: {
        id: 'playlist-creative-mix-002',
        title: 'Creative Mix',
        cat: ['IAB1-7'],
        language: 'en',
        genre: 'Electronic',
      },
    },
    device: {
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
      geo: {
        lat: 51.5074,
        lon: -0.1278,
        type: 2,
        country: 'GBR',
        region: 'ENG',
        city: 'London',
        zip: 'EC1A',
      },
      dnt: 0,
      lmt: 0,
      ip: '81.128.164.xxx',
      devicetype: 2,
      make: 'Apple',
      model: 'MacBook Pro',
      os: 'macOS',
      osv: '14.2',
      w: 2560,
      h: 1600,
      ppi: 227,
      pxratio: 2,
      js: 1,
      language: 'en',
      connectiontype: 1,
      ifa: '3A29F4BC-E012-4D7A-8B5C-91D2E3F40561',
    },
    user: {
      id: 'usr-a23bc4d5-e6f7-8901-ab23-cd45ef678901',
      yob: 1990,
      gender: 'F',
      data: [
        {
          id: 'audiverse-segments',
          name: 'AudioVerse',
          segment: [
            { id: 'creative-pro', name: 'Creative Professional', value: 'high' },
            { id: 'desktop-listener', name: 'Desktop Listener', value: 'active' },
          ],
        },
      ],
      ext: {
        consent: 'CPzHq4APzHq4AAHABBENAUEAALAAAAP_gAEPgAAAAIAAA',
        eids: [
          {
            source: 'id5-sync.com',
            uids: [{ id: 'ID5-ZHMOo_mNkU', atype: 1 }],
          },
        ],
      },
    },
    regs: { ...REGS_BASE },
    at: 1,
    tmax: 750,
    cur: ['USD', 'GBP'],
    source: {
      ...SOURCE_BASE,
      tid: 'txn-c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
    },
    bcat: ['IAB25-3', 'IAB26'],
    badv: ['competitor1.com'],
  };
}

// ═══════════════════════════════════════════════════════════════
// 3. IN-GAME AUDIO
// ═══════════════════════════════════════════════════════════════

export function getInGameAudioBidRequest() {
  return {
    id: 'req-c3d4e5f6-a7b8-9012-cdef-123456789012',
    imp: [
      {
        id: '1',
        audio: {
          mimes: ['audio/mp3', 'audio/mp4'],
          minduration: 10,
          maxduration: 20,
          startdelay: -1,
          protocols: [2, 3, 5, 6],
          api: [7],
          feed: 1,
          stitched: 0,
          nvol: 2,
        },
        bidfloor: 1.5,
        bidfloorcur: 'USD',
        secure: 1,
        exp: 120,
      },
    ],
    app: {
      id: 'app-game-67890',
      name: 'AudioVerse',
      bundle: 'com.audioverse.music',
      domain: 'audioverse.fm',
      storeurl: 'https://play.google.com/store/apps/details?id=com.audioverse.music',
      cat: ['IAB1-7', 'IAB9-30'],
      ver: '3.2.1',
      privacypolicy: 1,
      publisher: PUBLISHER,
      content: {
        id: 'game-runner-001',
        title: 'Neon Runner Mini-Game',
        cat: ['IAB9', 'IAB9-30'],
        language: 'en',
        genre: 'Casual Game',
      },
    },
    device: {
      ua: 'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.280 Mobile Safari/537.36',
      geo: {
        lat: 25.7617,
        lon: -80.1918,
        type: 1,
        accuracy: 10,
        country: 'USA',
        region: 'FL',
        city: 'Miami',
        zip: '33101',
        metro: '528',
      },
      dnt: 0,
      lmt: 0,
      ip: '156.80.103.xxx',
      devicetype: 4,
      make: 'Samsung',
      model: 'Galaxy S23',
      os: 'Android',
      osv: '14',
      hwv: 'SM-S911B',
      w: 1080,
      h: 2340,
      ppi: 425,
      pxratio: 2.625,
      js: 1,
      language: 'en',
      carrier: 'T-Mobile',
      connectiontype: 6,
      ifa: 'AEBE52E7-03EE-455A-B3C4-E57283966239',
    },
    user: {
      id: 'usr-d45ef678-9012-3456-7890-abcdef012345',
      yob: 1998,
      gender: 'M',
      data: [
        {
          id: 'audiverse-segments',
          name: 'AudioVerse',
          segment: [
            { id: 'gamer', name: 'Active Gamer', value: 'high' },
            { id: 'mobile-first', name: 'Mobile-First User', value: 'active' },
            { id: 'edm-fan', name: 'EDM Fan', value: 'medium' },
          ],
        },
      ],
      ext: {
        consent: 'CPzHq4APzHq4AAHABBENAUEAALAAAAP_gAEPgAAAAIAAA',
        eids: [
          {
            source: 'adserver.org',
            uids: [{ id: 'ABcd1234EfGh', atype: 1 }],
          },
        ],
      },
    },
    regs: {
      coppa: 0,
      gdpr: 0,
      ext: {
        us_privacy: '1YNN',
      },
    },
    at: 1,
    tmax: 300,
    cur: ['USD'],
    source: {
      ...SOURCE_BASE,
      tid: 'txn-d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
    },
    bcat: ['IAB25-3', 'IAB26', 'IAB7-39', 'IAB7-44'],
    badv: ['competitor1.com'],
  };
}

// ═══════════════════════════════════════════════════════════════
// 4. CONTEXTUAL AUDIO (5 context variations)
// ═══════════════════════════════════════════════════════════════

const CONTEXTUAL_DEVICES = {
  default: {
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    geo: {
      lat: 40.7128, lon: -74.006, type: 1, accuracy: 12,
      country: 'USA', region: 'NY', city: 'New York', zip: '10001', metro: '501',
    },
    dnt: 0, lmt: 0, ip: '72.229.28.xxx',
    devicetype: 4, make: 'Apple', model: 'iPhone 14 Pro', os: 'iOS', osv: '17.2',
    w: 1179, h: 2556, pxratio: 3, js: 1, language: 'en',
    carrier: 'Verizon', connectiontype: 2,
    ifa: '6D92078A-8246-4BA4-AE5B-76104861E7DC',
  },
  morning: {
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
    geo: {
      lat: 37.7749, lon: -122.4194, type: 1, accuracy: 20,
      country: 'USA', region: 'CA', city: 'San Francisco', zip: '94102', metro: '807',
    },
    dnt: 0, lmt: 0, ip: '104.132.45.xxx',
    devicetype: 4, make: 'Apple', model: 'AirPods Pro', os: 'iOS', osv: '17.3',
    w: 1179, h: 2556, pxratio: 3, js: 1, language: 'en',
    carrier: 'AT&T', connectiontype: 6,
    ifa: 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
  },
  evening: {
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    geo: {
      lat: 30.2672, lon: -97.7431, type: 2,
      country: 'USA', region: 'TX', city: 'Austin', zip: '78701', metro: '635',
    },
    dnt: 0, lmt: 0, ip: '209.166.78.xxx',
    devicetype: 2, make: 'Apple', model: 'MacBook Pro', os: 'macOS', osv: '14.2',
    w: 2560, h: 1600, pxratio: 2, js: 1, language: 'en',
    connectiontype: 2,
    ifa: 'B2C3D4E5-F6A7-8901-BCDE-F12345678901',
  },
  workout: {
    ua: 'AudioVerse/3.2.1 WearOS/4.0',
    geo: {
      lat: 25.7617, lon: -80.1918, type: 1, accuracy: 8,
      country: 'USA', region: 'FL', city: 'Miami', zip: '33101', metro: '528',
    },
    dnt: 0, lmt: 0, ip: '156.80.103.xxx',
    devicetype: 6, make: 'Samsung', model: 'Galaxy Watch 5', os: 'WearOS', osv: '4.0',
    w: 450, h: 450, pxratio: 2, js: 0, language: 'en',
    carrier: 'T-Mobile', connectiontype: 6,
    ifa: 'C3D4E5F6-A7B8-9012-CDEF-123456789012',
  },
  creative: {
    ua: 'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    geo: {
      lat: 51.5074, lon: -0.1278, type: 2,
      country: 'GBR', region: 'ENG', city: 'London', zip: 'EC1A',
    },
    dnt: 0, lmt: 0, ip: '81.128.164.xxx',
    devicetype: 5, make: 'Apple', model: 'iPad Pro', os: 'iPadOS', osv: '17.2',
    w: 2048, h: 2732, pxratio: 2, js: 1, language: 'en',
    connectiontype: 2,
    ifa: 'D4E5F6A7-B8C9-0123-DEF0-1234567890AB',
  },
};

const CONTEXTUAL_CONTENT = {
  default: { id: 'playlist-classical-001', title: 'Classical Music Playlist', cat: ['IAB1-7'], language: 'en', genre: 'Classical' },
  morning: { id: 'playlist-motivation-002', title: 'Morning Motivation Mix', cat: ['IAB1-7', 'IAB17-18'], language: 'en', genre: 'Pop/Motivation' },
  evening: { id: 'playlist-lofi-003', title: 'Lo-Fi Study Beats', cat: ['IAB1-7'], language: 'en', genre: 'Lo-Fi' },
  workout: { id: 'playlist-edm-004', title: 'High-Energy EDM', cat: ['IAB1-7', 'IAB17-18'], language: 'en', genre: 'EDM' },
  creative: { id: 'playlist-ambient-005', title: 'Ambient Focus Sounds', cat: ['IAB1-7'], language: 'en', genre: 'Ambient' },
};

const CONTEXTUAL_USERS = {
  default: {
    id: 'usr-ctx-default-001', yob: 1996, gender: 'M',
    data: [{ id: 'audiverse-segments', name: 'AudioVerse', segment: [
      { id: 'content-creator', name: 'Content Creator', value: 'high' },
      { id: 'classical-fan', name: 'Classical Music Fan', value: 'active' },
    ]}],
  },
  morning: {
    id: 'usr-ctx-morning-002', yob: 1988, gender: 'M',
    data: [{ id: 'audiverse-segments', name: 'AudioVerse', segment: [
      { id: 'professional', name: 'Working Professional', value: 'high' },
      { id: 'commuter', name: 'Daily Commuter', value: 'active' },
      { id: 'podcast-fan', name: 'Podcast Fan', value: 'medium' },
    ]}],
  },
  evening: {
    id: 'usr-ctx-evening-003', yob: 2002, gender: 'O',
    data: [{ id: 'audiverse-segments', name: 'AudioVerse', segment: [
      { id: 'student', name: 'Student', value: 'high' },
      { id: 'night-listener', name: 'Night Listener', value: 'active' },
    ]}],
  },
  workout: {
    id: 'usr-ctx-workout-004', yob: 1997, gender: 'F',
    data: [{ id: 'audiverse-segments', name: 'AudioVerse', segment: [
      { id: 'fitness', name: 'Fitness Enthusiast', value: 'high' },
      { id: 'edm-fan', name: 'EDM Fan', value: 'active' },
    ]}],
  },
  creative: {
    id: 'usr-ctx-creative-005', yob: 1992, gender: 'F',
    data: [{ id: 'audiverse-segments', name: 'AudioVerse', segment: [
      { id: 'designer', name: 'Designer', value: 'high' },
      { id: 'focus-listener', name: 'Focus Session Listener', value: 'active' },
    ]}],
  },
};

const CONTEXTUAL_BIDFLOORS = {
  default: 1.0,
  morning: 0.85,
  evening: 0.6,
  workout: 1.1,
  creative: 1.5,
};

export function getContextualAudioBidRequest(contextKey = 'default') {
  const device = CONTEXTUAL_DEVICES[contextKey] || CONTEXTUAL_DEVICES.default;
  const content = CONTEXTUAL_CONTENT[contextKey] || CONTEXTUAL_CONTENT.default;
  const userBase = CONTEXTUAL_USERS[contextKey] || CONTEXTUAL_USERS.default;
  const bidfloor = CONTEXTUAL_BIDFLOORS[contextKey] || 1.0;
  const isEU = contextKey === 'creative';

  return {
    id: `req-ctx-${contextKey}-${Date.now().toString(36)}`,
    imp: [
      {
        id: '1',
        audio: {
          mimes: ['audio/mp3', 'audio/mp4'],
          minduration: 15,
          maxduration: 30,
          startdelay: 0,
          protocols: [2, 3, 5, 6],
          api: [3, 5, 7],
          feed: 1,
          stitched: 0,
          nvol: 1,
        },
        bidfloor,
        bidfloorcur: 'USD',
        secure: 1,
      },
    ],
    app: {
      ...APP_BASE,
      cat: ['IAB1-7', ...(contextKey === 'workout' ? ['IAB17-18'] : [])],
      content,
    },
    device,
    user: {
      ...userBase,
      ext: {
        consent: isEU ? 'CPzHq4APzHq4AAHABBENAUEAALAAAAP_gAEPgAAAAIAAA' : '',
        eids: [
          {
            source: 'liveramp.com',
            uids: [{ id: `LR-${contextKey}-XY1000`, atype: 3 }],
          },
        ],
      },
    },
    regs: {
      coppa: 0,
      gdpr: isEU ? 1 : 0,
      ext: {
        us_privacy: isEU ? '' : '1YNN',
        ...(isEU ? {} : { gpp: 'DBACNYA~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA', gpp_sid: [7] }),
      },
    },
    at: 1,
    tmax: contextKey === 'workout' ? 300 : 500,
    cur: isEU ? ['USD', 'GBP', 'EUR'] : ['USD'],
    source: {
      ...SOURCE_BASE,
      tid: `txn-ctx-${contextKey}-${Date.now().toString(36)}`,
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// 5. MID-ROLL AUDIO
// ═══════════════════════════════════════════════════════════════

export function getMidRollAudioBidRequest() {
  return {
    id: 'req-e5f6a7b8-c9d0-1234-ef56-789012345678',
    imp: [
      {
        id: '1',
        audio: {
          mimes: ['audio/mp3', 'audio/mp4', 'audio/ogg'],
          minduration: 15,
          maxduration: 30,
          startdelay: -1,
          protocols: [2, 3, 5, 6],
          api: [3, 5, 7],
          feed: 1,
          stitched: 0,
          nvol: 1,
        },
        bidfloor: 0.5,
        bidfloorcur: 'USD',
        secure: 1,
        exp: 600,
      },
    ],
    app: {
      ...APP_BASE,
      content: {
        id: 'playlist-focus-flow-001',
        title: 'Focus & Flow Playlist',
        series: 'Curated Playlists',
        episode: 2,
        cat: ['IAB1-7'],
        livestream: 0,
        len: 1077,
        language: 'en',
        genre: 'Mixed/Chill',
      },
    },
    device: {
      ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.280 Mobile Safari/537.36',
      geo: {
        lat: 52.52,
        lon: 13.405,
        type: 2,
        country: 'DEU',
        region: 'BE',
        city: 'Berlin',
        zip: '10115',
      },
      dnt: 0,
      lmt: 0,
      ip: '91.64.128.xxx',
      devicetype: 4,
      make: 'Google',
      model: 'Pixel 8 Pro',
      os: 'Android',
      osv: '14',
      hwv: 'husky',
      w: 1344,
      h: 2992,
      ppi: 489,
      pxratio: 2.8,
      js: 1,
      language: 'de',
      carrier: 'Deutsche Telekom',
      connectiontype: 6,
      ifa: 'F6A7B8C9-D0E1-2345-F678-90ABCDEF0123',
    },
    user: {
      id: 'usr-e56fa7b8-c9d0-1234-5678-9abcdef01234',
      yob: 1991,
      gender: 'M',
      data: [
        {
          id: 'audiverse-segments',
          name: 'AudioVerse',
          segment: [
            { id: 'playlist-lover', name: 'Playlist Curator', value: 'high' },
            { id: 'long-session', name: 'Long Session Listener', value: 'active' },
          ],
        },
      ],
      ext: {
        consent: 'CPzHq4APzHq4AAHABBENAUEAALAAAAP_gAEPgAAAAIAAA',
        eids: [
          {
            source: 'pubcid.org',
            uids: [{ id: 'PC-de-XY9876', atype: 1 }],
          },
        ],
      },
    },
    regs: {
      coppa: 0,
      gdpr: 1,
      ext: {
        us_privacy: '',
        gpp: 'DBACNYA~CPXxRfAPXxRfAAfKABENB-CgAAAAAAAAAAYgAAAAAAAA',
        gpp_sid: [2],
      },
    },
    at: 2,
    tmax: 500,
    cur: ['USD', 'EUR'],
    source: {
      ...SOURCE_BASE,
      tid: 'txn-e5f6a7b8-c9d0-1234-ef56-789012345678',
    },
    bcat: ['IAB25-3', 'IAB26'],
  };
}
