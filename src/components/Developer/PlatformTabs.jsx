import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const platforms = [
  {
    id: 'ios',
    name: 'iOS',
    icon: '🍎',
    cpm: 15,
    time: '8 min',
    install: '// Swift Package Manager\n// Add package: https://github.com/audioverse/sdk-ios',
    code: `import AudioVerseSDK

// Initialize in AppDelegate
AudioVerse.configure(appId: "YOUR_APP_ID")

// Play music in any view
struct MusicView: View {
    var body: some View {
        AudioVersePlayer()
            .onAppear {
                AudioVerse.play(genre: .ambient)
            }
    }
}`,
    steps: [
      'Add Swift Package from GitHub URL',
      'Initialize SDK in AppDelegate',
      'Add AudioVersePlayer() to your view',
      'Upload app-ads.txt in App Store Connect',
      'Submit update for review',
    ],
  },
  {
    id: 'android',
    name: 'Android',
    icon: '🤖',
    cpm: 12,
    time: '10 min',
    install: '// build.gradle (app)\nimplementation "com.audioverse:sdk:1.0.0"',
    code: `import com.audioverse.AudioVerse
import com.audioverse.AudioVersePlayer

// Initialize in Application
AudioVerse.init(this, "YOUR_APP_ID")

// Add player to activity
class MusicActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val player = AudioVersePlayer(this)
        player.play(genre = "ambient")
    }
}`,
    steps: [
      'Add dependency to build.gradle',
      'Initialize SDK in Application class',
      'Add AudioVersePlayer to your activity',
      'Upload app-ads.txt in Play Console',
      'Publish update',
    ],
  },
  {
    id: 'react-native',
    name: 'React Native',
    icon: '⚛️',
    cpm: 13,
    time: '7 min',
    install: 'npm install @audioverse/react-native',
    code: `import { AudioVerseProvider, MusicPlayer } from '@audioverse/react-native';

export default function App() {
  return (
    <AudioVerseProvider appId="YOUR_APP_ID">
      <MusicPlayer
        genre="ambient"
        autoPlay={true}
        theme="dark"
      />
    </AudioVerseProvider>
  );
}`,
    steps: [
      'Install npm package',
      'Wrap app in AudioVerseProvider',
      'Add MusicPlayer component',
      'Add app-ads.txt to both stores',
      'Rebuild and publish',
    ],
  },
  {
    id: 'flutter',
    name: 'Flutter',
    icon: '🦋',
    cpm: 13,
    time: '7 min',
    install: 'flutter pub add audioverse_sdk',
    code: `import 'package:audioverse_sdk/audioverse_sdk.dart';

class MusicScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return AudioVersePlayer(
      appId: 'YOUR_APP_ID',
      genre: Genre.ambient,
      autoPlay: true,
      theme: AudioVerseTheme.dark,
    );
  }
}`,
    steps: [
      'Add package with flutter pub add',
      'Import and initialize',
      'Add AudioVersePlayer widget',
      'Add app-ads.txt to both stores',
      'Build and publish',
    ],
  },
];

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="absolute top-3 right-3 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-white/40 transition-colors">
      {copied ? '✓' : 'Copy'}
    </button>
  );
}

export default function PlatformTabs() {
  const [active, setActive] = useState('ios');
  const platform = platforms.find(p => p.id === active);

  return (
    <section className="px-4 py-16 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-2">Platform Integration</h2>
        <p className="text-white/40 text-center mb-8">Choose your platform and start in minutes</p>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {platforms.map(p => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                active === p.id
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.08]'
              }`}
            >
              <span>{p.icon}</span>
              <span className="hidden sm:inline">{p.name}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{platform.icon}</span>
                <div>
                  <h3 className="font-bold text-white">{platform.name}</h3>
                  <span className="text-white/30 text-xs">Setup time: {platform.time}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[#FF6B35] font-bold text-lg">${platform.cpm} CPM</div>
                <div className="text-white/30 text-xs">Average rate</div>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Install */}
              <div>
                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">Install</h4>
                <div className="relative bg-black/30 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                  <CopyBtn text={platform.install} />
                  <pre className="whitespace-pre-wrap">{platform.install}</pre>
                </div>
              </div>

              {/* Code */}
              <div>
                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">Code Example</h4>
                <div className="relative bg-black/30 rounded-xl p-4 font-mono text-xs text-white/70 overflow-x-auto">
                  <CopyBtn text={platform.code} />
                  <pre className="whitespace-pre-wrap">{platform.code}</pre>
                </div>
              </div>

              {/* Steps */}
              <div>
                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">Setup Steps</h4>
                <ol className="space-y-2">
                  {platform.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
