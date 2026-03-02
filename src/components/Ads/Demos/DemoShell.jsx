import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BidRequestViewer from './BidRequestViewer';

function PlayDemoIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseDemoIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function RestartIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </svg>
  );
}

function ChartIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
    </svg>
  );
}

function FullscreenIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
  );
}

function VoiceIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
    </svg>
  );
}

export default function DemoShell({
  title,
  subtitle,
  badge,
  children,
  onPlay,
  onPause,
  onRestart,
  isPlaying,
  isComplete,
  metrics = [],
  formatId,
  voiceName,
  onCycleVoice,
  bidRequest,
  bidRequestProgress = 0,
  bidRequestIsPlaying = false,
  bidRequestChangedFields = null,
  bidRequestFormatLabel = 'Audio',
}) {
  const [showMetrics, setShowMetrics] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [requested, setRequested] = useState(false);
  const [showBidRequest, setShowBidRequest] = useState(true);
  const hasBidRequest = !!bidRequest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      {/* Header + Top Play Button */}
      <div className="flex items-start justify-between gap-6 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-display text-xl font-bold">{title}</h3>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-500/20 text-primary-300 border border-primary-500/30">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 max-w-xl">{subtitle}</p>
        </div>

        {/* Prominent top play button */}
        <div className="flex items-center gap-3 shrink-0">
          {isPlaying && (
            <div className="flex items-center gap-1.5 text-xs text-primary-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-400" />
              </span>
              Live
            </div>
          )}
          <button
            onClick={isPlaying ? onPause : onPlay}
            className={`group flex items-center gap-3 pl-4 pr-6 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
              isPlaying
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                : 'bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105'
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              isPlaying ? 'bg-white/15' : 'bg-white/25 group-hover:bg-white/30'
            }`}>
              {isPlaying
                ? <PauseDemoIcon className="w-5 h-5" />
                : <PlayDemoIcon className="w-5 h-5 translate-x-0.5" />
              }
            </div>
            <span className="text-base">
              {isPlaying ? 'Pause' : isComplete ? 'Play Again' : 'Play Demo'}
            </span>
          </button>
        </div>
      </div>

      {/* Demo content area */}
      <div
        className={`bg-[#16213E]/80 rounded-2xl border border-white/[0.08] overflow-hidden mb-4 transition-all duration-300 ${
          fullscreen ? 'fixed inset-4 z-50 m-0' : ''
        }`}
      >
        {fullscreen && (
          <div className="fixed inset-0 bg-black/80 -z-10" onClick={() => setFullscreen(false)} />
        )}
        <div className={`${fullscreen ? 'h-full overflow-auto' : ''} ${hasBidRequest && showBidRequest ? 'flex flex-col xl:flex-row' : ''}`}>
          <div className={`${hasBidRequest && showBidRequest ? 'xl:w-[60%] min-w-0' : ''} ${fullscreen && !hasBidRequest ? 'p-6' : ''}`}>
            {children}
          </div>
          {hasBidRequest && showBidRequest && (
            <div className="xl:w-[40%] border-t xl:border-t-0 xl:border-l border-white/[0.06] min-w-0" style={{ minHeight: 400 }}>
              <BidRequestViewer
                bidRequest={bidRequest}
                isPlaying={bidRequestIsPlaying}
                progress={bidRequestProgress}
                changedFields={bidRequestChangedFields}
                formatLabel={bidRequestFormatLabel}
              />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-all border border-white/[0.06]"
        >
          <RestartIcon className="w-4 h-4" />
          Restart
        </button>

        <button
          onClick={() => setShowMetrics(!showMetrics)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border border-white/[0.06] ${
            showMetrics ? 'bg-primary-500/15 text-primary-300' : 'bg-white/5 hover:bg-white/10 text-gray-300'
          }`}
        >
          <ChartIcon className="w-4 h-4" />
          {showMetrics ? 'Hide' : 'View'} Metrics
        </button>

        {onCycleVoice && (
          <button
            onClick={onCycleVoice}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-all border border-white/[0.06]"
            title={voiceName ? `Current: ${voiceName}` : 'Switch voice'}
          >
            <VoiceIcon className="w-4 h-4" />
            <span className="truncate max-w-[140px]">{voiceName || 'Voice'}</span>
          </button>
        )}

        {hasBidRequest && (
          <button
            onClick={() => setShowBidRequest(!showBidRequest)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border border-white/[0.06] ${
              showBidRequest ? 'bg-primary-500/15 text-primary-300' : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
            </svg>
            {showBidRequest ? 'Hide' : 'Show'} Bid Request
          </button>
        )}

        <button
          onClick={() => setFullscreen(!fullscreen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-all border border-white/[0.06]"
        >
          <FullscreenIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => setRequested(true)}
          disabled={requested}
          className={`ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            requested
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
              : 'bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white shadow-lg'
          }`}
        >
          {requested ? 'Request Sent!' : 'Request This Format'}
        </button>
      </div>

      {/* Metrics panel */}
      <AnimatePresence>
        {showMetrics && metrics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {metrics.map((m) => (
                <div key={m.label} className="glass-light rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold gradient-text mb-1">{m.value}</p>
                  <p className="text-xs text-gray-400">{m.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
