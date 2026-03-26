export type LocationSource = 'live' | 'manual';

export type PanditAvailabilityStatus = 'available' | 'limited' | 'unavailable';

export type PanditAvailabilityResult = {
  status: PanditAvailabilityStatus;
  zoneLabel: string;
  city?: string;
  state?: string;
  summary: string;
  note: string;
  nextAvailableWindow: string;
  travelSurcharge: number;
  distanceKm?: number;
  checkedAt: string;
  locationLabel: string;
  locationSource: LocationSource;
  latitude?: number;
  longitude?: number;
};

type ServiceZone = {
  label: string;
  city: string;
  state: string;
  keywords: string[];
  center: {
    latitude: number;
    longitude: number;
  };
  coreRadiusKm: number;
  extendedRadiusKm: number;
  limitedSurcharge: number;
  extendedSurcharge: number;
  nextAvailableWindow: string;
  note: string;
};

type AvailabilityInput = {
  locationSource: LocationSource;
  locationLabel: string;
  latitude?: number;
  longitude?: number;
};

const serviceZones: ServiceZone[] = [
  {
    label: 'Kashi Core Seva Circle',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    keywords: ['varanasi', 'kashi', 'banaras', 'shivala', 'lanka', 'sigra'],
    center: { latitude: 25.3176, longitude: 82.9739 },
    coreRadiusKm: 12,
    extendedRadiusKm: 28,
    limitedSurcharge: 0,
    extendedSurcharge: 350,
    nextAvailableWindow: 'Earliest home visit slot opens in 3 to 5 hours.',
    note: 'This zone has the strongest pandit coverage with same-day offline seva support.',
  },
  {
    label: 'Prayagraj Sangam Circle',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    keywords: ['prayagraj', 'allahabad', 'sangam', 'jhunsi', 'naini'],
    center: { latitude: 25.4358, longitude: 81.8463 },
    coreRadiusKm: 10,
    extendedRadiusKm: 24,
    limitedSurcharge: 0,
    extendedSurcharge: 450,
    nextAvailableWindow: 'Next coordinated visit is usually available by tomorrow morning.',
    note: 'Pandit ji visits are routed through the Sangam partner network for offline ceremonies.',
  },
  {
    label: 'Ayodhya Mandir Circuit',
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    keywords: ['ayodhya', 'faizabad', 'ram janmabhoomi', 'hanuman garhi'],
    center: { latitude: 26.7995, longitude: 82.2043 },
    coreRadiusKm: 8,
    extendedRadiusKm: 20,
    limitedSurcharge: 0,
    extendedSurcharge: 500,
    nextAvailableWindow: 'Offline home seva is typically aligned within the next 24 hours.',
    note: 'Availability depends on temple-linked pandit rotations and festival demand.',
  },
  {
    label: 'Lucknow Ghar Seva Belt',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    keywords: ['lucknow', 'gomti nagar', 'indira nagar', 'hazratganj', 'aliganj'],
    center: { latitude: 26.8467, longitude: 80.9462 },
    coreRadiusKm: 9,
    extendedRadiusKm: 22,
    limitedSurcharge: 0,
    extendedSurcharge: 650,
    nextAvailableWindow: 'The support desk can usually assign a pandit ji by the next available slot.',
    note: 'Travel and slot confirmation vary slightly because pandit ji is dispatched from partner hubs.',
  },
];

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm(
  startLatitude: number,
  startLongitude: number,
  endLatitude: number,
  endLongitude: number,
) {
  const earthRadiusKm = 6371;
  const deltaLatitude = toRadians(endLatitude - startLatitude);
  const deltaLongitude = toRadians(endLongitude - startLongitude);
  const startLatRadians = toRadians(startLatitude);
  const endLatRadians = toRadians(endLatitude);

  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2)
    + Math.cos(startLatRadians)
      * Math.cos(endLatRadians)
      * Math.sin(deltaLongitude / 2)
      * Math.sin(deltaLongitude / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function matchManualZone(locationLabel: string) {
  const normalizedLabel = locationLabel.trim().toLowerCase();

  return (
    serviceZones.find((zone) =>
      zone.keywords.some((keyword) => normalizedLabel.includes(keyword)),
    ) || null
  );
}

function findNearestZone(latitude: number, longitude: number) {
  return serviceZones.reduce<{ zone: ServiceZone; distanceKm: number } | null>((closest, zone) => {
    const distanceKm = calculateDistanceKm(
      latitude,
      longitude,
      zone.center.latitude,
      zone.center.longitude,
    );

    if (!closest || distanceKm < closest.distanceKm) {
      return { zone, distanceKm };
    }

    return closest;
  }, null);
}

function roundDistance(distanceKm: number) {
  return Math.round(distanceKm * 10) / 10;
}

export function checkPanditAvailability(input: AvailabilityInput): PanditAvailabilityResult {
  const checkedAt = new Date().toISOString();
  const locationLabel = input.locationLabel.trim();
  const hasCoordinates =
    Number.isFinite(input.latitude) && Number.isFinite(input.longitude);

  if (!locationLabel) {
    return {
      status: 'unavailable',
      zoneLabel: 'Location required',
      summary: 'Please share your live location or enter your area to check pandit availability.',
      note: 'Offline puja dispatch needs a serviceable address before we can assign pandit ji.',
      nextAvailableWindow: 'Availability can be checked instantly after location is shared.',
      travelSurcharge: 0,
      checkedAt,
      locationLabel: '',
      locationSource: input.locationSource,
    };
  }

  let matchedZone: ServiceZone | null = null;
  let distanceKm: number | undefined;

  if (hasCoordinates) {
    const nearestZone = findNearestZone(input.latitude as number, input.longitude as number);
    matchedZone = nearestZone?.zone || null;
    distanceKm = nearestZone ? roundDistance(nearestZone.distanceKm) : undefined;
  } else {
    matchedZone = matchManualZone(locationLabel);
  }

  if (!matchedZone) {
    return {
      status: 'unavailable',
      zoneLabel: 'Outside current offline network',
      summary: 'Pandit ji home-visit seva is not active in this area yet.',
      note: 'Please choose online puja for instant support, or contact support to request a manual offline quote.',
      nextAvailableWindow: 'New areas are activated zone by zone based on partner availability.',
      travelSurcharge: 0,
      checkedAt,
      locationLabel,
      locationSource: input.locationSource,
      latitude: input.latitude,
      longitude: input.longitude,
    };
  }

  if (typeof distanceKm === 'number') {
    if (distanceKm <= matchedZone.coreRadiusKm) {
      return {
        status: 'available',
        zoneLabel: matchedZone.label,
        city: matchedZone.city,
        state: matchedZone.state,
        summary: `Pandit ji is available for this location in the ${matchedZone.city} service zone.`,
        note: matchedZone.note,
        nextAvailableWindow: matchedZone.nextAvailableWindow,
        travelSurcharge: matchedZone.limitedSurcharge,
        distanceKm,
        checkedAt,
        locationLabel,
        locationSource: input.locationSource,
        latitude: input.latitude,
        longitude: input.longitude,
      };
    }

    if (distanceKm <= matchedZone.extendedRadiusKm) {
      return {
        status: 'limited',
        zoneLabel: matchedZone.label,
        city: matchedZone.city,
        state: matchedZone.state,
        summary: `Pandit ji can travel to this location, but dispatch is limited outside the core ${matchedZone.city} radius.`,
        note: 'A travel coordination charge applies and the final slot is confirmed after route planning.',
        nextAvailableWindow: matchedZone.nextAvailableWindow,
        travelSurcharge: matchedZone.extendedSurcharge,
        distanceKm,
        checkedAt,
        locationLabel,
        locationSource: input.locationSource,
        latitude: input.latitude,
        longitude: input.longitude,
      };
    }

    return {
      status: 'unavailable',
      zoneLabel: matchedZone.label,
      city: matchedZone.city,
      state: matchedZone.state,
      summary: `This address is ${distanceKm} km away from our nearest active seva zone.`,
      note: 'The location is currently outside the maximum offline dispatch radius for pandit ji.',
      nextAvailableWindow: 'You can continue with online puja or request support for a custom arrangement.',
      travelSurcharge: 0,
      distanceKm,
      checkedAt,
      locationLabel,
      locationSource: input.locationSource,
      latitude: input.latitude,
      longitude: input.longitude,
    };
  }

  return {
    status: 'limited',
    zoneLabel: matchedZone.label,
    city: matchedZone.city,
    state: matchedZone.state,
    summary: `Pandit ji service is available for ${matchedZone.city}, subject to final address confirmation.`,
    note: 'Manual place checks are best-effort. Exact dispatch and travel charge may adjust once the full address is confirmed.',
    nextAvailableWindow: matchedZone.nextAvailableWindow,
    travelSurcharge: matchedZone.extendedSurcharge,
    checkedAt,
    locationLabel,
    locationSource: input.locationSource,
  };
}
