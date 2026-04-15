import { motion } from 'framer-motion';

export default function Transparency() {
  return (
    <section className="px-4 py-16 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">Full Transparency</h2>
        <p className="text-white/40 text-center mb-10">Where we are today — no sugarcoating</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Ready Now */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-6">
            <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Ready Now
            </h3>
            <ul className="space-y-2">
              {[
                '1,749 tracks live and playable',
                '450 radio stations streaming',
                'SDK integration packages',
                'Player UI components',
                'Developer documentation',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="text-emerald-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Building */}
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-6">
            <h3 className="text-amber-400 font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Building (Month 1–2)
            </h3>
            <ul className="space-y-2">
              {[
                'Backend developer accounts',
                'Analytics dashboard',
                'License verification (70% done)',
                'Automated payouts (Month 3)',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-white/60 text-sm">
                  <span className="text-amber-400">◑</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Early adopter benefits */}
        <div className="mt-8 bg-gradient-to-r from-[#FF6B35]/5 to-transparent border border-[#FF6B35]/15 rounded-2xl p-6">
          <h3 className="text-[#FF6B35] font-bold mb-4">Early Adopter Benefits</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: '💰', text: '70% revenue share (vs 60% standard)' },
              { icon: '⭐', text: 'Lifetime early adopter status' },
              { icon: '🎯', text: 'Priority support & direct contact' },
              { icon: '🗺️', text: 'Roadmap input & feature requests' },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-3 text-white/60 text-sm">
                <span>{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
          <p className="mt-4 text-white/40 text-xs">
            We're not asking you to pay. We're asking you to grow with us.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
