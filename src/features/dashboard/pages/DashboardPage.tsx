import { WelcomeChecklist } from '../components/WelcomeChecklist';
import { ExplorePlacesWidget } from '../components/ExplorePlacesWidget';
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
import { WidgetCustomizeBar } from '@/components/shared/WidgetCustomizeBar';
import { useWidgetOrder } from '@/hooks/useWidgetOrder';

// Registry of reorderable/hideable Dashboard sections. TripCommandHero is
// deliberately NOT in this registry — it's pinned, always first (removing or
// moving the primary hero doesn't make sense). Two entries
// (`todayAndWeather`, `travelOverview`) render an existing, intentional
// side-by-side/grouped layout as ONE reorderable unit rather than splitting
// it into two independently-reorderable widgets, which would require
// dynamically re-pairing them depending on where the user drags each one —
// real complexity the "customizable layout" ask doesn't call for.
const WIDGETS: Record<string, { label: string; render: () => React.ReactNode }> = {
  nextAction: { label: 'Next action', render: () => <NextActionBanner /> },
  explorePlaces: { label: 'Explore places', render: () => <ExplorePlacesWidget /> },
  quickActions: { label: 'Quick actions', render: () => <TripQuickActions /> },
  tripBrief: { label: 'AI trip brief', render: () => <TripBriefCard /> },
  welcomeChecklist: { label: 'Getting started checklist', render: () => <WelcomeChecklist /> },
  todayAndWeather: {
    label: "Today's plan & weather",
    render: () => (
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TodayTimeline />
        </div>
        <div className="lg:col-span-5">
          <EnhancedWeatherWidget />
        </div>
      </div>
    ),
  },
  upcomingTrips: { label: 'My trips', render: () => <UpcomingTripsSection /> },
  travelOverview: {
    label: 'Travel overview (budget & stats)',
    render: () => (
      <section aria-label="Your travel overview" className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
          Your Travel Overview
        </h2>
        <BudgetDonut />
        <TravelStats />
      </section>
    ),
  },
};

const DEFAULT_ORDER = [
  'nextAction',
  'explorePlaces',
  'quickActions',
  'tripBrief',
  'welcomeChecklist',
  'todayAndWeather',
  'upcomingTrips',
  'travelOverview',
];

const LABELS = Object.fromEntries(Object.entries(WIDGETS).map(([id, w]) => [id, w.label]));

export default function DashboardPage() {
  const { entries, visibleIds, reorder, toggleHidden } = useWidgetOrder('dashboard', DEFAULT_ORDER);

  return (
    <div className="relative space-y-6 pb-20">
      <DashboardBackground />

      <TripCommandHero />

      <div className="flex justify-end">
        <WidgetCustomizeBar
          entries={entries}
          labels={LABELS}
          onReorder={reorder}
          onToggleHidden={toggleHidden}
          pinnedLabels={['Trip overview hero']}
        />
      </div>

      {visibleIds.map((id) => (
        <div key={id}>{WIDGETS[id]?.render()}</div>
      ))}
    </div>
  );
}
