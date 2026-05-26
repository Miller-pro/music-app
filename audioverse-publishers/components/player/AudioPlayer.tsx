'use client';

import { useEffect, useState, useRef } from 'react';
import { Play, Pause, Volume2, Search } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
}

export default function AudioPlayer({ apiKey }: { apiKey: string }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [search, setSearch] = useState('');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await fetch(`/api/tracks?limit=20`);
        const data = await res.json();
        setTracks(data.tracks || []);
      } catch (err) {
        console.error('Error:', err);
      }
    };
    fetchTracks();
  }, []);

  const handlePlay = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  return (
    <div className="w-full bg-slate-800 rounded-lg border border-slate-700 p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">🎵 AudioVerse Player</h2>
      
      <input
        type="text"
        placeholder="Search tracks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 bg-slate-700 rounded border border-slate-600 mb-4"
      />

      {currentTrack && (
        <div className="mb-4 p-4 bg-slate-700 rounded">
          <p className="font-semibold">{currentTrack.title}</p>
          <p className="text-slate-300 text-sm">{currentTrack.artist}</p>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {tracks.map((track) => (
          <div
            key={track.id}
            onClick={() => handlePlay(track)}
            className="p-3 bg-slate-700 rounded hover:bg-slate-600 cursor-pointer"
          >
            <p className="font-semibold">{track.title}</p>
            <p className="text-sm text-slate-300">{track.artist}</p>
          </div>
        ))}
      </div>

      <audio ref={audioRef} />
    </div>
  );
}