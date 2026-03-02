import { useState, useRef, useCallback, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════
// 5 FUN, CONVERSATIONAL 15-SECOND AUDIO ADS
// Written to sound like a cool friend talking, not a robot.
// Commas and periods create natural TTS pauses.
// ═══════════════════════════════════════════════════════════════

export const ADS = {
  podwave: {
    id: 'podwave',
    brand: 'Podwave',
    url: 'Podwave.com',
    category: 'Podcast Hosting',
    script: "Yo! Got a podcast idea? Stop overthinking it. Podwave lets you record, edit, and publish, in literally 10 minutes. Seriously. Try it free, no credit card needed. Podwave dot com. Let's go!",
    voice: { type: 'male', label: 'Young, energetic male', pitch: 1.1, rate: 1.0 },
    music: { style: 'upbeat', label: 'Upbeat background' },
    color: '#FF6B35',
    accentColor: '#FF8C61',
    format: 'MP3 128kbps',
    duration: 15,
  },
  designflow: {
    id: 'designflow',
    brand: 'DesignFlow Pro',
    url: 'DesignFlowPro.com',
    category: 'Creative Software',
    script: "Ugh, editing videos shouldn't feel like homework. DesignFlow makes it stupid simple. Drag, drop, done. No boring tutorials needed. Free for 30 days. DesignFlow Pro dot com. You're welcome!",
    voice: { type: 'female', label: 'Fun, upbeat female', pitch: 1.15, rate: 1.0 },
    music: { style: 'modern', label: 'Modern, techy beat' },
    color: '#FFB4A2',
    accentColor: '#FF6B35',
    format: 'MP3 128kbps',
    duration: 15,
  },
  masterclass: {
    id: 'masterclass',
    brand: 'MasterClass Studio',
    url: 'MasterClassStudio.com',
    category: 'Online Education',
    script: "Want Instagram-worthy photos? MasterClass Studio teaches you pro photography, in literally 30 days. No expensive camera needed. Just your phone! Get 50% off today. MasterClass Studio dot com. Trust me on this.",
    voice: { type: 'male', label: 'Friendly, conversational male', pitch: 1.05, rate: 0.92 },
    music: { style: 'soft', label: 'Soft, motivational' },
    color: '#059669',
    accentColor: '#34d399',
    format: 'MP3 128kbps',
    duration: 15,
  },
  taskmaster: {
    id: 'taskmaster',
    brand: 'TaskMaster AI',
    url: 'iOS & Android',
    category: 'Productivity App',
    script: "Okay, real talk, you have way too many tabs open right now. TaskMaster AI organizes your chaos, automatically. Like having a super organized friend, in your pocket. Free on iOS and Android. Download TaskMaster. Future you says thanks!",
    voice: { type: 'female', label: 'Chill, relatable female', pitch: 1.12, rate: 0.93 },
    music: { style: 'clean', label: 'Clean, minimal' },
    color: '#FFD700',
    accentColor: '#FFE44D',
    format: 'MP3 128kbps',
    duration: 15,
  },
  soundlibrary: {
    id: 'soundlibrary',
    brand: 'SoundLibrary Pro',
    url: 'SoundLibraryPro.com',
    category: 'Music Licensing',
    script: "Copyright strike? Yikes. SoundLibrary Pro has thousands of tracks you can actually use. YouTube, TikTok, podcasts, whatever. Nine bucks a month. Unlimited downloads. SoundLibrary Pro dot com. Problem solved!",
    voice: { type: 'male', label: 'Energetic, helpful male', pitch: 1.08, rate: 0.97 },
    music: { style: 'upbeatModern', label: 'Upbeat, modern' },
    color: '#f97316',
    accentColor: '#fb923c',
    format: 'MP3 128kbps',
    duration: 15,
  },
};

// Backwards-compatible flat script map
export const AD_SCRIPTS = {
  standard: ADS.podwave.script,
  inGame: ADS.taskmaster.script,
  midRoll: ADS.soundlibrary.script,
  contextual: {
    default: ADS.masterclass.script,
    morning: ADS.podwave.script,
    evening: ADS.soundlibrary.script,
    workout: ADS.taskmaster.script,
    creative: ADS.designflow.script,
  },
};

// Map context IDs to full ad objects for contextual demo
export const CONTEXTUAL_AD_MAP = {
  default: ADS.masterclass,
  morning: ADS.podwave,
  evening: ADS.soundlibrary,
  workout: ADS.taskmaster,
  creative: ADS.designflow,
};

// ═══════════════════════════════════════════════════════════════
// VOICE QUALITY RANKING
// Higher score = more natural sounding. Tested across browsers.
// ═══════════════════════════════════════════════════════════════

const VOICE_SCORES = {
  // Google voices (Chrome) — best overall
  'Google US English':            100,
  'Google UK English Male':       96,
  'Google UK English Female':     96,
  // Microsoft voices (Edge / Windows) — very good
  'Microsoft David Online':       94,
  'Microsoft Zira Online':        93,
  'Microsoft David':              92,
  'Microsoft Zira':               91,
  'Microsoft Mark Online':        90,
  'Microsoft Mark':               88,
  // macOS voices — solid quality
  'Samantha':                     95,
  'Daniel':                       93,
  'Karen':                        89,
  'Moira':                        87,
  'Alex':                         86,
  'Victoria':                     84,
  'Tessa':                        83,
  // Fallback
  'Google 日本語':                 0,  // wrong language, exclude
};

function scoreVoice(v) {
  if (!v.lang.startsWith('en')) return -1;
  for (const [name, score] of Object.entries(VOICE_SCORES)) {
    if (v.name.includes(name)) return score;
  }
  // Unknown English voice gets a baseline score
  return v.localService ? 40 : 60;
}

function getEnglishVoicesRanked() {
  const all = window.speechSynthesis?.getVoices() || [];
  return all
    .filter(v => v.lang.startsWith('en'))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

// ═══════════════════════════════════════════════════════════════
// BACKGROUND MUSIC GENERATOR (Web Audio API)
// Subtle tonal beds — 20% volume so voice stays front and center
// ═══════════════════════════════════════════════════════════════

const MUSIC_CHORDS = {
  upbeat: {
    notes: [261.63, 329.63, 392.00, 523.25],
    types: ['triangle', 'triangle', 'sine', 'sine'],
    lfoRate: 0.25,
    lfoDepth: 0.3,
    baseGain: 0.045,
  },
  modern: {
    notes: [220.00, 261.63, 329.63, 392.00],
    types: ['triangle', 'sine', 'triangle', 'sine'],
    lfoRate: 0.5,
    lfoDepth: 0.2,
    baseGain: 0.04,
  },
  soft: {
    notes: [196.00, 246.94, 293.66],
    types: ['sine', 'sine', 'sine'],
    lfoRate: 0.15,
    lfoDepth: 0.4,
    baseGain: 0.03,
  },
  clean: {
    notes: [293.66, 440.00],
    types: ['sine', 'sine'],
    lfoRate: 0,
    lfoDepth: 0,
    baseGain: 0.02,
  },
  upbeatModern: {
    notes: [329.63, 415.30, 493.88],
    types: ['triangle', 'triangle', 'sine'],
    lfoRate: 0.3,
    lfoDepth: 0.25,
    baseGain: 0.04,
  },
};

function createBackgroundMusic(style = 'upbeat', durationSec = 15) {
  let audioCtx;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return null;
  }

  const chord = MUSIC_CHORDS[style] || MUSIC_CHORDS.upbeat;
  const now = audioCtx.currentTime;

  // Master gain with fade-in / fade-out envelope
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(chord.baseGain, now + 0.8);
  masterGain.gain.setValueAtTime(chord.baseGain, now + durationSec - 1.5);
  masterGain.gain.linearRampToValueAtTime(0, now + durationSec);
  masterGain.connect(audioCtx.destination);

  // Optional LFO for subtle modulation
  let lfo = null;
  if (chord.lfoRate > 0) {
    lfo = audioCtx.createOscillator();
    lfo.frequency.value = chord.lfoRate;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = chord.lfoDepth * 0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start(now);
    lfo.stop(now + durationSec + 0.2);
  }

  // Chord oscillators
  const oscillators = chord.notes.map((freq, i) => {
    const osc = audioCtx.createOscillator();
    osc.type = chord.types[i] || 'sine';
    osc.frequency.value = freq;
    osc.detune.value = (i - chord.notes.length / 2) * 4;

    const noteGain = audioCtx.createGain();
    noteGain.gain.value = 0.15 / chord.notes.length;
    osc.connect(noteGain);
    noteGain.connect(masterGain);

    osc.start(now);
    osc.stop(now + durationSec + 0.2);
    return osc;
  });

  // Sub-bass for warmth
  const subBass = audioCtx.createOscillator();
  subBass.type = 'sine';
  subBass.frequency.value = chord.notes[0] / 2;
  const subGain = audioCtx.createGain();
  subGain.gain.value = 0.03;
  subBass.connect(subGain);
  subGain.connect(masterGain);
  subBass.start(now);
  subBass.stop(now + durationSec + 0.2);

  let stopped = false;

  return {
    stop: () => {
      if (stopped) return;
      stopped = true;
      try {
        const ct = audioCtx.currentTime;
        masterGain.gain.cancelScheduledValues(ct);
        masterGain.gain.setValueAtTime(masterGain.gain.value, ct);
        masterGain.gain.linearRampToValueAtTime(0, ct + 0.15);
        setTimeout(() => {
          oscillators.forEach(o => { try { o.stop(); } catch {} });
          try { subBass.stop(); } catch {}
          if (lfo) try { lfo.stop(); } catch {}
          audioCtx.close().catch(() => {});
        }, 200);
      } catch {
        try { audioCtx.close(); } catch {}
      }
    },
    audioCtx,
  };
}

// ═══════════════════════════════════════════════════════════════
// useAdAudio HOOK
// TTS voice + background music + timer + voice picker
// ═══════════════════════════════════════════════════════════════

export default function useAdAudio(script, durationSec = 15, options = {}) {
  const { voice = {}, musicStyle = null } = options;
  const voicePitch = voice.pitch ?? 1.1;
  const voiceRate = voice.rate ?? 0.95;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');

  const rafRef = useRef(null);
  const startRef = useRef(null);
  const pausedAtRef = useRef(0);
  const musicRef = useRef(null);
  const keepAliveRef = useRef(null);
  const voiceOverrideRef = useRef(null);

  // ── Load voices (async on Chrome) ────────────────────────
  useEffect(() => {
    function update() {
      const ranked = getEnglishVoicesRanked();
      if (ranked.length > 0 && !selectedVoiceName) {
        setSelectedVoiceName(ranked[0].name);
      }
    }
    update();
    window.speechSynthesis?.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', update);
  }, []);

  // ── Cleanup ──────────────────────────────────────────────
  const stopAll = useCallback(() => {
    try { window.speechSynthesis?.cancel(); } catch {}
    if (musicRef.current) {
      musicRef.current.stop();
      musicRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    keepAliveRef.current = null;
  }, []);

  useEffect(() => stopAll, [stopAll]);

  // ── Timer tick ───────────────────────────────────────────
  const tick = useCallback(() => {
    if (!startRef.current) return;
    const elapsed = pausedAtRef.current + (Date.now() - startRef.current) / 1000;
    if (elapsed >= durationSec) {
      stopAll();
      setIsPlaying(false);
      setCurrentTime(durationSec);
      setIsComplete(true);
      return;
    }
    setCurrentTime(elapsed);
    rafRef.current = requestAnimationFrame(tick);
  }, [durationSec, stopAll]);

  // ── Speak with best available voice ──────────────────────
  const speak = useCallback((text) => {
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(text);
      u.rate = voiceRate;
      u.pitch = voicePitch;
      u.volume = 1.0;

      // Pick voice: user override > auto-ranked best
      const voices = getEnglishVoicesRanked();
      let picked = null;

      if (voiceOverrideRef.current) {
        picked = voices.find(v => v.name === voiceOverrideRef.current);
      }

      if (!picked && voices.length > 0) {
        // Auto-select: prefer voices matching the ad's gender
        const isFemale = voice.type === 'female';
        const genderHints = isFemale
          ? ['Female', 'Zira', 'Samantha', 'Karen', 'Victoria', 'Moira', 'Tessa']
          : ['Male', 'David', 'Daniel', 'Mark', 'Alex', 'Tom'];

        const genderMatched = voices.filter(v =>
          genderHints.some(h => v.name.includes(h))
        );

        picked = genderMatched[0] || voices[0];
      }

      if (picked) {
        u.voice = picked;
        setSelectedVoiceName(picked.name);
      }

      window.speechSynthesis.speak(u);

      // Chrome TTS keepalive — prevents the ~15s silence bug
      keepAliveRef.current = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);
    } catch { /* TTS not available — visual-only mode */ }
  }, [voicePitch, voiceRate, voice.type]);

  // ── Cycle through available voices ───────────────────────
  const cycleVoice = useCallback(() => {
    const voices = getEnglishVoicesRanked();
    if (voices.length < 2) return;

    const currentName = voiceOverrideRef.current || selectedVoiceName;
    const currentIdx = voices.findIndex(v => v.name === currentName);
    const nextIdx = (currentIdx + 1) % voices.length;
    const next = voices[nextIdx];

    voiceOverrideRef.current = next.name;
    setSelectedVoiceName(next.name);
  }, [selectedVoiceName]);

  // ── Play ─────────────────────────────────────────────────
  const play = useCallback(() => {
    stopAll();
    pausedAtRef.current = 0;
    startRef.current = Date.now();

    if (musicStyle) {
      musicRef.current = createBackgroundMusic(musicStyle, durationSec);
    }

    // Small delay so the music bed establishes first
    setTimeout(() => speak(script), 350);

    setIsPlaying(true);
    setCurrentTime(0);
    setIsComplete(false);
    rafRef.current = requestAnimationFrame(tick);
  }, [script, durationSec, musicStyle, tick, stopAll, speak]);

  // ── Pause ────────────────────────────────────────────────
  const pause = useCallback(() => {
    if (!startRef.current) return;
    pausedAtRef.current += (Date.now() - startRef.current) / 1000;
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
    keepAliveRef.current = null;
    try { window.speechSynthesis?.pause(); } catch {}
    setIsPlaying(false);
  }, []);

  // ── Resume ───────────────────────────────────────────────
  const resume = useCallback(() => {
    startRef.current = Date.now();
    try { window.speechSynthesis?.resume(); } catch {}
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // ── Restart ──────────────────────────────────────────────
  const restart = useCallback(() => {
    stopAll();
    pausedAtRef.current = 0;
    startRef.current = null;
    setIsPlaying(false);
    setCurrentTime(0);
    setIsComplete(false);
  }, [stopAll]);

  // ── Skip ─────────────────────────────────────────────────
  const skip = useCallback(() => {
    stopAll();
    setIsPlaying(false);
    setCurrentTime(durationSec);
    setIsComplete(true);
  }, [durationSec, stopAll]);

  return {
    isPlaying,
    currentTime,
    duration: durationSec,
    progress: Math.min(currentTime / durationSec, 1),
    timeLeft: Math.max(0, Math.ceil(durationSec - currentTime)),
    isComplete,
    selectedVoiceName,
    play,
    pause,
    resume,
    restart,
    skip,
    cycleVoice,
  };
}
