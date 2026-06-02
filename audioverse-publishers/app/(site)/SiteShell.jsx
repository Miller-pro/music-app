'use client';

import { useState } from 'react';
import Sidebar from '@/src/components/Layout/Sidebar';
import Header from '@/src/components/Layout/Header';
import PlayerBar from '@/src/components/Player/PlayerBar';
import PreRollAd from '@/src/components/Ads/PreRollAd';
import Toast from '@/src/components/UI/Toast';
import { useApp } from '@/src/context/AppContext';

/**
 * Client chrome for the public music site. Ported from the old Vite App.jsx —
 * the only change is that react-router's <Routes> is replaced by `children`,
 * which the App Router supplies from the matched (site) page.
 */
export default function SiteShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentTrack } = useApp();

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-[128px]" />
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content - 72px margin for collapsed sidebar on desktop */}
      <div className="lg:ml-[72px] relative">
        <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />

        <main className={`min-h-[calc(100vh-64px)] ${currentTrack ? 'pb-24' : ''}`}>
          {children}
        </main>
      </div>

      <PlayerBar />
      <PreRollAd />
      <Toast />
    </div>
  );
}
