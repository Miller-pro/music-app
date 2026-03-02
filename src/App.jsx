import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import PlayerBar from './components/Player/PlayerBar';
import PreRollAd from './components/Ads/PreRollAd';
import Toast from './components/UI/Toast';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Library from './pages/Library';
import Downloads from './pages/Downloads';
import AdvertiserDemos from './pages/AdvertiserDemos';
import Publishers from './pages/Publishers';
import { useApp } from './context/AppContext';

export default function App() {
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
        <Header onMenuToggle={() => setSidebarOpen(v => !v)} />

        <main className={`min-h-[calc(100vh-64px)] ${currentTrack ? 'pb-24' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/library" element={<Library />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/advertisers" element={<AdvertiserDemos />} />
            <Route path="/publishers" element={<Publishers />} />
          </Routes>
        </main>
      </div>

      <PlayerBar />
      <PreRollAd />
      <Toast />
    </div>
  );
}
