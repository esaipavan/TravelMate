import { describe, it, expect } from 'vitest';
import { mapHotel, normalizeRating } from './provider.ts';

describe('normalizeRating', () => {
  it("halves a Booking.com-style 0–10 review score to this app's 0–5 scale", () => {
    expect(normalizeRating(8.6)).toBe(4.3);
    expect(normalizeRating(10)).toBe(5);
  });

  it('treats a missing/zero/negative/non-numeric score as unrated (0), never NaN', () => {
    expect(normalizeRating(undefined)).toBe(0);
    expect(normalizeRating(0)).toBe(0);
    expect(normalizeRating(-1)).toBe(0);
    expect(normalizeRating('not-a-number')).toBe(0);
  });
});

describe('mapHotel', () => {
  it('maps a well-formed raw listing to the app-facing HotelResult shape', () => {
    const raw = {
      hotel_id: 12345,
      hotel_name: 'The Grand Palace',
      district: 'City Centre',
      review_score: 8.4,
      review_nr: 512,
      price_breakdown: { gross_price: 4200 },
      currencycode: 'INR',
      latitude: 17.385,
      longitude: 78.4867,
      main_photo_url: 'https://example.com/photo.jpg',
      class: 4,
    };

    expect(mapHotel(raw, 'INR')).toEqual({
      id: '12345',
      name: 'The Grand Palace',
      area: 'City Centre',
      rating: 4.2,
      reviewCount: 512,
      pricePerNight: 4200,
      currency: 'INR',
      amenities: [],
      lat: 17.385,
      lon: 78.4867,
      imageUrl: 'https://example.com/photo.jpg',
      stars: 4,
    });
  });

  it('falls back to city when district is absent, and to the fallback currency when the provider omits one', () => {
    const raw = { hotel_id: 1, hotel_name: 'Budget Inn', city: 'Hyderabad', min_total_price: 1500 };
    const mapped = mapHotel(raw, 'INR');
    expect(mapped?.area).toBe('Hyderabad');
    expect(mapped?.currency).toBe('INR');
    expect(mapped?.pricePerNight).toBe(1500);
  });

  it('returns null for a listing missing an id or name — never a half-fabricated hotel', () => {
    expect(mapHotel({ hotel_name: 'No Id Inn' }, 'INR')).toBeNull();
    expect(mapHotel({ hotel_id: 1 }, 'INR')).toBeNull();
    expect(mapHotel({ hotel_id: 1, hotel_name: '   ' }, 'INR')).toBeNull();
  });

  it('never fabricates optional fields the raw listing genuinely lacks (imageUrl, stars, coordinates)', () => {
    const mapped = mapHotel({ hotel_id: 1, hotel_name: 'Plain Inn' }, 'INR');
    expect(mapped?.imageUrl).toBeUndefined();
    expect(mapped?.stars).toBeUndefined();
    expect(mapped?.lat).toBeUndefined();
    expect(mapped?.lon).toBeUndefined();
    expect(mapped?.amenities).toEqual([]);
  });
});
