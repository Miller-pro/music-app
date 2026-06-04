'use client';

import { motion } from 'framer-motion';
import HeroBackdrop from '../UI/HeroBackdrop';

const STATS = [
  { value: '2.4M', label: 'Monthly Active Users' },
  { value: '500+', label: 'Artist Partners' },
  { value: '98.5%', label: 'Fill Rate' },
  { value: '$18-45', label: 'CPM Range' },
  { value: '60%', label: 'Revenue Share' },
  { value: 'Net 30', label: 'Payment Terms' },
];

export default function PublisherHero({ onGetStarted }) {
  return (
    <>
      <section className="relative overflow-hidden rounded-2xl mx-4 lg:mx-6 mt-4 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E]/90 via-[#16213E]/80 to-[#FF6B35]/30" />
        <HeroBackdrop waveColor="bg-accent-400" />

        <div className="relative px-8 py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 border border-accent-500/30 text-accent-300 text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
              Publisher Platform
            </div>

            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              <span className="gradient-text">Monetize Your</span>
              <br />
              Music Platform
            </h1>

            <p className="text-gray-300 text-lg max-w-xl mb-6">
              Turn your music app into a revenue engine. Premium audio ads, seamless SDK integration,
              and transparent revenue sharing — all powered by AudioVerse.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={onGetStarted}
                className="px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-400 font-semibold text-sm transition-colors shadow-lg shadow-accent-500/30"
              >
                Start Earning
              </button>
              <a
                href="#calculator"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 font-semibold text-sm transition-colors border border-white/10"
              >
                Calculate Revenue
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-4 lg:px-6 mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-light rounded-xl p-4 text-center"
            >
              <p className="text-2xl font-bold gradient-text mb-0.5">{stat.value}</p>
              <p className="text-[11px] text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
