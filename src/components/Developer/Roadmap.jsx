import { motion } from 'framer-motion';

const categories = [
  {
    title: 'Legal',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/15',
    bgColor: 'bg-purple-500/5',
    items: [
      { text: 'Audit all 1,749 tracks', done: false },
      { text: 'Remove unclear licenses', done: false },
      { text: 'Remove NC-licensed tracks', done: false },
      { text: 'Register DMCA agent ($6)', done: false },
      { text: 'Add Terms of Service', done: false },
      { text: 'Add Privacy Policy', done: false },
    ],
  },
  {
    title: 'Infrastructure',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/15',
    bgColor: 'bg-blue-500/5',
    items: [
      { text: 'Test 450 radio station URLs', done: false },
      { text: 'Remove dead streams', done: false },
      { text: 'Connect AdSense', done: false },
      { text: 'Wire forms to email', done: false },
      { text: 'Add Plausible analytics', done: false },
    ],
  },
  {
    title: 'Backend',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/15',
    bgColor: 'bg-emerald-500/5',
    items: [
      { text: 'User auth (Supabase/Clerk)', done: false },
      { text: 'Cloud sync preferences', done: false },
      { text: 'Analytics dashboard', done: false },
      { text: 'Auto ads.txt verification', done: false },
    ],
  },
];

export default function Roadmap() {
  return (
    <section className="px-4 py-16 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">Phase 1 Action Plan</h2>
        <p className="text-white/40 text-center mb-10">Our Month 1–2 commitments — what we're actively building</p>

        <div className="grid md:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.title} className={`${cat.bgColor} border ${cat.borderColor} rounded-2xl p-5`}>
              <h3 className={`font-bold mb-4 ${cat.color}`}>{cat.title}</h3>
              <ul className="space-y-2.5">
                {cat.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/50 text-xs">
                    <span className={`shrink-0 mt-0.5 ${item.done ? 'text-emerald-400' : 'text-white/20'}`}>
                      {item.done ? '✓' : '○'}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Progress updated weekly at audioverse.com/roadmap
        </p>
      </motion.div>
    </section>
  );
}
