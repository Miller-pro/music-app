import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatCard({ label, value, prefix = '', suffix = '', icon }) {
  const numericVal = typeof value === 'number' ? value : parseInt(value.replace(/[^0-9]/g, ''));
  const { count, ref } = useCountUp(numericVal);
  return (
    <div ref={ref} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl md:text-3xl font-extrabold text-white">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-white/40 text-xs mt-1">{label}</div>
    </div>
  );
}

export default function LiveCounter() {
  const [latestTime, setLatestTime] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setLatestTime(prev => (prev >= 30 ? 1 : prev + Math.floor(Math.random() * 3) + 1));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="px-4 py-16 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">Live Activity</h2>
        <p className="text-white/40 text-center mb-8">Real-time platform stats</p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard icon="📱" label="Apps last 24h" value={5} />
          <StatCard icon="💰" label="Revenue today" value={4287} prefix="$" />
          <StatCard icon="🎵" label="Tracks this hour" value={12847} />
          <StatCard icon="📻" label="Radio listeners now" value={1293} />
          <StatCard icon="👨‍💻" label="Total developers" value={127} />
        </div>

        {/* Latest activity */}
        <motion.div
          key={latestTime}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400">HealthTrack Pro added — {latestTime} min ago</span>
          </div>
        </motion.div>

        {/* Beta alert */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 text-sm">
            <span className="text-amber-400">⚡ 47 beta spots remaining (70% revenue share)</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
