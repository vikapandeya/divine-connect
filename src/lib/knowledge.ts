export type KnowledgeHighlight = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
};

export type PujaGuide = {
  id: string;
  title: string;
  purpose: string;
  idealFor: string;
  duration: string;
  bestTiming: string;
  samagriFocus: string[];
  keyTakeaway: string;
};

export type ScriptureGuide = {
  id: string;
  title: string;
  tradition: string;
  focus: string;
  idealFor: string;
  structure: string;
  whatYouLearn: string[];
  readingApproach: string;
};

export type TempleGuide = {
  id: string;
  name: string;
  location: string;
  tradition: string;
  significance: string;
  bestSeason: string;
  idealFor: string;
  highlights: string[];
};

export type LearningPath = {
  id: string;
  title: string;
  audience: string;
  duration: string;
  outcome: string;
  steps: string[];
};

export type DevoteeQuestion = {
  id: string;
  question: string;
  answer: string;
};

export const knowledgeHighlights: KnowledgeHighlight[] = [
  {
    id: 'ganesh-puja-guide',
    title: 'How Ganesh Puja supports new beginnings with clarity and sankalp',
    excerpt:
      'A practical guide to why families start spiritual journeys, new homes, and major milestones with Ganesh worship.',
    category: 'Puja Guide',
    readTime: '6 min read',
  },
  {
    id: 'gita-family-reading',
    title: 'A simple family reading path for Bhagavad Gita, Ramayana, and Bhagavatam',
    excerpt:
      'A structured way to begin scripture reading without feeling overwhelmed by length, language, or commentary.',
    category: 'Scripture Reading',
    readTime: '8 min read',
  },
  {
    id: 'temple-yatra-planning',
    title: 'How to choose between Jyotirlinga, Char Dham, and major tirth yatras',
    excerpt:
      'A planning guide for devotees deciding between temple-city visits, full pilgrimage circuits, and special seasonal journeys.',
    category: 'Temple Journey',
    readTime: '7 min read',
  },
];

export const pujaGuides: PujaGuide[] = [
  {
    id: 'ganesh-puja',
    title: 'Ganesh Puja',
    purpose:
      'Invoked for new beginnings, removal of obstacles, and calm family focus before important milestones.',
    idealFor: 'Housewarming, exams, business starts, marriage preparation, and new ventures.',
    duration: '45 to 75 minutes',
    bestTiming: 'Morning muhurat, Chaturthi observance, and fresh sankalp days.',
    samagriFocus: ['durva grass', 'modak or laddoo', 'red flowers', 'akshat rice'],
    keyTakeaway:
      'Ganesh Puja works best when the family keeps the sankalp specific and the ritual simple, sincere, and uncluttered.',
  },
  {
    id: 'lakshmi-puja',
    title: 'Lakshmi Puja',
    purpose:
      'Performed for prosperity, household abundance, business harmony, and gratitude for earned resources.',
    idealFor: 'Diwali, shop openings, new accounting cycles, and family finance blessings.',
    duration: '50 to 90 minutes',
    bestTiming: 'Evening deepa lighting, Diwali muhurat, and Friday worship.',
    samagriFocus: ['lotus or white flowers', 'ghee diya', 'coins', 'kumkum and haldi'],
    keyTakeaway:
      'The devotional mood matters as much as the offerings. Lakshmi Puja is strongest when paired with cleanliness, gratitude, and disciplined intent.',
  },
  {
    id: 'satyanarayan-katha',
    title: 'Satyanarayan Katha',
    purpose:
      'A family-centered katha and puja focused on gratitude, vow fulfillment, and spiritual grounding through Vishnu devotion.',
    idealFor: 'Birthdays, anniversaries, griha pravesh, and post-milestone thanksgiving.',
    duration: '90 to 150 minutes',
    bestTiming: 'Purnima, Ekadashi-adjacent observance, or a calm evening family slot.',
    samagriFocus: ['panchamrit', 'banana leaves', 'fruits', 'prasadam for family sharing'],
    keyTakeaway:
      'This puja becomes especially meaningful when the katha is explained clearly so every family member understands the vow and blessing.',
  },
  {
    id: 'rudrabhishek',
    title: 'Rudrabhishek',
    purpose:
      'A Shiva-centered ritual for inner strength, peace, health prayers, and release from stress or heavy emotional phases.',
    idealFor: 'Shravan month, Mondays, Mahashivratri, and periods of intense personal transition.',
    duration: '60 to 120 minutes',
    bestTiming: 'Morning Shiva worship, Pradosh influence, and sacred month observances.',
    samagriFocus: ['jal and milk abhishek', 'bilva leaves', 'bhasma', 'rudraksha'],
    keyTakeaway:
      'Rudrabhishek feels most complete when the chanting pace, offerings, and sankalp stay balanced rather than rushed.',
  },
  {
    id: 'maha-mrityunjaya-jaap',
    title: 'Maha Mrityunjaya Jaap',
    purpose:
      'A healing-centered prayer cycle for resilience, health intention, mental steadiness, and spiritual protection.',
    idealFor: 'Health concerns, recovery periods, difficult life phases, and prayer support for loved ones.',
    duration: 'Variable, often 108 repetitions or guided anushthan sequences',
    bestTiming: 'Brahma muhurta, Monday observance, or dedicated healing sankalp dates.',
    samagriFocus: ['rudraksha mala', 'ghee diya', 'water kalash', 'Shiva mantra focus'],
    keyTakeaway:
      'The power of this practice comes from disciplined repetition, clean pronunciation, and devotion sustained over time.',
  },
  {
    id: 'navagraha-shanti',
    title: 'Navagraha Shanti',
    purpose:
      'Performed to seek balance across planetary influences, life transitions, and karmic stress points.',
    idealFor: 'Astrological remedy plans, marriage delays, career instability, and repeated obstacles.',
    duration: '75 to 120 minutes',
    bestTiming: 'Suggested by astrology guidance, before key transitions, or during remedy periods.',
    samagriFocus: ['navadhanya grains', 'colored vastra', 'til and flowers', 'graha mantra recitation'],
    keyTakeaway:
      'This ritual works best when it is tied to a clear remedy plan and practical follow-through in daily conduct.',
  },
];

