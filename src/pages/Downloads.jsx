import { useApp } from '../context/AppContext';
import TrackRow from '../components/UI/TrackRow';
import { DownloadIcon } from '../components/UI/Icons';

export default function Downloads() {
  const { downloadHistory } = useApp();

  return (
    <div className="pb-8">
      <div className="px-4 lg:px-6 pt-4 mb-6">
        <h1 className="font-display text-2xl font-bold">Downloads</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {downloadHistory.length} tracks downloaded
        </p>
      </div>

      <div className="px-4 lg:px-6">
        {downloadHistory.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <DownloadIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No downloads yet</p>
            <p className="text-sm">Tracks you download will appear here</p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-4 px-4 py-2 text-xs text-gray-500 border-b border-white/5">
              <span className="w-8 text-center">#</span>
              <span className="w-10" />
              <span className="flex-1">Title</span>
              <span className="hidden sm:inline w-20">License</span>
              <span className="hidden md:inline w-20">Genre</span>
              <span className="w-12 text-right">Time</span>
              <span className="w-16" />
            </div>
            {downloadHistory.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                trackList={downloadHistory}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
