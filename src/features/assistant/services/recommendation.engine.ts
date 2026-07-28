import type { TripRow } from '@/features/trips/types';
import type { ExpenseData } from '@/features/expenses/types';
import type { DestinationData, ChecklistCategory } from '@/features/destination-intel/types';
import type {
  Recommendation,
  BudgetAnalysis,
  BudgetStatus,
  PackingAnalysis,
  PackingCategoryInfo,
  TripInsight,
} from '../types';

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000,
  );
}

export function computeTripInsight(trip: TripRow, today: string): TripInsight {
  const daysUntilTrip = daysBetween(today, trip.start_date);
  const daysIntoTrip = Math.max(0, daysBetween(trip.start_date, today));
  const daysTotal = Math.max(1, daysBetween(trip.start_date, trip.end_date) + 1);
  const daysRemaining = Math.max(0, daysBetween(today, trip.end_date) + 1);
  return {
    daysUntilTrip,
    daysIntoTrip,
    daysTotal,
    daysRemaining,
    isActive: daysUntilTrip <= 0 && daysRemaining > 0,
    isUpcoming: daysUntilTrip > 0,
    isCompleted: daysRemaining <= 0,
  };
}

export function computeBudgetAnalysis(
  trip: TripRow,
  expenseData: ExpenseData | null,
  insight: TripInsight,
): BudgetAnalysis | null {
  const totalBudget = trip.total_budget ?? 0;
  if (!totalBudget || !expenseData) return null;

  const totalSpent = expenseData.expenses.reduce((s, e) => s + (e.amount ?? 0), 0);
  const remaining = totalBudget - totalSpent;
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const daysElapsed = Math.max(1, Math.min(insight.daysTotal, insight.daysIntoTrip + 1));
  const dailyAllowance = totalBudget / Math.max(1, insight.daysTotal);
  const dailyActual = totalSpent / daysElapsed;
  const projectedTotal = dailyActual * insight.daysTotal;

  let status: BudgetStatus = 'on-track';
  if (percentUsed > 100) status = 'over-budget';
  else if (percentUsed > 80 || projectedTotal > totalBudget * 1.1) status = 'near-limit';

  return {
    status,
    totalBudget,
    totalSpent,
    remaining,
    percentUsed,
    daysElapsed,
    daysTotal: insight.daysTotal,
    daysRemaining: insight.daysRemaining,
    dailyAllowance,
    dailyActual,
    projectedTotal,
    currency: expenseData.tripCurrency || trip.currency || 'USD',
  };
}

const CAT_META: Record<string, { label: string; emoji: string }> = {
  documents: { label: 'Documents', emoji: '📄' },
  health: { label: 'Health', emoji: '💊' },
  money: { label: 'Money', emoji: '💳' },
  tech: { label: 'Tech', emoji: '📱' },
  clothing: { label: 'Clothing', emoji: '👕' },
  essentials: { label: 'Essentials', emoji: '🎒' },
};

export function computePackingAnalysis(intel: DestinationData | null): PackingAnalysis | null {
  if (!intel || intel.checklist.length === 0) return null;

  const byCategory: Record<string, { total: number; required: number }> = {};
  for (const item of intel.checklist) {
    if (!byCategory[item.category]) byCategory[item.category] = { total: 0, required: 0 };
    byCategory[item.category].total++;
    if (item.required) byCategory[item.category].required++;
  }

  const categories: PackingCategoryInfo[] = Object.entries(byCategory).map(([cat, counts]) => ({
    category: cat as ChecklistCategory,
    label: CAT_META[cat]?.label ?? cat,
    emoji: CAT_META[cat]?.emoji ?? '📦',
    total: counts.total,
    required: counts.required,
  }));

  return {
    totalItems: intel.checklist.length,
    totalRequired: intel.checklist.filter((i) => i.required).length,
    categories,
  };
}

