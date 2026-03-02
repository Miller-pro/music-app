import { useMemo } from 'react';

export default function AudioWaveform({
  isPlaying = false,
  barCount = 32,
  color = 'primary',
  height = 48,
  className = '',
}) {
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => ({
      id: i,
      baseHeight: 20 + Math.random() * 60,
      delay: (i * 0.05) % 1.2,
      duration: 0.3 + Math.random() * 0.5,
    }));
  }, [barCount]);

  const colorMap = {
    primary: { from: 'rgb(255, 107, 53)', to: 'rgb(255, 215, 0)' },
    purple: { from: 'rgb(255, 107, 53)', to: 'rgb(204, 77, 34)' },
    cyan: { from: 'rgb(255, 215, 0)', to: 'rgb(255, 228, 77)' },
    green: { from: 'rgb(34, 197, 94)', to: 'rgb(74, 222, 128)' },
    orange: { from: 'rgb(249, 115, 22)', to: 'rgb(251, 146, 60)' },
    blue: { from: 'rgb(255, 180, 162)', to: 'rgb(255, 200, 180)' },
    white: { from: 'rgba(255,255,255,0.6)', to: 'rgba(255,255,255,0.3)' },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div
      className={`flex items-end justify-center gap-[2px] ${className}`}
      style={{ height }}
    >
      {bars.map((bar) => (
        <div
          key={bar.id}
          className="rounded-full transition-all"
          style={{
            width: Math.max(2, Math.floor((height * 0.8) / barCount)),
            height: isPlaying ? `${bar.baseHeight}%` : '12%',
            background: `linear-gradient(to top, ${c.from}, ${c.to})`,
            animation: isPlaying
              ? `waveformBounce ${bar.duration}s ease-in-out ${bar.delay}s infinite alternate`
              : 'none',
            transition: 'height 0.3s ease',
            opacity: isPlaying ? 0.9 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

export function MiniWaveform({ isPlaying, className = '' }) {
  return (
    <div className={`flex items-end gap-[2px] ${className}`}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-primary-400"
          style={{
            height: isPlaying ? `${12 + Math.random() * 8}px` : '4px',
            animation: isPlaying
              ? `waveformBounce ${0.3 + i * 0.1}s ease-in-out ${i * 0.1}s infinite alternate`
              : 'none',
            transition: 'height 0.2s ease',
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SyncedScript — Karaoke-style word-by-word text highlight
// ═══════════════════════════════════════════════════════════════

export function SyncedScript({ script, progress, isPlaying, accentColor }) {
  const words = useMemo(() => script.split(' '), [script]);
  const currentIdx = Math.floor(progress * (words.length + 2)); // +2 so last word completes before 100%

  if (!isPlaying && progress === 0) {
    return (
      <p className="text-sm text-gray-500 leading-relaxed italic">
        Press Play to hear the ad with background music
      </p>
    );
  }

  return (
    <p className="text-sm leading-relaxed">
      {words.map((word, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx && isPlaying;
        return (
          <span
            key={i}
            className="inline-block mr-1 transition-all duration-200"
            style={{
              color: isCurrent
                ? (accentColor || 'rgb(255, 140, 97)')
                : isPast
                ? 'rgba(255,255,255,0.95)'
                : 'rgba(156,163,175,0.5)',
              fontWeight: isCurrent ? 600 : 400,
              textShadow: isCurrent ? `0 0 12px ${accentColor || 'rgba(255,107,53,0.5)'}` : 'none',
              transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {word}
          </span>
        );
      })}
    </p>
  );
}

// ═══════════════════════════════════════════════════════════════
// AdInfoBadge — Shows ad metadata (brand, voice, music, format)
// ═══════════════════════════════════════════════════════════════

export function AdInfoBadge({ ad, className = '' }) {
  if (!ad) return null;
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 ${className}`}>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: ad.color }} />
        <span className="text-[11px] font-semibold text-gray-200">{ad.brand}</span>
        <span className="text-[10px] text-gray-500">&middot; {ad.category}</span>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /></svg>
          {ad.voice.label}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
          {ad.music.label}
        </span>
        <span>{ad.format}</span>
        <span>{ad.duration}s</span>
      </div>
    </div>
  );
}
