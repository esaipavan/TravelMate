import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { CATEGORY_META, type NearbyPlace, type PlaceCategory } from '../../types';

// ── Theme detection ───────────────────────────────────────────────────────────

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

// ── Tile layers ───────────────────────────────────────────────────────────────

const ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions" target="_blank">CARTO</a>';

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

// ── Custom markers ────────────────────────────────────────────────────────────

function makeMarkerIcon(category: PlaceCategory, isSelected: boolean, isDark: boolean): L.DivIcon {
  const meta = CATEGORY_META[category];
  const size = isSelected ? 38 : 28;
  const glow = isSelected
    ? `box-shadow: 0 0 0 4px ${meta.color}40, 0 4px 12px ${meta.color}60;`
    : `box-shadow: 0 2px 6px rgba(0,0,0,${isDark ? '0.6' : '0.3'});`;

  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:${meta.color};
      border:${isSelected ? 3 : 2}px solid ${isDark ? '#1e1e2e' : '#ffffff'};
      ${glow}
      display:flex; align-items:center; justify-content:center;
      font-size:${isSelected ? 16 : 12}px;
      cursor:pointer;
      transition:all 0.15s ease;
    ">${meta.emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function makeCenterIcon(isDark: boolean): L.DivIcon {
  const border = isDark ? '#1e1e2e' : '#ffffff';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:18px; height:18px;
      border-radius:50%;
      background:#6366f1;
      border:3px solid ${border};
      box-shadow: 0 0 0 6px rgba(99,102,241,0.25), 0 2px 8px rgba(99,102,241,0.4);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

// ── Map controller — flies to new center when destination changes ──────────────

interface ControllerProps {
  center: [number, number];
  zoom: number;
}

function MapController({ center, zoom }: ControllerProps) {
  const map = useMap();
  const prevRef = useRef<string>('');
  const key = center.join(',');

  useEffect(() => {
    if (key === prevRef.current) return;
    prevRef.current = key;
    map.flyTo(center, zoom, { duration: 1.4, easeLinearity: 0.4 });
  }, [key, center, map, zoom]);

  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  centerLat: number;
  centerLon: number;
  radiusM: number;
  places: NearbyPlace[];
  filteredIds: Set<string>;
  selectedPlace: NearbyPlace | null;
  onPlaceSelect: (place: NearbyPlace | null) => void;
  className?: string;
}

export function ExplorerMap({
  centerLat,
  centerLon,
  radiusM,
  places,
  filteredIds,
  selectedPlace,
  onPlaceSelect,
  className,
}: Props) {
  const isDark = useDarkMode();

  const center: [number, number] = [centerLat, centerLon];
  const centerIcon = makeCenterIcon(isDark);

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-border/40', className)}>
      <MapContainer
        center={center}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        attributionControl={true}
      >
        {/* Theme-aware tile layer */}
        <TileLayer
          key={isDark ? 'dark' : 'light'}
          url={isDark ? TILE_DARK : TILE_LIGHT}
          attribution={ATTRIBUTION}
          maxZoom={19}
        />

        {/* Fly to new destinations */}
        <MapController center={center} zoom={14} />

        {/* Search radius */}
        <Circle
          center={center}
          radius={radiusM}
          pathOptions={{
            color: '#6366f1',
            fillColor: '#6366f1',
            fillOpacity: 0.04,
            weight: 1.5,
            dashArray: '6 4',
            opacity: 0.4,
          }}
        />

        {/* Center pin */}
        <Marker
          position={center}
          icon={centerIcon}
          eventHandlers={{ click: () => onPlaceSelect(null) }}
        />

        {/* Place markers */}
        {places.map((place) => {
          const isVisible = filteredIds.size === 0 || filteredIds.has(place.id);
          const isSelected = selectedPlace?.id === place.id;
          if (!isVisible) return null;

          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lon]}
              icon={makeMarkerIcon(place.category, isSelected, isDark)}
              eventHandlers={{
                click: () => onPlaceSelect(isSelected ? null : place),
              }}
              opacity={isVisible ? 1 : 0.25}
            />
          );
        })}
      </MapContainer>

      {/* Gradient overlay — top, for visual depth */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-card/20 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
