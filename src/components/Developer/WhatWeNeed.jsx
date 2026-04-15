import { useState } from 'react';
import { motion } from 'framer-motion';

export default function WhatWeNeed() {
  const [copied, setCopied] = useState(false);
  const adsLine = 'audioverse.com, pub-ABC123, DIRECT, f08c47fec0942fa0';

  const handleCopy = () => {
    navigator.clipboard.writeText(adsLine);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="px-4 py-16 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">What We Need From You</h2>
        <p className="text-white/40 text-center mb-10">We only ask for <span className="text-[#FF6B35] font-bold">ONE thing</span></p>

        {/* ads.txt line */}
        <div className="bg-white/[0.03] border border-[#FF6B35]/20 rounded-2xl p-6 mb-8">
          <p className="text-white/50 text-sm mb-3">Add this line to your app-ads.txt file:</p>
          <div className="flex items-center gap-3 bg-black/30 rounded-xl p-4 font-mono text-sm">
            <code className="flex-1 text-[#FF6B35] break-all">{adsLine}</code>
            <button
              onClick={handleCopy}
              className="shrink-0 px-4 py-2 bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 text-[#FF6B35] rounded-lg text-xs font-bold transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-white/60 text-sm">
              <span className="text-[#FF6B35] font-bold">Why?</span> This IAB-standard line lets us serve audio ads in your app and share 60% of the revenue with you.
            </p>
          </div>
        </div>

        {/* Before / After */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-5 text-center">
            <div className="text-red-400 font-bold mb-2">Without app-ads.txt</div>
            <div className="text-white/40 text-sm">No ads · No revenue · $0/mo</div>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-5 text-center">
            <div className="text-emerald-400 font-bold mb-2">With app-ads.txt</div>
            <div className="text-white/40 text-sm">Audio ads · Revenue share · $720+/mo</div>
          </div>
        </div>

        {/* Safety */}
        <div className="space-y-3">
          <h3 className="font-bold text-white text-sm">Is it safe?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'IAB Tech Lab standard',
              'Used by Google & Facebook',
              'Remove anytime (1 line delete)',
              'Does not access user data',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-white/50 text-sm">
                <span className="text-emerald-400">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Where to add */}
        <div className="mt-8 bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="font-bold text-white text-sm mb-3">Where to add it</h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-white/50">
            <div className="flex gap-2">
              <span className="text-white/70 font-medium">iOS:</span>
              App Store Connect → App Information → app-ads.txt
            </div>
            <div className="flex gap-2">
              <span className="text-white/70 font-medium">Android:</span>
              Play Console → Store Presence → app-ads.txt
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
