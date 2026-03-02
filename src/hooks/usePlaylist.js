import { useState, useCallback, useEffect } from 'react';
import config from '../config/config';
import { getFromStorage, setToStorage, generateId } from '../utils/helpers';

export default function usePlaylist() {
  const [playlists, setPlaylists] = useState(
    () => getFromStorage(config.storage.playlists, [])
  );

  useEffect(() => {
    setToStorage(config.storage.playlists, playlists);
  }, [playlists]);

  const createPlaylist = useCallback((name, description = '') => {
    const playlist = {
      id: 'user_' + generateId(),
      name,
      description,
      trackIds: [],
      createdAt: new Date().toISOString(),
      isUserPlaylist: true,
    };
    setPlaylists(prev => [...prev, playlist]);
    return playlist;
  }, []);

  const deletePlaylist = useCallback((id) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  }, []);

  const renamePlaylist = useCallback((id, name) => {
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  }, []);

  const addTrackToPlaylist = useCallback((playlistId, trackId) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id !== playlistId) return p;
      if (p.trackIds.includes(trackId)) return p;
      return { ...p, trackIds: [...p.trackIds, trackId] };
    }));
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId, trackId) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id !== playlistId) return p;
      return { ...p, trackIds: p.trackIds.filter(id => id !== trackId) };
    }));
  }, []);

  const reorderTracks = useCallback((playlistId, fromIndex, toIndex) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id !== playlistId) return p;
      const ids = [...p.trackIds];
      const [moved] = ids.splice(fromIndex, 1);
      ids.splice(toIndex, 0, moved);
      return { ...p, trackIds: ids };
    }));
  }, []);

  const getPlaylist = useCallback((id) => {
    return playlists.find(p => p.id === id) || null;
  }, [playlists]);

  return {
    playlists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    reorderTracks,
    getPlaylist,
  };
}
