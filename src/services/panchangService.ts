
/**
 * Simplified Vedic Panchang Calculation Logic
 * Note: These are approximations for UI purposes. 
 * For religious precision, a full Ephemeris based engine would be used.
 */

export interface PanchangData {
  date: string;
  tithi: string;
  tithiName: string;
  paksha: 'Shukla' | 'Krishna';
  nakshatra: string;
  yoga: string;
  karana: string;
  weekday: string;
  samvat: number;
  samvatsara: string;
  kaliyugaYear: number;
  sunrise: string;
  sunset: string;
  moonPhase: number; // 0 to 1
}

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const YOGAS = [
  "Vishkumbha", "Priti", "Ayushmana", "Saubhagya", "Sobhana", "Atiganda", "Sukarma", "Dhriti", "Shula",
  "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

const KARANAS = [
  "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kintughna"
];

const SAMVATSARAS = [
  "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapati", "Angira", "Shrimukha", "Bhava", "Yuva", "Dhata",
  "Ishvara", "Bahudhanya", "Pramati", "Vikrama", "Vrusha", "Chitrabhanu", "Subhanu", "Tarana", "Parthiva", "Vyaya",
  "Sarvajit", "Sarvadhari", "Virodhi", "Vikruti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha",
  "Hevalambi", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakruta", "Shobhakruta", "Krodhi", "Visvavasu", "Paridhavi",
  "Pramadicha", "Ananda", "Rakshasa", "Anala", "Pingala", "Kalayukta", "Siddharthi", "Raudra", "Durmati", "Dundubhi",
  "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya"
];

const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
];

export function getPanchangForDate(date: Date = new Date()): PanchangData {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  // Simple Julian Day conversion (approximation for recent dates)
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Reference date: April 19, 2026 was Tithi 2 (Dwitiya) Shukla
  // Let's use a known New Moon near the current date.
  // Approximation of Moon age (days since last New Moon)
  // One synodic month is approx 29.53059 days.
  const knownNewMoonJD = 2451550.1; // Jan 6, 2000
  const daysSinceNewMoon = (jd - knownNewMoonJD) % 29.53059;
  const tithiIndex = Math.floor((daysSinceNewMoon / 29.53059) * 30) % 30;
  
  const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';
  const tithiName = TITHI_NAMES[tithiIndex];
  
  // Basic cycle for Nakshatra (approx 27.32 days cycle)
  const nakshatraIndex = Math.floor((jd % 27.32166) / 27.32166 * 27);
  
  // Samvat Calculation: Vikram Samvat ≈ Gregorian Year + 57 (approx)
  // Siddharthi corresponds to 2026/27 (Samvat 2083)
  const samvat = year + 57;
  const kaliyugaYear = year + 3101;
  
  // Samvatsara index in the 60-year cycle
  // Siddharthi is the 53rd year. Shaka year 1948 corresponds to 2026.
  // Cycle starts from Prabhava (1).
  const samvatsaraIndex = (samvat - 3) % 60; // Approximation

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekday = weekdays[date.getDay()];

  return {
    date: date.toDateString(),
    tithi: `${paksha} ${tithiName}`,
    tithiName,
    paksha,
    nakshatra: NAKSHATRAS[nakshatraIndex] || "Pushya",
    yoga: YOGAS[jd % 27] || "Siddha",
    karana: KARANAS[jd % 11] || "Bava",
    weekday,
    samvat,
    samvatsara: SAMVATSARAS[samvatsaraIndex] || "Siddharthi",
    kaliyugaYear,
    sunrise: "05:52 AM",
    sunset: "06:49 PM",
    moonPhase: daysSinceNewMoon / 29.53
  };
}
