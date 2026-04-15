import { motion } from 'framer-motion';

const rows = [
  { label: 'Monthly Cost', av: '$0', spotify: '$99/mo', apple: '$499/mo', youtube: '$0*', diy: '$500+/mo' },
  { label: 'Setup Time', av: '15 min', spotify: '2–4 weeks', apple: '4–6 weeks', youtube: '1–2 weeks', diy: '3–6 months' },
  { label: 'Revenue Share', av: '60% yours', spotify: '0%', apple: '0%', youtube: '55%*', diy: '100%' },
  { label: 'Content Library', av: '1,749 tracks', spotify: '100M+ tracks', apple: '100M+ tracks', youtube: 'Varies', diy: '0 (license yourself)' },
  { label: 'Licensing', av: 'Legally verified', spotify: 'Streaming only', apple: 'Streaming only', youtube: 'UGC risk', diy: 'Your liability' },
  { label: 'Hosting Cost', av: '$0', spotify: 'N/A', apple: 'N/A', youtube: '$0', diy: '$200–1K/mo' },
  { label: 'Dev Time', av: '15 min', spotify: '40+ hours', apple: '80+ hours', youtube: '20+ hours', diy: '500+ hours' },
  { label: 'Monetization', av: 'Built-in', spotify: 'None', apple: 'None', youtube: 'Limited', diy: 'Build yourself' },
  { label: 'Lock-in', av: 'None', spotify: 'ToS dependent', apple: 'ToS dependent', youtube: 'ToS dependent', diy: 'None' },
  { label: 'Support', av: 'White-glove', spotify: 'Docs only', apple: 'Docs only', youtube: 'Docs only', diy: 'Yourself' },
  { label: 'Year 1 Cost', av: '$0', spotify: '$1,188', apple: '$5,988', youtube: '$0', diy: '$12,000+', highlight: true },
  { label: 'Year 1 Revenue', av: '$12,960+', spotify: '$0', apple: '$0', youtube: '$6,000*', diy: '$12,960', highlight: true },
  { label: 'NET BENEFIT', av: '+$12,960', spotify: '-$1,188', apple: '-$5,988', youtube: '+$6,000*', diy: '-$11K+', highlight: true, isTotal: true },
];

export default function ComparisonTable() {
  return (
    <section className="px-4 py-16 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">How We Compare</h2>
        <p className="text-white/40 text-center mb-10">AudioVerse saves you $11K–$24K in year 1</p>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-3 text-white/40 font-medium w-[140px]"></th>
                <th className="py-3 px-3 text-[#FF6B35] font-bold text-center">AudioVerse</th>
                <th className="py-3 px-3 text-white/50 font-medium text-center">Spotify API</th>
                <th className="py-3 px-3 text-white/50 font-medium text-center">Apple Music</th>
                <th className="py-3 px-3 text-white/50 font-medium text-center">YouTube</th>
                <th className="py-3 px-3 text-white/50 font-medium text-center">Build Yourself</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className={`border-b border-white/5 ${row.isTotal ? 'bg-[#FF6B35]/5' : ''} ${row.highlight ? 'font-bold' : ''}`}
                >
                  <td className="py-2.5 px-3 text-white/50 text-xs">{row.label}</td>
                  <td className={`py-2.5 px-3 text-center ${row.isTotal ? 'text-[#FF6B35] font-extrabold' : 'text-emerald-400'}`}>{row.av}</td>
                  <td className="py-2.5 px-3 text-center text-white/40">{row.spotify}</td>
                  <td className="py-2.5 px-3 text-center text-white/40">{row.apple}</td>
                  <td className="py-2.5 px-3 text-center text-white/40">{row.youtube}</td>
                  <td className="py-2.5 px-3 text-center text-white/40">{row.diy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-white/20 text-xs space-y-1">
          <p>* YouTube: Revenue share only on eligible content, subject to YouTube Partner Program approval. No guaranteed rates.</p>
          <p>* Build Yourself: Includes licensing, hosting, development time at $50/hr, and ongoing maintenance costs.</p>
        </div>
      </motion.div>
    </section>
  );
}
