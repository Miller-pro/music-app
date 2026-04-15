import { motion } from 'framer-motion';

export default function TheCatch() {
  return (
    <section className="px-4 py-16 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">The Catch</h2>
        <p className="text-white/40 text-center mb-10">What's the catch? Fair question.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* NOT */}
          <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6">
            <h3 className="text-red-400 font-bold mb-4">❌ It's NOT</h3>
            <ul className="space-y-3">
              {['Hidden fees or premium tiers', 'Bait & switch pricing', 'We own your users', 'Lock-in or contracts'].map(item => (
                <li key={item} className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="text-red-400/50">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* YES */}
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-6">
            <h3 className="text-emerald-400 font-bold mb-4">✓ It IS</h3>
            <ul className="space-y-3">
              {[
                'We make money when you make money',
                '60/40 revenue split (you get 60%)',
                'If you make $0, we make $0',
                'Our incentive = your success',
              ].map(item => (
                <li key={item} className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="text-emerald-400">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Story */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
          <h3 className="font-bold text-white mb-3 text-sm">How we got here</h3>
          <div className="space-y-2 text-white/50 text-sm leading-relaxed">
            <p>We tried charging $99/mo — nobody paid. Fair enough.</p>
            <p>We tried ads without revenue sharing — developers removed the SDK.</p>
            <p>So we built a win-win model: you bring the users, we bring the content and ads, we both earn.</p>
            <p className="text-white/70 font-medium">The only "catch" is that we need you to succeed for us to succeed.</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
