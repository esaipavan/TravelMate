// One-shot browser geolocation lookup — no continuous watchPosition, matching
// "a one-time location request is sufficient for the first implementation".

export interface Coordinates {
  lat: number;
  lon: number;
}

export type GeolocationErrorReason =
  'unsupported' | 'permission-denied' | 'unavailable' | 'timeout';

export class GeolocationError extends Error {
  reason: GeolocationErrorReason;

  constructor(reason: GeolocationErrorReason, message: string) {
    super(message);
    this.reason = reason;
  }
}

export function getCurrentCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new GeolocationError('unsupported', 'Your browser does not support location access.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(
            new GeolocationError(
              'permission-denied',
              'Location access was denied. You can still search by typing a destination.',
            ),
          );
        } else if (err.code === err.TIMEOUT) {
          reject(new GeolocationError('timeout', 'Location request timed out. Please try again.'));
        } else {
          reject(new GeolocationError('unavailable', 'Could not determine your location.'));
        }
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  });
}
