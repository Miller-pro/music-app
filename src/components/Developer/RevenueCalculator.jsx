import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

function Slider({ label, value, onChange, min, max, step, suffix }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-white/60 text-sm">{label}</span>
        <span className="text-white font-bold text-sm">{value.toLocaleString()}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-[#FF6B35]"
      />
      <div className="flex justify-between text-[10px] text-white/30 mt-1">
        <span>{min.toLocaleString()}{suffix}</span>
        <span>{max.toLocaleString()}{suffix}</span>
      </div>
    </div>
  );
}

export default function RevenueCalculator() {
  const [mau, setMau] = useState(50000);
  const [sessionTime, setSessionTime] = useState(15);
  const [sessionsPerUser, setSessionsPerUser] = useState(20);
  const [gamingMode, setGamingMode] = useState(false);

  const calc = useMemo(() => {
    const baseCpm = 12;
    const cpm = gamingMode ? baseCpm * 1.3 : baseCpm;
    const totalSessions = mau * sessionsPerUser;
    const totalMinutes = totalSessions * sessionTime;
    const impressions = Math.floor(totalMinutes / 15); // 1 ad per 15 min
    const gross = (impressions / 1000) * cpm;
    const yourShare = gross * 0.6;
    return { impressions, cpm, gross, yourShare };
  }, [mau, sessionTime, sessionsPerUser, gamingMode]);

  return (
    <section className="px-4 py-16 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">Revenue Calculator</h2>
        <p className="text-white/40 text-center mb-10">Drag the sliders to see your projected earnings</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Sliders */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-6">
            <Slider label="Monthly Active Users" value={mau} onChange={setMau} min={0} max={100000} step={1000} suffix="" />
            <Slider label="Avg Session Time" value={sessionTime} onChange={setSessionTime} min={0} max={40} step={1} suffix=" min" />
            <Slider label="Sessions / User / Month" value={sessionsPerUser} onChange={setSessionsPerUser} min={0} max={40} step={1} suffix="" />

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div>
                <span className="text-white/80 text-sm font-medium">Gaming Mode</span>
                <span className="text-white/30 text-xs block">+30% CPM boost</span>
              </div>
              <button
                onClick={() => setGamingMode(!gamingMode)}
                className={`w-12 h-6 rounded-full transition-colors relative ${gamingMode ? 'bg-[#FF6B35]' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${gamingMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gradient-to-br from-[#FF6B35]/10 to-transparent border border-[#FF6B35]/20 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <ResultRow label="Ad Impressions / Month" value={calc.impressions.toLocaleString()} />
              <ResultRow label="CPM Rate" value={`$${calc.cpm.toFixed(2)}`} />
              <ResultRow label="Gross Revenue" value={`$${calc.gross.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`} />
              <div className="border-t border-[#FF6B35]/20 pt-3">
                <div className="flex justify-between items-end">
                  <span className="text-white/60 text-sm">YOUR SHARE (60%)</span>
                  <div className="text-right">
                    <div className="text-[#FF6B35] font-extrabold text-3xl">
                      ${calc.yourShare.toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-lg">/mo</span>
                    </div>
                    <div className="text-white/40 text-xs">
                      = ${(calc.yourShare * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/year
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-[#FF6B35] hover:bg-[#e55a28] text-white font-bold py-3 rounded-xl text-sm transition-all">
                Lock In Revenue
              </button>
              <button className="flex-1 border border-[#FF6B35]/30 text-[#FF6B35] hover:bg-[#FF6B35]/10 font-bold py-3 rounded-xl text-sm transition-all">
                Email Me Calculation
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function ResultRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/50 text-sm">{label}</span>
      <span className="text-white font-semibold text-sm">{value}</span>
    </div>
  );
}
