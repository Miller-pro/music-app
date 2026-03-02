import adService from '../../services/adService';
import adConfig from '../../config/adConfig';

export default function BannerAd({ zone }) {
  const config = adService.getBannerConfig(zone);
  if (!adService.isEnabled() || !config?.enabled) return null;

  const [width, height] = config.size.split('x').map(Number);

  return (
    <div className="flex justify-center my-4">
      <div
        className="glass-light rounded-lg flex items-center justify-center text-gray-500 text-xs overflow-hidden"
        style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
      >
        {/* Replace with real ad code (AdSense, GAM, etc.) */}
        <div className="text-center">
          <p className="text-gray-600">{config.placeholder}</p>
          <p className="text-[10px] text-gray-700 mt-1">Ad Slot: {config.slotId}</p>
        </div>
      </div>
    </div>
  );
}
