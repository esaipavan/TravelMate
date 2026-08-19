import type { DocumentType } from '@/features/documents/types';
import type { TravelDocumentRow } from '@/features/documents/types';

export interface DocumentSuggestion {
  key: string;
  label: string;
  /** Real travel_documents.type when the suggestion maps 1:1 to a known type
   *  — used to honestly detect "already added". Null for free-text/trip-guide
   *  suggestions we can't confidently match, which always stay "Suggested". */
  type: DocumentType | null;
}

const DOMESTIC_BASELINE: DocumentSuggestion[] = [
  { key: 'gov-id', label: 'Government ID', type: null },
  { key: 'insurance', label: 'Travel insurance', type: 'insurance' },
  { key: 'hotel', label: 'Hotel booking confirmation', type: 'hotel' },
  { key: 'ticket', label: 'Flight / train / bus ticket', type: null },
];

const INTERNATIONAL_BASELINE: DocumentSuggestion[] = [
  { key: 'passport', label: 'Passport', type: 'passport' },
  { key: 'visa', label: 'Visa', type: 'visa' },
  ...DOMESTIC_BASELINE,
];

/** Deterministic, no AI — based only on the trip's destination country_code.
 * Never claims a visa/passport is actually required, only suggests checking. */
export function getBaselineDocumentSuggestions(countryCode: string | null): DocumentSuggestion[] {
  const isInternational = !!countryCode && countryCode.trim().toUpperCase() !== 'IN';
  return isInternational ? INTERNATIONAL_BASELINE : DOMESTIC_BASELINE;
}

/** Free-text items from trip_briefs.required_documents, deduped against the
 * baseline list by loose label match. Always type: null — AI free text is
 * never confidently matched to a specific document type. */
export function getTripGuideDocumentSuggestions(
  requiredDocuments: unknown,
  baseline: DocumentSuggestion[],
): DocumentSuggestion[] {
  if (!Array.isArray(requiredDocuments)) return [];
  const baselineLabels = new Set(baseline.map((b) => b.label.toLowerCase()));
  const seen = new Set<string>();
  const result: DocumentSuggestion[] = [];

  for (const raw of requiredDocuments) {
    if (typeof raw !== 'string') continue;
    const label = raw.trim();
    if (!label) continue;
    const norm = label.toLowerCase();
    if (baselineLabels.has(norm) || seen.has(norm)) continue;
    // Skip anything that's clearly just re-describing a baseline item
    if ([...baselineLabels].some((b) => norm.includes(b) || b.includes(norm))) continue;
    seen.add(norm);
    result.push({ key: `guide-${norm.replace(/\s+/g, '-')}`, label, type: null });
  }

  return result.slice(0, 8);
}

/** Only claims "already added" when the suggestion maps to a real, specific
 * document type AND a document of that type exists for this trip — never
 * guessed from free text, so it can never be honestly wrong. */
export function isSuggestionFulfilled(
  suggestion: DocumentSuggestion,
  existingDocs: TravelDocumentRow[],
): boolean {
  if (!suggestion.type) return false;
  return existingDocs.some((d) => d.type === suggestion.type);
}
