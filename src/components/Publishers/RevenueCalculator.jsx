import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const SLIDERS = [
  { key: 'mau', label: 'Monthly Active Users', min: 1000, max: 5000000, step: 1000, defaultVal: 100000, format: v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K` },
  { key: 'sessions', label: 'Avg Sessions / User / Month', min: 1, max: 30, step: 1, defaultVal: 8, format: v => v.toString() },
  { key: 'tracks', label: 'Avg Tracks / Session', min: 1, max: 50, step: 1, defaultVal: 12, format: v => v.toString() },
  { key: 'cpm', label: 'Avg CPM ($)', min: 5, max: 50, step: 1, defaultVal: 25, format: v => `$${v}` },
];

function useAnimatedValue(target) {
  const [display, setDisplay] = useState(target);
  const ref = useRef(target);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = ref.current;
    const diff = target - start;
    if (Math.abs(diff) < 1) { setDisplay(target); ref.current = target; return; }

    const duration = 400;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        ref.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return display;
}

export default function RevenueCalculator() {
  const [values, setValues] = useState(
    Object.fromEntries(SLIDERS.map(s => [s.key, s.defaultVal]))
  );

  const { mau, sessions, tracks, cpm } = values;
  // monthlyRevenue = (MAU * sessions * avgTracks * 0.7 / 1000) * CPM * 0.6
  const adOpportunities = mau * sessions * tracks * 0.7;
  const grossRevenue = (adOpportunities / 1000) * cpm;
  const monthlyRevenue = grossRevenue * 0.6;
  const yearlyRevenue = monthlyRevenue * 12;

  const animatedMonthly = useAnimatedValue(monthlyRevenue);
  const animatedYearly = useAnimatedValue(yearlyRevenue);

  const formatCurrency = (v) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
    if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`;
    return `$${Math.round(v)}`;
  };

  return (
    <section id="calculator" className="px-4 lg:px-6 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-2xl font-bold mb-2 text-center">
          <span className="gradient-text">Revenue Calculator</span>
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8 max-w-lg mx-auto">
          Estimate your monthly earnings based on your platform metrics.
        </p>

        <div className="glass rounded-2xl p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Sliders */}
            <div className="space-y-6">
              {SLIDERS.map(slider => (
                <div key={slider.key}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {slider.label}
                    </label>
                    <span className="text-sm font-bold text-primary-300">
                      {slider.format(values[slider.key])}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={values[slider.key]}
                    onChange={e => setValues(v => ({ ...v, [slider.key]: Number(e.target.value) }))}
                    className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-primary-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                    <span>{slider.format(slider.min)}</span>
                    <span>{slider.format(slider.max)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Results */}
            <div className="flex flex-col items-center justify-center">
              <div className="glass-light rounded-2xl p-8 text-center w-full">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Estimated Monthly Revenue
                </p>
                <p className="text-5xl lg:text-6xl font-bold gradient-text mb-1 font-display">
                  {formatCurrency(animatedMonthly)}
                </p>
                <p className="text-gray-500 text-sm mb-6">per month (your 60% share)</p>

                <div className="border-t border-white/[0.06] pt-4">
                  <p className="text-xs text-gray-500 mb-1">Annual Projection</p>
                  <p className="text-2xl font-bold text-accent-400 font-display">
                    {formatCurrency(animatedYearly)}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="glass rounded-lg p-3">
                    <p className="text-lg font-bold text-white">{(adOpportunities / 1000000).toFixed(1)}M</p>
                    <p className="text-[10px] text-gray-500">Ad Impressions/mo</p>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <p className="text-lg font-bold text-white">{formatCurrency(grossRevenue)}</p>
                    <p className="text-[10px] text-gray-500">Gross Revenue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
