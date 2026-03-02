import catalog from '../data/catalog.json';

class MusicService {
  constructor() {
    this.catalog = catalog;
    this.tracks = catalog.tracks;
    this.playlists = catalog.playlists;
    this.sponsoredPlaylists = catalog.sponsoredPlaylists || [];
  }

  getAllTracks() {
    return this.tracks;
  }

  getTrackById(id) {
    return this.tracks.find(t => t.id === id) || null;
  }

  getTracksByIds(ids) {
    return ids.map(id => this.getTrackById(id)).filter(Boolean);
  }

  getFeaturedTracks() {
    return this.tracks.filter(t => t.featured);
  }

  getTrendingTracks(limit = 10) {
    return [...this.tracks].sort((a, b) => b.plays - a.plays).slice(0, limit);
  }

  getNewTracks(limit = 10) {
    return [...this.tracks]
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, limit);
  }

  getMostDownloaded(limit = 10) {
    return [...this.tracks].sort((a, b) => b.downloads - a.downloads).slice(0, limit);
  }

  getTracksByGenre(genre) {
    if (!genre || genre === 'all') return this.tracks;
    return this.tracks.filter(t => t.genre === genre);
  }

  getTracksByMood(mood) {
    return this.tracks.filter(t => t.mood === mood);
  }

  getTracksByUseCase(useCase) {
    return this.tracks.filter(t => t.useCase?.includes(useCase));
  }

  searchTracks(query) {
    if (!query) return this.tracks;
    const q = query.toLowerCase();
    return this.tracks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q) ||
      t.genre.toLowerCase().includes(q) ||
      t.mood.toLowerCase().includes(q)
    );
  }

  filterTracks({ genre, mood, useCase, search, sort = 'popular' }) {
    let results = [...this.tracks];

    if (genre && genre !== 'all') {
      results = results.filter(t => t.genre === genre);
    }
    if (mood) {
      results = results.filter(t => t.mood === mood);
    }
    if (useCase) {
      results = results.filter(t => t.useCase?.includes(useCase));
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case 'popular':
        results.sort((a, b) => b.plays - a.plays);
        break;
      case 'recent':
        results.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        break;
      case 'az':
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'downloads':
        results.sort((a, b) => b.downloads - a.downloads);
        break;
      default:
        break;
    }

    return results;
  }

  getAllPlaylists() {
    return this.playlists;
  }

  getFeaturedPlaylists() {
    return this.playlists.filter(p => p.featured);
  }

  getPlaylistById(id) {
    return this.playlists.find(p => p.id === id) || null;
  }

  getPlaylistTracks(playlistId) {
    const playlist = this.getPlaylistById(playlistId);
    if (!playlist) return [];
    return this.getTracksByIds(playlist.trackIds);
  }

  getSponsoredPlaylists() {
    return this.sponsoredPlaylists;
  }

  getTracksByGenreSorted(genre, limit = 8) {
    return [...this.tracks]
      .filter(t => t.genre === genre)
      .sort((a, b) => b.plays - a.plays)
      .slice(0, limit);
  }

  getGenreStats() {
    const stats = {};
    let totalDuration = 0;
    for (const t of this.tracks) {
      if (!stats[t.genre]) stats[t.genre] = { count: 0, duration: 0 };
      stats[t.genre].count++;
      stats[t.genre].duration += t.duration || 0;
      totalDuration += t.duration || 0;
    }
    return { genres: stats, totalTracks: this.tracks.length, totalDuration };
  }

  getGenres() {
    return [...new Set(this.tracks.map(t => t.genre))];
  }

  getMoods() {
    return [...new Set(this.tracks.map(t => t.mood))];
  }
}

const musicService = new MusicService();
export default musicService;
