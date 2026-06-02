import { useState, useRef, useCallback, useEffect } from 'react';
import config from '../config/config';
import { getFromStorage, setToStorage } from '../utils/helpers';

export default function useAudio() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(
    () => getFromStorage(config.storage.volume, config.player.defaultVolume)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const onEnded = () => setIsPlaying(false);
    const onError = () => {
      setError('Failed to load audio');
      setIsLoading(false);
      setIsPlaying(false);
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const loadTrack = useCallback((url) => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    audio.src = url;
    audio.load();
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setError('Playback failed');
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((v) => {
    const val = Math.max(0, Math.min(1, v));
    if (audioRef.current) audioRef.current.volume = val;
    setVolumeState(val);
    setToStorage(config.storage.volume, val);
  }, []);

  const onTrackEnd = useCallback((callback) => {
    const audio = audioRef.current;
    if (!audio) return;
    const handler = () => callback();
    audio.addEventListener('ended', handler);
    return () => audio.removeEventListener('ended', handler);
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    loadTrack,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    onTrackEnd,
    audioRef,
  };
}
