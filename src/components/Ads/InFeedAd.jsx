import adService from '../../services/adService';
import adConfig from '../../config/adConfig';

export default function InFeedAd({ index }) {
  if (!adService.shouldShowInFeedAd(index)) return null;

  return (
    <div className="col-span-full px-4 py-3 my-2 rounded-lg glass-light flex items-center justify-center text-gray-500 text-xs">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">
          {adConfig.native.label}
        </p>
        <p className="text-gray-500">{adConfig.inFeed.placeholder}</p>
      </div>
    </div>
  );
}
