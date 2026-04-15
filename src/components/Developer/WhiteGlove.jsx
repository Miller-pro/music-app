import { motion } from 'framer-motion';

export default function WhiteGlove({ onGetStarted }) {
  return (
    <section className="px-4 py-16 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="bg-gradient-to-br from-[#FF6B35]/10 via-[#FF6B35]/5 to-transparent border border-[#FF6B35]/20 rounded-2xl p-8 md:p-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FF6B35]/10 rounded-full px-4 py-1.5 text-xs text-[#FF6B35] font-bold mb-6">
            ⚡ First 50 Apps Only
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">VIP White-Glove Onboarding</h2>
          <p className="text-white/40 mb-8 max-w-lg mx-auto">
            Don't want to deal with tech? We do it <span className="text-white font-bold">FOR you</span>.
          </p>

          {/* What we do */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 text-left max-w-xl mx-auto">
            <div className="bg-white/[0.03] rounded-xl p-5">
              <h3 className="text-[#FF6B35] font-bold text-sm mb-3">We Do Everything</h3>
              <ul className="space-y-2">
                {[
                  'Add ads.txt line for you',
                  'Integrate SDK into your app',
                  'Test everything end-to-end',
                  'Submit to App Store / Play Store',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-white/60 text-xs">
                    <span className="text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/[0.03] rounded-xl p-5">
              <h3 className="text-emerald-400 font-bold text-sm mb-3">You Do Nothing</h3>
              <ul className="space-y-2">
                {[
                  'Time required: 0 minutes',
                  'Technical skill: None needed',
                  'Cost: $0',
                  'Just share repo access',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-white/60 text-xs">
                    <span className="text-[#FF6B35]">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-white font-extrabold text-xl">12</div>
              <div className="text-white/30 text-xs">apps onboarded</div>
            </div>
            <div className="text-center">
              <div className="text-white font-extrabold text-xl">18 days</div>
              <div className="text-white/30 text-xs">avg time to first payout</div>
            </div>
            <div className="text-center">
              <div className="text-[#FF6B35] font-extrabold text-xl">38 spots left</div>
              <div className="text-white/30 text-xs">of 50 available</div>
            </div>
          </div>

          <button
            onClick={onGetStarted}
            className="bg-[#FF6B35] hover:bg-[#e55a28] text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-[#FF6B35]/25 hover:shadow-[#FF6B35]/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            Claim White-Glove Setup
          </button>
          <p className="text-white/30 text-xs mt-3">Free · No obligations · We handle everything</p>
        </div>
      </motion.div>
    </section>
  );
}
