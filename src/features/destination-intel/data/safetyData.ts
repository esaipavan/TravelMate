import type { SafetyInfo } from '../types';

export const SAFETY_DB: Record<string, SafetyInfo> = {
  goa: {
    overallRating: 'safe',
    ratingNote:
      'Goa is generally safe for tourists, especially in well-travelled beach towns and Panaji. Exercise normal caution at night on isolated beaches and in crowded markets.',
    emergency: {
      police: '100',
      ambulance: '108',
      fire: '101',
      general: '112',
      touristHelpline: '1800-111-363',
    },
    hospitals: [
      { name: 'Goa Medical College & Hospital', area: 'Bambolim, Panaji (30 min from North Goa)' },
      { name: 'Apollo Clinic Goa', area: 'Panaji — best for non-emergency consultations' },
    ],
    embassies: [
      {
        country: 'US, UK, EU',
        phone: 'All embassies are in New Delhi — nearest consulates in Mumbai (3 hrs)',
      },
    ],
    tips: [
      'Avoid isolated beaches after dark — even during peak season; stick to lit, populated stretches',
      'Keep a physical copy of your passport and visa — the originals in your hotel safe',
      'Drink only bottled or filtered water; avoid ice in drinks from small roadside stalls',
      'Negotiate taxi fares before boarding — scam fares are common near tourist landmarks',
      'Monsoon season brings strong rip currents — swim only at beaches with lifeguard flags',
    ],
    scams: [
      'Taxi overcharging: tourists are quoted 3–5× the local rate. Ask your hotel the correct fare before hailing',
      "Fake police: plain-clothes 'officers' demand to see documents and then extort 'fines'. Genuine police wear uniforms",
      'Restaurant bill inflation: always ask for the bill to be itemised; extra items are regularly added',
      'Jewellery gem scams: sellers claim stones are investment quality. They are not. Never buy gems from street vendors',
      'Currency exchange: informal changers short-count bills. Use only bank ATMs or registered exchange counters',
    ],
    avoidAreas: [
      'Calangute and Baga beaches late at night (after midnight) — rowdy and poorly lit',
      'Interior Goa roads at night during monsoon — flash floods and visibility are dangerous',
    ],
    etiquette: [
      'Remove shoes before entering any temple, church, or home — a sign outside usually confirms this',
      'Dress modestly at religious sites — shoulders and knees covered; swimwear is not appropriate in towns',
      'Public displays of affection are frowned upon in conservative areas; beachfront is more relaxed',
      'Tipping is appreciated but not mandatory — 10% at restaurants, round up taxi fares',
      'Bargaining is expected at markets and with taxis; never bargain in temples or at government-fixed prices',
      'Do not photograph people, especially women, without asking permission first',
    ],
  },
};
