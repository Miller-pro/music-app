'use client';

import { useEffect, useState } from 'react';
import AudioPlayer from '@/components/player/AudioPlayer';

export default function MusicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">🎵 AudioVerse Music Library</h1>
        <p className="text-slate-400 mb-8">1,749 royalty-free tracks available</p>
        
        <AudioPlayer apiKey="public" />
      </div>
    </div>
  );
}