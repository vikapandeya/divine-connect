/**
 * Astronomical Panchang Calculator
 * Tithi, Nakshatra, Yoga, Karana computed at sunrise (traditional method).
 * Sun/Moon positions via VSOP87 simplified (Meeus, "Astronomical Algorithms").
 */

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const IST_OFFSET = 5.5; // hours

const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati',
];

const TITHIS = [
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima',
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya',
];

const YOGAS = [
  'Vishkambha','Priti','Ayushman','Saubhagya','Shobhana','Atiganda','Sukarma',
  'Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata','Harshana','Vajra',
  'Siddhi','Vyatipata','Variyana','Parigha','Shiva','Siddha','Sadhya','Shubha',
  'Shukla','Brahma','Indra','Vaidhriti',
];

const KARANAS = [
  'Bava','Balava','Kaulava','Taitila','Garija','Vanija','Vishti',
  'Bava','Balava','Kaulava','Taitila','Garija','Vanija','Vishti',
  'Bava','Balava','Kaulava','Taitila','Garija','Vanija','Vishti',
  'Bava','Balava','Kaulava','Taitila','Garija','Vanija','Vishti',
  'Shakuni','Chatushpada','Nagava','Kimstughna',
];

const RASHIS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const HINDU_MONTHS = [
  'Chaitra','Vaishakha','Jyeshtha','Ashadha','Shravana','Bhadrapada',
  'Ashwin','Kartik','Margashirsha','Paush','Magha','Phalguna',
];

// Rahukaal slot per weekday (Sun=0..Sat=6); slot 1 = first 90-min period from sunrise
const RAHUKAAL_SLOT = [8, 2, 7, 5, 6, 4, 3];
const GULIKA_SLOT   = [6, 7, 5, 6, 4, 3, 2];
const YAMA_SLOT     = [4, 3, 2, 1, 7, 6, 5];

// ── Julian Day ────────────────────────────────────────────────────────────────
function julianDay(utcDate: Date): number {
  const y = utcDate.getUTCFullYear();
  const m = utcDate.getUTCMonth() + 1;
  const d = utcDate.getUTCDate()
    + utcDate.getUTCHours() / 24
    + utcDate.getUTCMinutes() / 1440
    + utcDate.getUTCSeconds() / 86400;
  const A = Math.floor((14 - m) / 12);
  const Y = y + 4800 - A;
  const M = m + 12 * A - 3;
  // Subtract 0.5 to convert from midnight-based civil JD to standard astronomical JD
  // (standard JD epoch is noon; without correction all T values are 0.5 days too large,
  // causing ~6.6° error in moon longitude and wrong tithi)
  return d
    + Math.floor((153 * M + 2) / 5)
    + 365 * Y
    + Math.floor(Y / 4)
    - Math.floor(Y / 100)
    + Math.floor(Y / 400)
    - 32045
    - 0.5;
}

// ── Sun tropical longitude (degrees) ─────────────────────────────────────────
function sunLon(jd: number): number {
  const T  = (jd - 2451545) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M  = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG;
  const C  = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
           + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
           + 0.000289 * Math.sin(3 * M);
  return ((L0 + C) % 360 + 360) % 360;
}

// ── Moon tropical longitude (degrees, Meeus Ch.47) ───────────────────────────
function moonLon(jd: number): number {
  const T  = (jd - 2451545) / 36525;
  const Lm = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  const D  = (297.8501921 + 445267.1114034 * T - 0.0018819 * T * T) * DEG;
  const Ms = (357.5291092 + 35999.0502909  * T - 0.0001536 * T * T) * DEG;
  const Mm = (134.9633964 + 477198.8675055 * T + 0.0087414 * T * T) * DEG;
  const F  = (93.2720950  + 483202.0175233 * T - 0.0036539 * T * T) * DEG;
  const lon = Lm
    + 6.288774 * Math.sin(Mm)
    + 1.274027 * Math.sin(2*D - Mm)
    + 0.658314 * Math.sin(2*D)
    + 0.213618 * Math.sin(2*Mm)
    - 0.185116 * Math.sin(Ms)
    - 0.114332 * Math.sin(2*F)
    + 0.058793 * Math.sin(2*D - 2*Mm)
    + 0.057066 * Math.sin(2*D - Ms - Mm)
    + 0.053322 * Math.sin(2*D + Mm)
    + 0.045758 * Math.sin(2*D - Ms)
    - 0.040923 * Math.sin(Ms - Mm)
    - 0.034720 * Math.sin(D)
    - 0.030383 * Math.sin(Ms + Mm)
    + 0.015327 * Math.sin(2*D - 2*F)
    - 0.012528 * Math.sin(Mm + 2*F)
    + 0.010980 * Math.sin(Mm - 2*F)
    + 0.010675 * Math.sin(4*D - Mm)
    + 0.010034 * Math.sin(3*Mm)
    + 0.008548 * Math.sin(4*D - 2*Mm)
    - 0.007888 * Math.sin(2*D + Ms - Mm)
    - 0.006766 * Math.sin(2*D + Ms)
    - 0.005163 * Math.sin(D - Mm)
    + 0.004987 * Math.sin(D + Ms)
    + 0.004036 * Math.sin(2*D - Ms + Mm)
    + 0.003994 * Math.sin(2*D + 2*Mm)
    + 0.003861 * Math.sin(4*D)
    + 0.003665 * Math.sin(2*D - 3*Mm);
  return ((lon % 360) + 360) % 360;
}

