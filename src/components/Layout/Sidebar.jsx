import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../../config/config';
import { useApp } from '../../context/AppContext';
import { getFromStorage, setToStorage } from '../../utils/helpers';
import {
  HomeIcon, BrowseIcon, LibraryIcon, DownloadIcon,
  CloseIcon, AddIcon, HeartIcon, RadioIcon,
} from '../UI/Icons';
import CreatePlaylistModal from './CreatePlaylistModal';

function AdvertiseIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1l5 3V6L5 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z" />
    </svg>
  );
}

function PublisherIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.85c-.01 1.83-1.38 2.83-3.12 3.19z" />
    </svg>
  );
}

const navItems = [
  { to: '/', icon: HomeIcon, label: 'Home' },
  { to: '/browse', icon: BrowseIcon, label: 'Browse' },
  { to: '/radio', icon: RadioIcon, label: 'Radio' },
  { to: '/library', icon: LibraryIcon, label: 'Library' },
  { to: '/downloads', icon: DownloadIcon, label: 'Downloads' },
  { to: '/advertisers', icon: AdvertiseIcon, label: 'Advertisers' },
  { to: '/publishers', icon: PublisherIcon, label: 'Publishers' },
];

function CollapseIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  );
}

function PlaylistIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
    </svg>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { playlists, likedTracks } = useApp();
  const [collapsed, setCollapsed] = useState(
    () => getFromStorage('audioverse_sidebar_collapsed', true)
  );
  const [hovered, setHovered] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    setToStorage('audioverse_sidebar_collapsed', collapsed);
  }, [collapsed]);

  // On desktop: collapsed = icons only, expanded on hover or pinned
  // On mobile: hidden by default, full-width slide-in via isOpen
  const expanded = !collapsed || hovered;
  const sidebarW = expanded ? 240 : 72;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ width: `${sidebarW}px` }}
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col border-r border-white/[0.06] transition-all duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
      >
        {/* Background - separate so we don't animate bg with width */}
        <div className="absolute inset-0 bg-[rgba(26,26,46,0.97)] backdrop-blur-xl -z-10" />

        {/* ── Logo ──────────────────────────────── */}
        <div className="flex items-center h-16 px-4 shrink-0">
          <NavLink to="/" className="flex items-center gap-3 min-w-0" onClick={onClose}>
            <img src={config.branding.logo} alt={config.branding.name} className="w-8 h-8 shrink-0" />
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <h1 className="font-display font-bold text-base gradient-text leading-tight">
                    {config.branding.name}
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </NavLink>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden ml-auto p-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* ── Navigation ──────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1">
          {/* Section label */}
          {expanded && (
            <p className="px-3 mb-1 mt-1 text-[10px] uppercase tracking-widest text-gray-600 font-semibold">
              Menu
            </p>
          )}

          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              title={!expanded ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-150 mb-0.5
                ${expanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'}
                ${isActive
                  ? 'bg-primary-500/15 text-primary-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {expanded && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}

          {/* Liked Songs shortcut */}
          <NavLink
            to="/library"
            onClick={onClose}
            title={!expanded ? 'Liked Songs' : undefined}
            className={`flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-150 mb-0.5
              ${expanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'}
              text-gray-400 hover:text-white hover:bg-white/[0.06]`}
          >
            <div className="w-5 h-5 shrink-0 flex items-center justify-center rounded bg-gradient-to-br from-primary-500 to-primary-700">
              <HeartIcon className="w-3 h-3 text-white" filled />
            </div>
            {expanded && (
              <span className="truncate">Liked Songs</span>
            )}
            {expanded && likedTracks.length > 0 && (
              <span className="ml-auto text-[10px] text-gray-500">{likedTracks.length}</span>
            )}
          </NavLink>

          {/* Divider */}
          <div className={`my-3 border-t border-white/[0.06] ${expanded ? 'mx-2' : 'mx-3'}`} />

          {/* ── My Playlists ──────────────────── */}
          {expanded && (
            <div className="flex items-center justify-between px-3 mb-1">
              <p className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold">
                My Playlists
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                title="Create playlist"
              >
                <AddIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!expanded && (
            <button
              onClick={() => { setCollapsed(false); setShowCreateModal(true); }}
              title="Create playlist"
              className="flex items-center justify-center w-full py-2.5 text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-md transition-all mb-0.5"
            >
              <AddIcon className="w-5 h-5" />
            </button>
          )}

          {/* User playlists */}
          {expanded && playlists.map(pl => (
            <NavLink
              key={pl.id}
              to={`/browse?playlist=${pl.id}`}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-150 mb-0.5"
            >
              <PlaylistIcon className="w-4 h-4 shrink-0 text-gray-500" />
              <span className="truncate text-[13px]">{pl.name}</span>
              <span className="ml-auto text-[10px] text-gray-600">{pl.trackIds.length}</span>
            </NavLink>
          ))}

          {expanded && playlists.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full mt-1 px-3 py-6 rounded-lg border border-dashed border-white/10 text-center hover:border-white/20 hover:bg-white/[0.03] transition-all group"
            >
              <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                <AddIcon className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 group-hover:text-gray-300">Create your first playlist</p>
            </button>
          )}

          {/* Divider before use cases */}
          {expanded && (
            <>
              <div className="my-3 border-t border-white/[0.06] mx-2" />
              <p className="px-3 mb-1 text-[10px] uppercase tracking-widest text-gray-600 font-semibold">
                Use Cases
              </p>
              {config.useCases.slice(0, 4).map(uc => (
                <NavLink
                  key={uc.id}
                  to={`/browse?useCase=${uc.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-[13px] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all duration-150 mb-0.5"
                >
                  <span className="text-sm w-5 text-center shrink-0">{uc.icon}</span>
                  <span className="truncate">{uc.name}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* ── Footer ──────────────────────────── */}
        <div className="shrink-0 border-t border-white/[0.06]">
          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(prev => !prev)}
            className={`hidden lg:flex items-center gap-3 w-full text-sm text-gray-500 hover:text-white hover:bg-white/[0.06] transition-all duration-150
              ${expanded ? 'px-5 py-3' : 'px-0 py-3 justify-center'}`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <CollapseIcon className="w-5 h-5 shrink-0" />
            </motion.div>
            {expanded && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Create playlist modal */}
      <CreatePlaylistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
