import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import useAudio from '../hooks/useAudio';
import usePlaylist from '../hooks/usePlaylist';
import musicService from '../services/musicService';
import adService from '../services/adService';
import config from '../config/config';
import { getFromStorage, setToStorage, shuffleArray } from '../utils/helpers';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const audio = useAudio();
  const playlistManager = usePlaylist();

  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('none'); // 'none' | 'all' | 'one'
  const [history, setHistory] = useState(
    () => getFromStorage(config.storage.history, [])
  );
  const [downloadHistory, setDownloadHistory] = useState(
    () => getFromStorage(config.storage.downloads, [])
  );
  const [showPreRoll, setShowPreRoll] = useState(false);
  const [toast, setToast] = useState(null);
  const [likedTracks, setLikedTracks] = useState(
    () => getFromStorage('audioverse_liked', [])
  );
  const pendingTrackRef = useRef(null);

  // Persist history
  useEffect(() => {
    setToStorage(config.storage.history, history.slice(0, 100));
  }, [history]);

  useEffect(() => {
    setToStorage(config.storage.downloads, downloadHistory);
  }, [downloadHistory]);

  useEffect(() => {
    setToStorage('audioverse_liked', likedTracks);
  }, [likedTracks]);

  // Like/unlike a track
  const toggleLike = useCallback((trackId) => {
    setLikedTracks(prev => {
      if (prev.includes(trackId)) return prev.filter(id => id !== trackId);
      return [...prev, trackId];
    });
  }, []);

  const isLiked = useCallback((trackId) => {
    return likedTracks.includes(trackId);
  }, [likedTracks]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Play a track or radio station
  const playTrack = useCallback((track, trackList = null) => {
    if (!track) return;

    const isRadio = track.type === 'radio' || track.isLive;

    // Check pre-roll ads (skip for radio)
    if (!isRadio && adService.shouldShowPreRoll()) {
      pendingTrackRef.current = { track, trackList };
      setShowPreRoll(true);
      return;
    }

    setCurrentTrack(track);
    audio.loadTrack(track.url);
    setTimeout(() => audio.play(), 100);

    // Update queue if new list (not for radio)
    if (trackList && !isRadio) {
      const idx = trackList.findIndex(t => t.id === track.id);
      setQueue(trackList);
      setQueueIndex(idx >= 0 ? idx : 0);
    }

    // Add to history (not for radio)
    if (!isRadio) {
      setHistory(prev => {
        const filtered = prev.filter(h => h.id !== track.id);
        return [{ ...track, playedAt: new Date().toISOString() }, ...filtered];
      });
    }
  }, [audio]);

  // Pre-roll ad completed
  const onPreRollComplete = useCallback(() => {
    setShowPreRoll(false);
    const pending = pendingTrackRef.current;
    if (pending) {
      pendingTrackRef.current = null;
      adService.resetPreRollCounter();
      setCurrentTrack(pending.track);
      audio.loadTrack(pending.track.url);
      setTimeout(() => audio.play(), 100);

      if (pending.trackList) {
        const idx = pending.trackList.findIndex(t => t.id === pending.track.id);
        setQueue(pending.trackList);
        setQueueIndex(idx >= 0 ? idx : 0);
      }

      setHistory(prev => {
        const filtered = prev.filter(h => h.id !== pending.track.id);
        return [{ ...pending.track, playedAt: new Date().toISOString() }, ...filtered];
      });
    }
  }, [audio]);

  // Next track
  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') nextIndex = 0;
        else return;
      }
    }

    const next = queue[nextIndex];
    if (next) {
      setQueueIndex(nextIndex);
      setCurrentTrack(next);
      audio.loadTrack(next.url);
      setTimeout(() => audio.play(), 100);

      setHistory(prev => {
        const filtered = prev.filter(h => h.id !== next.id);
        return [{ ...next, playedAt: new Date().toISOString() }, ...filtered];
      });
    }
  }, [queue, queueIndex, shuffle, repeat, audio]);

  // Previous track
  const playPrev = useCallback(() => {
    if (audio.currentTime > 3) {
      audio.seek(0);
      return;
    }
    if (queue.length === 0) return;
    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) prevIndex = repeat === 'all' ? queue.length - 1 : 0;

    const prev = queue[prevIndex];
    if (prev) {
      setQueueIndex(prevIndex);
      setCurrentTrack(prev);
      audio.loadTrack(prev.url);
      setTimeout(() => audio.play(), 100);
    }
  }, [queue, queueIndex, repeat, audio]);

  // Handle track end
  useEffect(() => {
    const cleanup = audio.onTrackEnd(() => {
      if (repeat === 'one') {
        audio.seek(0);
        audio.play();
      } else {
        playNext();
      }
    });
    return cleanup;
  }, [audio, repeat, playNext]);

  // Add to queue
  const addToQueue = useCallback((track) => {
    setQueue(prev => [...prev, track]);
    showToast(`Added "${track.title}" to queue`);
  }, [showToast]);

  // Remove from queue
  const removeFromQueue = useCallback((index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (index < queueIndex) setQueueIndex(prev => prev - 1);
  }, [queueIndex]);

  // Download
  const downloadTrack = useCallback((track) => {
    const link = document.createElement('a');
    link.href = track.url;
    link.download = `${track.title} - ${track.artist}.mp3`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadHistory(prev => {
      const filtered = prev.filter(d => d.id !== track.id);
      return [{ ...track, downloadedAt: new Date().toISOString() }, ...filtered];
    });
    showToast(`Downloading "${track.title}"`);
  }, [showToast]);

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);

  // Cycle repeat
  const cycleRepeat = useCallback(() => {
    setRepeat(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!config.features.keyboardShortcuts) return;
    const handler = (e) => {
      // Don't trigger if user is typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          audio.togglePlay();
          break;
        case 'ArrowRight':
          if (e.shiftKey) playNext();
          else audio.seek(Math.min(audio.currentTime + 10, audio.duration));
          break;
        case 'ArrowLeft':
          if (e.shiftKey) playPrev();
          else audio.seek(Math.max(audio.currentTime - 10, 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          audio.setVolume(audio.volume + 0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          audio.setVolume(audio.volume - 0.05);
          break;
        case 'KeyM':
          audio.setVolume(audio.volume > 0 ? 0 : 0.7);
          break;
        case 'KeyS':
          toggleShuffle();
          break;
        case 'KeyR':
          cycleRepeat();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [audio, playNext, playPrev, toggleShuffle, cycleRepeat]);

  const value = {
    // Audio
    ...audio,
    // Current state
    currentTrack,
    queue,
    queueIndex,
    shuffle,
    repeat,
    history,
    downloadHistory,
    showPreRoll,
    toast,
    // Actions
    playTrack,
    playNext,
    playPrev,
    addToQueue,
    removeFromQueue,
    downloadTrack,
    toggleShuffle,
    cycleRepeat,
    onPreRollComplete,
    showToast,
    toggleLike,
    isLiked,
    likedTracks,
    // Playlist manager
    ...playlistManager,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
