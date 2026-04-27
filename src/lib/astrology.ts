export type AstrologyMode = 'birth-chart' | 'rashifal' | 'kundli' | 'adv-chart';

export interface BirthChartRequest {
  name: string;
  dob: string;
  tob: string;
  pob: string;
  query?: string;
}

export interface RashifalRequest {
  sign: string;
  timeframe: string;
}

export interface KundliPersonInput {
  name: string;
  dob: string;
  tob: string;
  pob: string;
}

export interface KundliRequest {
  groom: KundliPersonInput;
  bride: KundliPersonInput;
}

type Varna = 'Brahmin' | 'Kshatriya' | 'Vaishya' | 'Shudra';
type Vashya = 'Chatushpada' | 'Dwipada' | 'Jalachara' | 'Vanachara' | 'Keeta';
type Gana = 'Deva' | 'Manushya' | 'Rakshasa';
type Nadi = 'Adi' | 'Madhya' | 'Antya';

interface NakshatraMeta {
  name: string;
  gana: Gana;
  nadi: Nadi;
  yoni: string;
}

interface AstroProfile {
  name: string;
  dob: string;
  tob: string;
  pob: string;
  moonLongitude: number;
  rashiIndex: number;
  rashi: string;
  rashiLord: string;
  nakshatraIndex: number;
  nakshatra: string;
  pada: number;
  gana: Gana;
  nadi: Nadi;
  yoni: string;
  varna: Varna;
  vashya: Vashya;
}

interface KootaScore {
  name: string;
  score: number;
  max: number;
  summary: string;
}

const RASHIS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

const RASHI_LORDS = [
  'Mars',
  'Venus',
  'Mercury',
  'Moon',
  'Sun',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Saturn',
  'Jupiter',
] as const;

