import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { TrustBar } from './TrustBar';
import { WhyTravelMateSection } from './WhyTravelMateSection';
import { IndiaCoverageSection } from './IndiaCoverageSection';
import { FeatureAISection } from './FeatureAISection';
import { SmartDocumentsSection } from './SmartDocumentsSection';
import { SmartBookingSection } from './SmartBookingSection';
import { FeatureShowcaseSection } from './FeatureShowcaseSection';
import { HowItWorksSection } from './HowItWorksSection';
import { SecuritySection } from './SecuritySection';
import { FAQSection } from './FAQSection';
import { FinalCTASection } from './FinalCTASection';
import { SiteFooter } from './SiteFooter';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased dark:bg-gray-900">
      <LandingNav />

      {/* Mobile sticky CTA — visible after scrolling past hero */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/95 lg:hidden">
        <Link
          to="/register"
          className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-bold text-gray-900 transition-opacity hover:opacity-90"
          style={{ background: '#F59E0B' }}
        >
          Start planning free
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* pt-16 to offset fixed nav; pb-[72px] on mobile to offset sticky CTA */}
      <main className="pb-[72px] pt-16 lg:pb-0" id="main-content">
        <HeroSection />
        <TrustBar />
        <WhyTravelMateSection />
        <IndiaCoverageSection />
        <FeatureAISection />
        <SmartDocumentsSection />
        <SmartBookingSection />
        <FeatureShowcaseSection />
        <HowItWorksSection />
        <SecuritySection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <SiteFooter />
    </div>
  );
}
