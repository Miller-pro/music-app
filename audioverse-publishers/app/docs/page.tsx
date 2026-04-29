import Link from "next/link";
import type { Metadata } from "next";
import { CodeSnippet } from "@/components/onboarding/CodeSnippet";

export const metadata: Metadata = { title: "SDK docs — AudioVerse Publishers" };

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/dashboard" className="text-sm text-white/50 hover:text-white">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">SDK Documentation</h1>
      <p className="mt-2 text-sm text-white/60">
        Placeholder — full docs land in Phase 2. Below is what you need to get running.
      </p>

      <Section id="ads-txt" title="1. Add the ads.txt line">
        <p className="text-sm text-white/70">
          Paste your personalized line (see dashboard) into the ads.txt at the root of your site,
          or app-ads.txt for iOS/Android. One line per row, no extra formatting.
        </p>
      </Section>

      <Section id="web" title="2a. Web integration (React)">
        <CodeSnippet
          language="shell"
          label="Install"
          code="npm install @audioverse/sdk-web"
        />
        <div className="mt-3">
          <CodeSnippet
            language="html"
            label="app.tsx"
            code={`import { AudioVersePlayer } from "@audioverse/sdk-web";

export default function App() {
  return <AudioVersePlayer publisherId="pub-XXXXXXXXXX" />;
}`}
          />
        </div>
      </Section>

      <Section id="ios" title="2b. iOS integration (Swift)">
        <CodeSnippet
          language="text"
          label="Podfile"
          code={`pod 'AudioVerseSDK'`}
        />
      </Section>

      <Section id="android" title="2c. Android integration (Kotlin)">
        <CodeSnippet
          language="text"
          label="build.gradle"
          code={`implementation("com.audioverse:sdk:1.0.0")`}
        />
      </Section>

      <Section id="api" title="3. API reference">
        <p className="text-sm text-white/70">
          Coming in Phase 2: revenue reports, listener analytics, and track catalog API.
        </p>
      </Section>
    </main>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-8 scroll-mt-10">
      <h2 className="mb-2 text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}
