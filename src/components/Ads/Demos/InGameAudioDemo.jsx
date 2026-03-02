import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAdAudio, { ADS } from './useAdAudio';
import DemoShell from './DemoShell';
import { MiniWaveform, SyncedScript, AdInfoBadge } from './AudioWaveform';
import { getInGameAudioBidRequest } from './bidRequestData';

const AD = ADS.taskmaster;

function MiniGame({ isAdPlaying, adTimeLeft }) {
  const canvasRef = useRef(null);
  const gameRef = useRef({
    running: false,
    score: 0,
    playerY: 0,
    velocity: 0,
    jumping: false,
    obstacles: [],
    frameId: null,
    groundY: 0,
    particles: [],
  });
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (!g.jumping && g.running) {
      g.velocity = -10;
      g.jumping = true;
    }
  }, []);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const g = gameRef.current;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    g.groundY = h - 40;
    g.playerY = g.groundY - 24;
    g.velocity = 0;
    g.jumping = false;
    g.obstacles = [];
    g.score = 0;
    g.running = true;
    g.particles = [];
    setScore(0);
    setGameStarted(true);

    let lastObstacle = 0;
    let frame = 0;

    function spawnObstacle() {
      const types = [
        { w: 16, h: 24 + Math.random() * 16, color: '#FFD700' },
        { w: 12, h: 18 + Math.random() * 12, color: '#FFE44D' },
        { w: 20, h: 30 + Math.random() * 10, color: '#E6C200' },
      ];
      const t = types[Math.floor(Math.random() * types.length)];
      g.obstacles.push({ x: w + 20, ...t, passed: false });
    }

    function tick() {
      if (!g.running) return;
      frame++;
      ctx.clearRect(0, 0, w, h);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#1A1A2E');
      skyGrad.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 20; i++) {
        const sx = (i * 37 + frame * 0.3) % w;
        const sy = (i * 23) % (h * 0.6);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.sin(frame * 0.05 + i) * 0.15})`;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      ctx.fillStyle = '#16213E';
      ctx.fillRect(0, g.groundY, w, h - g.groundY);
      ctx.strokeStyle = 'rgba(255,215,0,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, g.groundY);
      ctx.lineTo(w, g.groundY);
      ctx.stroke();

      for (let i = 0; i < 8; i++) {
        const gx = ((frame * 3 + i * 60) % (w + 60)) - 30;
        ctx.strokeStyle = 'rgba(255,215,0,0.1)';
        ctx.beginPath();
        ctx.moveTo(gx, g.groundY);
        ctx.lineTo(gx - 20, h);
        ctx.stroke();
      }

      g.velocity += 0.55;
      g.playerY += g.velocity;
      if (g.playerY >= g.groundY - 24) {
        g.playerY = g.groundY - 24;
        g.velocity = 0;
        g.jumping = false;
      }

      const px = 60;
      const py = g.playerY;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.roundRect(px, py, 20, 24, 4);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(px + 13, py + 6, 4, 4);
      ctx.fillStyle = '#000';
      ctx.fillRect(px + 15, py + 7, 2, 2);

      if (g.jumping) {
        g.particles.push({
          x: px + 10, y: py + 24,
          vx: -1 - Math.random(), vy: Math.random() * 2,
          life: 15,
        });
      }

      g.particles = g.particles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.life--;
        ctx.fillStyle = `rgba(255,215,0,${p.life / 15})`;
        ctx.fillRect(p.x, p.y, 3, 3);
        return p.life > 0;
      });

      if (frame - lastObstacle > 80 + Math.random() * 60) {
        spawnObstacle();
        lastObstacle = frame;
      }

      g.obstacles = g.obstacles.filter(obs => {
        obs.x -= 3;
        ctx.fillStyle = obs.color;
        ctx.beginPath();
        ctx.roundRect(obs.x, g.groundY - obs.h, obs.w, obs.h, 3);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(obs.x + 2, g.groundY - obs.h + 2, obs.w - 4, 4);

        if (!obs.passed && obs.x + obs.w < px) {
          obs.passed = true;
          g.score++;
          setScore(g.score);
        }
        return obs.x > -30;
      });

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(`Score: ${g.score}`, w - 70, 20);

      g.frameId = requestAnimationFrame(tick);
    }

    tick();
  }, []);

  useEffect(() => {
    startGame();
    return () => {
      gameRef.current.running = false;
      if (gameRef.current.frameId) cancelAnimationFrame(gameRef.current.frameId);
    };
  }, [startGame]);

  return (
    <div className="relative select-none">
      <canvas
        ref={canvasRef}
        onClick={jump}
        onTouchStart={jump}
        className="w-full cursor-pointer"
        style={{ height: 220 }}
      />

      {gameStarted && score < 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-xs text-gray-400 bg-black/50 px-3 py-1 rounded-full pointer-events-none"
        >
          Tap / Click to jump
        </motion.div>
      )}

      {/* Ad audio indicator overlay */}
      <AnimatePresence>
        {isAdPlaying && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-3 left-3 flex items-center gap-2 bg-black/70 backdrop-blur rounded-lg px-3 py-2"
          >
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${AD.color}30` }}>
              <svg className="w-3 h-3" style={{ color: AD.color }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            </div>
            <MiniWaveform isPlaying className="h-4" />
            <div className="text-left">
              <span className="text-[9px] text-gray-400 block leading-none">{AD.brand}</span>
              <span className="text-[10px] text-gray-300 font-mono">{adTimeLeft}s</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isAdPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-3 right-3 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold px-2.5 py-1 rounded-full"
        >
          Zero Gameplay Interruption
        </motion.div>
      )}

      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur rounded-lg px-3 py-1.5">
        <span className="text-xs font-bold text-white">Score: {score}</span>
      </div>
    </div>
  );
}

