import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StandardAudioDemo from '../components/Ads/Demos/StandardAudioDemo';
import ImmersiveAudioDemo from '../components/Ads/Demos/ImmersiveAudioDemo';
import InGameAudioDemo from '../components/Ads/Demos/InGameAudioDemo';
import ContextualAudioDemo from '../components/Ads/Demos/ContextualAudioDemo';
import MidRollAudioDemo from '../components/Ads/Demos/MidRollAudioDemo';
import CompanionBanners from '../components/Ads/Demos/CompanionBanners';

const TABS = [
  { id: 'standard', label: 'Standard Audio', icon: '🔊' },
  { id: 'immersive', label: 'Immersive', icon: '🎯' },
  { id: 'ingame', label: 'In-Game', icon: '🎮' },
  { id: 'contextual', label: 'Contextual', icon: '📡' },
  { id: 'midroll', label: 'Mid-Roll', icon: '📻' },
  { id: 'banners', label: 'Banners', icon: '🖼️' },
];

const PLATFORM_STATS = [
  { value: '2.4M+', label: 'Monthly Listeners' },
  { value: '18M+', label: 'Monthly Impressions' },
  { value: '92%', label: 'Avg. Completion Rate' },
  { value: '4.8%', label: 'Avg. CTR' },
  { value: '54+', label: 'Targeting Signals' },
  { value: '100%', label: 'Brand Safety' },
];

export default function AdvertiserDemos() {
  const [activeTab, setActiveTab] = useState('standard');
  const demoRef = useRef(null);
  const navigate = useNavigate();

  const scrollToDemo = (tabId) => {
    setActiveTab(tabId);
    demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl mx-4 lg:mx-6 mt-4 mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E]/90 via-[#16213E]/80 to-[#FF6B35]/30" />
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute border border-white/20 rounded-lg"
                style={{
                  width: 40 + Math.random() * 60,
                  height: 40 + Math.random() * 60,
                  left: `${(i * 5) % 100}%`,
                  top: `${(i * 7) % 100}%`,
                  animation: `bannerFloat ${4 + i * 0.5}s ease-in-out ${i * 0.3}s infinite alternate`,
                }}
              />
            ))}
          </div>
          {/* Waveform decoration */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 h-16 px-4 opacity-20">
            {[...Array(60)].map((_, i) => (
              <div
                key={i}
                className="bg-primary-400 rounded-t-full flex-1 min-w-[3px]"
                style={{
                  height: `${20 + Math.sin(i * 0.3) * 50 + Math.random() * 30}%`,
                  animation: `waveformBounce ${0.5 + (i % 8) * 0.1}s ease-in-out ${i * 0.05}s infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative px-8 py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              Interactive Demos
            </div>

            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-3 leading-tight">
              <span className="gradient-text">Experience Our</span>
              <br />
              Ad Formats Live
            </h1>

            <p className="text-gray-300 text-lg max-w-xl mb-6">
              Interactive demos that show exactly how your ads will appear to listeners.
              Play, pause, and explore each format in real-time.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => scrollToDemo('standard')}
                className="px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 font-semibold text-sm transition-colors shadow-lg shadow-primary-500/30"
              >
                Try the Demos
              </button>
              <a
                href="#stats"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 font-semibold text-sm transition-colors border border-white/10"
              >
                View Platform Stats
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platform Stats Bar */}
      <section id="stats" className="px-4 lg:px-6 mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PLATFORM_STATS.map((stat, i) => (
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

      {/* Tab Navigation */}
      <div ref={demoRef} className="px-4 lg:px-6 mb-6 sticky top-16 z-30">
        <div className="glass rounded-2xl p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500/20 text-primary-300 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Demo Content Area */}
      <div className="px-4 lg:px-6">
        {activeTab === 'standard' && <StandardAudioDemo />}
        {activeTab === 'immersive' && <ImmersiveAudioDemo />}
        {activeTab === 'ingame' && <InGameAudioDemo />}
        {activeTab === 'contextual' && <ContextualAudioDemo />}
        {activeTab === 'midroll' && <MidRollAudioDemo />}
        {activeTab === 'banners' && <CompanionBanners />}
      </div>

      {/* Format Comparison Table */}
      <section className="px-4 lg:px-6 mt-12 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-display text-2xl font-bold mb-6 text-center">Compare Ad Formats</h2>
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-5 py-4 text-gray-400 font-medium">Format</th>
                    <th className="text-center px-4 py-4 text-gray-400 font-medium">CPM</th>
                    <th className="text-center px-4 py-4 text-gray-400 font-medium">Completion</th>
                    <th className="text-center px-4 py-4 text-gray-400 font-medium">CTR</th>
                    <th className="text-center px-4 py-4 text-gray-400 font-medium">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Standard Audio', cpm: '$18-32', completion: '92%', ctr: '2.4%', best: 'Brand awareness' },
                    { name: 'Immersive Audio', cpm: '$28-45', completion: '90%', ctr: '4.8%', best: 'Direct response' },
                    { name: 'In-Game Audio', cpm: '$22-38', completion: '97%', ctr: '1.8%', best: 'Non-intrusive reach' },
                    { name: 'Contextual Audio', cpm: '$25-50', completion: '88%', ctr: '5.2%', best: 'Precision targeting' },
                    { name: 'Mid-Roll Audio', cpm: '$15-28', completion: '95%', ctr: '2.1%', best: 'Scale & frequency' },
                  ].map((row, i) => (
                    <tr
                      key={row.name}
                      className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer`}
                      onClick={() => scrollToDemo(TABS[i].id)}
                    >
                      <td className="px-5 py-3.5 font-medium">{row.name}</td>
                      <td className="text-center px-4 py-3.5 text-primary-300 font-semibold">{row.cpm}</td>
                      <td className="text-center px-4 py-3.5">
                        <span className="text-green-400">{row.completion}</span>
                      </td>
                      <td className="text-center px-4 py-3.5">{row.ctr}</td>
                      <td className="text-center px-4 py-3.5 text-gray-400">{row.best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/30 via-[#1A1A2E]/40 to-[#FFD700]/30" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />

          <div className="relative px-8 py-14 text-center">
            <h2 className="font-display text-3xl font-bold mb-3">
              Ready to <span className="gradient-text">Reach Your Audience</span>?
            </h2>
            <p className="text-gray-300 max-w-lg mx-auto mb-8">
              Start advertising on AudioVerse today. Our team will help you choose the right formats
              and targeting strategy for your campaign goals.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button className="px-8 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-400 font-semibold transition-colors shadow-lg shadow-primary-500/30">
                Get Started
              </button>
              <button className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 font-semibold transition-colors border border-white/10">
                Contact Sales
              </button>
              <button className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 font-semibold text-gray-300 transition-colors border border-white/[0.06]">
                Download Media Kit
              </button>
              <button
                onClick={() => navigate('/publishers')}
                className="px-8 py-3.5 rounded-xl bg-accent-500/20 hover:bg-accent-500/30 font-semibold text-accent-300 transition-colors border border-accent-500/20"
              >
                Are you a Publisher?
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
                <span className="text-xs">Brand Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                </svg>
                <span className="text-xs">Real-Time Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span className="text-xs">IAB Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
                <span className="text-xs">2.4M+ Listeners</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
