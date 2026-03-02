import { useApp } from '../../context/AppContext';
import musicService from '../../services/musicService';
import { PlayIcon } from './Icons';
import { motion } from 'framer-motion';

export default function PlaylistCard({ playlist, index = 0, sponsored = false }) {
  const { playTrack } = useApp();

  const handlePlay = () => {
    const tracks = playlist.trackIds
      ? musicService.getTracksByIds(playlist.trackIds)
      : [];
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="group relative rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
      onClick={handlePlay}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={playlist.cover}
          alt={playlist.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <button className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 hover:bg-primary-400">
          <PlayIcon className="w-6 h-6 text-white ml-0.5" />
        </button>

        {sponsored && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-yellow-500/90 text-black text-[10px] font-bold uppercase tracking-wider">
            Sponsored
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{playlist.name}</h3>
        <p className="text-xs text-gray-400 truncate mt-0.5">{playlist.description}</p>
        <p className="text-xs text-gray-500 mt-1">{playlist.trackIds?.length || 0} tracks</p>
      </div>
    </motion.div>
  );
}
