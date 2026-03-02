import { useRef } from 'react';
import PublisherHero from '../components/Publishers/PublisherHero';
import RevenueCalculator from '../components/Publishers/RevenueCalculator';
import HowItWorks from '../components/Publishers/HowItWorks';
import AdFormatSpecs from '../components/Publishers/AdFormatSpecs';
import SdkIntegrationGuide from '../components/Publishers/SdkIntegrationGuide';
import AdsTxtGenerator from '../components/Publishers/AdsTxtGenerator';
import PublisherSignupForm from '../components/Publishers/PublisherSignupForm';
import PublisherFaq from '../components/Publishers/PublisherFaq';
import PublisherAgreement from '../components/Publishers/PublisherAgreement';
import PublisherCta from '../components/Publishers/PublisherCta';

export default function Publishers() {
  const formRef = useRef(null);

  const scrollToSignup = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="pb-12">
      <PublisherHero onGetStarted={scrollToSignup} />
      <RevenueCalculator />
      <HowItWorks />
      <AdFormatSpecs />
      <SdkIntegrationGuide />
      <AdsTxtGenerator />
      <PublisherSignupForm formRef={formRef} />
      <PublisherFaq />
      <PublisherAgreement />
      <PublisherCta onGetStarted={scrollToSignup} />
    </div>
  );
}