export const scriptureGuides: ScriptureGuide[] = [
  {
    id: 'bhagavad-gita',
    title: 'Bhagavad Gita',
    tradition: 'Smriti scripture within the Mahabharata tradition',
    focus: 'Duty, devotion, discipline, clarity, and action without attachment.',
    idealFor: 'Beginners, working professionals, students, and seekers navigating responsibility.',
    structure: '18 chapters with philosophical dialogue between Krishna and Arjuna.',
    whatYouLearn: ['karma yoga', 'bhakti yoga', 'clarity in decision making', 'stability during conflict'],
    readingApproach:
      'Start with one chapter summary at a time, then read a trusted translation with practical commentary rather than trying to absorb every verse at once.',
  },
  {
    id: 'ramayana',
    title: 'Ramayana',
    tradition: 'Itihasa focused on dharma, character, kingship, and devotion.',
    focus: 'Ideal conduct, family loyalty, righteous leadership, and steadfast devotion.',
    idealFor: 'Families, children, and anyone learning dharma through story and character.',
    structure: 'Narrative epic with major kandas tracing Rama, Sita, Lakshmana, and Hanuman.',
    whatYouLearn: ['maryada and ethics', 'devotion through action', 'family duty', 'strength in adversity'],
    readingApproach:
      'Read it as a lived moral narrative. Short daily passages with discussion often work better than isolated quotation.',
  },
  {
    id: 'srimad-bhagavatam',
    title: 'Srimad Bhagavatam',
    tradition: 'Bhakti-centered Purana with deep focus on Vishnu and Krishna devotion.',
    focus: 'Divine play, devotion, surrender, and the emotional texture of bhakti.',
    idealFor: 'Devotees interested in Krishna bhakti, katha listening, and devotional storytelling.',
    structure: '12 skandhas with theology, stories of devotees, avatars, and spiritual teaching.',
    whatYouLearn: ['bhakti as a path', 'stories of Prahlad and Dhruva', 'Krishna leela', 'detachment through devotion'],
    readingApproach:
      'Begin with guided summaries and key stories, then move into skandha-by-skandha reading with audio kathas for context.',
  },
  {
    id: 'vedas',
    title: 'The Four Vedas',
    tradition: 'Rigveda, Yajurveda, Samaveda, and Atharvaveda',
    focus: 'Foundational mantras, yajna, cosmic order, praise, and sacred sound.',
    idealFor: 'Serious learners who want roots of ritual language and early Hindu knowledge systems.',
    structure: 'Layered corpus of samhita, brahmana, aranyaka, and upanishadic thought.',
    whatYouLearn: ['sacred chant traditions', 'ritual foundations', 'cosmic order', 'evolution into philosophical inquiry'],
    readingApproach:
      'Approach through introductions and commentaries first. Direct reading becomes meaningful when framed by teachers and context.',
  },
  {
    id: 'puranas',
    title: 'Puranas',
    tradition: 'Narrative and theological literature across Shaiva, Vaishnava, and Shakta streams.',
    focus: 'Creation stories, deity traditions, pilgrimage significance, and festival context.',
    idealFor: 'Readers who want temple legends, vrata stories, and accessible mythic structure.',
    structure: 'Multiple major and minor Puranas with varied emphasis by deity and tradition.',
    whatYouLearn: ['temple origin stories', 'vrata meaning', 'pilgrimage lore', 'symbolic interpretation'],
    readingApproach:
      'Choose a Purana based on interest, such as Shiva, Vishnu, or Devi traditions, instead of trying to read all at once.',
  },
  {
    id: 'upanishads',
    title: 'Upanishads',
    tradition: 'Philosophical texts emerging from the Vedic stream',
    focus: 'Self-knowledge, ultimate reality, consciousness, and liberation.',
    idealFor: 'Intermediate or advanced readers ready for contemplative study.',
    structure: 'Dialogues and teaching passages exploring atman, brahman, and inner realization.',
    whatYouLearn: ['nature of the self', 'non-attachment', 'awareness', 'meditative inquiry'],
    readingApproach:
      'Pair shorter Upanishads with a teacher or commentary. Reflection matters more than reading quickly.',
  },
];

