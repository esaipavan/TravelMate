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

  bali: {
    localCurrency: 'Indonesian Rupiah',
    localCurrencyCode: 'IDR',
    usdToLocalRate: 15900,
    items: [
      { category: 'Accommodation', emoji: '🏨', budgetUSD: 15, midrangeUSD: 55, luxuryUSD: 220 },
      { category: 'Food & Drink', emoji: '🍜', budgetUSD: 7, midrangeUSD: 25, luxuryUSD: 85 },
      { category: 'Transport', emoji: '🛵', budgetUSD: 5, midrangeUSD: 15, luxuryUSD: 55 },
      { category: 'Activities', emoji: '🌋', budgetUSD: 5, midrangeUSD: 22, luxuryUSD: 75 },
      { category: 'Shopping', emoji: '🛍️', budgetUSD: 4, midrangeUSD: 20, luxuryUSD: 80 },
      { category: 'Emergency fund', emoji: '💊', budgetUSD: 5, midrangeUSD: 12, luxuryUSD: 40 },
    ],
    dailyTotalBudget: 41,
    dailyTotalMidrange: 149,
    dailyTotalLuxury: 555,
    tippingNote:
      'Tipping is appreciated but not mandatory. 10% at restaurants if no service charge. Round up taxi fares. Spa staff: Rp 50,000–100,000.',
    bargainingNote:
      "Bargain at all markets and with independent drivers. Fixed-price restaurants and chain stores don't negotiate. Never bargain at temples.",
    atmNote:
      'ATMs are abundant in Kuta, Seminyak, and Ubud. Use BCA or BNI bank ATMs. Standalone ATMs near tourist sites charge high fees. Max withdrawal typically Rp 2,000,000 per transaction.',
  },

  bangkok: {
    localCurrency: 'Thai Baht',
    localCurrencyCode: 'THB',
    usdToLocalRate: 35,
    items: [
      { category: 'Accommodation', emoji: '🏨', budgetUSD: 12, midrangeUSD: 50, luxuryUSD: 200 },
      { category: 'Food & Drink', emoji: '🍜', budgetUSD: 8, midrangeUSD: 28, luxuryUSD: 80 },
      { category: 'Transport', emoji: '🚇', budgetUSD: 5, midrangeUSD: 10, luxuryUSD: 45 },
      { category: 'Activities', emoji: '🛕', budgetUSD: 5, midrangeUSD: 20, luxuryUSD: 65 },
      { category: 'Shopping', emoji: '🛍️', budgetUSD: 5, midrangeUSD: 25, luxuryUSD: 100 },
      { category: 'Emergency fund', emoji: '💊', budgetUSD: 5, midrangeUSD: 12, luxuryUSD: 40 },
    ],
    dailyTotalBudget: 40,
    dailyTotalMidrange: 145,
    dailyTotalLuxury: 530,
    tippingNote:
      'Tipping is not mandatory but appreciated. ฿20–50 for good service at restaurants. Taxi drivers: round up the fare. Spa/massage: ฿50–100 per therapist.',
    bargainingNote:
      'Chatuchak market and street stalls: bargaining expected. BTS station malls and chain restaurants: fixed prices. Always smile while bargaining.',
    atmNote:
      'ATMs are everywhere and accept major international cards. Bangkok Bank and Kasikorn Bank ATMs are most reliable. Fee per withdrawal is ฿220 — withdraw larger amounts less frequently.',
  },

  tokyo: {
    localCurrency: 'Japanese Yen',
    localCurrencyCode: 'JPY',
    usdToLocalRate: 150,
    items: [
      { category: 'Accommodation', emoji: '🏨', budgetUSD: 30, midrangeUSD: 95, luxuryUSD: 420 },
      { category: 'Food & Drink', emoji: '🍣', budgetUSD: 20, midrangeUSD: 55, luxuryUSD: 200 },
      { category: 'Transport', emoji: '🚇', budgetUSD: 10, midrangeUSD: 15, luxuryUSD: 55 },
      { category: 'Activities', emoji: '⛩️', budgetUSD: 12, midrangeUSD: 35, luxuryUSD: 110 },
      { category: 'Shopping', emoji: '🛍️', budgetUSD: 8, midrangeUSD: 40, luxuryUSD: 160 },
      { category: 'Emergency fund', emoji: '💊', budgetUSD: 10, midrangeUSD: 20, luxuryUSD: 55 },
    ],
    dailyTotalBudget: 90,
    dailyTotalMidrange: 260,
    dailyTotalLuxury: 1000,
    tippingNote:
      'Tipping is NOT practised in Japan — it can cause confusion or embarrassment. Exceptional service is simply expected. Do not leave cash on the table.',
    bargainingNote:
      'Bargaining is not a Japanese custom and is considered very rude in most contexts. Prices are fixed. The only exception is used electronics markets.',
    atmNote:
      '7-Eleven ATMs and Japan Post ATMs accept foreign cards most reliably. Many regular bank ATMs do not. Carry ¥10,000–20,000 in cash at all times — many restaurants and small shops are cash-only.',
  },

  paris: {
    localCurrency: 'Euro',
    localCurrencyCode: 'EUR',
    usdToLocalRate: 0.92,
    items: [
      { category: 'Accommodation', emoji: '🏨', budgetUSD: 32, midrangeUSD: 130, luxuryUSD: 520 },
      { category: 'Food & Drink', emoji: '🥐', budgetUSD: 22, midrangeUSD: 65, luxuryUSD: 210 },
      { category: 'Transport', emoji: '🚇', budgetUSD: 10, midrangeUSD: 15, luxuryUSD: 65 },
      { category: 'Activities', emoji: '🎨', budgetUSD: 12, midrangeUSD: 35, luxuryUSD: 110 },
      { category: 'Shopping', emoji: '🛍️', budgetUSD: 8, midrangeUSD: 45, luxuryUSD: 210 },
      { category: 'Emergency fund', emoji: '💊', budgetUSD: 10, midrangeUSD: 25, luxuryUSD: 65 },
    ],
    dailyTotalBudget: 94,
    dailyTotalMidrange: 315,
    dailyTotalLuxury: 1180,
    tippingNote:
      'Service charge is legally included in all restaurant bills. An extra €1–2 for good service is appreciated but never expected. Never tip in boulangeries or cafés.',
    bargainingNote:
      'Prices are fixed in all shops, restaurants, and markets. Antique dealers at Marché aux Puces de Saint-Ouen are an exception — polite negotiation is possible.',
    atmNote:
      "ATMs (distributeurs) are everywhere. Use your bank's affiliated network for lowest fees. Avoid airport exchange booths — their rates are 10–15% worse than bank ATMs.",
  },

  dubai: {
    localCurrency: 'UAE Dirham',
    localCurrencyCode: 'AED',
    usdToLocalRate: 3.67,
    items: [
      { category: 'Accommodation', emoji: '🏨', budgetUSD: 35, midrangeUSD: 125, luxuryUSD: 650 },
      { category: 'Food & Drink', emoji: '🫕', budgetUSD: 15, midrangeUSD: 55, luxuryUSD: 220 },
      { category: 'Transport', emoji: '🚇', budgetUSD: 10, midrangeUSD: 28, luxuryUSD: 110 },
      { category: 'Activities', emoji: '🏙️', budgetUSD: 15, midrangeUSD: 45, luxuryUSD: 160 },
      { category: 'Shopping', emoji: '🛍️', budgetUSD: 10, midrangeUSD: 50, luxuryUSD: 320 },
      { category: 'Emergency fund', emoji: '💊', budgetUSD: 10, midrangeUSD: 25, luxuryUSD: 80 },
    ],
    dailyTotalBudget: 95,
    dailyTotalMidrange: 328,
    dailyTotalLuxury: 1540,
    tippingNote:
      'Tipping is not mandatory but expected in hotel restaurants (10–15%). Taxi drivers: round up the fare. Valet and hotel staff: AED 10–20 per service.',
    bargainingNote:
      'Bargaining is acceptable at the Gold Souk and Spice Souk — and expected on workmanship fees at the Gold Souk (not the gold price itself, which is government-fixed). Malls: fixed prices.',
    atmNote:
      'ATMs are everywhere and free with most international cards. Emirates NBD, ADCB, and ENBD ATMs are most widely accessible. The AED is pegged to the USD — no currency speculation risk.',
  },

  london: {
    localCurrency: 'British Pound',
    localCurrencyCode: 'GBP',
    usdToLocalRate: 0.79,
    items: [
      { category: 'Accommodation', emoji: '🏨', budgetUSD: 38, midrangeUSD: 140, luxuryUSD: 540 },
      { category: 'Food & Drink', emoji: '🍺', budgetUSD: 22, midrangeUSD: 65, luxuryUSD: 220 },
      { category: 'Transport', emoji: '🚇', budgetUSD: 12, midrangeUSD: 15, luxuryUSD: 65 },
      { category: 'Activities', emoji: '🎭', budgetUSD: 10, midrangeUSD: 38, luxuryUSD: 110 },
      { category: 'Shopping', emoji: '🛍️', budgetUSD: 8, midrangeUSD: 55, luxuryUSD: 220 },
      { category: 'Emergency fund', emoji: '💊', budgetUSD: 10, midrangeUSD: 25, luxuryUSD: 65 },
    ],
    dailyTotalBudget: 100,
    dailyTotalMidrange: 338,
    dailyTotalLuxury: 1220,
    tippingNote:
      '12.5% service charge is often added automatically — check your bill before adding more. Pubs: no tipping at the bar. Taxis: round up or add 10%.',
    bargainingNote:
      'Prices are fixed everywhere except antique markets (Portobello Road, Bermondsey). Polite offers at antique stalls are acceptable.',
    atmNote:
      'ATMs (cash machines) are abundant throughout London. Use Visa/Mastercard network ATMs at Barclays or Nationwide for lowest foreign fees. Avoid pay-to-use machines in pubs and corner shops.',
  },
};
