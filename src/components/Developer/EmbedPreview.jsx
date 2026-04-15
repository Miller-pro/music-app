import { useState } from 'react';
import { motion } from 'framer-motion';

export default function EmbedPreview() {
  const [codeCopied, setCodeCopied] = useState(false);

  const embedCode = `AudioVersePlayer(
  appId: "YOUR_APP_ID",
  style: .compact,
  colorScheme: .custom(
    primary: Color("#FF6B35"),
    background: Color("#1A1A2E")
  ),
  autoPlay: true,
  genre: .ambient
)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <section className="px-4 py-16 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">Embeddable Player</h2>
        <p className="text-white/40 text-center mb-10">Drops into any view — your brand, your colors</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Player preview */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
            <div className="bg-[#1A1A2E] rounded-xl border border-white/10 p-4">
              {/* Mini player mockup */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF6B35]/30 to-[#FF6B35]/10 flex items-center justify-center">
                  <span className="text-lg">🎵</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">Ambient Dreams</div>
                  <div className="text-white/40 text-xs">AudioVerse · Ambient</div>
                </div>
                <button className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center hover:bg-[#e55a28] transition-colors">
                  <span className="text-white text-sm ml-0.5">▶</span>
                </button>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-[#FF6B35] rounded-full" />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-white/30">
                <span>1:24</span>
                <span>3:47</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-white/50">
              <p><span className="text-[#FF6B35]">Growth engine:</span> Every integration = free marketing</p>
              <p>Code once → embed everywhere → users discover → traffic grows</p>
            </div>
          </div>

          {/* Code */}
          <div>
            <div className="relative bg-black/30 border border-white/[0.06] rounded-2xl p-5 font-mono text-xs text-white/70 overflow-x-auto">
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-white/40 transition-colors"
              >
                {codeCopied ? '✓ Copied' : 'Copy'}
              </button>
              <pre className="whitespace-pre-wrap">{embedCode}</pre>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider">Customization</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Match your colors', 'Compact or full size', 'Auto-play option', 'Genre filters'].map(f => (
                  <div key={f} className="flex items-center gap-1.5 text-white/40 text-xs">
                    <span className="text-[#FF6B35]">•</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
