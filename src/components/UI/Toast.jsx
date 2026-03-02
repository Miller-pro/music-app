import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast() {
  const { toast } = useApp();

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`px-5 py-3 rounded-xl text-sm font-medium shadow-2xl pointer-events-auto
              ${toast.type === 'error' ? 'bg-red-500/90' : ''}
              ${toast.type === 'success' ? 'bg-green-500/90' : ''}
              ${toast.type === 'info' ? 'bg-primary-600/90 backdrop-blur-sm' : ''}
            `}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
