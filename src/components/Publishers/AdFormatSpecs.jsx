import { motion } from 'framer-motion';

const FORMATS = [
  {
    name: 'Pre-Roll Audio',
    icon: '🔊',
    duration: '15-30s',
    cpm: '$22-38',
    fillRate: '98%',
    desc: 'Plays before the first track in a listening session. Highest engagement with captive audience.',
    specs: ['VAST 4.2', 'MP3/AAC', 'Companion banner optional'],
  },
  {
    name: 'Mid-Roll Audio',
    icon: '📻',
    duration: '15-30s',
    cpm: '$18-32',
    fillRate: '99%',
    desc: 'Inserted between tracks during a session. Natural break point with high completion rates.',
    specs: ['VAST 4.2', 'Skippable after 5s', 'Frequency capped'],
  },
  {
    name: 'Companion Banner',
    icon: '🖼️',
    duration: 'Session',
    cpm: '$8-15',
    fillRate: '95%',
    desc: 'Visual display ad shown alongside audio playback. Drives click-through actions.',
    specs: ['300x250, 728x90', 'HTML5/Static', 'Clickable CTA'],
  },
  {
    name: 'In-Game Audio',
    icon: '🎮',
    duration: '10-15s',
    cpm: '$25-45',
    fillRate: '97%',
    desc: 'Non-intrusive audio ads that blend into gameplay audio. Premium inventory with loyal users.',
    specs: ['Spatial audio ready', 'Volume-matched', 'Context-aware'],
  },
  {
    name: 'Contextual Audio',
    icon: '📡',
    duration: '15-60s',
    cpm: '$30-50',
    fillRate: '92%',
    desc: 'AI-matched ads based on listening context, mood, genre, and user behavior patterns.',
    specs: ['ML targeting', 'Genre-matched', 'Mood-aware delivery'],
  },
];

export default function AdFormatSpecs() {
  return (
    <section className="px-4 lg:px-6 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-2xl font-bold mb-2 text-center">
          <span className="gradient-text">Ad Format Specs</span>
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8 max-w-lg mx-auto">
          Multiple premium ad formats optimized for music and audio experiences.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {FORMATS.map((fmt, i) => (
            <motion.div
              key={fmt.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-6 hover:border-primary-500/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{fmt.icon}</span>
                <span className="text-xs font-bold text-primary-300 bg-primary-500/10 px-2.5 py-1 rounded-full">
                  {fmt.cpm} CPM
                </span>
              </div>

              <h3 className="font-display font-bold text-lg mb-2">{fmt.name}</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{fmt.desc}</p>

              <div className="flex gap-4 text-xs text-gray-500 mb-4">
                <div>
                  <span className="text-gray-600">Duration:</span>{' '}
                  <span className="text-gray-300">{fmt.duration}</span>
                </div>
                <div>
                  <span className="text-gray-600">Fill:</span>{' '}
                  <span className="text-green-400">{fmt.fillRate}</span>
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {fmt.specs.map(spec => (
                    <span
                      key={spec}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/[0.06]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
