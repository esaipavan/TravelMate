import { DashboardBackground } from '../components/DashboardBackground';
import { TripCommandHero } from '../components/TripCommandHero';
import { PremiumQuickActions } from '../components/PremiumQuickActions';
import { TodayTimeline } from '../components/TodayTimeline';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import { BudgetDonut } from '../components/BudgetDonut';
import { EnhancedWeatherWidget } from '../components/EnhancedWeatherWidget';
import { UpcomingTripsSection } from '../components/UpcomingTripsSection';
import { TravelStats } from '../components/TravelStats';

export default function DashboardPage() {
  return (
    <div className="relative space-y-8 pb-20">
      <DashboardBackground />

      <TripCommandHero />

      <PremiumQuickActions />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TodayTimeline />
        </div>
        <div className="lg:col-span-5">
          <AIInsightsPanel />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <BudgetDonut />
        <EnhancedWeatherWidget />
      </div>

      <UpcomingTripsSection />

      <TravelStats />
    </div>
  );
}