export const templeGuides: TempleGuide[] = [
  {
    id: 'kashi-vishwanath',
    name: 'Kashi Vishwanath',
    location: 'Varanasi, Uttar Pradesh',
    tradition: 'Jyotirlinga and Shiva bhakti',
    significance:
      'One of the most revered Shiva temples, associated with liberation, sacred Ganga proximity, and lifelong pilgrimage aspiration.',
    bestSeason: 'October to March, with extra planning during major festival periods.',
    idealFor: 'Shiva devotees, Rudrabhishek seekers, and pilgrims combining temple worship with Ganga rituals.',
    highlights: ['Mangala aarti tradition', 'Ganga ghat connection', 'Jyotirlinga darshan', 'Kashi spiritual heritage'],
  },
  {
    id: 'tirupati-balaji',
    name: 'Tirupati Balaji',
    location: 'Tirupati, Andhra Pradesh',
    tradition: 'Venkateswara devotion',
    significance:
      'A major center of Vishnu devotion known for disciplined darshan systems, seva culture, and one of the most recognized temple ecosystems in India.',
    bestSeason: 'Year-round with advance planning for peak crowd periods.',
    idealFor: 'Family darshan, vow fulfillment, laddu prasadam, and seva-based pilgrimage.',
    highlights: ['Laddu prasadam', 'seva booking system', 'hill temple journey', 'crowd-managed darshan'],
  },
  {
    id: 'jagannath-puri',
    name: 'Jagannath Puri',
    location: 'Puri, Odisha',
    tradition: 'Jagannath, Balabhadra, and Subhadra worship',
    significance:
      'A major dham known for mahaprasad culture, Rath Yatra, and an inclusive devotional atmosphere rooted in service and festival tradition.',
    bestSeason: 'Pleasant in winter, iconic during Rath Yatra with heavy planning needs.',
    idealFor: 'Mahaprasad seekers, dham yatris, and festival-based spiritual travel.',
    highlights: ['Rath Yatra legacy', 'Ananda Bazaar mahaprasad', 'Char Dham importance', 'coastal pilgrimage setting'],
  },
  {
    id: 'kedarnath',
    name: 'Kedarnath',
    location: 'Rudraprayag district, Uttarakhand',
    tradition: 'Jyotirlinga and Himalayan Shiva pilgrimage',
    significance:
      'A high-altitude Shiva dham representing tapasya, endurance, and one of the most emotionally powerful Himalayan yatras.',
    bestSeason: 'Temple opening season, generally late spring to early autumn depending on official schedule.',
    idealFor: 'Pilgrims seeking intense spiritual travel, Shiva devotion, and Char Dham integration.',
    highlights: ['Himalayan route', 'Char Dham circuit', 'weather-sensitive planning', 'deep tapasya atmosphere'],
  },
  {
    id: 'badrinath',
    name: 'Badrinath',
    location: 'Chamoli district, Uttarakhand',
    tradition: 'Vishnu dham within the Char Dham circuit',
    significance:
      'A major Vishnu pilgrimage associated with meditation, mountain sanctity, and one of the four most important dham journeys.',
    bestSeason: 'Temple open season with route planning for weather and altitude.',
    idealFor: 'Char Dham yatris, Vishnu devotees, and pilgrims seeking a complete Himalayan circuit.',
    highlights: ['Badri Narayan darshan', 'Tapt Kund tradition', 'Alaknanda setting', 'combined Char Dham route'],
  },
  {
    id: 'rameshwaram',
    name: 'Rameshwaram',
    location: 'Ramanathapuram, Tamil Nadu',
    tradition: 'Shaiva worship with Ramayana connection',
    significance:
      'A deeply symbolic temple destination linking Shiva devotion with Lord Rama narrative and one of the sacred Jyotirlinga circuits.',
    bestSeason: 'October to April for more comfortable pilgrimage conditions.',
    idealFor: 'Jyotirlinga pilgrims, Ramayana devotees, and South India temple circuits.',
    highlights: ['corridor architecture', 'theertham sequence', 'Ramayana association', 'coastal pilgrimage route'],
  },
];

