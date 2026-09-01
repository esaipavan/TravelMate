// Single source of truth for outbound Google Maps links. Always prefers exact
// coordinates over a text query — a lat/lon pin can never be misinterpreted or
// pattern-match onto the wrong same-named place across the country the way a
// text search can.

export function getMapSearchUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

// No `origin` param — Google Maps falls back to the device's current location,
// which is the correct default for "get directions to this place" and avoids
// TravelMate having to know/guess where the user is starting from.
export function getDirectionsUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}
