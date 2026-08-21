import type { CostGuide } from '../types';

export const COST_DB: Record<string, CostGuide> = {
  goa: {
    localCurrency: 'Indian Rupee',
    localCurrencyCode: 'INR',
    usdToLocalRate: 83,
    items: [
      { category: 'Accommodation', emoji: '🏨', budgetUSD: 12, midrangeUSD: 45, luxuryUSD: 180 },
      { category: 'Food & Drink', emoji: '🍛', budgetUSD: 8, midrangeUSD: 22, luxuryUSD: 65 },
      { category: 'Transport', emoji: '🛵', budgetUSD: 4, midrangeUSD: 12, luxuryUSD: 40 },
      { category: 'Activities', emoji: '🌊', budgetUSD: 4, midrangeUSD: 18, luxuryUSD: 55 },
      { category: 'Shopping', emoji: '🛍️', budgetUSD: 3, midrangeUSD: 15, luxuryUSD: 60 },
      { category: 'Emergency fund', emoji: '💊', budgetUSD: 5, midrangeUSD: 12, luxuryUSD: 30 },
    ],
    dailyTotalBudget: 36,
    dailyTotalMidrange: 124,
    dailyTotalLuxury: 430,
    tippingNote:
      'Tipping is not mandatory but appreciated. 10% at restaurants; round up taxi fares. Hotel staff: ₹50–100 per service.',
    bargainingNote:
      "Bargain at all markets — starting prices are typically 2–3× the fair value. Fixed-price restaurants and government shops don't bargain.",
    atmNote:
      'ATMs are widely available in tourist areas. Use bank ATMs (SBI, HDFC, ICICI) rather than standalone machines. Daily withdrawal limit typically ₹20,000–40,000.',
  },
};
