import { WelcomeChecklist } from '../components/WelcomeChecklist';
import { DashboardBackground } from '../components/DashboardBackground';
import { TripCommandHero } from '../components/TripCommandHero';
import { NextActionBanner } from '../components/NextActionBanner';
import { TripQuickActions } from '../components/TripQuickActions';
import { TripBriefCard } from '../components/TripBriefCard';
import { TodayTimeline } from '../components/TodayTimeline';
import { EnhancedWeatherWidget } from '../components/EnhancedWeatherWidget';
import { UpcomingTripsSection } from '../components/UpcomingTripsSection';
import { BudgetDonut } from '../components/BudgetDonut';
import { TravelStats } from '../components/TravelStats';

export default function DashboardPage() {
  return (
    <div className="relative space-y-6 pb-20">
      <DashboardBackground />

      {/* ── Upcoming trip: hero, next action, quick actions ─────────── */}
      <TripCommandHero />
      <NextActionBanner />
      <TripQuickActions />

      <TripBriefCard />
      <WelcomeChecklist />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TodayTimeline />
        </div>
        <div className="lg:col-span-5">
          <EnhancedWeatherWidget />
        </div>
      </div>

      {/* ── My trips ─────────────────────────────────────────────────── */}
      <UpcomingTripsSection />

      {/* ── Secondary: account-wide overview ────────────────────────── */}
      <section aria-label="Your travel overview" className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
          Your Travel Overview
        </h2>
        <BudgetDonut />
        <TravelStats />
      </section>
    </div>
  );
}
