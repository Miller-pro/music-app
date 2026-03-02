import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function PublisherCta({ onGetStarted }) {
  const navigate = useNavigate();

  return (
    <section className="px-4 lg:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/30 via-[#1A1A2E]/40 to-[#FF6B35]/30" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />

        <div className="relative px-8 py-14 text-center">
          <h2 className="font-display text-3xl font-bold mb-3">
            Ready to <span className="gradient-text">Start Earning</span>?
          </h2>
          <p className="text-gray-300 max-w-lg mx-auto mb-8">
            Join hundreds of music app publishers already monetizing with AudioVerse.
            Integration takes minutes, revenue starts flowing immediately.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="px-8 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-400 font-semibold transition-colors shadow-lg shadow-primary-500/30"
            >
              Create Publisher Account
            </button>
            <button
              onClick={() => navigate('/advertisers')}
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 font-semibold transition-colors border border-white/10"
            >
              I'm an Advertiser
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
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
              </svg>
              <span className="text-xs">60% Revenue Share</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="text-xs">IAB Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
              </svg>
              <span className="text-xs">Real-Time Analytics</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
