import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAdAudio, { ADS } from './useAdAudio';
import DemoShell from './DemoShell';
import AudioWaveform, { MiniWaveform, SyncedScript, AdInfoBadge } from './AudioWaveform';
import { getMidRollAudioBidRequest } from './bidRequestData';

const AD = ADS.soundlibrary;

const PLAYLIST_TRACKS = [
  { id: 1, title: 'Morning Light', artist: 'Skyline Echo', duration: '3:24', genre: 'Ambient' },
  { id: 2, title: 'Urban Flow', artist: 'Beat Architect', duration: '2:58', genre: 'Lo-Fi' },
  // Ad plays between track 2 and 3
  { id: 3, title: 'Crystal Waves', artist: 'Ocean Sound', duration: '4:12', genre: 'Chill' },
  { id: 4, title: 'Neon Dreams', artist: 'Digital Pulse', duration: '3:35', genre: 'Synth' },
  { id: 5, title: 'Sunset Boulevard', artist: 'West Coast Vibes', duration: '3:48', genre: 'Indie' },
];

const TRACK_SIM_DURATION = 4;

export default function MidRollAudioDemo() {
  const audio = useAdAudio(AD.script, 15, {
    voice: AD.voice,
    musicStyle: AD.music.style,
  });
  const [playbackState, setPlaybackState] = useState('idle');
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [trackProgress, setTrackProgress] = useState(0);
  const timerRef = useRef(null);
  const startRef = useRef(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const bidRequest = useMemo(() => getMidRollAudioBidRequest(), []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    timerRef.current = null;
    startRef.current = null;
  }, []);

  const playTrack = useCallback((trackIdx) => {
    clearTimer();
    setCurrentTrackIdx(trackIdx);
    setTrackProgress(0);
    setPlaybackState('playing-track');
    startRef.current = Date.now();

    function tick() {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const progress = Math.min(elapsed / TRACK_SIM_DURATION, 1);
      setTrackProgress(progress);

      if (progress >= 1) {
        if (trackIdx === 1) {
          setPlaybackState('playing-ad');
          return;
        } else if (trackIdx < PLAYLIST_TRACKS.length - 1) {
          playTrack(trackIdx + 1);
        } else {
          setPlaybackState('complete');
          setDemoRunning(false);
        }
        return;
      }

      timerRef.current = requestAnimationFrame(tick);
    }

    timerRef.current = requestAnimationFrame(tick);
  }, [clearTimer]);

  useEffect(() => {
    if (playbackState === 'playing-ad' && !audio.isPlaying && !audio.isComplete) {
      audio.play();
    }
  }, [playbackState]);

  useEffect(() => {
    if (audio.isComplete && playbackState === 'playing-ad') {
      setTimeout(() => playTrack(2), 500);
    }
  }, [audio.isComplete, playbackState, playTrack]);

  const handlePlay = () => {
    audio.restart();
    setDemoRunning(true);
    playTrack(0);
  };

  const handlePause = () => {
    clearTimer();
    if (playbackState === 'playing-ad') {
      audio.pause();
    }
    setPlaybackState('idle');
    setDemoRunning(false);
  };

  const handleRestart = () => {
    clearTimer();
    audio.restart();
    setDemoRunning(false);
    setPlaybackState('idle');
    setCurrentTrackIdx(0);
    setTrackProgress(0);
  };

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const isAdSlot = playbackState === 'playing-ad';

  return (
    <DemoShell
      title="Mid-Roll Audio"
      subtitle={`"${AD.brand}" ad with ${AD.voice.label.toLowerCase()} voice plays naturally between tracks. Non-intrusive, with ${AD.music.label.toLowerCase()}.`}
      badge="Seamless"
      isPlaying={demoRunning}
      isComplete={playbackState === 'complete'}
      onPlay={handlePlay}
      onPause={handlePause}
      onRestart={handleRestart}
      voiceName={audio.selectedVoiceName}
      onCycleVoice={audio.cycleVoice}
      bidRequest={bidRequest}
      bidRequestIsPlaying={audio.isPlaying}
      bidRequestProgress={audio.progress}
      bidRequestFormatLabel="Mid-Roll Audio"
      formatId="mid-roll-audio"
      metrics={[
        { label: 'Completion Rate', value: '95%' },
        { label: 'Skip Rate', value: '5%' },
        { label: 'User Disruption', value: 'Minimal' },
        { label: 'CPM Range', value: '$15-28' },
        { label: 'Placement', value: 'Between tracks' },
        { label: 'Frequency', value: '1 per 3-5 tracks' },
        { label: 'Session Impact', value: '<1%' },
        { label: 'Monthly Impressions', value: '4.2M' },
      ]}
    >
      <div className="p-4">
        {/* Playlist header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-600 to-orange-400 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold">Focus &amp; Flow Playlist</p>
              <p className="text-[10px] text-gray-500">5 tracks &middot; 17:57 total</p>
            </div>
          </div>
          {demoRunning && (
            <span className="text-[10px] text-gray-500">
              Demo: {TRACK_SIM_DURATION}s per track (sped up)
            </span>
          )}
        </div>

        {/* Track list */}
        <div className="space-y-0.5">
          {PLAYLIST_TRACKS.map((track, i) => {
            const isCurrentTrack = currentTrackIdx === i && playbackState === 'playing-track';
            const isPast = playbackState !== 'idle' && (
              i < currentTrackIdx || (i === currentTrackIdx && playbackState !== 'playing-track' && i < 2)
            );

            return (
              <div key={track.id}>
                {/* Ad slot indicator between track 2 and 3 */}
                {i === 2 && (
                  <motion.div
                    animate={isAdSlot ? { borderColor: [`${AD.color}50`, `${AD.color}99`, `${AD.color}50`] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`my-1 rounded-xl border transition-all ${
                      isAdSlot
                        ? 'border-orange-500/30 p-3'
                        : playbackState !== 'idle' && currentTrackIdx >= 2
                        ? 'bg-green-500/5 border-green-500/20 p-3'
                        : 'border-dashed border-white/10 p-3'
                    }`}
                    style={isAdSlot ? { background: `${AD.color}10` } : {}}
                  >
                    {isAdSlot ? (
                      <div>
                        {/* Ad info */}
                        <AdInfoBadge ad={AD} className="mb-2" />
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${AD.color}20` }}>
                            <MiniWaveform isPlaying className="h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[9px] font-bold">AD</span>
                              <span className="text-xs text-gray-300">{AD.brand} Mid-Roll</span>
                              <span className="text-[10px] text-gray-500 ml-auto">Ad 1 of 1</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${audio.progress * 100}%`, background: AD.color }}
                              />
                            </div>
                            {/* Synced script */}
                            <div className="mt-2">
                              <SyncedScript
                                script={AD.script}
                                progress={audio.progress}
                                isPlaying={audio.isPlaying}
                                accentColor={AD.accentColor}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-mono text-gray-400 shrink-0">{audio.timeLeft}s</span>
                        </div>
                      </div>
                    ) : playbackState !== 'idle' && currentTrackIdx >= 2 ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        <span className="text-xs font-medium">{AD.brand} mid-roll ad delivered successfully</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 9v6h4l5 5V4L7 9H3z" />
                        </svg>
                        <span className="text-xs">
                          {AD.brand} mid-roll ad &mdash; plays between Track 2 and 3
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Track row */}
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isCurrentTrack
                      ? 'bg-primary-500/10'
                      : isPast
                      ? 'opacity-50'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="w-6 text-center shrink-0">
                    {isCurrentTrack ? (
                      <MiniWaveform isPlaying className="h-4 justify-center" />
                    ) : isPast ? (
                      <svg className="w-4 h-4 text-green-500 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    ) : (
                      <span className="text-xs text-gray-500">{i + 1}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-primary-300' : ''}`}>
                      {track.title}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{track.artist}</p>
                  </div>

                  <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded hidden sm:inline">{track.genre}</span>
                  <span className="text-xs text-gray-500 font-mono shrink-0">{track.duration}</span>

                  {isCurrentTrack && (
                    <div className="w-16 shrink-0">
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: `${trackProgress * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual progress indicator */}
        {demoRunning && (
          <div className="mt-4 px-1">
            <div className="flex items-center gap-2">
              {PLAYLIST_TRACKS.map((_, i) => (
                <div key={i} className="flex items-center gap-1 flex-1">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      i < currentTrackIdx || (i === currentTrackIdx && playbackState !== 'playing-track' && i < 2)
                        ? 'bg-primary-500'
                        : i === currentTrackIdx && playbackState === 'playing-track'
                        ? 'bg-primary-400 animate-pulse'
                        : 'bg-white/10'
                    }`}
                  />
                  {i < PLAYLIST_TRACKS.length - 1 && (
                    <div className="flex-1 h-0.5 bg-white/5 rounded">
                      {i === 1 && (
                        <div className="relative">
                          <div
                            className="absolute -top-1 right-0 w-2 h-2 rounded-full"
                            style={{
                              background: isAdSlot ? AD.color : `${AD.color}50`,
                              animation: isAdSlot ? 'pulse 1s infinite' : 'none',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-gray-600">Track 1</span>
              <span className="text-[9px]" style={{ color: `${AD.color}80` }}>{AD.brand} Ad</span>
              <span className="text-[9px] text-gray-600">Track 5</span>
            </div>
          </div>
        )}

        {playbackState === 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-green-500/10 rounded-xl border border-green-500/20 text-center"
          >
            <p className="text-sm text-green-400 font-medium">
              Playlist completed with 1 "{AD.brand}" mid-roll ad &mdash; natural, non-intrusive placement
            </p>
          </motion.div>
        )}
      </div>
    </DemoShell>
  );
}
