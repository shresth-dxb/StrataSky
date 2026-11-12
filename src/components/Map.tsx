'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, X, Loader2 } from 'lucide-react';
import { UaeFarmZone, UAE_FARM_PRESETS, validateLandUse } from '@/lib/landValidation';

export type { UaeFarmZone };
export { UAE_FARM_PRESETS };

interface NominatimSearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
  category?: string;
  address?: Record<string, string>;
}

// Apple Health Consumer Light Marker Pins
const pinGreen = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;background:#34C759;border:3px solid #FFFFFF;border-radius:9999px;box-shadow:0 3px 12px rgba(52,199,89,0.45);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const pinRed = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;background:#FF3B30;border:3px solid #FFFFFF;border-radius:9999px;box-shadow:0 3px 12px rgba(255,59,48,0.45);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapUpdater({
  selected,
  onSelect,
}: {
  selected: UaeFarmZone;
  onSelect: (z: UaeFarmZone) => void;
}) {
  const map = useMap();
  const requestSeqRef = useRef(0);

  useEffect(() => {
    map.flyTo([selected.lat, selected.lng], selected.zoom || map.getZoom(), {
      animate: true,
      duration: 1.2,
    });
  }, [selected.lat, selected.lng, selected.zoom, map]);

  useMapEvents({
    async click(e) {
      const lat = Number(e.latlng.lat.toFixed(4));
      const lng = Number(e.latlng.lng.toFixed(4));
      const currentSeq = ++requestSeqRef.current;

      // Immediate UI update while reverse-geocoding validates
      onSelect({
        lat,
        lng,
        name: 'Analyzing GPS Parcel...',
        emirate: `GIS Coordinate (${lat}°N, ${lng}°E)`,
        soilSummary: 'Reading satellite telemetry and soil classification...',
        aquiferNote: 'Checking aquifer depth and urban zoning boundaries...',
        isFarmable: true,
      });

      const validated = await validateLandUse(lat, lng);
      if (currentSeq === requestSeqRef.current) {
        onSelect(validated);
      }
    },
  });

  return null;
}

export default function Map({
  selected,
  onSelect,
}: {
  selected: UaeFarmZone;
  onSelect: (z: UaeFarmZone) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchLocations = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim().slice(0, 80);
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=ae&addressdetails=1&accept-language=en&limit=5&q=${encodeURIComponent(
          trimmed
        )}`,
        {
          headers: { 'User-Agent': 'StrataSky-UAE-Farm-App/1.0' },
          signal: controller.signal,
        }
      );
      if (!res.ok) throw new Error('Search failed');
      const data: NominatimSearchResult[] = await res.json();
      setResults(data || []);
      setIsOpen(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce typing in the search bar
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const timer = setTimeout(() => {
      searchLocations(trimmed);
    }, 350);

    return () => clearTimeout(timer);
  }, [query, searchLocations]);

  const handleSelectResult = async (item: NominatimSearchResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const displayName = item.name || item.display_name.split(',')[0];

    setQuery(displayName);
    setResults([]);
    setIsOpen(false);

    // Validate land use for chosen coordinates
    const validated = await validateLandUse(lat, lng, displayName);
    validated.zoom = 14;
    onSelect(validated);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const isFarmable = selected.isFarmable !== false;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Floating Apple Health Pill Search Bar */}
      <div
        ref={searchContainerRef}
        className="map-search-bar"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <div className="map-search-input-box">
          <Search size={16} color="#86868B" />
          <input
            type="text"
            className="map-search-input"
            placeholder="Search UAE farms, oases, or landmarks..."
            value={query}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (!val.trim()) {
                setResults([]);
                setIsSearching(false);
                setIsOpen(false);
              } else {
                setIsOpen(true);
              }
            }}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
          />
          {isSearching && <Loader2 size={16} color="#34C759" className="animate-spin" />}
          {!isSearching && query && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#86868B',
              }}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {isOpen && results.length > 0 && (
          <div className="map-search-dropdown">
            {results.map((item) => {
              const mainName = item.name || item.display_name.split(',')[0];
              const subDetails = item.display_name;
              const typeLabel = item.type || item.category || 'Parcel';

              return (
                <div
                  key={item.place_id}
                  className="map-search-item"
                  onClick={() => handleSelectResult(item)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#111111' }}>{mainName}</span>
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#1E8236',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        backgroundColor: 'rgba(52, 199, 89, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                      }}
                    >
                      {typeLabel}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6E6E73',
                      marginTop: '3px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {subDetails}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isOpen && query.trim().length >= 2 && !isSearching && results.length === 0 && (
          <div
            className="map-search-dropdown"
            style={{
              padding: '12px 16px',
              fontSize: '12px',
              color: '#86868B',
            }}
          >
            No locations found for &quot;{query}&quot;
          </div>
        )}
      </div>

      <MapContainer
        center={[selected.lat, selected.lng]}
        zoom={selected.zoom || 8}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater onSelect={onSelect} selected={selected} />
        <Marker
          icon={isFarmable ? pinGreen : pinRed}
          position={[selected.lat, selected.lng]}
        >
          <Popup>
            <div
              style={{
                color: isFarmable ? '#1E8236' : '#FF3B30',
                fontWeight: 600,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                marginBottom: '2px',
              }}
            >
              {isFarmable ? 'Verified Farmable Land' : 'Developed / Urban Area'}
            </div>
            <div style={{ color: '#111111', fontWeight: 600, fontSize: '13px' }}>{selected.name}</div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
