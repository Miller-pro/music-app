import { motion } from 'framer-motion';

const cards = [
  {
    icon: '🎵',
    title: 'Free Content',
    marketValue: '$199/mo',
    features: ['1,749 tracks', '450 radio stations', 'Weekly updates'],
    yourCost: '$0',
    costColor: 'text-emerald-400',
  },
  {
    icon: '🛠️',
    title: 'SDK',
    marketValue: '$5,000',
    features: ['iOS/Android/RN/Flutter', 'UI components', 'Offline support'],
    yourCost: '$0',
    costColor: 'text-emerald-400',
  },
  {
    icon: '💰',
    title: 'Revenue',
    marketValue: '$1,200/mo',
    features: ['Pre-roll audio ads', '60% revenue share', 'Monthly payouts'],
    yourCost: '$720/mo earned',
    costColor: 'text-[#FF6B35]',
  },
  {
    icon: '☁️',
    title: 'Infrastructure',
    marketValue: '$200/mo',
    features: ['Global CDN hosting', 'Unlimited bandwidth', '99.9% uptime'],
    yourCost: '$0',
    costColor: 'text-emerald-400',
  },
  {
    icon: '⚖️',
    title: 'Legal',
    marketValue: '$2,000',
    features: ['Verified licenses', 'DMCA compliance', 'COPPA/GDPR ready'],
    yourCost: '$0',
    costColor: 'text-emerald-400',
  },
];

export default function ValueBreakdown() {
  return (
    <section className="px-4 py-16 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">What You Get</h2>
        <p className="text-white/40 text-center mb-10">Everything included, zero cost</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-[#FF6B35]/20 transition-colors"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-bold text-white mb-1">{card.title}</h3>
              <div className="text-white/30 text-xs mb-3">Market value: {card.marketValue}</div>
              <ul className="space-y-1.5 mb-4">
                {card.features.map(f => (
                  <li key={f} className="text-white/50 text-xs flex items-start gap-1.5">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className={`text-sm font-bold ${card.costColor}`}>Your cost: {card.yourCost}</div>
            </motion.div>
          ))}
        </div>

        {/* Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 bg-gradient-to-r from-[#FF6B35]/10 to-emerald-500/10 border border-[#FF6B35]/20 rounded-2xl p-6 text-center"
        >
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Market Value</div>
              <div className="text-white font-extrabold text-xl line-through decoration-red-400/50">$7,399 + $599/mo</div>
            </div>
            <div className="text-white/20 text-2xl hidden md:block">→</div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Your Cost</div>
              <div className="text-emerald-400 font-extrabold text-xl">$0</div>
            </div>
            <div className="text-white/20 text-2xl hidden md:block">+</div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Your Earnings</div>
              <div className="text-[#FF6B35] font-extrabold text-xl">$720+/mo</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
