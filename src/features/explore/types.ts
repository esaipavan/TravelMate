// Administrative scope a search query resolved to — drives both the Geoapify
// filter shape (circle vs rect, see explore.service.ts) and how results are
// labelled ("Places in Telangana" vs "Places in Hyderabad").
export type ExploreScope = 'country' | 'state' | 'district' | 'city';

export interface ExplorePlace {
  id: string;
  name: string;
  /** Human-readable category label (e.g. "Fort", "Museum", "Park") — always
   *  derived from Geoapify's own category tags, never guessed. */
  category: string;
  locality?: string;
  state?: string;
  lat: number;
  lon: number;
  /** Present only when the AI curation step selected and described this
   *  place. The place itself is always real (from Geoapify) whether or not
   *  a blurb is present — `aiRanked` tracks the DESCRIPTION's provenance,
   *  never the place's existence. */
  blurb?: string;
  aiRanked: boolean;
}

export interface ExploreSearchResult {
  query: string;
  scope: ExploreScope;
  locationLabel: string;
  places: ExplorePlace[];
  /** True only when AI curation actually succeeded and was applied. False
   *  means every place in `places` is real but unranked/undescribed — an
   *  honest degrade, never an error, when AI is unavailable. */
  isAICurated: boolean;
}

export type ExploreErrorKind = 'not_found' | 'unavailable' | 'empty';

export class ExploreError extends Error {
  readonly kind: ExploreErrorKind;
  constructor(kind: ExploreErrorKind, message: string) {
    super(message);
    this.name = 'ExploreError';
    this.kind = kind;
  }
}