export default function InGameAudioDemo() {
  const audio = useAdAudio(AD.script, 15, {
    voice: AD.voice,
    musicStyle: AD.music.style,
  });
  const [adState, setAdState] = useState('waiting');
  const bidRequest = useMemo(() => getInGameAudioBidRequest(), []);

  useEffect(() => {
    if (audio.isPlaying) setAdState('playing');
  }, [audio.isPlaying]);

  useEffect(() => {
    if (audio.isComplete) setAdState('complete');
  }, [audio.isComplete]);

  const handlePlay = () => {
    setAdState('waiting');
    audio.play();
  };

  const handleRestart = () => {
    setAdState('waiting');
    audio.restart();
  };

  return (
    <DemoShell
      title="In-Game Audio"
      subtitle={`"${AD.brand}" ad plays with ${AD.voice.label.toLowerCase()} voice and ${AD.music.label.toLowerCase()} while gameplay continues uninterrupted.`}
      badge="Gaming"
      isPlaying={audio.isPlaying}
      isComplete={audio.isComplete}
      onPlay={handlePlay}
      onPause={audio.pause}
      onRestart={handleRestart}
      voiceName={audio.selectedVoiceName}
      onCycleVoice={audio.cycleVoice}
      bidRequest={bidRequest}
      bidRequestIsPlaying={audio.isPlaying}
      bidRequestProgress={audio.progress}
      bidRequestFormatLabel="In-Game Audio"
      formatId="in-game-audio"
      metrics={[
        { label: 'Gameplay Interruption', value: '0%' },
        { label: 'Completion Rate', value: '97%' },
        { label: 'User Sentiment', value: '4.6/5' },
        { label: 'Session Retention', value: '94%' },
        { label: 'CPM Range', value: '$22-38' },
        { label: 'Brand Recall', value: '68%' },
        { label: 'Ad Avoidance', value: '<3%' },
        { label: 'Monthly Impressions', value: '3.1M' },
      ]}
    >
      <div>
        <MiniGame isAdPlaying={audio.isPlaying} adTimeLeft={audio.timeLeft} />

        {/* Ad script display below game */}
        <div className="px-4 pb-4 pt-3 border-t border-white/[0.06]">
          {/* Ad info badge */}
          <AdInfoBadge ad={AD} className="mb-3 pb-2 border-b border-white/[0.04]" />

          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              {audio.isPlaying ? (
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${AD.color}20` }}>
                  <MiniWaveform isPlaying className="h-3" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                  <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">
                {audio.isPlaying ? `${AD.brand} Ad Playing` : audio.isComplete ? 'Ad Complete' : `${AD.brand} Ad Preview`}
              </p>
              <SyncedScript
                script={AD.script}
                progress={audio.progress}
                isPlaying={audio.isPlaying}
                accentColor={AD.accentColor}
              />
            </div>
            {audio.isPlaying && (
              <div className="shrink-0 text-right">
                <div className="text-lg font-bold text-white font-mono">{audio.timeLeft}s</div>
                <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${audio.progress * 100}%`, background: AD.color }}
                  />
                </div>
              </div>
            )}
          </div>

          {adState === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-green-400"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="text-xs font-medium">
                {AD.brand} ad delivered with zero gameplay interruption &mdash; game continued seamlessly
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </DemoShell>
  );
}
