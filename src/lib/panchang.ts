import { getLocale, type AppLocale, type PanchangInsight } from './platform';

export type PanchangCardData = PanchangInsight & {
  source: 'live' | 'fallback' | 'computed';
  sourceName: string;
  locationLabel: string;
  fetchedAt?: string;
  festivalName?: string | null;
  engineName?: string | null;
  engineVersion?: string | null;
};

const DEFAULT_LOCATION_LABEL = 'Varanasi, Uttar Pradesh';

// ─── Astronomical helpers ───────────────────────────────────────────────────

function toJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function sind(deg: number): number {
  return Math.sin((deg * Math.PI) / 180);
}

function mod360(v: number): number {
  return ((v % 360) + 360) % 360;
}

function calcSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const M = mod360(357.5291 + 35999.0503 * T);
  const C =
    1.9146 * sind(M) + 0.02 * sind(2 * M) + 0.0003 * sind(3 * M);
  return mod360(280.4665 + 36000.7698 * T + C);
}

function calcMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L = mod360(218.3165 + 481267.8813 * T);
  const Mp = mod360(134.9634 + 477198.8676 * T);
  const D = mod360(297.8502 + 445267.1115 * T);
  const M = mod360(357.5291 + 35999.0503 * T);
  const F = mod360(93.2721 + 483202.0175 * T);
  const corr =
    6.2888 * sind(Mp) +
    1.274 * sind(2 * D - Mp) +
    0.6583 * sind(2 * D) +
    0.2136 * sind(2 * Mp) -
    0.185 * sind(M) -
    0.1144 * sind(F) +
    0.0588 * sind(2 * D - 2 * Mp) +
    0.0572 * sind(2 * D - M - Mp) +
    0.0533 * sind(2 * D + Mp);
  return mod360(L + corr);
}

// Ayanamsha (sidereal offset) ≈ 23.85° at J2000, drifts ~50.2″/year
function ayanamsha(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  return 23.85197 + T * 0.013932; // degrees
}

// ─── Lookup tables ───────────────────────────────────────────────────────────

const TITHI_NAMES_EN = [
  'Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dvadashi', 'Trayodashi', 'Chaturdashi', 'Purnima',
  'Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dvadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya',
];

const TITHI_NAMES_HI = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा',
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'अमावस्या',
];

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

// Approximate Hindu month from solar longitude (sidereal)
const SOLAR_HINDU_MONTHS = [
  'Vaisakh', 'Jyeshtha', 'Ashadha', 'Shravan', 'Bhadrapada', 'Ashwin',
  'Kartik', 'Margashirsha', 'Paush', 'Magh', 'Phalgun', 'Chaitra',
];

const MUHURAT_BY_WEEKDAY = [
  'Surya Muhurat: 6:30 AM – 7:30 AM',
  'Amrit Kaal: 6:00 AM – 7:30 AM',
  'Abhijit Muhurat: 11:48 AM – 12:36 PM',
  'Brahma Muhurat: 4:24 AM – 5:12 AM',
  'Guru (Abhijit) Muhurat: 11:48 AM – 12:36 PM',
  'Shri Muhurat: 10:00 AM – 11:00 AM',
  'Vijay Muhurat: 2:00 PM – 3:00 PM',
];

