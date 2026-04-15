import { motion } from 'framer-motion';

export default function FinalCTA({ onGetStarted }) {
  return (
    <section className="px-4 py-20 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
          Start Earning <span className="text-[#FF6B35]">$1,000+/Month</span><br />
          in 15 Minutes
        </h2>
        <p className="text-white/40 text-lg mb-10 max-w-lg mx-auto">
          No signup. No credit card. No risk.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <button
            onClick={onGetStarted}
            className="bg-[#FF6B35] hover:bg-[#e55a28] text-white font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-lg shadow-[#FF6B35]/25 hover:shadow-[#FF6B35]/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Free Setup
          </button>
          <button className="border border-[#FF6B35]/30 text-[#FF6B35] hover:bg-[#FF6B35]/10 font-bold px-10 py-4 rounded-xl text-lg transition-all">
            Email Me Revenue Report
          </button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { icon: '🏛️', label: 'IAB Tech Lab Certified' },
            { icon: '👶', label: 'COPPA Compliant' },
            { icon: '🛡️', label: 'GDPR Ready' },
            { icon: '📱', label: 'App Store Approved' },
          ].map(badge => (
            <div
              key={badge.label}
              className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white/40"
            >
              <span>{badge.icon}</span>
              {badge.label}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
