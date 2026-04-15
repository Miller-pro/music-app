import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import musicService from '../services/musicService';
import config from '../config/config';
import PlaylistCard from '../components/UI/PlaylistCard';
import TrackCard from '../components/UI/TrackCard';
import RadioStationCard from '../components/UI/RadioStationCard';
import BannerAd from '../components/Ads/BannerAd';

export default function Browse() {
  const [searchParams] = useSearchParams();
  const useCaseParam = searchParams.get('useCase');

  const allPlaylists = useMemo(() => musicService.getAllPlaylists(), []);
  const sponsored = useMemo(() => musicService.getSponsoredPlaylists(), []);
  const trending = useMemo(() => musicService.getTrendingTracks(12), []);
  const mostDownloaded = useMemo(() => musicService.getMostDownloaded(12), []);
  const topRadio = useMemo(() => musicService.getTopRadioStations(6), []);

  const useCaseTracks = useMemo(() => {
    if (!useCaseParam) return null;
    return musicService.getTracksByUseCase(useCaseParam);
  }, [useCaseParam]);

  const activeUseCase = useCaseParam
    ? config.useCases.find(uc => uc.id === useCaseParam)
    : null;

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="px-4 lg:px-6 pt-4 mb-6">
        <h1 className="font-display text-2xl font-bold">
          {activeUseCase ? `${activeUseCase.icon} ${activeUseCase.name}` : 'Browse'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {activeUseCase
            ? `Copyright-free tracks perfect ${activeUseCase.name.toLowerCase()}`
            : 'Discover curated playlists and trending tracks'}
        </p>
      </div>

      {/* Use case filter */}
      {!useCaseParam && (
        <section className="px-4 lg:px-6 mb-8">
          <div className="flex gap-2 flex-wrap">
            {config.useCases.map(uc => (
              <a
                key={uc.id}
                href={`/browse?useCase=${uc.id}`}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-primary-500/20 border border-white/10 hover:border-primary-500/30 text-sm transition-all"
              >
                {uc.icon} {uc.name}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* If filtering by use case, show those tracks */}
      {useCaseTracks && (
        <section className="px-4 lg:px-6 mb-10">
          <h2 className="font-display text-lg font-bold mb-4">
            {useCaseTracks.length} tracks found
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {useCaseTracks.map((track, i) => (
              <TrackCard key={track.id} track={track} trackList={useCaseTracks} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Playlists */}
      {!useCaseParam && (
        <>
          <section className="px-4 lg:px-6 mb-10">
            <h2 className="font-display text-lg font-bold mb-4">Curated Playlists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allPlaylists.map((pl, i) => (
                <PlaylistCard key={pl.id} playlist={pl} index={i} />
              ))}
            </div>
          </section>

          {/* Sponsored section */}
          {sponsored.length > 0 && (
            <section className="px-4 lg:px-6 mb-10">
              <h2 className="font-display text-lg font-bold mb-4">Featured Collections</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {sponsored.map((pl, i) => (
                  <PlaylistCard key={pl.id} playlist={pl} index={i} sponsored />
                ))}
              </div>
            </section>
          )}

          {/* Live Radio Preview */}
          {topRadio.length > 0 && (
            <section className="px-4 lg:px-6 mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-bold">Live Radio</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Live</span>
                  </span>
                </div>
                <Link
                  to="/radio"
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  See all
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {topRadio.map((station, i) => (
                  <RadioStationCard key={station.id} station={station} stationList={topRadio} index={i} />
                ))}
              </div>
            </section>
          )}

          <BannerAd zone="bannerSidebar" />

          {/* Trending */}
          <section className="px-4 lg:px-6 mb-10">
            <h2 className="font-display text-lg font-bold mb-4">Trending</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trending.map((track, i) => (
                <TrackCard key={track.id} track={track} trackList={trending} index={i} />
              ))}
            </div>
          </section>

          {/* Most Downloaded */}
          <section className="px-4 lg:px-6 mb-10">
            <h2 className="font-display text-lg font-bold mb-4">Most Downloaded</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {mostDownloaded.map((track, i) => (
                <TrackCard key={track.id} track={track} trackList={mostDownloaded} index={i} />
              ))}
            </div>
          </section>

          {/* Moods */}
          <section className="px-4 lg:px-6 mb-10">
            <h2 className="font-display text-lg font-bold mb-4">Browse by Mood</h2>
            <div className="flex flex-wrap gap-2">
              {config.moods.map(mood => (
                <a
                  key={mood}
                  href={`/library?mood=${mood}`}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-primary-500/20 border border-white/10 hover:border-primary-500/30 text-sm transition-all"
                >
                  {mood}
                </a>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