const TITHI_FOCUS = [
  'A fresh beginning — offer flowers and set a new sankalp today.',
  'Ideal for charitable acts and devotion to family deities.',
  'Auspicious for yatra planning and honouring ancestors.',
  'Vinayaka energy: worship Ganesha for obstacle removal.',
  'Sacred for Naga puja and deepening spiritual learning.',
  'Shashti honours Kartikeya — ideal for children\'s wellbeing rituals.',
  'Saptami is auspicious for Surya puja and positive new beginnings.',
  'Ashtami: powerful for Durga worship and navarna mantra chanting.',
  'Navami: especially auspicious for Rama puja and Ramayana recitation.',
  'Dashami brings righteous energy — ideal for dharmic resolutions.',
  'Ekadashi — fast, worship Vishnu, study sacred texts.',
  'Dvadashi: break the fast, offer Tulsi, and do Satyanarayan puja.',
  'Trayodashi: sacred for Shiva worship and pradosh puja at sunset.',
  'Chaturdashi: strong protective energies — invoke Bhairava or Durga.',
  'Purnima — full moon blessings for ancestral rituals, charity, and satyanarayan.',
  'Krishna Pratipada — honour the waning moon with quiet evening prayers.',
  'Dvitiya invites gratitude and family harmony rituals.',
  'Tritiya is auspicious for new ventures, upanayana, and celebrations.',
  'Krishna Chaturthi: fast, Ganesha worship, and charitable giving.',
  'Panchami: honour Saraswati and sacred learning today.',
  'Shashti: offer prayers for children and seek family protection.',
  'Saptami: recite the Aditya Hridayam and worship the Sun.',
  'Ashtami in Krishna Paksha: strong Kali energies — offer red flowers.',
  'Navami: Devi blessings are near — recite Durga Saptashati verses.',
  'Dashami: honour teachers and dharmic guides in your life.',
  'Krishna Ekadashi — fasting and Hari Naam are especially meritorious.',
  'Dvadashi: complete the fast and make charitable offerings.',
  'Trayodashi: Pradosh Vrat for Shiva devotees — visit the mandir at dusk.',
  'Chaturdashi: Shivaratri energy — night puja and vigil are recommended.',
  'Amavasya — new moon: perform tarpanam for ancestors and light a lamp.',
];

const EN_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EN_MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const HI_DAY_NAMES = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
const HI_MONTH_NAMES = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितम्बर', 'अक्टूबर', 'नवम्बर', 'दिसम्बर'];

// ─── Core computation ────────────────────────────────────────────────────────

function computeTodayPanchang(locale: AppLocale): PanchangInsight {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekday = now.getDay();

  const jd = toJulianDay(year, month, day);
  const sunTropical = calcSunLongitude(jd);
  const moonTropical = calcMoonLongitude(jd);
  const ayan = ayanamsha(jd);

  // Tithi uses tropical diff (standard for most panchang calculations)
  const diff = mod360(moonTropical - sunTropical);
  const tithiIndex = Math.floor(diff / 12); // 0–29
  const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';
  const pakshaHi = tithiIndex < 15 ? 'शुक्ल' : 'कृष्ण';

  // Nakshatra uses sidereal moon longitude
  const moonSidereal = mod360(moonTropical - ayan);
  const nakshatraIndex = Math.floor(moonSidereal / (360 / 27)); // 0–26

  // Hindu month from sidereal sun
  const sunSidereal = mod360(sunTropical - ayan);
  const hinduMonthIndex = Math.floor(sunSidereal / 30) % 12;
  const hinduMonth = SOLAR_HINDU_MONTHS[hinduMonthIndex];

  const tithi = TITHI_NAMES_EN[tithiIndex];
  const nakshatra = NAKSHATRA_NAMES[nakshatraIndex];
  const muhurat = MUHURAT_BY_WEEKDAY[weekday];
  const focus = TITHI_FOCUS[tithiIndex] || TITHI_FOCUS[0];

  if (locale === 'hi') {
    return {
      dateLabel: `${HI_DAY_NAMES[weekday]}, ${day} ${HI_MONTH_NAMES[month - 1]} ${year}`,
      tithi: `${pakshaHi} ${TITHI_NAMES_HI[tithiIndex]}`,
      nakshatra,
      muhurat,
      focus,
    };
  }

  return {
    dateLabel: `${EN_DAY_NAMES[weekday]}, ${EN_MONTH_NAMES[month - 1]} ${day}, ${year}`,
    tithi: `${hinduMonth} ${paksha} ${tithi}`,
    nakshatra,
    muhurat,
    focus,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

function resolveApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
  return typeof configuredBaseUrl === 'string' ? configuredBaseUrl.replace(/\/$/, '') : '';
}

export function getFallbackPanchangCard(locale: AppLocale = getLocale()): PanchangCardData {
  return {
    ...computeTodayPanchang(locale),
    source: 'computed',
    sourceName: 'Computed Panchang (Approx.)',
    locationLabel: DEFAULT_LOCATION_LABEL,
  };
}

export async function fetchDailyPanchang(locale: AppLocale = getLocale()): Promise<PanchangCardData> {
  const apiBaseUrl = resolveApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/api/panchang/today`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Panchang request failed with status ${response.status}.`);
  }

  const payload = await response.json();

  return {
    ...computeTodayPanchang(locale),
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
