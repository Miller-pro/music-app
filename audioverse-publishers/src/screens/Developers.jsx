'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Hero from '../components/Developer/Hero';
import RevenueCalculator from '../components/Developer/RevenueCalculator';
import LiveCounter from '../components/Developer/LiveCounter';
import ValueBreakdown from '../components/Developer/ValueBreakdown';
import WhatWeNeed from '../components/Developer/WhatWeNeed';
import PlatformTabs from '../components/Developer/PlatformTabs';
import SuccessJourney from '../components/Developer/SuccessJourney';
import ComparisonTable from '../components/Developer/ComparisonTable';
import TheCatch from '../components/Developer/TheCatch';
import Testimonial from '../components/Developer/Testimonial';
import FAQ from '../components/Developer/FAQ';
import Transparency from '../components/Developer/Transparency';
import EmbedPreview from '../components/Developer/EmbedPreview';
import DashboardPreview from '../components/Developer/DashboardPreview';
import LicenseStatus from '../components/Developer/LicenseStatus';
import Roadmap from '../components/Developer/Roadmap';
import Infrastructure from '../components/Developer/Infrastructure';
import WhiteGlove from '../components/Developer/WhiteGlove';
import FinalCTA from '../components/Developer/FinalCTA';

export default function Developers() {
  const setupRef = useRef(null);
  const router = useRouter();

  // Publisher signup now lives in this same app (post-merge), so route to it
  // directly instead of the old cross-app VITE_PUBLISHER_URL redirect.
  const goToSignup = () => router.push('/auth/signup');

  return (
    <div className="pb-12">
      <Hero onGetStarted={goToSignup} />
      <RevenueCalculator />
      <LiveCounter />
      <ValueBreakdown />
      <div ref={setupRef}>
        <WhatWeNeed />
      </div>
      <PlatformTabs />
      <SuccessJourney />
      <ComparisonTable />
      <TheCatch />
      <Testimonial />
      <FAQ />
      <Transparency />
      <EmbedPreview />
      <DashboardPreview />
      <LicenseStatus />
      <Roadmap />
      <Infrastructure />
      <WhiteGlove onGetStarted={goToSignup} />
      <FinalCTA onGetStarted={goToSignup} />

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:ml-[72px] p-3 bg-[#1A1A2E]/95 backdrop-blur-sm border-t border-white/5 md:hidden z-40">
        <button
          onClick={goToSignup}
          className="w-full bg-[#FF6B35] hover:bg-[#e55a28] text-white font-bold py-3 rounded-xl text-sm transition-all"
        >
          Start Free Setup — 15 Minutes
        </button>
      </div>
    </div>
  );
}
