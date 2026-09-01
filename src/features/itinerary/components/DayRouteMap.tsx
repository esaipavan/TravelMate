import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle } from 'lucide-react';
import type { ItineraryItemRow } from '../types';

function useDarkMode(): boolean {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark')),
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

const ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions" target="_blank">CARTO</a>';
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

function numberedIcon(n: number, isDark: boolean): L.DivIcon {
  const border = isDark ? '#1e1e2e' : '#ffffff';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:24px; height:24px;
      border-radius:50%;
      background:#6366f1;
      border:2px solid ${border};
      box-shadow:0 2px 6px rgba(0,0,0,${isDark ? '0.6' : '0.3'});
      display:flex; align-items:center; justify-content:center;
      font-size:11px; font-weight:700; color:#fff;
    ">${n}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

interface Props {
  /** Already filtered to the day's items that have saved coordinates, in the
   *  day's current order — the sequence shown is exactly the itinerary
   *  order, nothing re-sorted or inferred. */
  items: (ItineraryItemRow & { latitude: number; longitude: number })[];
}

/**
 * Honest day-route visualization: numbered markers in itinerary order,
 * connected by a dashed straight-line path. This is NOT a road route and
 * never claims a travel time — TravelMate has no routing provider, so it
 * only shows what it can actually prove (saved coordinates), labelled
 * clearly as a sequence, not navigation.
 */
export function DayRouteMap({ items }: Props) {
  const isDark = useDarkMode();
  const points: [number, number][] = items.map((i) => [i.latitude, i.longitude]);
  const bounds = L.latLngBounds(points);

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl border border-border/40" style={{ height: 220 }}>
        <MapContainer
          bounds={bounds}
          boundsOptions={{ padding: [28, 28] }}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          scrollWheelZoom={false}
          attributionControl={true}
        >
          <TileLayer
            key={isDark ? 'dark' : 'light'}
            url={isDark ? TILE_DARK : TILE_LIGHT}
            attribution={ATTRIBUTION}
            maxZoom={19}
          />
          <Polyline
            positions={points}
            pathOptions={{ color: '#6366f1', weight: 2, dashArray: '6 5', opacity: 0.7 }}
          />
          {items.map((item, i) => (
            <Marker
              key={item.id}
              position={[item.latitude, item.longitude]}
              icon={numberedIcon(i + 1, isDark)}
            />
          ))}
        </MapContainer>
      </div>
      <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
        Straight-line sequence only — not a road route or drive time. Use a place's Route button for
        real directions.
      </p>
    </div>
  );
}
