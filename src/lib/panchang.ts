import { getLocale, type AppLocale, type PanchangInsight } from './platform';

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

function getLocalizedFallback(locale: AppLocale): PanchangInsight {
  if (locale === 'hi') {
    return {
      dateLabel: 'शुक्रवार, 27 मार्च 2026',
      tithi: 'चैत्र शुक्ल नवमी',
      nakshatra: 'पुनर्वसु',
      muhurat: 'अभिजित मुहूर्त: लगभग 12:00 PM - 12:48 PM',
      focus: 'राम नवमी पूजन, रामायण पाठ, दान और पारिवारिक संकल्प के लिए अत्यंत शुभ दिन।',
    };
  }

  if (locale === 'sa') {
    return {
      dateLabel: 'शुक्रवासरः, 27 मार्च 2026',
      tithi: 'चैत्र-शुक्ल-नवमी',
      nakshatra: 'पुनर्वसू',
      muhurat: 'अभिजित् मुहूर्तम्: प्रायः 12:00 PM - 12:48 PM',
      focus: 'रामनवमी-पूजनाय, रामायण-पाठाय, दानाय, पारिवारिक-संकल्पाय च अयं दिनः शुभः।',
    };
  }

  return {
    dateLabel: 'Friday, March 27, 2026',
    tithi: 'Chaitra Shukla Navami',
    nakshatra: 'Punarvasu',
    muhurat: 'Abhijit Muhurat: around 12:00 PM - 12:48 PM',
    focus: 'An especially auspicious day for Rama Navami worship, Ramayana recitation, charity, and fresh family sankalp.',
  };
}

function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
  return typeof configuredBaseUrl === 'string' ? configuredBaseUrl.replace(/\/$/, '') : '';
}

export function getFallbackPanchangCard(locale: AppLocale = getLocale()): PanchangCardData {
  return {
    ...getLocalizedFallback(locale),
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
    ...getLocalizedFallback(locale),
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
