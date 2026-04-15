import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

function StatLine({ label, value, color }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-white/60 text-sm">{label}</span>
      <span className={`font-semibold text-sm ${color}`}>{value}</span>
    </div>
  );
}

function PanelCard({ title, color, stats, borderColor }) {
  return (
    <div className={`flex-1 rounded-2xl border ${borderColor} bg-white/[0.03] p-6 backdrop-blur-sm`}>
      <h3 className={`text-lg font-bold mb-4 ${color}`}>{title}</h3>
      <div className="space-y-0">
        {stats.map((s, i) => (
          <StatLine key={i} {...s} />
        ))}
      </div>
    </div>
  );
}

export default function Hero({ onGetStarted }) {
  return (
    <section className="relative px-4 pt-12 pb-16 max-w-6xl mx-auto">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
        <motion.p variants={fadeUp} className="text-[#FF6B35] font-semibold text-sm tracking-widest uppercase mb-3 text-center">
          For App Developers
        </motion.p>
        <motion.h1 variants={fadeUp} className="text-3xl md:text-5xl font-extrabold text-center mb-4 leading-tight">
          Turn Your App Into a<br />
          <span className="text-[#FF6B35]">Revenue Machine</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="text-white/50 text-center max-w-xl mx-auto mb-10 text-lg">
          Free music library + SDK + 60/40 revenue share. Add one line to app-ads.txt and start earning.
        </motion.p>

        {/* Before / After Cards */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row gap-4 items-stretch mb-6">
          <PanelCard
            title="Without AudioVerse"
            color="text-red-400"
            borderColor="border-red-500/20"
            stats={[
              { label: 'Music Content', value: 'None', color: 'text-red-400' },
              { label: 'Monthly Revenue', value: '$0', color: 'text-red-400' },
              { label: 'API Costs', value: '-$200/mo', color: 'text-red-400' },
              { label: 'Monthly P&L', value: '-$200', color: 'text-red-400 font-bold' },
            ]}
          />

          {/* Arrow */}
          <div className="flex items-center justify-center py-4 md:py-0">
            <div className="flex flex-col items-center gap-2">
              <div className="hidden md:block text-[#FF6B35] text-3xl">→</div>
              <div className="md:hidden text-[#FF6B35] text-3xl">↓</div>
              <span className="text-xs text-white/40 text-center leading-tight">Add AudioVerse<br />(15 min)</span>
            </div>
          </div>

          <PanelCard
            title="With AudioVerse"
            color="text-emerald-400"
            borderColor="border-emerald-500/20"
            stats={[
              { label: 'Music Content', value: '1,749 tracks', color: 'text-emerald-400' },
              { label: 'Monthly Revenue', value: '$1,080/mo', color: 'text-emerald-400' },
              { label: 'Costs', value: '$0', color: 'text-emerald-400' },
              { label: 'Monthly P&L', value: '+$1,080', color: 'text-emerald-400 font-bold' },
            ]}
          />
        </motion.div>

        {/* Net improvement */}
        <motion.div variants={fadeUp} className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-6 py-3">
            <span className="text-white/60 text-sm">Net improvement:</span>
            <span className="text-emerald-400 font-extrabold text-xl">+$1,280/month</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeUp} className="text-center">
          <button
            onClick={onGetStarted}
            className="bg-[#FF6B35] hover:bg-[#e55a28] text-white font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-lg shadow-[#FF6B35]/25 hover:shadow-[#FF6B35]/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Free Setup — 15 Minutes
          </button>
          <p className="text-white/30 text-xs mt-3">No credit card · No signup required · Remove anytime</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
