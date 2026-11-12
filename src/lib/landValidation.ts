export interface UaeFarmZone {
  lat: number;
  lng: number;
  name: string;
  emirate: string;
  soilSummary: string;
  aquiferNote: string;
  zoom?: number;
  isFarmable?: boolean;
  detectedType?: string;
  rejectionReason?: string;
}

export const UAE_FARM_PRESETS: UaeFarmZone[] = [
  {
    lat: 24.2075,
    lng: 55.7447,
    name: 'Al Ain Oasis',
    emirate: 'Abu Dhabi Eastern Region',
    soilSummary: 'Deep sandy loam suited for multi-tier date palm canopies',
    aquiferNote: 'Historic Falaj channel zone — moderate groundwater salinity',
    isFarmable: true,
  },
  {
    lat: 25.2881,
    lng: 55.8814,
    name: 'Al Dhaid Plains',
    emirate: 'Sharjah Inland Foothills',
    soilSummary: 'Alluvial gravel plains fed by Hajar mountain wadi runoff',
    aquiferNote: 'High seasonal evaporation — shade canopy cuts water loss by 55%',
    isFarmable: true,
  },
  {
    lat: 23.1333,
    lng: 53.7667,
    name: 'Liwa Crescent',
    emirate: 'Al Dhafra Desert Margin',
    soilSummary: 'Hyper-arid dune sand over ancient fossil groundwater lens',
    aquiferNote: 'Extreme solar heat — requires windbreak palms and salt-tolerant crops',
    isFarmable: true,
  },
  {
    lat: 25.0935,
    lng: 55.3897,
    name: 'ICBA Biosaline Hub',
    emirate: 'Dubai Academic City South',
    soilSummary: 'Saline sandy soil tested for halophyte and quinoa rotations',
    aquiferNote: 'Brackish groundwater — ideal for Quinoa and Salicornia rotation',
    isFarmable: true,
  },
];

function sanitizeString(input?: string, maxLen = 100): string {
  if (!input || typeof input !== 'string') return '';
  return input.trim().replace(/[\x00-\x1F\x7F]/g, '').slice(0, maxLen);
}