export const learningPaths: LearningPath[] = [
  {
    id: 'daily-sadhana',
    title: 'Daily Sadhana Starter',
    audience: 'Busy devotees building a consistent home practice',
    duration: '15 to 20 minutes a day',
    outcome: 'Creates a stable devotional rhythm without requiring complex ritual preparation.',
    steps: [
      'Begin with one fixed diya-lighting time each morning or evening.',
      'Read a short Gita or Ramayana passage daily.',
      'Keep one mantra practice for 108 repetitions across 21 days.',
    ],
  },
  {
    id: 'festival-family-prep',
    title: 'Festival Family Preparation',
    audience: 'Families planning a puja, invite list, samagri, and home setup together',
    duration: '7-day preparation cycle',
    outcome: 'Turns festival planning into a calm, shared family ritual instead of last-minute stress.',
    steps: [
      'Finalize the puja type and ideal timing first.',
      'Prepare samagri and prasad list three days ahead.',
      'Assign reading, chanting, and hospitality roles across the household.',
    ],
  },
  {
    id: 'scripture-reading-circle',
    title: 'Family Scripture Reading Circle',
    audience: 'Homes that want weekly reading with children, elders, and first-time learners',
    duration: 'One chapter or one story each week',
    outcome: 'Builds understanding through repetition, discussion, and shared reflection.',
    steps: [
      'Choose one anchor text for 4 to 6 weeks, such as Gita or Ramayana.',
      'Read a short section aloud, then explain its practical meaning in simple language.',
      'Close with one question, one takeaway, and one chant or prayer.',
    ],
  },
];

export const devoteeQuestions: DevoteeQuestion[] = [
  {
    id: 'first-puja',
    question: 'Which puja is best if a family is booking for the first time?',
    answer:
      'Ganesh Puja or Satyanarayan Katha usually works best because both are familiar, family-friendly, and easy to explain to every age group.',
  },
  {
    id: 'books-first',
    question: 'Which book should I start with if I want spiritual clarity, not just stories?',
    answer:
      'Bhagavad Gita is usually the clearest starting point for practical decision making, while Ramayana is stronger for learning dharma through character and story.',
  },
  {
    id: 'temple-yatra-choice',
    question: 'How do I choose between temple darshan and a full yatra package?',
    answer:
      'Choose darshan when the focus is one temple and one offering. Choose a yatra package when travel, stay, route planning, and multi-stop pilgrimage matter equally.',
  },
  {
    id: 'knowledge-purpose',
    question: 'Why add spiritual knowledge inside a marketplace app?',
    answer:
      'Because devotees do not only want to transact. They want context, confidence, preparation, and a deeper sense of why a ritual, temple, or text matters.',
  },
];
