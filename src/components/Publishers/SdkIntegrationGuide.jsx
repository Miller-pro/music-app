import { useState } from 'react';
import { motion } from 'framer-motion';
import CodeBlock from './CodeBlock';

const TABS = [
  { id: 'js', label: 'JavaScript', icon: '🟨' },
  { id: 'react', label: 'React', icon: '⚛️' },
  { id: 'ios', label: 'iOS (Swift)', icon: '🍎' },
  { id: 'android', label: 'Android (Kotlin)', icon: '🤖' },
];

const CODE_EXAMPLES = {
  js: {
    filename: 'audioverse-ads.js',
    language: 'javascript',
    code: `import { AudioVerseAds } from '@audioverse/ads-sdk';

// Initialize with your Publisher ID
const ads = new AudioVerseAds({
  publisherId: 'pub-XXXXXXXXXXXX',
  apiKey: 'ak_live_XXXXXXXXXXXXXXXX',
  environment: 'production',
});

// Request a pre-roll ad before playback
async function playWithAd(trackId) {
  const ad = await ads.requestAd({
    type: 'pre-roll',
    contentId: trackId,
    userConsent: true,
  });

  if (ad) {
    await ad.play();
    ad.on('complete', () => startTrack(trackId));
    ad.on('error', () => startTrack(trackId));
  } else {
    startTrack(trackId);
  }
}

// Report a mid-roll opportunity
ads.reportAdBreak({
  type: 'mid-roll',
  position: 'between-tracks',
  sessionDuration: 1200,
});`,
  },
  react: {
    filename: 'AudioAdProvider.jsx',
    language: 'jsx',
    code: `import { AudioVerseProvider, useAudioAd } from '@audioverse/react-sdk';

// Wrap your app with the provider
function App() {
  return (
    <AudioVerseProvider
      publisherId="pub-XXXXXXXXXXXX"
      apiKey="ak_live_XXXXXXXXXXXXXXXX"
    >
      <MusicPlayer />
    </AudioVerseProvider>
  );
}

// Use the hook in your player component
function MusicPlayer() {
  const { requestAd, adPlaying, AdOverlay } = useAudioAd();

  const handlePlay = async (track) => {
    const ad = await requestAd({ type: 'pre-roll' });
    if (!ad) playTrack(track);
    // Ad completion auto-triggers playTrack
  };

  return (
    <div className="player">
      <AdOverlay />
      <TrackList onPlay={handlePlay} />
      <NowPlaying disabled={adPlaying} />
    </div>
  );
}`,
  },
  ios: {
    filename: 'AudioVerseAds.swift',
    language: 'swift',
    code: `import AudioVerseAdsSDK

class MusicPlayerController: UIViewController {

    let adManager = AVAdManager(
        publisherId: "pub-XXXXXXXXXXXX",
        apiKey: "ak_live_XXXXXXXXXXXXXXXX"
    )

    func playTrack(_ track: Track) {
        // Request pre-roll ad
        adManager.requestAd(type: .preRoll) { [weak self] result in
            switch result {
            case .success(let ad):
                ad.present(from: self!) {
                    self?.startPlayback(track)
                }
            case .failure:
                self?.startPlayback(track)
            }
        }
    }

    func reportMidRoll(session: ListeningSession) {
        adManager.reportAdBreak(
            type: .midRoll,
            position: .betweenTracks,
            sessionDuration: session.duration
        )
    }
}`,
  },
  android: {
    filename: 'MusicPlayerActivity.kt',
    language: 'kotlin',
    code: `import com.audioverse.ads.AVAdManager
import com.audioverse.ads.AdType

class MusicPlayerActivity : AppCompatActivity() {

    private val adManager = AVAdManager(
        publisherId = "pub-XXXXXXXXXXXX",
        apiKey = "ak_live_XXXXXXXXXXXXXXXX"
    )

    fun playTrack(track: Track) {
        // Request pre-roll ad
        adManager.requestAd(AdType.PRE_ROLL) { result ->
            result.onSuccess { ad ->
                ad.show(this) {
                    startPlayback(track)
                }
            }.onFailure {
                startPlayback(track)
            }
        }
    }

    fun reportMidRoll(session: ListeningSession) {
        adManager.reportAdBreak(
            type = AdType.MID_ROLL,
            position = "between-tracks",
            sessionDuration = session.duration
        )
    }
}`,
  },
};

export default function SdkIntegrationGuide() {
  const [activeTab, setActiveTab] = useState('js');
  const example = CODE_EXAMPLES[activeTab];

  return (
    <section className="px-4 lg:px-6 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-2xl font-bold mb-2 text-center">
          <span className="gradient-text">SDK Integration</span>
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8 max-w-lg mx-auto">
          Drop-in SDK for every major platform. Get ads serving in under 10 minutes.
        </p>

        <div className="max-w-3xl mx-auto">
          {/* Tab bar */}
          <div className="glass rounded-2xl p-1.5 flex gap-1 overflow-x-auto no-scrollbar mb-4">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500/20 text-primary-300 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Code block */}
          <CodeBlock
            code={example.code}
            language={example.language}
            filename={example.filename}
          />

          {/* Install command */}
          <div className="mt-4 glass-light rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Install via package manager</p>
              <code className="text-sm text-primary-300 font-mono">
                {activeTab === 'js' || activeTab === 'react'
                  ? 'npm install @audioverse/ads-sdk'
                  : activeTab === 'ios'
                    ? 'pod \'AudioVerseAdsSDK\', \'~> 2.0\''
                    : 'implementation "com.audioverse:ads-sdk:2.0.0"'}
              </code>
            </div>
            <button
              onClick={() => {
                const cmd = activeTab === 'js' || activeTab === 'react'
                  ? 'npm install @audioverse/ads-sdk'
                  : activeTab === 'ios'
                    ? "pod 'AudioVerseAdsSDK', '~> 2.0'"
                    : 'implementation "com.audioverse:ads-sdk:2.0.0"';
                navigator.clipboard.writeText(cmd).catch(() => {});
              }}
              className="text-xs text-gray-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10 shrink-0"
            >
              Copy
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
