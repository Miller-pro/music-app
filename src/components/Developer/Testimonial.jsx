import { motion } from 'framer-motion';

export default function Testimonial() {
  return (
    <section className="px-4 py-16 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="bg-gradient-to-br from-[#FF6B35]/5 to-transparent border border-[#FF6B35]/15 rounded-2xl p-8 md:p-10">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B35]/30 to-[#FF6B35]/10 flex items-center justify-center text-2xl">
                👨‍💻
              </div>
            </div>

            <div className="flex-1">
              {/* Quote */}
              <blockquote className="text-white/70 leading-relaxed mb-6">
                <p className="mb-3">
                  "I was skeptical — checked their GitHub, read the docs, decided to try it on a side project. Integration took 8 minutes.
                </p>
                <p className="mb-3">
                  First month: $847. I thought it was a glitch. Month 6: consistently above $1,200.
                </p>
                <p className="text-white/90 font-medium">
                  My only regret is not doing this 6 months earlier."
                </p>
              </blockquote>

              {/* Attribution */}
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    David K.
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded-full font-medium">Verified</span>
                  </div>
                  <div className="text-white/40 text-sm">iOS Developer · FitTracker · 250K MAU</div>
                </div>
              </div>

              {/* Revenue timeline */}
              <div className="mt-6 flex flex-wrap gap-3">
                {[
                  { label: 'Month 1', value: '$847', color: 'text-emerald-400' },
                  { label: 'Month 3', value: '$1,050', color: 'text-emerald-400' },
                  { label: 'Month 6', value: '$1,200', color: 'text-[#FF6B35]' },
                ].map(m => (
                  <div key={m.label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                    <div className="text-white/30 text-[10px]">{m.label}</div>
                    <div className={`font-bold text-sm ${m.color}`}>{m.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 text-xs text-white/30">
                <span>📱 App Store link available</span>
                <span>·</span>
                <span>📊 Revenue screenshots available on request</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
