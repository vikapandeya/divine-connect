/**
 * geminiService.ts  — Frontend AI service
 *
 * All Gemini API calls are now proxied through the backend server.
 * This keeps the API key server-side only and never exposes it to the browser.
 */

export interface PanchangData {
  tithi: string;
  tithiEnd?: string;
  paksha: string;
  nakshatra: string;
  nakshatraEnd?: string;
  yoga: string;
  yogaEnd?: string;
  karana: string;
  karanaEnd?: string;
  mahina: string;
  vikramSamvat: string;
  samvatName: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  rahukaal: string;
  gulika: string;
  yamaganda: string;
  auspicious: string;
  festivals?: string[];
  sunSign?: string;
  moonSign?: string;
  location?: string;
}

export interface HoroscopeData {
  sign: string;
  prediction: string;
}

/** Fetch live Panchang via the backend proxy */
export async function fetchLivePanchang(date: Date, language: string = 'en'): Promise<PanchangData> {
  const dateStr = date.toISOString().split('T')[0];
  const res = await fetch(`/api/ai/panchang?date=${dateStr}&lang=${language}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch panchang');
  }
  return res.json();
}

/** Fetch live horoscope for a zodiac sign via the backend proxy */
export async function fetchLiveHoroscope(sign: string, language: string = 'en'): Promise<string> {
  const res = await fetch(`/api/ai/horoscope?sign=${encodeURIComponent(sign)}&lang=${language}`);
  if (!res.ok) {
    // Graceful fallback — return a static spiritual message
    return 'The cosmic energies are aligning with your purpose. Today, prioritize tranquility and let your inner wisdom guide your path.';
  }
  const data = await res.json();
  return data.prediction || 'The stars illuminate your path with grace and divine purpose today.';
}