// ── Lahiri ayanamsha (degrees) ────────────────────────────────────────────────
function ayanamsha(jd: number): number {
  const T = (jd - 2451545) / 36525;
  return 23.85 + 0.013617 * T;
}

function toSidereal(tropical: number, jd: number): number {
  return ((tropical - ayanamsha(jd)) % 360 + 360) % 360;
}

// ── Sunrise/Sunset (returns UTC decimal hours) ────────────────────────────────
function sunriseUTC(year: number, month: number, day: number, lat: number, lon: number) {
  const jd  = julianDay(new Date(Date.UTC(year, month - 1, day, 12)));
  const T   = (jd - 2451545) / 36525;
  const L0  = ((280.46646 + 36000.76983 * T) % 360 + 360) % 360;
  const M   = ((357.52911 + 35999.05029 * T) % 360 + 360) % 360 * DEG;
  const C   = 1.914602 * Math.sin(M) + 0.019993 * Math.sin(2 * M);
  const sunL = (L0 + C) * DEG;
  const obl  = (23.439 - 0.0000004 * T) * DEG;
  const decl = Math.asin(Math.sin(obl) * Math.sin(sunL));
  const latR = lat * DEG;
  const cosH = (Math.cos(90.833 * DEG) - Math.sin(latR) * Math.sin(decl))
             / (Math.cos(latR) * Math.cos(decl));
  if (Math.abs(cosH) > 1) return { rise: 6, set: 18 }; // polar fallback
  const H    = Math.acos(cosH) * RAD;
  const RAAN = Math.atan2(Math.cos(obl) * Math.sin(sunL), Math.cos(sunL)) * RAD;
  const eqT  = 4 * (L0 - 0.0057183 - RAAN);
  // UTC = local apparent solar time - lon/15 - eqT/60
  // sunrise local apparent solar time = 12 - H/15
  const rise = 12 - H / 15 - eqT / 60 - lon / 15;
  const set  = 12 + H / 15 - eqT / 60 - lon / 15;
  return { rise, set };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function toTime(h: number): string {
  h = ((h % 24) + 24) % 24;
  const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
  const ap = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 || 12;
  return `${String(h12).padStart(2,'0')}:${String(mm).padStart(2,'0')} ${ap}`;
}

function timeRange(startUTC: number, endUTC: number): string {
  return `${toTime(startUTC + IST_OFFSET)} - ${toTime(endUTC + IST_OFFSET)}`;
}

function slotTimes(slot: number, sunriseH: number, slotSize: number) {
  const start = sunriseH + (slot - 1) * slotSize;
  return { start, end: start + slotSize };
}

// ── Moon ecliptic latitude (degrees, dominant terms) ─────────────────────────
function moonLat(jd: number): number {
  const T  = (jd - 2451545) / 36525;
  const Mm = (134.9633964 + 477198.8675055 * T + 0.0087414 * T * T) * DEG;
  const F  = (93.2720950  + 483202.0175233 * T - 0.0036539 * T * T) * DEG;
  const D  = (297.8501921 + 445267.1114034 * T - 0.0018819 * T * T) * DEG;
  const Ms = (357.5291092 + 35999.0502909  * T - 0.0001536 * T * T) * DEG;
  return  5.128122 * Math.sin(F)
        + 0.280602 * Math.sin(Mm + F)
        + 0.277693 * Math.sin(Mm - F)
        + 0.173237 * Math.sin(2 * D - F)
        + 0.055413 * Math.sin(2 * D - Mm + F)
        + 0.046272 * Math.sin(2 * D - Mm - F)
        + 0.032573 * Math.sin(2 * D + F)
        + 0.017198 * Math.sin(2 * Mm + F)
        + 0.009266 * Math.sin(2 * D + Mm - F)
        + 0.008823 * Math.sin(2 * Mm - F)
        - 0.008247 * Math.sin(2 * D - Ms - F);
}

// ── Moon rise / set (altitude scanning) ──────────────────────────────────────
function moonriseSetUTC(year: number, month: number, day: number, lat: number, lon: number): { rise: number; set: number } {
  // JD at midnight UTC for the requested date
  const jd0 = julianDay(new Date(Date.UTC(year, month - 1, day, 0, 0, 0)));

  // Moon altitude (degrees) at utcH hours relative to midnight UTC of the date
  function moonAltDeg(utcH: number): number {
    const jd = jd0 + utcH / 24;
    const mLonRad = moonLon(jd) * DEG;
    const mLatRad = moonLat(jd) * DEG; // ecliptic latitude correction
    const T = (jd - 2451545) / 36525;
    const oblRad = (23.439 - 0.0000004 * T) * DEG;
    // Ecliptic → Equatorial (with latitude)
    const ra  = Math.atan2(
      Math.sin(mLonRad) * Math.cos(oblRad) - Math.tan(mLatRad) * Math.sin(oblRad),
      Math.cos(mLonRad)
    );
    const dec = Math.asin(
      Math.sin(mLatRad) * Math.cos(oblRad) + Math.cos(mLatRad) * Math.sin(oblRad) * Math.sin(mLonRad)
    );
    // Greenwich Mean Sidereal Time (degrees)
    const gst = ((280.46061837 + 360.98564736629 * (jd - 2451545)) % 360 + 360) % 360;
    // Local Hour Angle (radians) — lon is degrees east
    const ha = (gst + lon) * DEG - ra;
    const latR = lat * DEG;
    return Math.asin(Math.sin(latR) * Math.sin(dec) + Math.cos(latR) * Math.cos(dec) * Math.cos(ha)) * RAD;
  }

  // Effective horizon altitude for moon:
  // Moon parallax ≈ 0.9507°, refraction ≈ 0.5667°, semi-diameter ≈ 0.2725°
  // h0 = 0.7275 * 0.9507° - 0.5667° ≈ +0.125° (moon parallax > refraction)
  const h0 = 0.125;
  const step = 0.25; // 15-minute steps

  // Scan from UTC -8 to UTC +32 (covers the full IST calendar day with buffer)
  let rise = 6.0, set = 18.0;
  let riseFound = false, setFound = false;
  let prev = moonAltDeg(-8);

  for (let i = 1; i <= 160; i++) {
    const utcH = -8 + i * step;
    const curr = moonAltDeg(utcH);
    if (!riseFound && prev < h0 && curr >= h0) {
      // Interpolate crossing
      rise = (utcH - step) + step * (h0 - prev) / (curr - prev);
      riseFound = true;
    }
    if (riseFound && !setFound && prev >= h0 && curr < h0) {
      set = (utcH - step) + step * (h0 - prev) / (curr - prev);
      setFound = true;
    }
    prev = curr;
  }

  return { rise, set };
}

// ── Main export ───────────────────────────────────────────────────────────────
export function calculatePanchang(date: Date, lat = 28.6139, lon = 77.2090) {
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();

  // Sunrise/Sunset in UTC hours
  const { rise: riseUTC, set: setUTC } = sunriseUTC(y, m, d, lat, lon);

  // JD at sunrise (for tithi — traditional: use sunrise tithi)
  const sunriseDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  sunriseDate.setUTCHours(0, 0, 0, 0);
  const riseHours = riseUTC;
  const riseH_int = Math.floor(riseHours);
  const riseM_int = Math.round((riseHours - riseH_int) * 60);
  const sunriseUTCDate = new Date(Date.UTC(y, m - 1, d, riseH_int, riseM_int));
  const jdSunrise = julianDay(sunriseUTCDate);

  // Planetary positions at sunrise
  const sTrop = sunLon(jdSunrise);
  const mTrop = moonLon(jdSunrise);
  const sSid  = toSidereal(sTrop, jdSunrise);
  const mSid  = toSidereal(mTrop, jdSunrise);

  // Tithi (moon-sun elongation in tropical, each 12° = one tithi)
  const elongation = ((mTrop - sTrop) % 360 + 360) % 360;
  const tithiIdx  = Math.floor(elongation / 12);
  const tithiName = TITHIS[tithiIdx] ?? 'Pratipada';
  const paksha    = tithiIdx < 15 ? 'Shukla Paksha' : 'Krishna Paksha';

  // Tithi end time estimate
  const moonDailyMotion = 12.19; // deg/day
  const tithiRemainingDeg = 12 - (elongation % 12);
  const tithiRemainingHrs = (tithiRemainingDeg / moonDailyMotion) * 24;
  const tithiEndUTC = riseUTC + tithiRemainingHrs;

  // Nakshatra (moon sidereal)
  const nakIdx  = Math.floor(mSid / (360 / 27)) % 27;
  const nakName = NAKSHATRAS[nakIdx];
  const pada    = Math.floor((mSid % (360 / 27)) / (360 / 108)) + 1;

  // Nakshatra end time estimate
  const nakRemainingDeg = (360 / 27) - (mSid % (360 / 27));
  const nakEndUTC = riseUTC + (nakRemainingDeg / moonDailyMotion) * 24;

  // Yoga
  const yogaLon = ((sSid + mSid) % 360 + 360) % 360;
  const yogaName = YOGAS[Math.floor(yogaLon / (360 / 27)) % 27];

  // Karana
  const karanaName = KARANAS[Math.floor(elongation / 6) % KARANAS.length];

  // Rashi
  const sunRashi  = RASHIS[Math.floor(sSid / 30)];
  const moonRashi = RASHIS[Math.floor(mSid / 30)];

  // Hindu month (Purnimanta calendar — North Indian style)
  // In Krishna Paksha (elongation ≥ 180°) the month name is one ahead of sun's rashi
  // In Shukla Paksha it is already one ahead (Mesha sun → Vaishakha month)
  const hinduMonth = HINDU_MONTHS[(Math.floor(sSid / 30) + 1 + (elongation >= 180 ? 1 : 0)) % 12];

  // Vikram Samvat
  // VS 2082 (Siddharthi): Chaitra 2025 - Phalguna 2026 → dates up to ~March 2026
  // VS 2083 (Raudri): Chaitra 2026 onwards
  const vs = y + 56 + (m >= 4 ? 1 : 0);
  const SAMVATSARAS = [
    'Prabhava','Vibhava','Shukla','Pramoda','Prajapati','Angiras','Shrimukha','Bhava',
    'Yuva','Dhatri','Ishvara','Bahudhanya','Pramathi','Vikrama','Vrisha','Chitrabhanu',
    'Subhanu','Tarana','Parthiva','Vyaya','Sarvajeena','Sarvadharin','Virodhin','Vikriti',
    'Khara','Nandana','Vijaya','Jaya','Manmatha','Durmukhi','Hevilambi','Vilambi','Vikari',
    'Sharvari','Plava','Shubhakrit','Shobhana','Krodhi','Vishvavasu','Parabhava','Plavanga',
    'Kilaka','Saumya','Sadharana','Virodhikrit','Paridhavi','Pramadicha','Ananda','Rakshasa',
    'Nala','Pingala','Kalayukti','Siddharthi','Raudri','Durmati','Dundubhi','Rudhirodgari',
    'Raktakshi','Krodhana','Kshaya',
  ];
  const vsName = SAMVATSARAS[(vs + 10) % 60];

  // Rahukaal, Gulika, Yamaganda (each = 1/8 of day duration, in UTC)
  const dayDurationUTC = setUTC - riseUTC;
  const slotSize = dayDurationUTC / 8;
  const dow = new Date(y, m - 1, d).getDay(); // 0=Sun

  const rahu  = slotTimes(RAHUKAAL_SLOT[dow], riseUTC, slotSize);
  const gulika = slotTimes(GULIKA_SLOT[dow], riseUTC, slotSize);
  const yama   = slotTimes(YAMA_SLOT[dow],   riseUTC, slotSize);

  // Abhijit Muhurat — 24 min either side of solar noon (local)
  const solarNoonUTC = (riseUTC + setUTC) / 2;

  // Moon rise/set via altitude scanning (replaces inaccurate dayOfYear approximation)
  const { rise: moonRiseUTC, set: moonSetUTC } = moonriseSetUTC(y, m, d, lat, lon);

  return {
    tithi: tithiName,
    tithiEnd: toTime(tithiEndUTC + IST_OFFSET),
    paksha,
    nakshatra: nakName,
    nakshatraEnd: toTime(nakEndUTC + IST_OFFSET),
    pada: String(pada),
    yoga: yogaName,
    karana: karanaName,
    mahina: hinduMonth,
    vikramSamvat: String(vs),
    samvatName: vsName,
    sunrise: toTime(riseUTC + IST_OFFSET),
    sunset:  toTime(setUTC  + IST_OFFSET),
    moonrise: toTime(moonRiseUTC + IST_OFFSET),
    moonset:  toTime(moonSetUTC  + IST_OFFSET),
    rahukaal: timeRange(rahu.start,  rahu.end),
    gulika:   timeRange(gulika.start, gulika.end),
    yamaganda: timeRange(yama.start,  yama.end),
    auspicious: `Abhijit Muhurat: ${timeRange(solarNoonUTC - 0.4, solarNoonUTC + 0.4)}`,
    sunSign:  sunRashi,
    moonSign: moonRashi,
    location: 'New Delhi, India',
    festivals: [] as string[],
  };
}
