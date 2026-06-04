// Decorative animated backdrop for the Advertiser/Publisher hero sections.
// Extracted from the two identical copies that used to live inline in
// AdvertiserDemos and PublisherHero — the only difference was the waveform
// bar color, exposed here as `waveColor`.
//
// The grid/waveform sizes are derived from a deterministic seeded value rather
// than Math.random(). Math.random() ran during render and produced different
// numbers on the server vs the client, which tripped a React hydration
// mismatch ("Prop `style` did not match"). Seeding by index keeps the same
// scattered look while guaranteeing identical server and client output.

// Stable pseudo-random in [0, 1) for a given seed.
function seeded(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Math.sin can differ in the last digit between the Node (server) and browser
// (client) V8 builds. Rounding the derived sizes to 2 decimals keeps the look
// identical while making the server and client strings byte-for-byte equal, so
// there is no hydration mismatch.
const r2 = (n) => Math.round(n * 100) / 100;

export default function HeroBackdrop({ waveColor = 'bg-primary-400' }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute border border-white/20 rounded-lg"
            style={{
              width: r2(40 + seeded(i * 2.13 + 1) * 60),
              height: r2(40 + seeded(i * 3.71 + 2) * 60),
              left: `${(i * 5) % 100}%`,
              top: `${(i * 7) % 100}%`,
              animation: `bannerFloat ${4 + i * 0.5}s ease-in-out ${i * 0.3}s infinite alternate`,
            }}
          />
        ))}
      </div>
      {/* Waveform decoration */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 h-16 px-4 opacity-20">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className={`${waveColor} rounded-t-full flex-1 min-w-[3px]`}
            style={{
              height: `${r2(20 + Math.sin(i * 0.3) * 50 + seeded(i + 0.5) * 30)}%`,
              animation: `waveformBounce ${0.5 + (i % 8) * 0.1}s ease-in-out ${i * 0.05}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
