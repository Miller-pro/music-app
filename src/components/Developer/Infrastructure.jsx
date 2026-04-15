import { motion } from 'framer-motion';

export default function Infrastructure() {
  return (
    <section className="px-4 py-16 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">Why We Can Offer This Free</h2>
        <p className="text-white/40 text-center mb-10">The infrastructure secret behind our model</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Traditional */}
          <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6">
            <h3 className="text-red-400 font-bold mb-4">Traditional Hosting (AWS S3)</h3>
            <ul className="space-y-3">
              {[
                '$0.09/GB egress fees',
                '100K users = $500–1,000/mo bandwidth',
                'Kills free-tier platforms',
                'Forces premium pricing',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="text-red-400">✕</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-center">
              <span className="text-red-400 font-bold text-xl">$500–1,000/mo</span>
              <span className="text-white/30 text-xs block">just for bandwidth</span>
            </div>
          </div>

          {/* Our solution */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-6">
            <h3 className="text-emerald-400 font-bold mb-4">Our Solution (Cloudflare R2)</h3>
            <ul className="space-y-3">
              {[
                '$0 egress fees — zero, always',
                '$0.015/GB storage only',
                'Unlimited bandwidth included',
                'Global CDN — fast worldwide',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="text-emerald-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-center">
              <span className="text-emerald-400 font-bold text-xl">~$0.40/mo</span>
              <span className="text-white/30 text-xs block">for 26GB of music</span>
            </div>
          </div>
        </div>

        {/* What this means */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h3 className="font-bold text-white mb-3 text-sm">What This Means For You</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: '♾️', text: 'Free forever — not a trial' },
              { icon: '📊', text: 'No pricing changes as you scale' },
              { icon: '🌍', text: 'Fast delivery worldwide via CDN' },
              { icon: '✅', text: '99.9% uptime guarantee' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 text-white/60 text-sm">
                <span>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
          <p className="mt-4 text-[#FF6B35] text-sm font-medium">
            This is why revenue share works — our costs stay near zero regardless of your growth.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
