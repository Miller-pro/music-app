import { useState } from 'react';
import { motion } from 'framer-motion';

function BannerFrame({ children, label, size = '300x250' }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">
        {label} &middot; {size}
      </div>
      <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/30 border border-white/[0.08]">
        {children}
      </div>
    </div>
  );
}

function PodcastBanner() {
  const [clicked, setClicked] = useState(false);

  return (
    <BannerFrame label="Banner 1: Podcast Hosting">
      <div
        onClick={() => setClicked(true)}
        className="w-[300px] h-[250px] relative overflow-hidden cursor-pointer group"
        style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB4A2, #FFD700)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" style={{ animation: 'bannerFloat 4s ease-in-out infinite alternate' }} />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/5" style={{ animation: 'bannerFloat 5s ease-in-out 0.5s infinite alternate' }} />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
          {/* Animated microphone */}
          <motion.div
            animate={{ y: [0, -4, 0], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
              </svg>
            </div>
          </motion.div>

          {/* Sound wave decoration around mic */}
          <div className="absolute top-[72px] left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                className="w-1 rounded-full bg-white/30"
                style={{ height: 8 + i * 4 }}
              />
            ))}
          </div>

          <h3 className="text-white font-bold text-xl leading-tight mb-1.5">
            Start Your Podcast
          </h3>
          <h4 className="text-white font-bold text-xl leading-tight mb-3">
            Today
          </h4>
          <p className="text-white/70 text-xs mb-5">Free hosting. Unlimited episodes.</p>

          {/* Pulsing CTA */}
          <motion.button
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-8 py-2.5 bg-white text-[#1A1A2E] font-bold text-sm rounded-full shadow-lg hover:bg-orange-50 transition-colors"
          >
            Try Free
          </motion.button>

          {/* Brand */}
          <p className="absolute bottom-3 text-white/40 text-[10px] font-medium">PodcastHub.io</p>
        </div>

        {/* Click overlay */}
        {clicked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <p className="text-white font-semibold text-sm">Click Tracked!</p>
              <p className="text-gray-400 text-xs">Redirecting to landing page...</p>
              <button onClick={(e) => { e.stopPropagation(); setClicked(false); }} className="mt-2 text-xs text-gray-500 underline">
                Close
              </button>
            </div>
          </motion.div>
        )}

        {/* Hover effect */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
      </div>
    </BannerFrame>
  );
}

function CreativeSoftwareBanner() {
  const [clicked, setClicked] = useState(false);

  return (
    <BannerFrame label="Banner 2: Creative Software">
      <div
        onClick={() => setClicked(true)}
        className="w-[300px] h-[250px] relative overflow-hidden cursor-pointer group"
        style={{ background: 'linear-gradient(135deg, #1A1A2E, #FF6B35, #FFD700)' }}
      >
        {/* Animated brush strokes */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 250" fill="none">
          <motion.path
            d="M 20 200 Q 80 120 150 160 T 280 100"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="40"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M 0 80 Q 100 40 200 120 T 300 60"
            stroke="rgba(249,115,22,0.2)"
            strokeWidth="25"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1, 0] }}
            transition={{ duration: 5, delay: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M 50 250 Q 150 180 250 220"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="30"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1, 0] }}
            transition={{ duration: 4, delay: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
          {/* Paintbrush icon */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z" />
              </svg>
            </div>
          </motion.div>

          <h3 className="text-white font-bold text-xl leading-tight mb-1">Create Without</h3>
          <h4 className="text-white font-bold text-xl leading-tight mb-3">Limits</h4>
          <p className="text-white/70 text-xs mb-5">Professional design tools for everyone</p>

          {/* CTA */}
          <motion.button
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="px-7 py-2.5 bg-orange-500 text-white font-bold text-sm rounded-full shadow-lg hover:bg-orange-400 transition-colors"
          >
            Download Now
          </motion.button>

          <p className="absolute bottom-3 text-white/40 text-[10px] font-medium">CreativeStudio Pro</p>
        </div>

        {clicked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <p className="text-white font-semibold text-sm">Click Tracked!</p>
              <p className="text-gray-400 text-xs">Redirecting to download...</p>
              <button onClick={(e) => { e.stopPropagation(); setClicked(false); }} className="mt-2 text-xs text-gray-500 underline">
                Close
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </BannerFrame>
  );
}

function OnlineCourseBanner() {
  const [clicked, setClicked] = useState(false);

  return (
    <BannerFrame label="Banner 3: Online Course">
      <div
        onClick={() => setClicked(true)}
        className="w-[300px] h-[250px] relative overflow-hidden cursor-pointer group"
        style={{ background: 'linear-gradient(135deg, #065f46, #059669, #34d399)' }}
      >
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full border-2 border-white/10" style={{ animation: 'bannerFloat 6s ease-in-out infinite alternate' }} />
        <div className="absolute bottom-8 left-6 w-16 h-16 rounded-full border border-white/5" style={{ animation: 'bannerFloat 5s ease-in-out 1s infinite alternate' }} />

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
          {/* Book/camera icon */}
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
              </svg>
            </div>
          </motion.div>

          {/* Animated page flip effect */}
          <div className="absolute top-16 right-12 pointer-events-none">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ rotateY: [0, 30, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                className="w-6 h-8 bg-white/10 rounded-sm absolute"
                style={{ right: i * 4, transformOrigin: 'left center' }}
              />
            ))}
          </div>

          <h3 className="text-white font-bold text-lg leading-tight mb-1">Learn Photography</h3>
          <h4 className="text-white font-bold text-lg leading-tight mb-3">in 30 Days</h4>
          <p className="text-white/70 text-xs mb-5">From beginner to pro. Step by step.</p>

          {/* CTA */}
          <motion.button
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-8 py-2.5 bg-white text-emerald-700 font-bold text-sm rounded-full shadow-lg hover:bg-emerald-50 transition-colors"
          >
            Enroll Free
          </motion.button>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3 h-3 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
            <span className="text-white/60 text-[10px] ml-1">4.9 (2.3K reviews)</span>
          </div>

          <p className="absolute bottom-3 text-white/40 text-[10px] font-medium">SkillMaster Academy</p>
        </div>

        {clicked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <p className="text-white font-semibold text-sm">Click Tracked!</p>
              <p className="text-gray-400 text-xs">Redirecting to enrollment...</p>
              <button onClick={(e) => { e.stopPropagation(); setClicked(false); }} className="mt-2 text-xs text-gray-500 underline">
                Close
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </BannerFrame>
  );
}

export default function CompanionBanners() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4">
        <h3 className="font-display text-xl font-bold mb-1">Display Companion Banners</h3>
        <p className="text-sm text-gray-400">
          Animated 300x250 banner mockups that pair with audio ads. Click any banner to see click tracking in action.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 place-items-center">
        <PodcastBanner />
        <CreativeSoftwareBanner />
        <OnlineCourseBanner />
      </div>
    </motion.div>
  );
}
