import { getCurrentDailyPanchang, getLocale, type AppLocale, type PanchangInsight } from './platform';

export type PanchangCardData = PanchangInsight & {
  source: 'live' | 'fallback';
  sourceName: string;
  locationLabel: string;
  fetchedAt?: string;
  festivalName?: string | null;
  engineName?: string | null;
  engineVersion?: string | null;
};

const DEFAULT_LOCATION_LABEL = 'Varanasi, Uttar Pradesh';

function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
  return typeof configuredBaseUrl === 'string' ? configuredBaseUrl.replace(/\/$/, '') : '';
}

export function getFallbackPanchangCard(locale: AppLocale = getLocale()): PanchangCardData {
  return {
    ...getCurrentDailyPanchang(locale),
    source: 'fallback',
    sourceName: 'Built-in Panchang fallback',
    locationLabel: DEFAULT_LOCATION_LABEL,
  };
}

export async function fetchDailyPanchang(locale: AppLocale = getLocale()): Promise<PanchangCardData> {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/api/panchang/today`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Panchang request failed with status ${response.status}.`);
  }

  const payload = await response.json();

  return {
    ...getCurrentDailyPanchang(locale),
    ...payload.panchang,
    source: 'live',
    sourceName: 'TathaAstu Panchang API',
    locationLabel: payload.location?.label || DEFAULT_LOCATION_LABEL,
    fetchedAt: payload.fetchedAt,
    festivalName: payload.panchang?.festivalName || null,
    engineName: payload.engine?.name || null,
    engineVersion: payload.engine?.version || null,
  };
}
