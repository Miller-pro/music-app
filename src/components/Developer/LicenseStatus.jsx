import { motion } from 'framer-motion';

export default function LicenseStatus() {
  return (
    <section className="px-4 py-16 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">License Verification</h2>
        <p className="text-white/40 text-center mb-10">Transparent status on our content licensing</p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-white/50 text-sm">Verification Progress</span>
            <span className="text-[#FF6B35] font-bold text-sm">70%</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '70%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FF6B35]/70 rounded-full"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Process */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 text-sm">Our Process</h3>
            <ol className="space-y-3">
              {[
                'Legal repositories sourced (CC0/BY/BY-SA/PD)',
                'Manual verification of each track',
                'Documentation collection ongoing',
                'Legal review scheduled Month 2',
                'DMCA agent registration ($6)',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-white/50 text-sm">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* What we accept */}
          <div className="space-y-4">
            <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-6">
              <h3 className="font-bold text-emerald-400 mb-3 text-sm">What We Include</h3>
              <ul className="space-y-2">
                {['CC0 (Public Domain Dedication)', 'CC BY (Attribution)', 'CC BY-SA (ShareAlike)', 'Public Domain verified'].map(l => (
                  <li key={l} className="flex items-center gap-2 text-white/50 text-xs">
                    <span className="text-emerald-400">✓</span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6">
              <h3 className="font-bold text-red-400 mb-3 text-sm">What We Exclude</h3>
              <ul className="space-y-2">
                {['No NC (NonCommercial) tracks', 'No unclear licensing', 'No unverified sources'].map(l => (
                  <li key={l} className="flex items-center gap-2 text-white/50 text-xs">
                    <span className="text-red-400">✕</span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-amber-500/5 border border-amber-500/15 rounded-xl p-5">
          <p className="text-amber-400/80 text-xs font-medium mb-2">Important Disclaimer</p>
          <p className="text-white/40 text-xs leading-relaxed">
            All content is published under verified Creative Commons or Public Domain licenses.
            We are actively auditing every track and removing any with unclear licensing.
            Full documentation is available for your review. If any issues arise,
            we provide immediate removal and DMCA compliance.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
