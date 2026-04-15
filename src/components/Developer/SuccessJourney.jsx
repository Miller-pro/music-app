import { motion } from 'framer-motion';

const steps = [
  { day: 'Day 1', label: 'Sign up', time: '2 min', revenue: '$0', color: 'bg-white/10' },
  { day: 'Day 1', label: 'Add ads.txt', time: '3 min', revenue: '$0', color: 'bg-white/10' },
  { day: 'Day 2', label: 'Auto-verify (24h)', time: 'Auto', revenue: 'Access unlocked', color: 'bg-blue-500/20' },
  { day: 'Day 2–3', label: 'SDK setup', time: '10 min', revenue: '$0', color: 'bg-white/10' },
  { day: 'Day 4–7', label: 'App Store review', time: 'Waiting', revenue: '$0', color: 'bg-white/10' },
  { day: 'Day 8–30', label: 'Users listening', time: 'Passive', revenue: '$200–500', color: 'bg-emerald-500/15' },
  { day: 'Day 30', label: 'FIRST PAYOUT', time: '—', revenue: '$1,080', color: 'bg-[#FF6B35]/20', highlight: true },
];

export default function SuccessJourney() {
  return (
    <section className="px-4 py-16 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">Your Success Path</h2>
        <p className="text-white/40 text-center mb-10">From zero to payout in 30 days</p>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-[#FF6B35]/30 to-[#FF6B35]/50" />

          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`relative flex items-center gap-4 ${step.color} rounded-xl p-4 ml-3 md:ml-5 ${step.highlight ? 'border border-[#FF6B35]/30' : ''}`}
              >
                {/* Dot */}
                <div className={`absolute -left-[19px] md:-left-[25px] w-3 h-3 rounded-full ${step.highlight ? 'bg-[#FF6B35]' : 'bg-white/20'} ring-2 ring-[#1A1A2E]`} />

                <div className="min-w-[70px]">
                  <div className={`text-xs font-bold ${step.highlight ? 'text-[#FF6B35]' : 'text-white/40'}`}>{step.day}</div>
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${step.highlight ? 'text-[#FF6B35]' : 'text-white/80'}`}>{step.label}</div>
                </div>
                <div className="text-white/30 text-xs hidden sm:block">{step.time}</div>
                <div className={`text-sm font-bold min-w-[80px] text-right ${step.highlight ? 'text-[#FF6B35]' : step.revenue.includes('$') && !step.revenue.includes('$0') ? 'text-emerald-400' : 'text-white/30'}`}>
                  {step.revenue}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-3 text-center">
            <div className="text-white/40 text-xs mb-1">Total active time</div>
            <div className="text-white font-extrabold">15 minutes</div>
          </div>
          <div className="bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-xl px-5 py-3 text-center">
            <div className="text-white/40 text-xs mb-1">Monthly passive income</div>
            <div className="text-[#FF6B35] font-extrabold">$1,080+</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