const NAKSHATRAS: NakshatraMeta[] = [
  { name: 'Ashwini', gana: 'Deva', nadi: 'Adi', yoni: 'Horse' },
  { name: 'Bharani', gana: 'Manushya', nadi: 'Madhya', yoni: 'Elephant' },
  { name: 'Krittika', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Sheep' },
  { name: 'Rohini', gana: 'Manushya', nadi: 'Antya', yoni: 'Serpent' },
  { name: 'Mrigashira', gana: 'Deva', nadi: 'Madhya', yoni: 'Serpent' },
  { name: 'Ardra', gana: 'Manushya', nadi: 'Adi', yoni: 'Dog' },
  { name: 'Punarvasu', gana: 'Deva', nadi: 'Adi', yoni: 'Cat' },
  { name: 'Pushya', gana: 'Deva', nadi: 'Madhya', yoni: 'Sheep' },
  { name: 'Ashlesha', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Cat' },
  { name: 'Magha', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Rat' },
  { name: 'Purva Phalguni', gana: 'Manushya', nadi: 'Madhya', yoni: 'Rat' },
  { name: 'Uttara Phalguni', gana: 'Manushya', nadi: 'Adi', yoni: 'Cow' },
  { name: 'Hasta', gana: 'Deva', nadi: 'Adi', yoni: 'Buffalo' },
  { name: 'Chitra', gana: 'Rakshasa', nadi: 'Madhya', yoni: 'Tiger' },
  { name: 'Swati', gana: 'Deva', nadi: 'Antya', yoni: 'Buffalo' },
  { name: 'Vishakha', gana: 'Rakshasa', nadi: 'Antya', yoni: 'Tiger' },
  { name: 'Anuradha', gana: 'Deva', nadi: 'Madhya', yoni: 'Deer' },
  { name: 'Jyeshtha', gana: 'Rakshasa', nadi: 'Adi', yoni: 'Deer' },
  { name: 'Mula', gana: 'Rakshasa', nadi: 'Adi', yoni: 'Dog' },
  { name: 'Purva Ashadha', gana: 'Manushya', nadi: 'Madhya', yoni: 'Monkey' },
  { name: 'Uttara Ashadha', gana: 'Manushya', nadi: 'Antya', yoni: 'Mongoose' },
  { name: 'Shravana', gana: 'Deva', nadi: 'Antya', yoni: 'Monkey' },
  { name: 'Dhanishta', gana: 'Rakshasa', nadi: 'Madhya', yoni: 'Lion' },
  { name: 'Shatabhisha', gana: 'Rakshasa', nadi: 'Adi', yoni: 'Horse' },
  { name: 'Purva Bhadrapada', gana: 'Manushya', nadi: 'Adi', yoni: 'Lion' },
  { name: 'Uttara Bhadrapada', gana: 'Manushya', nadi: 'Madhya', yoni: 'Cow' },
  { name: 'Revati', gana: 'Deva', nadi: 'Antya', yoni: 'Elephant' },
];

const VARNA_BY_RASHI: Varna[] = [
  'Kshatriya',
  'Vaishya',
  'Shudra',
  'Brahmin',
  'Kshatriya',
  'Vaishya',
  'Shudra',
  'Brahmin',
  'Kshatriya',
  'Vaishya',
  'Shudra',
  'Brahmin',
];

const VASHYA_BY_RASHI: Vashya[] = [
  'Chatushpada',
  'Chatushpada',
  'Dwipada',
  'Jalachara',
  'Vanachara',
  'Dwipada',
  'Dwipada',
  'Keeta',
  'Chatushpada',
  'Chatushpada',
  'Dwipada',
  'Jalachara',
];

const PLANET_FRIENDSHIPS: Record<string, { friends: string[]; neutrals: string[]; enemies: string[] }> = {
  Sun: { friends: ['Moon', 'Mars', 'Jupiter'], neutrals: ['Mercury'], enemies: ['Venus', 'Saturn'] },
  Moon: { friends: ['Sun', 'Mercury'], neutrals: ['Mars', 'Jupiter', 'Venus', 'Saturn'], enemies: [] },
  Mars: { friends: ['Sun', 'Moon', 'Jupiter'], neutrals: ['Venus', 'Saturn'], enemies: ['Mercury'] },
  Mercury: { friends: ['Sun', 'Venus'], neutrals: ['Mars', 'Jupiter', 'Saturn'], enemies: ['Moon'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'], neutrals: ['Saturn'], enemies: ['Mercury', 'Venus'] },
  Venus: { friends: ['Mercury', 'Saturn'], neutrals: ['Mars', 'Jupiter'], enemies: ['Sun', 'Moon'] },
  Saturn: { friends: ['Mercury', 'Venus'], neutrals: ['Jupiter'], enemies: ['Sun', 'Moon', 'Mars'] },
};

const YONI_ENEMIES = new Set([
  ['Horse', 'Buffalo'].sort().join(':'),
  ['Elephant', 'Lion'].sort().join(':'),
  ['Sheep', 'Monkey'].sort().join(':'),
  ['Serpent', 'Mongoose'].sort().join(':'),
  ['Cow', 'Tiger'].sort().join(':'),
  ['Cat', 'Rat'].sort().join(':'),
  ['Dog', 'Deer'].sort().join(':'),
]);

const VASHYA_SCORE_MATRIX: Record<Vashya, Record<Vashya, number>> = {
  Chatushpada: { Chatushpada: 2, Dwipada: 1, Jalachara: 0.5, Vanachara: 1, Keeta: 1 },
  Dwipada: { Chatushpada: 1, Dwipada: 2, Jalachara: 0, Vanachara: 1, Keeta: 0.5 },
  Jalachara: { Chatushpada: 0.5, Dwipada: 0, Jalachara: 2, Vanachara: 0, Keeta: 1 },
  Vanachara: { Chatushpada: 1, Dwipada: 1, Jalachara: 0, Vanachara: 2, Keeta: 0 },
  Keeta: { Chatushpada: 1, Dwipada: 0.5, Jalachara: 1, Vanachara: 0, Keeta: 2 },
};

const GANA_SCORE_MATRIX: Record<Gana, Record<Gana, number>> = {
  Deva: { Deva: 6, Manushya: 5, Rakshasa: 0 },
  Manushya: { Deva: 5, Manushya: 6, Rakshasa: 1 },
  Rakshasa: { Deva: 0, Manushya: 1, Rakshasa: 6 },
};

function degToRad(value: number) {
  return (value * Math.PI) / 180;
}

function normalizeDegrees(value: number) {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function parseInputDate(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1, hour || 0, minute || 0, 0));
}

function getApproxMoonLongitude(date: Date) {
  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const daysSinceJ2000 = (date.getTime() - j2000) / 86400000;

  const meanLongitude = normalizeDegrees(218.316 + 13.176396 * daysSinceJ2000);
  const moonAnomaly = normalizeDegrees(134.963 + 13.064993 * daysSinceJ2000);
  const sunAnomaly = normalizeDegrees(357.529 + 0.98560028 * daysSinceJ2000);
  const elongation = normalizeDegrees(297.85 + 12.190749 * daysSinceJ2000);
  const latitudeArg = normalizeDegrees(93.272 + 13.22935 * daysSinceJ2000);

  const longitude =
    meanLongitude +
    6.289 * Math.sin(degToRad(moonAnomaly)) +
    1.274 * Math.sin(degToRad(2 * elongation - moonAnomaly)) +
    0.658 * Math.sin(degToRad(2 * elongation)) +
    0.214 * Math.sin(degToRad(2 * moonAnomaly)) -
    0.186 * Math.sin(degToRad(sunAnomaly)) -
    0.114 * Math.sin(degToRad(2 * latitudeArg));

  return normalizeDegrees(longitude);
}

function buildAstroProfile(input: KundliPersonInput): AstroProfile {
  const date = parseInputDate(input.dob, input.tob);
  const moonLongitude = getApproxMoonLongitude(date);
  const rashiIndex = Math.floor(moonLongitude / 30);
  const nakshatraIndex = Math.floor(moonLongitude / (360 / 27));
  const pada = Math.floor((moonLongitude % (360 / 27)) / (360 / 108)) + 1;
  const nakshatra = NAKSHATRAS[nakshatraIndex];

  return {
    name: input.name,
    dob: input.dob,
    tob: input.tob,
    pob: input.pob,
    moonLongitude,
    rashiIndex,
    rashi: RASHIS[rashiIndex],
    rashiLord: RASHI_LORDS[rashiIndex],
    nakshatraIndex,
    nakshatra: nakshatra.name,
    pada,
    gana: nakshatra.gana,
    nadi: nakshatra.nadi,
    yoni: nakshatra.yoni,
    varna: VARNA_BY_RASHI[rashiIndex],
    vashya: VASHYA_BY_RASHI[rashiIndex],
  };
}

function scoreVarna(groom: AstroProfile, bride: AstroProfile): KootaScore {
  const rank: Record<Varna, number> = { Shudra: 1, Vaishya: 2, Kshatriya: 3, Brahmin: 4 };
  const score = rank[groom.varna] >= rank[bride.varna] ? 1 : 0;
  return {
    name: 'Varna',
    score,
    max: 1,
    summary: `${groom.name} is ${groom.varna}; ${bride.name} is ${bride.varna}.`,
  };
}

function scoreVashya(groom: AstroProfile, bride: AstroProfile): KootaScore {
  const score = VASHYA_SCORE_MATRIX[groom.vashya][bride.vashya];
  return {
    name: 'Vashya',
    score,
    max: 2,
    summary: `${groom.vashya} with ${bride.vashya} yields ${score.toFixed(1)} out of 2.`,
  };
}

function taraValue(fromIndex: number, toIndex: number) {
  const distance = ((toIndex - fromIndex + 27) % 27) + 1;
  const remainder = distance % 9 || 9;
  return [2, 4, 6, 8, 9].includes(remainder);
}

function scoreTara(groom: AstroProfile, bride: AstroProfile): KootaScore {
  const groomToBride = taraValue(groom.nakshatraIndex, bride.nakshatraIndex);
  const brideToGroom = taraValue(bride.nakshatraIndex, groom.nakshatraIndex);
  const score = groomToBride && brideToGroom ? 3 : groomToBride || brideToGroom ? 1.5 : 0;
  return {
    name: 'Tara',
    score,
    max: 3,
    summary: `Tara balance is ${groomToBride ? 'supportive' : 'strained'} from groom to bride and ${brideToGroom ? 'supportive' : 'strained'} from bride to groom.`,
  };
}

function scoreYoni(groom: AstroProfile, bride: AstroProfile): KootaScore {
  const pairKey = [groom.yoni, bride.yoni].sort().join(':');
  let score = 2;
  if (groom.yoni === bride.yoni) {
    score = 4;
  } else if (YONI_ENEMIES.has(pairKey)) {
    score = 0;
  } else if (groom.gana === bride.gana) {
    score = 3;
  }

  return {
    name: 'Yoni',
    score,
    max: 4,
    summary: `${groom.yoni} and ${bride.yoni} indicate ${score >= 3 ? 'strong' : score >= 2 ? 'moderate' : 'tense'} instinctive compatibility.`,
  };
}

function getPlanetRelation(source: string, target: string) {
  if (source === target) {
    return 'same';
  }
  const config = PLANET_FRIENDSHIPS[source];
  if (config.friends.includes(target)) {
    return 'friend';
  }
  if (config.enemies.includes(target)) {
    return 'enemy';
  }
  return 'neutral';
}

function scoreGrahaMaitri(groom: AstroProfile, bride: AstroProfile): KootaScore {
  const groomView = getPlanetRelation(groom.rashiLord, bride.rashiLord);
  const brideView = getPlanetRelation(bride.rashiLord, groom.rashiLord);

  let score = 3;
  if (groom.rashiLord === bride.rashiLord) {
    score = 5;
  } else if (groomView === 'friend' && brideView === 'friend') {
    score = 5;
  } else if (
    (groomView === 'friend' && brideView === 'neutral') ||
    (groomView === 'neutral' && brideView === 'friend')
  ) {
    score = 4;
  } else if (groomView === 'neutral' && brideView === 'neutral') {
    score = 3;
  } else if (
    (groomView === 'friend' && brideView === 'enemy') ||
    (groomView === 'enemy' && brideView === 'friend')
  ) {
    score = 1;
  } else if (
    (groomView === 'neutral' && brideView === 'enemy') ||
    (groomView === 'enemy' && brideView === 'neutral')
  ) {
    score = 0.5;
  } else if (groomView === 'enemy' && brideView === 'enemy') {
    score = 0;
  }

  return {
    name: 'Graha Maitri',
    score,
    max: 5,
    summary: `${groom.rashiLord} and ${bride.rashiLord} have ${score >= 4 ? 'strong' : score >= 2 ? 'mixed' : 'weak'} planetary friendship.`,
  };
}

function scoreGana(groom: AstroProfile, bride: AstroProfile): KootaScore {
  const score = GANA_SCORE_MATRIX[groom.gana][bride.gana];
  return {
    name: 'Gana',
    score,
    max: 6,
    summary: `${groom.gana} and ${bride.gana} temperaments produce ${score} out of 6.`,
  };
}

function scoreBhakoot(groom: AstroProfile, bride: AstroProfile): KootaScore {
  const forwardDistance = ((bride.rashiIndex - groom.rashiIndex + 12) % 12) + 1;
  const reverseDistance = ((groom.rashiIndex - bride.rashiIndex + 12) % 12) + 1;
  const blocked = [2, 5, 6, 8, 9, 12].includes(forwardDistance) || [2, 5, 6, 8, 9, 12].includes(reverseDistance);
  const score = blocked ? 0 : 7;
  return {
    name: 'Bhakoot',
    score,
    max: 7,
    summary: blocked
      ? `Rashi relationship falls into a traditionally sensitive ${forwardDistance}/${reverseDistance} pattern.`
      : 'Rashi relationship avoids the main Bhakoot dosha patterns.',
  };
}

function scoreNadi(groom: AstroProfile, bride: AstroProfile): KootaScore {
  const score = groom.nadi === bride.nadi ? 0 : 8;
  return {
    name: 'Nadi',
    score,
    max: 8,
    summary: score === 8 ? 'Nadi mismatch is avoided.' : 'Same Nadi creates a classical Nadi dosha concern.',
  };
}

function getCompatibilityVerdict(total: number) {
  if (total >= 30) {
    return 'Excellent';
  }
  if (total >= 24) {
    return 'Good';
  }
  if (total >= 18) {
    return 'Average';
  }
  return 'Needs Caution';
}

function getCompatibilityTone(total: number) {
  if (total >= 30) {
    return 'A strong traditional match with broad emotional and practical support.';
  }
  if (total >= 24) {
    return 'A healthy match with a few areas that still benefit from communication and family guidance.';
  }
  if (total >= 18) {
    return 'A workable match, but the weaker kootas should be discussed carefully before taking major decisions.';
  }
  return 'Traditional matching shows notable friction, so this pair should proceed thoughtfully and consider deeper chart analysis.';
}

function getTopConcerns(scores: KootaScore[]) {
  return scores
    .filter((item) => item.score < item.max)
    .sort((a, b) => (a.score / a.max) - (b.score / b.max))
    .slice(0, 3);
}

function formatScore(score: number) {
  return Number.isInteger(score) ? `${score}` : score.toFixed(1);
}

export function generateKundliReading(input: KundliRequest) {
  const groom = buildAstroProfile(input.groom);
  const bride = buildAstroProfile(input.bride);

  const scores = [
    scoreVarna(groom, bride),
    scoreVashya(groom, bride),
    scoreTara(groom, bride),
    scoreYoni(groom, bride),
    scoreGrahaMaitri(groom, bride),
    scoreGana(groom, bride),
    scoreBhakoot(groom, bride),
    scoreNadi(groom, bride),
  ];

  const total = Number(scores.reduce((sum, item) => sum + item.score, 0).toFixed(1));
  const verdict = getCompatibilityVerdict(total);
  const concerns = getTopConcerns(scores);

  const lines = [
    `## Free Guna Milan Report`,
    ``,
    `**Total Score:** ${formatScore(total)} / 36`,
    `**Verdict:** ${verdict}`,
    `**Compatibility Insight:** ${getCompatibilityTone(total)}`,
    ``,
    `### Basic Details`,
    `| Person | Rashi | Nakshatra | Pada | Gana | Nadi | Yoni |`,
    `| --- | --- | --- | --- | --- | --- | --- |`,
    `| ${groom.name} (Groom) | ${groom.rashi} | ${groom.nakshatra} | ${groom.pada} | ${groom.gana} | ${groom.nadi} | ${groom.yoni} |`,
    `| ${bride.name} (Bride) | ${bride.rashi} | ${bride.nakshatra} | ${bride.pada} | ${bride.gana} | ${bride.nadi} | ${bride.yoni} |`,
    ``,
    `### Ashta Koota Scores`,
    `| Koota | Score | Max | Meaning |`,
    `| --- | --- | --- | --- |`,
    ...scores.map((item) => `| ${item.name} | ${formatScore(item.score)} | ${item.max} | ${item.summary} |`),
    ``,
    `### Main Observations`,
    concerns.length
      ? concerns.map((item) => `- ${item.name}: ${item.summary}`)
      : ['- All eight kootas scored strongly in this free matching report.'],
    ``,
    `### Free Version Notes`,
    `- This report uses a free, local guna milan engine with approximate Moon calculations derived from the entered date and time.`,
    `- Birthplace coordinates, DST conversion, divisional charts, Mangal dosha, and advanced cancellation rules are not included in this lightweight version.`,
    `- Use this as an initial compatibility screen. For marriage decisions, a full astrologer-reviewed kundli remains advisable.`,
  ];

  return {
    total,
    verdict,
    scores,
    groom,
    bride,
    reading: lines.join('\n'),
  };
}

export function buildOpenRouterPrompt(mode: AstrologyMode, payload: BirthChartRequest | RashifalRequest) {
  let systemInstruction = "You are a divine Vedic astrologer named 'Jyotish AI'. You provide compassionate, practical guidance and clearly label uncertainty.";
  let prompt = '';

  if (mode === 'birth-chart') {
    const data = payload as BirthChartRequest;
    prompt = `
Provide a Vedic-style astrology reading based on the following user-provided details.

Name: ${data.name}
Date of Birth: ${data.dob}
Time of Birth: ${data.tob}
Place of Birth: ${data.pob}
Question: ${data.query || 'General life reading and spiritual guidance'}

Requirements:
- Keep the tone warm, spiritual, and practical.
- Do not claim exact astronomical precision.
- Include: personality, current opportunities/challenges, relationship or career guidance if relevant, and one simple remedy or spiritual practice.
- Format in clean Markdown with short sections.
`.trim();
  } else if (mode === 'rashifal') {
    const data = payload as RashifalRequest;
    systemInstruction = 'You are an expert Vedic astrologer writing practical rashifal guidance.';
    prompt = `
Provide a ${data.timeframe} rashifal for ${data.sign}.

Requirements:
- Include general outlook, career and finance, relationships, health, lucky color or number, and one spiritual tip.
- Keep it concise, readable, and practical.
- Format in clean Markdown.
`.trim();
  } else if (mode === 'adv-chart') {
    const data = payload as BirthChartRequest;
    systemInstruction = 'You are a Vedic astrology assistant that writes technical but readable chart summaries without pretending to have ephemeris-grade precision.';
    prompt = `
Create an advanced astrology summary for the following user-provided birth details.

Name: ${data.name}
Date of Birth: ${data.dob}
Time of Birth: ${data.tob}
Place of Birth: ${data.pob}

Requirements:
- Present a technical-style report.
- Include likely chart themes, planetary influences in plain English, possible strengths, risks, and suggested spiritual disciplines.
- Clearly state that exact house and degree calculations require a full ephemeris engine.
- Format in Markdown with tables or bullet-like sections where useful.
`.trim();
  }

  return { systemInstruction, prompt };
}