export async function validateLandUse(
  lat: number,
  lng: number,
  fallbackName?: string
): Promise<UaeFarmZone> {
  // Input validation & boundary constraints
  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return {
      lat: 24.2075,
      lng: 55.7447,
      name: 'Invalid Coordinates',
      emirate: 'Out of Geographic Bounds',
      soilSummary: 'The provided latitude or longitude is invalid or out of bounds.',
      aquiferNote: 'Coordinates must be valid numbers within geographic boundaries.',
      isFarmable: false,
      rejectionReason: 'Invalid Coordinates Provided',
    };
  }

  const cleanFallback = sanitizeString(fallbackName);

  // Check if coordinates correspond closely to one of the 4 verified presets
  const matchedPreset = UAE_FARM_PRESETS.find(
    (p) => Math.abs(p.lat - lat) < 0.008 && Math.abs(p.lng - lng) < 0.008
  );
  if (matchedPreset) {
    return { ...matchedPreset, isFarmable: true };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1&accept-language=en`,
      {
        headers: { 'User-Agent': 'StrataSky-UAE-Farm-App/1.0' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Nominatim reverse lookup failed with HTTP ${res.status}`);
    }

    const data = await res.json();

    // 1. Water Body: Unable to geocode or water tags
    if (data.error === 'Unable to geocode') {
      return {
        lat,
        lng,
        name: cleanFallback || 'Water Body / Offshore Sea',
        emirate: 'Persian Gulf / Sea Parcel',
        soilSummary: 'Submerged sea parcel — zero soil suitable for agriculture',
        aquiferNote: 'Water Body Detected — Please select dry land inside the UAE.',
        isFarmable: false,
        detectedType: 'Water Body / Open Sea',
        rejectionReason: 'Water Body Detected — Please select dry land inside the UAE.',
      };
    }

    const addr = data.address || {};
    const category = typeof data.category === 'string' ? data.category.toLowerCase() : '';
    const type = typeof data.type === 'string' ? data.type.toLowerCase() : '';
    const placeRank = typeof data.place_rank === 'number' ? data.place_rank : 30;
    const countryCode = typeof addr.country_code === 'string' ? addr.country_code.toLowerCase() : '';

    // Water Body check
    const waterTypes = ['water', 'bay', 'strait', 'coastline', 'sea', 'reservoir', 'lake'];
    const isWater =
      (category === 'natural' && waterTypes.includes(type)) ||
      waterTypes.includes(type) ||
      (category === 'boundary' && placeRank <= 8 && !addr.city && !addr.town && !addr.village && !addr.county);

    if (isWater) {
      const detectedName = sanitizeString(data.name) || 'Persian Gulf / Water Body';
      return {
        lat,
        lng,
        name: cleanFallback || detectedName || 'Water Body Area',
        emirate: 'Persian Gulf / Coastal Zone',
        soilSummary: 'Open water surface — zero agricultural topsoil present',
        aquiferNote: 'Water Body Detected — Please select dry land inside the UAE.',
        isFarmable: false,
        detectedType: `${detectedName} (${type || 'water'})`,
        rejectionReason: 'Water Body Detected — Please select dry land inside the UAE.',
      };
    }

    // Outside UAE check
    if (countryCode && countryCode !== 'ae') {
      const detectedCountry = sanitizeString(addr.country) || 'Foreign Territory';
      return {
        lat,
        lng,
        name: cleanFallback || sanitizeString(data.name) || `${detectedCountry} Border`,
        emirate: `${sanitizeString(addr.state) || detectedCountry}`,
        soilSummary: 'Location falls outside United Arab Emirates borders',
        aquiferNote: 'StrataSky crop planner is calibrated strictly for UAE desert microclimates.',
        isFarmable: false,
        detectedType: `${detectedCountry} (Outside UAE)`,
        rejectionReason: 'Location Outside UAE — Please select a parcel within United Arab Emirates borders.',
      };
    }

    // 2. Transit, Metro, Roads & Infrastructure
    const transitSubstrings = [
      'station',
      'subway',
      'monorail',
      'tram',
      'bus_stop',
      'motorway',
      'trunk',
      'primary',
      'secondary',
      'residential',
      'parking',
      'bridge',
      'tunnel',
    ];
    const isTransitCategory = ['railway', 'highway', 'aeroway'].includes(category);
    const isTransitType = transitSubstrings.some((t) => type.includes(t));

    if (isTransitCategory || isTransitType) {
      const roadName =
        sanitizeString(data.name) ||
        sanitizeString(addr.road) ||
        sanitizeString(addr.railway) ||
        sanitizeString(addr.aeroway) ||
        'Highway / Transit Hub';
      return {
        lat,
        lng,
        name: cleanFallback || roadName,
        emirate: sanitizeString(addr.city) || sanitizeString(addr.state) || 'UAE Developed District',
        soilSummary: 'Asphalt, railway, or transit right-of-way — unplantable ground',
        aquiferNote: 'Transit infrastructure blocks soil cultivation and aquifer access.',
        isFarmable: false,
        detectedType: `${roadName} (${type || 'transit'} / ${category || 'infrastructure'})`,
        rejectionReason: 'Transit, Metro, Roads & Infrastructure — Transit hub, railway, or roadway detected.',
      };
    }

    // 3. Buildings, Commercial & Urban Blocks
    const urbanCategories = [
      'building',
      'amenity',
      'shop',
      'office',
      'tourism',
      'leisure',
      'man_made',
      'historic',
      'craft',
      'healthcare',
    ];
    if (urbanCategories.includes(category)) {
      const facilityName =
        sanitizeString(data.name) ||
        sanitizeString(addr.shop) ||
        sanitizeString(addr.amenity) ||
        sanitizeString(addr.building) ||
        sanitizeString(data.display_name?.split(',')[0]) ||
        'Urban Facility';
      return {
        lat,
        lng,
        name: cleanFallback || facilityName,
        emirate: sanitizeString(addr.city) || sanitizeString(addr.state) || 'UAE Developed District',
        soilSummary: 'Paved, constructed, or commercial zone — zero farmable acreage',
        aquiferNote: 'Municipal zoning and dense urban footprint prevent crop planting.',
        isFarmable: false,
        detectedType: `${facilityName} (${type} / ${category})`,
        rejectionReason: 'Developed Urban Area — Buildings, commercial blocks, or city infrastructure detected.',
      };
    }

    // 4. Urban Landuse
    const urbanLanduses = [
      'residential',
      'commercial',
      'industrial',
      'retail',
      'construction',
      'military',
      'port',
      'railway',
      'garages',
      'cemetery',
      'landfill',
    ];
    if (category === 'landuse' && urbanLanduses.includes(type)) {
      const landuseName = sanitizeString(data.name) || `${type.toUpperCase()} Zone`;
      return {
        lat,
        lng,
        name: cleanFallback || landuseName,
        emirate: sanitizeString(addr.city) || sanitizeString(addr.state) || 'UAE Developed District',
        soilSummary: 'Designated urban / industrial landuse — agricultural crops prohibited',
        aquiferNote: 'Urban zoning prevents agricultural groundwater extraction.',
        isFarmable: false,
        detectedType: `${landuseName} (landuse: ${type})`,
        rejectionReason: 'Developed Urban Area — Residential, industrial, or commercial zoning detected.',
      };
    }

    // 5. Dense City Street / Suburb Check
    const hasUrbanAddrKey = Boolean(
      addr.building ||
        addr.railway ||
        addr.shop ||
        addr.amenity ||
        addr.office ||
        addr.tourism ||
        addr.industrial ||
        addr.commercial
    );
    const isNaturalDesert = category === 'natural' && ['sand', 'desert', 'scrub', 'bare_rock'].includes(type);
    const isAgricultural =
      category === 'landuse' && ['farmland', 'orchard', 'farmyard', 'meadow', 'greenfield', 'allotments'].includes(type);

    if (
      hasUrbanAddrKey ||
      (Boolean(addr.road || addr.neighbourhood || addr.suburb) &&
        placeRank >= 26 &&
        !isNaturalDesert &&
        !isAgricultural)
    ) {
      const streetName =
        sanitizeString(data.name) ||
        sanitizeString(addr.road) ||
        sanitizeString(addr.neighbourhood) ||
        sanitizeString(addr.suburb) ||
        'City Urban Block';
      return {
        lat,
        lng,
        name: cleanFallback || streetName,
        emirate: sanitizeString(addr.city) || sanitizeString(addr.state) || 'UAE Developed District',
        soilSummary: 'Dense city street or residential neighborhood — no open arable soil',
        aquiferNote: 'City infrastructure and underground utilities prevent field farming.',
        isFarmable: false,
        detectedType: `${streetName} (Urban Street / Neighborhood)`,
        rejectionReason: 'Developed Urban Area — City street or dense urban neighborhood detected.',
      };
    }

    // 6. Valid open barren land, desert, or agricultural land
    const emirateName = sanitizeString(addr.state) || sanitizeString(addr.city) || sanitizeString(addr.county) || 'UAE Rural Region';
    const placeName =
      cleanFallback || sanitizeString(data.name) || (isNaturalDesert ? `Desert ${type.toUpperCase()}` : 'Custom UAE Field Parcel');

    return {
      lat,
      lng,
      name: placeName,
      emirate: `${emirateName} (${lat}°N, ${lng}°E)`,
      soilSummary: 'Open arid desert topsoil — high solar evaporation rate',
      aquiferNote: 'Check well salinity before choosing between Oasis Shade or Salt-Tolerant crops.',
      isFarmable: true,
      detectedType: `Open Rural Land (${type || 'desert'})`,
    };
  } catch {
    return {
      lat,
      lng,
      name: cleanFallback || 'Custom UAE Field Parcel',
      emirate: `Selected Point (${lat}°N, ${lng}°E)`,
      soilSummary: 'Arid desert topsoil — high sunlight evaporation',
      aquiferNote: 'Check well salinity before choosing between Oasis Shade or Salt-Tolerant crops.',
      isFarmable: true,
    };
  }
}