export function generateRecommendations(
  trip: TripRow,
  _expenseData: ExpenseData | null,
  intel: DestinationData | null,
  budget: BudgetAnalysis | null,
  insight: TripInsight,
): Recommendation[] {
  const recs: Recommendation[] = [];
  const tripId = trip.id;

  // Timing
  if (insight.isUpcoming) {
    if (insight.daysUntilTrip <= 3) {
      recs.push({
        id: 'timing-imminent',
        category: 'timing',
        priority: 'critical',
        title:
          insight.daysUntilTrip === 1
            ? 'Departing tomorrow!'
            : `${insight.daysUntilTrip} days to departure`,
        body: 'Do a final packing check, confirm all bookings, and arrange transport to the airport.',
        emoji: '✈️',
        action: { label: 'Check Packing List', type: 'view-packing', tripId },
        dismissible: false,
      });
    } else if (insight.daysUntilTrip <= 7) {
      recs.push({
        id: 'timing-soon',
        category: 'timing',
        priority: 'high',
        title: `${insight.daysUntilTrip} days until ${trip.destination}`,
        body: 'Start packing, confirm hotel reservations, and check travel advisories for your destination.',
        emoji: '🗓️',
        action: { label: 'View Destination Intel', type: 'view-intel', tripId },
        dismissible: true,
      });
    } else if (insight.daysUntilTrip <= 30) {
      recs.push({
        id: 'timing-month',
        category: 'timing',
        priority: 'medium',
        title: `${insight.daysUntilTrip} days to go`,
        body: `Great time to research must-see attractions and pre-book popular experiences in ${trip.destination} before they sell out.`,
        emoji: '📅',
        action: { label: 'Explore Attractions', type: 'view-intel', tripId },
        dismissible: true,
      });
    }
  }

  if (insight.isActive) {
    recs.push({
      id: 'timing-active',
      category: 'timing',
      priority: insight.daysRemaining <= 2 ? 'high' : 'medium',
      title:
        insight.daysRemaining === 1
          ? 'Last day in destination!'
          : `${insight.daysRemaining} days remaining`,
      body:
        insight.daysRemaining === 1
          ? `Make the most of your final day in ${trip.destination}. Check late checkout options and find that last great meal.`
          : `Day ${insight.daysIntoTrip + 1} of ${insight.daysTotal} in ${trip.destination}. ${insight.daysRemaining} more days of adventure ahead!`,
      emoji: insight.daysRemaining <= 2 ? '⏳' : '🌟',
      dismissible: true,
    });
  }

  // Budget
  if (budget) {
    if (budget.status === 'over-budget') {
      recs.push({
        id: 'budget-over',
        category: 'budget',
        priority: 'critical',
        title: `Over budget — ${Math.round(budget.percentUsed)}% spent`,
        body: `You've used ${budget.currency} ${Math.round(budget.totalSpent).toLocaleString()} of your ${budget.currency} ${Math.round(budget.totalBudget).toLocaleString()} budget. Daily actual ${budget.currency} ${Math.round(budget.dailyActual).toLocaleString()} vs ${budget.currency} ${Math.round(budget.dailyAllowance).toLocaleString()} planned.`,
        emoji: '⚠️',
        action: { label: 'Review Budget', type: 'view-budget', tripId },
        dismissible: false,
      });
    } else if (budget.status === 'near-limit') {
      recs.push({
        id: 'budget-near',
        category: 'budget',
        priority: 'high',
        title: `${Math.round(budget.percentUsed)}% of budget used`,
        body: `At this pace you'll spend ${budget.currency} ${Math.round(budget.projectedTotal).toLocaleString()} total. ${budget.currency} ${Math.round(budget.remaining).toLocaleString()} left with ${budget.daysRemaining} days remaining.`,
        emoji: '💰',
        action: { label: 'Review Expenses', type: 'view-budget', tripId },
        dismissible: true,
      });
    } else {
      recs.push({
        id: 'budget-ok',
        category: 'budget',
        priority: 'low',
        title: 'Budget on track',
        body: `You've spent ${budget.currency} ${Math.round(budget.totalSpent).toLocaleString()} (${Math.round(budget.percentUsed)}%). Daily average ${budget.currency} ${Math.round(budget.dailyActual).toLocaleString()} is within your ${budget.currency} ${Math.round(budget.dailyAllowance).toLocaleString()}/day allowance.`,
        emoji: '✅',
        action: { label: 'View Expenses', type: 'view-budget', tripId },
        dismissible: true,
      });
    }
  }

  // Safety
  if (intel?.safety) {
    const { overallRating, scams, ratingNote } = intel.safety;
    if (overallRating === 'caution' || overallRating === 'high-risk') {
      recs.push({
        id: 'safety-rating',
        category: 'safety',
        priority: overallRating === 'high-risk' ? 'critical' : 'high',
        title: `Safety advisory: ${overallRating === 'high-risk' ? 'High Risk' : 'Exercise Caution'}`,
        body:
          ratingNote ||
          `${trip.destination} has an elevated safety rating. Review safety tips and avoid marked areas.`,
        emoji: overallRating === 'high-risk' ? '🚨' : '⚠️',
        action: { label: 'View Safety Tips', type: 'view-safety', tripId },
        dismissible: false,
      });
    } else if (scams.length > 0) {
      recs.push({
        id: 'safety-scams',
        category: 'safety',
        priority: 'medium',
        title: `${scams.length} known tourist scams to know`,
        body: `Being aware of common scams in ${trip.destination} is your best protection. Review them before you arrive.`,
        emoji: '🛡️',
        action: { label: 'View Scam Awareness', type: 'view-safety', tripId },
        dismissible: true,
      });
    }
  }

  // Weather
  if (intel?.weather) {
    const { current, forecast, recommendations } = intel.weather;
    if (current.uvIndex >= 8) {
      recs.push({
        id: 'weather-uv',
        category: 'weather',
        priority: 'high',
        title: `High UV index: ${current.uvIndex}`,
        body: 'Apply SPF 50+ sunscreen every 2 hours, wear a wide-brim hat, and seek shade between 11am–3pm.',
        emoji: '☀️',
        dismissible: true,
      });
    }
    const rainyDay = forecast.find((d) => d.precipPct >= 60);
    if (rainyDay) {
      recs.push({
        id: 'weather-rain',
        category: 'weather',
        priority: 'medium',
        title: `Rain expected ${rainyDay.dayLabel.toLowerCase()}`,
        body: `${Math.round(rainyDay.precipPct)}% chance of rain. Consider indoor attractions or carry an umbrella.`,
        emoji: '🌧️',
        action: { label: 'Browse Attractions', type: 'view-intel', tripId },
        dismissible: true,
      });
    } else if (recommendations.length > 0 && current.uvIndex < 8) {
      recs.push({
        id: 'weather-tip',
        category: 'weather',
        priority: 'low',
        title: 'Weather tip for your trip',
        body: recommendations[0],
        emoji: '🌤️',
        dismissible: true,
      });
    }
  }

  // Experience
  if (intel?.attractions && intel.attractions.length > 0) {
    const top = intel.attractions.reduce(
      (best, a) => (a.popularityScore > best.popularityScore ? a : best),
      intel.attractions[0],
    );
    recs.push({
      id: 'exp-top-attraction',
      category: 'experience',
      priority: 'low',
      title: `Don't miss: ${top.name}`,
      body: top.description.length > 110 ? top.description.slice(0, 107) + '…' : top.description,
      emoji: '⭐',
      action: { label: 'Explore Attractions', type: 'view-intel', tripId },
      dismissible: true,
    });
  }

  if (intel?.food?.dishes) {
    const mustTry = intel.food.dishes.find((d) => d.mustTry);
    if (mustTry) {
      recs.push({
        id: 'exp-food',
        category: 'experience',
        priority: 'low',
        title: `Must try: ${mustTry.name}`,
        body: mustTry.description,
        emoji: mustTry.emoji,
        action: { label: 'View Food Guide', type: 'view-intel', tripId },
        dismissible: true,
      });
    }
  }

  // Visa
  if (intel?.overview?.visaInfo) {
    recs.push({
      id: 'entry-visa',
      category: 'alert',
      priority: 'medium',
      title: 'Entry & visa requirement',
      body: intel.overview.visaInfo,
      emoji: '🛂',
      dismissible: true,
    });
  }

  return recs;
}
