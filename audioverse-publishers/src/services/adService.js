import adConfig from '../config/adConfig';

class AdService {
  constructor() {
    this.songsSinceLastAd = 0;
  }

  isEnabled() {
    return adConfig.adsEnabled;
  }

  shouldShowBannerTop() {
    return this.isEnabled() && adConfig.bannerTop.enabled;
  }

  shouldShowBannerSidebar() {
    return this.isEnabled() && adConfig.bannerSidebar.enabled;
  }

  shouldShowBannerMobile() {
    return this.isEnabled() && adConfig.bannerMobile.enabled;
  }

  shouldShowInFeedAd(index) {
    if (!this.isEnabled() || !adConfig.inFeed.enabled) return false;
    return index > 0 && index % adConfig.inFeed.frequency === 0;
  }

  shouldShowPreRoll() {
    if (!this.isEnabled() || !adConfig.preRoll.enabled) return false;
    this.songsSinceLastAd++;
    if (this.songsSinceLastAd >= adConfig.preRoll.frequency) {
      this.songsSinceLastAd = 0;
      return true;
    }
    return false;
  }

  shouldShowNativeAds() {
    return this.isEnabled() && adConfig.native.enabled;
  }

  getPreRollConfig() {
    return adConfig.preRoll;
  }

  getBannerConfig(zone) {
    return adConfig[zone] || null;
  }

  getNativeLabel() {
    return adConfig.native.label;
  }

  getVariant() {
    if (!adConfig.abTesting.enabled) return 'A';
    return adConfig.abTesting.variant;
  }

  resetPreRollCounter() {
    this.songsSinceLastAd = 0;
  }
}

const adService = new AdService();
export default adService;
