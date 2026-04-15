import { motion } from 'framer-motion';

function MetricCard({ label, value, change, positive }) {
  return (
    <div className="bg-white/[0.03] rounded-lg p-3">
      <div className="text-white/30 text-[10px] uppercase tracking-wider mb-1">{label}</div>
      <div className="text-white font-bold text-lg">{value}</div>
      {change && (
        <div className={`text-[10px] font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
          {positive ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <section className="px-4 py-16 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">Analytics Dashboard</h2>
        <p className="text-white/40 text-center mb-10">Track everything in real-time (coming Month 2)</p>

        {/* Dashboard mockup */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 md:p-6">
          {/* Top metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <MetricCard label="Revenue (MTD)" value="$1,247" change="12% vs last month" positive />
            <MetricCard label="DAU / MAU" value="24.3%" change="2.1% improvement" positive />
            <MetricCard label="Avg Session" value="22 min" change="From 18 min" positive />
            <MetricCard label="CPM Rate" value="$13.40" change="$1.20 increase" positive />
          </div>

          {/* Chart mockup */}
          <div className="bg-white/[0.02] rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white/50 text-xs font-bold uppercase tracking-wider">Revenue Trend</h4>
              <div className="flex gap-2 text-[10px]">
                <span className="px-2 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] rounded">30d</span>
                <span className="px-2 py-0.5 text-white/30">90d</span>
                <span className="px-2 py-0.5 text-white/30">1y</span>
              </div>
            </div>
            {/* Simplified chart bars */}
            <div className="flex items-end gap-1 h-24">
              {[35, 42, 38, 55, 48, 62, 58, 70, 65, 75, 80, 72, 85, 88, 78, 90, 95, 85, 92, 98, 88, 95, 100, 92, 105, 110, 98, 108, 112, 115].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-[#FF6B35]/40 to-[#FF6B35]/80 transition-all hover:from-[#FF6B35]/60 hover:to-[#FF6B35]"
                  style={{ height: `${(h / 115) * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* Bottom metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Skip Rate" value="<18%" change="Below 20% target" positive />
            <MetricCard label="Retention (D7)" value="42%" change="Industry avg 25%" positive />
            <MetricCard label="Churn" value="3.2%" change="Below 5% target" positive />
            <MetricCard label="RPU" value="$0.024" change="Top 15% of apps" positive />
          </div>
        </div>

        {/* Industry benchmarks */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-white/30">
          <span>Benchmarks: Spotify DAU/MAU 33%</span>
          <span>·</span>
          <span>Avg session 148 min/day</span>
          <span>·</span>
          <span>Audio ad completion 90%+</span>
        </div>
      </motion.div>
    </section>
  );
}
