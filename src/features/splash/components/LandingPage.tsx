import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { TrustBar } from './TrustBar';
import { ProductPreviewStrip } from './ProductPreviewStrip';
import { FeatureAISection } from './FeatureAISection';
import { FeatureBudgetSection } from './FeatureBudgetSection';
import { HowItWorksSection } from './HowItWorksSection';
import { SecuritySection } from './SecuritySection';
import { FeatureGridSection } from './FeatureGridSection';
import { SocialProofSection } from './SocialProofSection';
import { FAQSection } from './FAQSection';
import { FinalCTASection } from './FinalCTASection';
import { SiteFooter } from './SiteFooter';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <LandingNav />
      {/* pt-16 to offset fixed nav */}
      <main className="pt-16">
        <HeroSection />
        <TrustBar />
        <ProductPreviewStrip />
        <FeatureAISection />
        <FeatureBudgetSection />
        <HowItWorksSection />
        <SecuritySection />
        <FeatureGridSection />
        <SocialProofSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <SiteFooter />
    </div>
  );
}
