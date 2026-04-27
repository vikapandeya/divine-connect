import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Info, ArrowRight, BookOpen, Sparkles, Search, X, Lightbulb, Clock, Star, ChevronDown, ChevronUp, Calendar, Building2, Eye, Flame, AlertCircle, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import VedicWisdomSections from '../components/VedicWisdomSections';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Section { heading: string; content: string; }
interface Temple {
  id: number; name: string; location: string; image: string;
  tagline: string; category: 'Temple' | 'Tirth';
  deity: string; type: string;
  introduction: Section;
  history: Section;
  significance: Section;
  architecture: Section;
  facts: { title: string; fact: string }[];
  festivals: Section;
  visitor: { bestTime: string; timings: string; tips: string[] };
  conclusion: Section;
}

// ── Temple Data ───────────────────────────────────────────────────────────────
const temples: Temple[] = [
  {
    id: 1,
    name: "Kashi Vishwanath Temple",
    location: "Varanasi, Uttar Pradesh",
    image: "https://images.unsplash.com/photo-1590050752117-23a9d7fc6bbd?auto=format&fit=crop&q=80&w=800",
    tagline: "The Eternal Light of Lord Shiva",
    category: "Temple", deity: "Lord Shiva (Vishwanath)", type: "Jyotirlinga",
    introduction: {
      heading: "Introduction",
      content: "The Kashi Vishwanath Temple stands on the western bank of the sacred Ganges in Varanasi — a city so ancient it makes Rome look like a newcomer. Dedicated to Lord Vishwanath (the Lord of the Universe), an epithet of Shiva, this temple is the most revered Jyotirlinga shrine in the Hindu world. Its towering gold-plated spire has guided pilgrims for millennia, and a single darshan here is believed to grant moksha — liberation from the cycle of birth and death. For Hindus, dying in Kashi (Varanasi) is the ultimate grace, as legend holds that Lord Shiva himself whispers the Taraka Mantra into the ears of the dying, guiding their souls to liberation."
    },
    history: {
      heading: "History",
      content: "The origins of the Kashi Vishwanath Temple are intertwined with the very founding of the universe in Hindu cosmology. Ancient scriptures mention a Shiva temple at this site dating back thousands of years. Historically documented, the temple was destroyed multiple times — most notably by Qutb-ud-Din Aibak in 1194 CE and later by Mughal Emperor Aurangzeb in 1669, who built the Gyanvapi Mosque atop its ruins. This mosque stands adjacent to the present temple to this day. The modern Kashi Vishwanath Temple was magnificently rebuilt in 1780 CE by the great Maratha queen Rani Ahilyabai Holkar of Indore, who was known for restoring sacred sites across India. In the 19th century, Maharaja Ranjit Singh of Punjab donated over 1,000 kg of gold to gild the temple's iconic twin spires, giving it the nickname 'The Golden Temple of Varanasi'. In 2021, Prime Minister Narendra Modi inaugurated the grand Kashi Vishwanath Corridor, transforming the entire precinct into a world-class spiritual destination."
    },
    significance: {
      heading: "Religious Significance",
      content: "Kashi Vishwanath is the most sacred of the twelve Jyotirlingas — the self-manifested pillars of light through which Lord Shiva announced his supremacy over Brahma and Vishnu. The Shivalinga here is known as Vishwanatha, meaning the Lord of all three worlds. According to the Shiva Purana, Kashi exists outside the regular cycles of creation and destruction. When Pralaya (the great deluge) occurs, Shiva lifts Kashi above the floodwaters on his trident. The sacred Gyan Vapi (Well of Wisdom) within the complex is said to contain the original Shivalinga hidden by priests to protect it from invaders. Bathing in the Ganges and visiting Kashi Vishwanath within a single day is considered the most potent spiritual act a Hindu can perform. The Panchakroshi Yatra — a 60-km circumambulation of the city — takes devotees through 108 shrines, all believed to have been established by Shiva himself."
    },
    architecture: {
      heading: "Architecture",
      content: "The Kashi Vishwanath Temple is a sublime example of North Indian Nagara architecture, featuring a soaring Shikhara (spire) that rises dramatically above the narrow, winding lanes of the old city. The main sanctum (Garbhagriha) is small and intimate — characteristic of ancient Shiva temples where the focus is concentrated on the Shivalinga rather than elaborate space. The temple complex was entirely rebuilt post-18th century, but the sacred geometry and orientation have been preserved. The most visually striking feature is the gold-plated outer surface of the three main spires, donated by Maharaja Ranjit Singh. Nearly 1,000 kg of gold covers the spires, gleaming brilliantly in the Varanasi sunlight. The 2021 Vishwanath Corridor, designed to connect the temple directly to the Ganges, added colonnaded walkways, galleries depicting the 12 Jyotirlingas, and a grand entrance plaza — all in white stone — dramatically enhancing the temple's approach."
    },
    facts: [
      { title: "Shiva Whispers at Death", fact: "It is believed that Lord Shiva personally whispers the Taraka Mantra into the ears of anyone who dies within the city limits of Varanasi, granting them instant moksha regardless of their karma." },
      { title: "The Hidden Shivalinga", fact: "The original Jyotirlinga is said to be submerged beneath the Gyan Vapi well, hidden by priests in the 17th century to protect it from Aurangzeb's armies." },
      { title: "Pilgrimage Number", fact: "Over 3 crore (30 million) pilgrims visit Kashi Vishwanath every year, making it one of the most visited religious sites on Earth." },
      { title: "7 Jyotirlingas in One Day", fact: "Varanasi alone contains temples dedicated to seven of the twelve Jyotirlingas, and visiting them in a single day is considered extremely auspicious." }
    ],
    festivals: {
      heading: "Festivals & Rituals",
      content: "Mahashivratri (February/March) transforms Varanasi into a city of light and devotion — hundreds of thousands gather for all-night prayers, and the temple conducts special abhishek (ritual bathing of the Shivalinga) with milk, honey, ghee, and Gangajal. Dev Deepawali, celebrated on Kartik Purnima (November), sees the entire riverfront illuminated with millions of earthen lamps — a spectacle so breathtaking it has been called 'the Diwali of the Gods'. Daily rituals follow a strict schedule: Mangala Aarti at 3 AM begins the day; the Bhog (food offering) Aarti follows; Sandhya Aarti at dusk is particularly mesmerizing; and Shayan Aarti at night gently 'puts Lord Shiva to sleep'. The Shravan (monsoon month, July-August) is especially sacred — the entire month witnesses uninterrupted prayers and millions of Kanwariyas (devotees carrying Gangajal on foot from Haridwar to offer at the Shivalinga)."
    },
    visitor: {
      bestTime: "October to March (cool, comfortable for exploring the ghats)",
      timings: "3:00 AM – 11:00 PM (with brief closures between sessions). Morning Mangala Aarti starts at 3 AM.",
      tips: [
        "Mobile phones are not permitted inside the temple. Use cloak rooms at the entrance.",
        "The Kashi Vishwanath Corridor now provides a direct, scenic path from the Ganges ghats — use it.",
        "Attend at least one Ganga Aarti at Dashashwamedh Ghat (7 PM daily) — it is a transformative experience.",
        "Dress modestly. Men in dhoti or traditional attire are preferred. Women must cover their heads.",
        "Book VIP Darshan online to avoid 3–4 hour queues during peak season.",
        "Be wary of self-proclaimed 'pandas' (guides) at the entrance who may overcharge."
      ]
    },
    conclusion: {
      heading: "Why You Should Visit",
      content: "Kashi Vishwanath is not merely a temple — it is an experience of eternity compressed into a sacred sliver of land between the Ganges and the divine. Whether you are a devout Hindu seeking moksha, a history enthusiast marveling at 3,000 years of continuity, or a traveler in search of India's most raw, spiritual energy — Varanasi and its crown jewel Kashi Vishwanath will shake your soul in the most beautiful way possible. Very few places on Earth carry the weight of so much belief, so much prayer, and so much undying devotion across so many millennia."
    }
  },
  {
    id: 2,
    name: "Meenakshi Amman Temple",
    location: "Madurai, Tamil Nadu",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800",
    tagline: "The Celestial Wedding of Shiva and Parvati",
    category: "Temple", deity: "Goddess Meenakshi (Parvati) & Lord Sundareshwar (Shiva)", type: "Shakti Peetha",
    introduction: {
      heading: "Introduction",
      content: "Rising above the ancient city of Madurai in Tamil Nadu, the Meenakshi Amman Temple is one of the most awe-inspiring architectural achievements in human history. This sprawling 14-acre complex, dedicated to Goddess Meenakshi (a form of Parvati) and her consort Sundareshwar (a form of Shiva), is a living, breathing city within a city — featuring 14 majestic Gopurams (gateway towers), thousands of sculptures, a golden lotus pond, and dozens of subsidiary shrines. With over 33,000 sculptures adorning its towers and walls, this temple is often described as the 'Eighth Wonder of the World'. It is not just a place of worship — it is the very heartbeat of Madurai, which literally grew around this temple over 2,000 years."
    },
    history: {
      heading: "History",
      content: "The history of Meenakshi Amman Temple stretches back over 2,000 years to the Sangam period. According to legend, the city of Madurai was built around the temple, which was established to mark the divine wedding of Goddess Meenakshi and Lord Sundareshwar. Early literary references in Sangam poetry (300 BCE – 300 CE) mention a shrine to the goddess. The temple complex as we see it today was largely rebuilt and expanded during the reign of the Nayaka kings, particularly under the patronage of King Thirumalai Nayaka in the 17th century. He was responsible for constructing several of the magnificent Gopurams that still stand today. However, the complex suffered during the invasion of Malik Kafur in 1310 CE, when much of the original structure was destroyed and looted. The resilient temple was rebuilt by the Pandya and later Vijayanagara kings. The Temple Tank (Porthamarai Kulam) — the Golden Lotus Pond — is believed to be thousands of years old and was used by the Tamil Sangam (literary academy) to test the authenticity of literary works."
    },
    significance: {
      heading: "Religious Significance",
      content: "Meenakshi Amman Temple holds a unique position in Hinduism as one of the most important Shakti Peethas in South India. Goddess Meenakshi is celebrated not as a subordinate consort but as the reigning queen of Madurai — the Sundareshwar (Shiva) is actually said to have come to her kingdom as a suitor, reversing the typical divine gender hierarchy. This powerful feminist dimension makes the temple theologically distinct. The annual celestial wedding (Chithirai Festival) between Meenakshi and Sundareshwar is considered the sacred re-enactment of the cosmic marriage of Shiva and Parvati. The temple is also a major center of the Shaiva Agama tradition, with elaborate daily rituals prescribed in detail by ancient texts. The Ashta Shakti Mandapam within the complex celebrates the eight forms of the goddess and is visited for removing obstacles and granting boons."
    },
    architecture: {
      heading: "Architecture",
      content: "Meenakshi Amman is the crown jewel of Dravidian temple architecture — the southern Indian style characterized by pyramidal Gopurams covered in stucco sculptures, large temple tanks, and colonnaded halls (Mandapams). The temple has 14 Gopurams, the tallest being the South Tower at 52 meters (170 feet). Each Gopuram is covered with thousands of brightly painted stucco figures depicting gods, demons, animals, and mythological scenes — recently repainted and restored in vivid colors. The Thousand Pillar Hall (Ayiram Kaal Mandapam), built in the 16th century, is an engineering marvel where 985 unique sculpted pillars support the roof — each pillar intricately different from the next. The Porthamarai Kulam (Golden Lotus Tank) at the center of the complex is surrounded by a colonnaded walkway and reflects the golden gopurams at dawn. The Parakeet Hall houses a pair of sacred parrots trained to call out the name of Meenakshi. The two main shrines — one for Meenakshi and one for Sundareshwar — are covered in gold, visible only to Hindu devotees."
    },
    facts: [
      { title: "33,000 Sculptures", fact: "The temple complex contains more than 33,000 sculptures, making it one of the most densely sculpted religious sites on the planet." },
      { title: "The Parrot Tradition", fact: "The temple houses two sacred parrots (Killai) that are trained to chant 'Meenakshi! Meenakshi!' and are part of daily rituals — a tradition maintained for centuries." },
      { title: "The Literary Test", fact: "The Golden Lotus Tank was used by the Tamil Sangam (ancient literary academy) as a final test: manuscripts placed on the water would sink if inauthentic, float if divinely inspired." },
      { title: "Never Sleeps", fact: "The temple conducts 6 services daily without interruption, 365 days a year, and has done so for at least a thousand years without a single break." }
    ],
    festivals: {
      heading: "Festivals & Rituals",
      content: "The Meenakshi Thirukalyanam (Chithirai Festival, April-May) is the most spectacular event — a 12-day celebration of the divine wedding of Meenakshi and Sundareshwar that draws 1 million+ pilgrims to Madurai. The celestial wedding procession through the city streets on chariots is an overwhelming sight. Navaratri (October) celebrates nine forms of the goddess with special alankaram (divine decorations) each night. The Float Festival (Thai Poosam) features decorated deities on a float across the Golden Lotus Tank by torchlight — a serene, otherworldly experience. Daily rituals: The temple conducts 6 pujas daily — Thiruvanandal (early morning), Kalaasanthi, Ucchikalam (noon), Sayarakshai (evening), Irandamkalam, and Ardha Jama Puja (midnight). The Thiruvanandal Puja begins at 5 AM with the auspicious sounds of nadaswaram (wind instrument) and thavil (percussion), filling the temple corridors with divine music."
    },
    visitor: {
      bestTime: "October to March (pleasant weather, Navaratri in Oct is spectacular)",
      timings: "5:00 AM – 12:30 PM and 4:00 PM – 9:30 PM. The midnight puja ends at 10 PM.",
      tips: [
        "Non-Hindus can visit most of the complex but are not permitted in the innermost gold-plated shrines.",
        "Hire a licensed temple guide — the iconography is incredibly complex and rewarding when explained.",
        "Early morning (5-7 AM) is the best time to experience the temple in a peaceful, spiritual atmosphere.",
        "Photography is prohibited inside the main shrines. Outside areas and Gopurams can be photographed.",
        "The Thousand Pillar Hall houses a small temple museum — don't skip it.",
        "Footwear must be removed at the entrance; storage lockers are available."
      ]
    },
    conclusion: {
      heading: "Why You Should Visit",
      content: "Walking into Meenakshi Amman Temple is like stepping into a different dimension of reality — one where art, devotion, music, mythology, and architecture have been layering upon each other for over 2,000 years. No photograph can prepare you for the first sight of its towering Gopurams ablaze with color, or the sound of nadaswaram filling its ancient corridors at dawn. It is equal parts art museum, sacred site, living community, and philosophical statement. A visit to Madurai without entering this temple is simply incomplete."
    }
  },
  {
    id: 3,
    name: "Kedarnath Temple",
    location: "Kedarnath, Uttarakhand (3,583 m above sea level)",
    image: "https://images.unsplash.com/photo-1621360241104-79948730b474?auto=format&fit=crop&q=80&w=800",
    tagline: "Where the Himalayas Meet the Divine",
    category: "Temple", deity: "Lord Shiva (Sadashiva / Kedarnath)", type: "Jyotirlinga + Char Dham",
    introduction: {
      heading: "Introduction",
      content: "Kedarnath, perched at 3,583 meters in the Garhwal Himalayan range of Uttarakhand, is arguably the most dramatically situated temple in the world. Surrounded by snow-capped peaks, glaciers, and the roaring Mandakini river, this ancient stone temple is dedicated to Lord Shiva in his form as Kedarnath — the Lord of the Fields. It is one of the twelve Jyotirlingas and forms the most critical stop on the Chota Char Dham Yatra (the four sacred abodes of the Himalayas). The temple stands as a testament to human devotion — built in a hostile, remote mountain environment at extreme altitude, accessible only on foot or by helicopter for six months a year (it remains snowbound from November to April/May). Even reaching Kedarnath is considered an act of penance and surrender."
    },
    history: {
      heading: "History",
      content: "The historical origin of Kedarnath Temple is attributed to the Pandavas — the five brothers from the Mahabharata. After the Kurukshetra war, the Pandavas sought Lord Shiva's forgiveness for killing their own kin, but Shiva, angry at them, fled to the Himalayas and disguised himself as a bull. When the Pandavas discovered him, Shiva dove into the ground, leaving only his hump above earth — this is the Shivalinga at Kedarnath. The remaining parts of Shiva's body appeared at four other locations: the arms at Tungnath, face at Rudranath, navel at Madhyamaheshwar, and hair at Kalpeshwar — together forming the Panch Kedar (Five Shivas). The current temple structure is generally attributed to Adi Shankaracharya, the 8th-century philosopher-saint who revitalized Hinduism across India. Shankaracharya is said to have attained samadhi (enlightenment and death) at Kedarnath — his samadhi sthal (memorial) stands right behind the temple. The temple has survived over 1,200 years of extreme Himalayan weather. Most dramatically, the devastating 2013 Uttarakhand floods — one of India's worst natural disasters — submerged much of Kedarnath valley but left the ancient temple remarkably unharmed, a fact many consider miraculous."
    },
    significance: {
      heading: "Religious Significance",
      content: "Kedarnath holds supreme importance in Hinduism on multiple levels. As one of the twelve Jyotirlingas — the most sacred manifestations of Lord Shiva — a pilgrimage here is considered one of the most meritorious acts in a Hindu's life. Simultaneously, it is one of the four Char Dham destinations (alongside Badrinath, Gangotri, and Yamunotri), completing which is believed to purify the soul of all sins and break the cycle of rebirth. The Shivalinga at Kedarnath is in the form of a 'Swayambhu' — self-manifested, not carved by human hands — making it especially sacred. The rugged pilgrimage — involving a steep 16-22 km trek through mountain terrain — is itself considered tapasya (austerity). The Panch Kedar pilgrimage (visiting all five Shiva manifestations in the region) is considered the ultimate Shaiva pilgrimage, though only the most devoted undertake the full circuit."
    },
    architecture: {
      heading: "Architecture",
      content: "Kedarnath Temple is a supreme example of North Indian Nagara architecture, but what makes it extraordinary is its sheer survival in one of Earth's harshest environments. Built in the 8th century CE (attributed to Adi Shankaracharya), the temple is constructed entirely from large, interlocked grey stone slabs — no mortar was used in the original construction. This 'dry masonry' technique has allowed the structure to flex slightly during earthquakes and withstand centuries of heavy snowfall without collapsing. The temple faces west — unusual for Hindu temples, which typically face east. The Garbhagriha (inner sanctum) houses the conical, self-manifested Shivalinga. The Mandapam (hall) contains intricately carved stone pillars depicting various deities and scenes from the Mahabharata. The Shikhara (tower) rises 80 feet above the surrounding plateau. Behind the temple lies a large rocky outcrop, and to its right, the magnificent Chorabari Glacier feeds the Mandakini River. The 2013 floods deposited a massive rock directly behind the temple, which effectively acted as a barrier, diverting the catastrophic debris flow around the structure — an event widely described as divine intervention."
    },
    facts: [
      { title: "The 2013 Miracle", fact: "During the catastrophic 2013 Uttarakhand floods, a giant boulder appeared directly behind the temple and deflected the debris flow, leaving the 1,200-year-old temple standing while everything around it was destroyed. Scientists confirmed the rock was not there before the flood." },
      { title: "Shankaracharya's Samadhi", fact: "Adi Shankaracharya, the philosopher who revived Hinduism in the 8th century, attained samadhi (conscious death) at Kedarnath at age 32. His samadhi sthal behind the temple is an important secondary pilgrimage within the complex." },
      { title: "No Idol, Just a Hump", fact: "Unlike most temples, the main deity at Kedarnath is not an idol but a naturally formed trapezoidal rock — representing the 'hump' of the bull-form of Lord Shiva as described in the Mahabharata." },
      { title: "Six Months Shut", fact: "The temple is open only from Akshaya Tritiya (April/May) to Kartik Purnima (October/November). During winter, the deity is ceremonially moved to Ukhimath village, 41 km away, where the puja continues for six months." }
    ],
    festivals: {
      heading: "Festivals & Rituals",
      content: "The opening ceremony (Kapaat Kholne) in late April or early May is one of the most emotional events in the Hindu calendar — thousands of pilgrims who have waited through the winter gather for the first puja of the season. The Shivalinga is elaborately decorated with fresh flowers, butter, and vibhuti (sacred ash). Mahashivratri, though celebrated everywhere, holds special significance at Kedarnath — pilgrims brave the winter cold to reach as close to the temple as possible. The closing ceremony (Kapaat Band) in October/November is equally moving — the deity is ceremonially bid farewell and carried in a silver palanquin to Ukhimath for the winter. Daily rituals during the open season include four main pujas: Pratah Puja at 4 AM (the most auspicious), Mahaabhishek, Afternoon Puja, and Sandhya Aarti. The Panchamrit Abhishek (ritual bathing of the Shivalinga with milk, honey, ghee, sugar, and yoghurt) is performed by devotees who purchase the privilege."
    },
    visitor: {
      bestTime: "May to June (post-opening, before monsoon) and September to October (post-monsoon, before closing). Avoid July-August monsoon season — landslides are common.",
      timings: "4:00 AM – 9:00 PM during open season (May to November). Temple is closed November to April/May.",
      tips: [
        "The trek from Gaurikund to Kedarnath is 16-22 km one way and takes 7-9 hours. Ponies and palanquins are available for hire.",
        "Helicopter service from Phata, Sersi, Guptakashi, or Sitapur is available — book well in advance through official websites only.",
        "Carry warm clothing even in summer — temperatures drop sharply at night and during rain.",
        "Register for the Char Dham Yatra online before departing; biometric registration is mandatory.",
        "Stay at government-run guesthouses or registered lodges — avoid unlicensed accommodation.",
        "Altitude sickness is real at 3,583m. Acclimatize at Gaurikund or Guptakashi before the trek."
      ]
    },
    conclusion: {
      heading: "Why You Should Visit",
      content: "Kedarnath is the kind of place that makes you confront your own smallness and find beauty in it. The trek through pine forests and alpine meadows, the first glimpse of the ancient grey stone temple against a backdrop of eternal snow peaks, the sound of Sanskrit chants mixing with mountain wind — these are experiences that rewire something deep inside you. Whether you come as a devotee seeking divine grace, an adventurer drawn to the extreme Himalayas, or a soul seeking perspective, Kedarnath will leave an indelible mark. It is not a comfortable pilgrimage — but then, the most transformative journeys rarely are."
    }
  },
  {
    id: 4,
    name: "Jagannath Temple",
    location: "Puri, Odisha",
    image: "https://images.unsplash.com/photo-1626078436898-9a6745582390?auto=format&fit=crop&q=80&w=800",
    tagline: "Lord of the Universe, Lord of All People",
    category: "Temple", deity: "Lord Jagannath (Vishnu / Krishna)", type: "Char Dham + Shakti Peetha",
    introduction: {
      heading: "Introduction",
      content: "The Jagannath Temple of Puri, Odisha, is one of the most magnificent and theologically unique sacred sites in India. Dedicated to Lord Jagannath — a form of Vishnu or Krishna meaning 'Lord of the Universe' — this 12th-century temple is one of the four sacred Char Dhams and draws over 20 million pilgrims annually. What makes Jagannath Temple truly distinctive is its radical, egalitarian philosophy: in this temple, caste, creed, and social hierarchy dissolve — all devotees from any walk of life are considered equal before the Lord. The famous Rath Yatra (Chariot Festival), where the deities are taken out in massive wooden chariots and the English word 'Juggernaut' (derived from 'Jagannath') entered the lexicon, is one of the largest religious gatherings on Earth."
    },
    history: {
      heading: "History",
      content: "The history of Jagannath is ancient and interlaced with tribal, Vedic, and Tantric traditions — a rare blend that makes this temple philosophically unique. According to legend, King Indradyumna of Malwa received divine instructions to recover a sacred log of wood (Daru Brahma) from the sea at Puri, from which the images of Jagannath, Balabhadra, and Subhadra would be carved. The divine craftsman Vishwakarma took the form of a sculptor but imposed one condition — he must not be disturbed until the work was complete. The impatient king opened the door early, and the sculptor vanished, leaving the three deities with incomplete hands and stumps — a form revered to this day. The current temple was built by King Chodaganga Deva of the Eastern Ganga dynasty around 1135 CE, though earlier temples likely occupied the site. The temple survived multiple attacks by medieval Muslim rulers including Kalapahar in 1568, who is said to have melted the Neelachakra (sacred wheel) — but was miraculously stopped. The 'Daitapati' tradition — where the temple rituals are traditionally performed by descendants of tribal communities — represents a remarkable integration of Adivasi and Brahmanical practices."
    },
    significance: {
      heading: "Religious Significance",
      content: "Jagannath Temple holds extraordinary importance across several sacred geographies. It is one of the four sacred Char Dhams (alongside Badrinath, Dwarka, and Rameswaram) — completing which is the highest pilgrimage aspiration for a Hindu. Puri is also believed to be the Navel of the Earth (Nabhigaya) and a Shakti Peetha (the navel/sacred triangle of the goddess Vimala is enshrined here). The theology of Jagannath is remarkable: the deity has no complete form — the stumped, large-eyed, wooden figure is deliberately unfinished, representing the formless (Nirakara) aspect of Brahman in a form accessible to all. The 'Mahaprasad' (sacred food) from Jagannath Temple has a unique status: it is considered equal regardless of who prepared it, eating it dissolves social distinctions, and even non-Hindus can partake of it — a remarkable social position for a Hindu temple. The Neelachakra (Blue Wheel) atop the temple is one of the holiest objects in Hinduism; seeing it from a distance is considered equivalent to seeing the Lord himself."
    },
    architecture: {
      heading: "Architecture",
      content: "The Jagannath Temple is a supreme achievement of Kalinga (Odisha) temple architecture — a distinctive regional variant of North Indian Nagara style. The main temple tower (Deula) rises 65 meters (214 feet) above the ground and dominates the Puri skyline, visible from out at sea. The complex covers an area of 4 hectares (10 acres) and is enclosed by two massive walls. The main tower is built on a raised platform (Jagamohan or Porch) and consists of four structures aligned north-south: the Deula (sanctum sanctorum), Jagamohan (assembly hall), Natamandira (festival hall), and Bhoga-mandapa (offerings hall). The curved Rekha Shikhara of the main tower is covered in intricate carvings and is capped by the Neelachakra — an 8-spoked iron wheel painted blue and adorned with flags (Patitapabana Bana). A remarkable feature: the flag atop the Neelachakra always appears to wave against the wind direction — a phenomenon that has never been fully explained. The temple is built of Khondalite rock with intricate Orissan-style sculptural panels covering every surface — depictions of Vishnu's avatars, tantric imagery, and scenes from the Mahabharata and Ramayana."
    },
    facts: [
      { title: "The Flag Defies Wind", fact: "The flag atop the Jagannath temple's Neelachakra always waves in the direction opposite to the wind — a phenomenon observed daily for centuries that remains unexplained by physics." },
      { title: "World's Largest Kitchen", fact: "The temple kitchen (Ananda Bazar) feeds between 10,000 and 100,000 people daily using 752 clay ovens. Food is cooked in clay pots stacked seven high — the top pot cooks first while the bottom remains raw until the last moment, then all cook simultaneously." },
      { title: "No Bird Flies Over", fact: "No bird is ever seen flying directly over the main dome of the temple — an observation that has persisted for centuries and has no scientific explanation." },
      { title: "Naba Kalebara", fact: "Every 8-19 years (based on the lunar calendar having an extra Ashadha month), the wooden deities undergo Naba Kalebara — a ceremony where new sacred logs are found in the forest and new deity images are carved, while the old ones are buried with great ceremony." }
    ],
    festivals: {
      heading: "Festivals & Rituals",
      content: "The Rath Yatra (Chariot Festival, June/July) is the most spectacular Hindu festival in the world — three enormous wooden chariots (Nandighosa for Jagannath: 45 feet tall, 16 wheels; Taladhwaja for Balabhadra; Darpadalana for Subhadra) are pulled through the streets of Puri by hundreds of thousands of devotees with thick ropes. The English word 'Juggernaut' — meaning an unstoppable force — derives from 'Jagannath', as British observers were overwhelmed by the sheer power of this procession. Snana Yatra (June) is the annual bathing festival where the deities are ritually bathed in 108 pots of water — after which they are said to fall 'ill' (anasar) and are kept in seclusion for 15 days, visible only to the chief priests. Chandan Yatra (42-day spring festival) involves floating the deities on a tank at night — one of the most beautiful ceremonies. Daily rituals: 5 daily darshans are held, and the offering of Mahaprasad (the 56-item food offering, also called Chhappan Bhog) is prepared by 600+ cooks in the temple kitchen daily."
    },
    visitor: {
      bestTime: "October to February. June-July for the spectacular Rath Yatra (book accommodation 6 months in advance).",
      timings: "5:00 AM – 11:00 PM, with 5 darshan windows. Note: Non-Hindus are not permitted inside the main temple.",
      tips: [
        "Non-Hindus are NOT allowed inside the temple. The Raghunandan Library rooftop nearby offers a view of the spire.",
        "The Mahaprasad is available at the Ananda Bazar market inside the complex — an extraordinary cultural experience.",
        "During Rath Yatra, arrive 2 days early as all accommodation in Puri fills completely.",
        "The beach at Puri is magnificent — plan a sunrise walk at the Golden Beach.",
        "Visit the Konark Sun Temple (35 km away) on the same trip — a UNESCO World Heritage Site.",
        "Photography inside the temple complex is strictly prohibited."
      ]
    },
    conclusion: {
      heading: "Why You Should Visit",
      content: "Jagannath Temple offers something that few religious sites can match: a genuine, lived spiritual democracy. Here, in the presence of the incomplete, stumped deity with those enormous, all-seeing eyes, every human hierarchy dissolves. The Mahaprasad feeds everyone equally. The Rath Yatra brings royalty and beggar to the same rope. The theology is radical, the architecture monumental, the rituals ancient and uninterrupted. If you visit during Rath Yatra and feel the ground vibrate under thousands of feet pulling those wooden giants through the streets of Puri, you will understand why this one word — Jagannath — entered every language in the world."
    }
  },
  {
    id: 5,
    name: "Somnath Temple",
    location: "Prabhas Patan (Veraval), Gujarat",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eaa0ae?auto=format&fit=crop&q=80&w=800",
    tagline: "The Eternal Shrine — Destroyed and Reborn 17 Times",
    category: "Temple", deity: "Lord Shiva (Somnath — Lord of the Moon)", type: "First of the 12 Jyotirlingas",
    introduction: {
      heading: "Introduction",
      content: "If resilience could take the form of stone and prayer, it would look like the Somnath Temple. Located on the western coast of Gujarat at Prabhas Patan (near Veraval), this magnificent temple is the first and most sacred of the twelve Jyotirlingas — the supreme manifestations of Lord Shiva. Somnath's story is one of the most dramatic in religious history: it has been looted, demolished, and rebuilt at least 17 times over 2,000 years. Yet each time, the devotion of Hindus across the subcontinent raised it from the rubble more magnificent than before. Today's gleaming white Chalukya-style temple, inaugurated in 1951 by India's first Home Minister Sardar Vallabhbhai Patel, stands as both a supreme act of faith and an assertion of civilizational identity."
    },
    history: {
      heading: "History",
      content: "Somnath's history is both sublime and scarred. Ancient texts including the Skanda Purana, Shiva Purana, and the Bhagavat Purana mention it as the most sacred Shiva shrine. According to legend, the Moon God (Soma) built the original temple in gold, the Sun God rebuilt it in silver, and Krishna rebuilt it in wood. The first historical temple was reportedly built of stone in the 7th century CE under the Maitraka dynasty. The most devastating chapter came in 1025 CE when Mahmud of Ghazni (from present-day Afghanistan) attacked Somnath with 30,000 cavalry. He killed 50,000 defenders, broke the Shivalinga, and looted an estimated 20 million gold dinars in treasure — a catastrophe seared into Indian historical memory. Despite this, the temple was rebuilt within 25 years by the Paramara King Bhoja and the Solanki King Bhimdev. It was destroyed and rebuilt multiple times again by subsequent rulers — Alauddin Khilji (1297), Muzaffar Shah (1375), Mahmud Begara (1451), and finally by Aurangzeb in 1706. Each destruction was followed by reconstruction — a 2,000-year cycle of demolition and devotion. After Indian independence, Sardar Patel visited the ruins in 1947 and declared its reconstruction a national duty. The new temple was inaugurated in 1951 by President Rajendra Prasad."
    },
    significance: {
      heading: "Religious Significance",
      content: "Somnath holds the apex position in the hierarchy of the 12 Jyotirlingas. According to the Shiva Purana, Lord Shiva manifested here as a pillar of limitless light (Jyotirlinga) to settle a dispute between Brahma and Vishnu about supremacy. The Moon God (Chandra/Soma) who was cursed by Daksha with wasting disease came to Prabhas and worshipped Shiva to relieve his curse — the place where this happened became Somnath (Lord of Soma/Moon). The three-hour Jyotirlinga darshan here is one of the most spiritually charged experiences in Hinduism. Interestingly, the Somnath Shivalinga is described in ancient texts as a 'Niranjan' (blemish-free) Jyotirlinga — the most perfectly self-manifested. The temple is also associated with the end of Krishna's earthly journey: the Bhalka Tirth, a few kilometers away, is where a hunter's arrow struck Krishna in his heel — the event that initiated his return to the divine realm."
    },
    architecture: {
      heading: "Architecture",
      content: "The present Somnath Temple (inaugurated 1951) is built in the Chalukya (or Kailash Mahameru Prasad) style of temple architecture — the classical North Indian Nagara style refined in Gujarat. The temple rises 15 stories (155 feet / 47 meters) above the Arabian Sea coast. The stone used is creamy-white Jurassic limestone from Junagadh, giving it a brilliant gleaming appearance against the blue sky and sea. The Shikhara (main tower) is intricately carved with bands of floral and geometric motifs, panels of celestial figures (Apsaras, Gandharvas), and scenes from Shiva's mythology. The interior Garbhagriha houses the Jyotirlinga in a silver-plated sanctum. The temple is oriented so that there is no landmass between the temple and the South Pole — a fact inscribed on the Baan Stambha (arrow pillar) at the temple's sea-facing side: 'The first strip of land in the direction of this arrow up to the South Pole is the sea.' The temple complex also includes the Triveni Sangam — the auspicious meeting point of the Hiran, Kapila, and Saraswati rivers — making this one of the most sacred confluences in Gujarat."
    },
    facts: [
      { title: "17 Destructions, 17 Rebirths", fact: "Somnath has been destroyed by invaders at least 17 times across 2,000 years and rebuilt each time — making it the most destroyed and most rebuilt sacred site in human history." },
      { title: "The Sea Pillar", fact: "The Baan Stambha (Sea Pillar) inscription at the temple states that from this point to the South Pole, there is only open sea — a scientifically accurate statement of ancient geography." },
      { title: "Krishna's Last Journey", fact: "Just 5 km from Somnath, the Bhalka Tirth marks the exact spot where Lord Krishna was struck by a hunter's arrow, beginning his departure from the mortal world." },
      { title: "Sardar Patel's Promise", fact: "When Sardar Vallabhbhai Patel visited the ruins in 1947, he reportedly said: 'Somnath shall be rebuilt.' He personally oversaw its reconstruction — it was one of his last great acts before his death in 1950." }
    ],
    festivals: {
      heading: "Festivals & Rituals",
      content: "Mahashivratri (February/March) at Somnath is a massive event — devotees arrive from across Gujarat and beyond for an all-night vigil, with special Rudrabhishek performed continuously. Kartik Purnima (November) is particularly auspicious here, as the Moon God's monthly cycle is associated with Somnath — pilgrims take a holy dip at the Triveni Sangam. Shravan Maas (July-August monsoon month) witnesses thousands of Shiv devotees who undertake the 'Somnath Padyatra' — walking hundreds of kilometers barefoot to offer Gangajal (Ganges water) at the Jyotirlinga. Daily rituals: Three aartis daily — Pratah Aarti (7 AM), Madhyanha Aarti (12 PM), and Sandhya Aarti (7 PM). The evening Sound & Light Show (Jai Somnath) at the temple premises — which recounts the temple's entire dramatic history — is a must-see for visitors and runs for 1 hour every evening."
    },
    visitor: {
      bestTime: "October to March (pleasant coastal weather). Avoid May-June (extreme heat on the Gujarat coast).",
      timings: "6:00 AM – 9:30 PM. Three aartis at 7 AM, 12 PM, and 7 PM. Evening Sound & Light Show at 7:45 PM.",
      tips: [
        "Attend the evening Sound & Light Show (Jai Somnath) — it runs 45 minutes and is the best way to understand the temple's history.",
        "Visit Bhalka Tirth and Triveni Sangam nearby — both within 5-10 km and equally significant.",
        "The coastal walk behind the temple (sea-facing promenade) offers stunning views — especially at sunset.",
        "Dress code is strictly enforced: traditional attire is preferred. Shorts and sleeveless tops are not allowed.",
        "Photography inside the main sanctum is prohibited, but the exterior and grounds may be photographed.",
        "Nearest airport: Diu (70 km). Nearest major railway station: Veraval (7 km)."
      ]
    },
    conclusion: {
      heading: "Why You Should Visit",
      content: "Somnath is not just a temple — it is a 2,000-year story of a civilization's refusal to surrender its sacred heart. Standing inside its gleaming white spire with the Arabian Sea crashing below and the first Jyotirlinga before you, you feel the weight of every prayer that has been offered here through invasions, ruins, and rebirths. It is one of the most emotionally resonant places in India — where history, geography, mythology, and living devotion converge at the edge of the sea."
    }
  },
  {
    id: 6,
    name: "Tirupati Balaji Temple (Venkateswara)",
    location: "Tirumala, Tirupati, Andhra Pradesh",
    image: "https://images.unsplash.com/photo-1585399000684-d2f72660f092?auto=format&fit=crop&q=80&w=800",
    tagline: "The Richest Temple on Earth — Lord of Seven Hills",
    category: "Temple", deity: "Lord Venkateswara (Vishnu / Balaji)", type: "Divya Desam + Vaishnava Kshetra",
    introduction: {
      heading: "Introduction",
      content: "Nestled atop the seven sacred hills of Tirumala in the Eastern Ghats of Andhra Pradesh, the Tirumala Venkateswara Temple — popularly known as Tirupati Balaji or simply 'Tirupati' — is the most visited religious site on Earth, receiving over 100,000 pilgrims daily. It is also the wealthiest temple in the world, with an annual income exceeding ₹3,500 crore (approximately $450 million). Dedicated to Lord Venkateswara, a form of Vishnu, it is one of the 108 Divya Desams (sacred Vishnu temples) and one of the most important Vaishnava pilgrimage centers. The sight of the black granite tower (Vimanam) rising above the hills, the thunderous sound of 'Govinda! Govinda!' from thousands of voices, and the extraordinary experience of standing before the bejeweled, flower-draped deity — all combine to create an experience of divine presence that is almost overwhelming."
    },
    history: {
      heading: "History",
      content: "The history of Tirumala extends deep into antiquity. The earliest references appear in the Sangam-era Tamil literature (300 BCE – 300 CE), where the hill deity is described. The site grew in importance through the Pallava, Chola, and Vijayanagara periods. The current temple structure was primarily built and expanded by Pallava Queen Samavai and Pallava King Thondaiman Chakravarthy around the 9th century CE, with major later additions by Chola and Vijayanagara kings. The iconic gold-plated Ananda Nilayam Vimanam (tower over the sanctum) was gilded with gold donated by Tirumalai Naicker during the Vijayanagara period. A central legend holds that Lord Venkateswara took a loan from the god of wealth Kubera to finance his own wedding, and that pilgrims' donations are repaying this cosmic debt — a mythology that spectacularly explains the temple's extraordinary donation culture. One of the most significant historical events was Ramanuja, the 12th-century philosopher-saint, standardizing the temple's rituals on Vaishnava Agamic principles — a system still followed today."
    },
    significance: {
      heading: "Religious Significance",
      content: "Tirupati holds supreme importance in Vaishnavism as one of the 108 Divya Desams — sacred Vishnu temples praised in the Nalayira Divya Prabandham, the Tamil Vaishnava scriptural canon. The Tirumala hills are believed to be a segment of the cosmic serpent Adishesha (on whom Vishnu rests) that fell to Earth. The deity Venkateswara is considered the supreme form of Vishnu for the current Kali Yuga (age) — the deity who is most accessible and merciful to humans in this age of spiritual decline. The practice of 'Tonsuring' (hair donation) at Tirupati is famous worldwide — devotees shave their heads as an offering of their most precious possession (hair, symbolizing ego) to the Lord. Over 600 barbers work continuously, processing 50,000+ hair offerings daily. The donated hair is sold globally for the production of wigs and hair extensions, generating hundreds of crores for the temple. The 'Laddu Prasad' from Tirupati has a GI (Geographical Indication) tag and is recognized as a unique cultural product."
    },
    architecture: {
      heading: "Architecture",
      content: "The Tirupati Venkateswara Temple is built in the Dravidian style, though it synthesizes elements of Agamic architecture that are distinct from the South Tamil Dravidian tradition. The temple complex covers 2.7 hectares within the larger Tirumala complex of 27 sq km. The Ananda Nilayam Vimanam (main tower) is entirely covered in gold plates and rises 52 meters, visible from considerable distances in the hills. The approach to the sanctum passes through a series of magnificent mandapams: the Sampangi Pradakshina, Vimana Pradakshina, Bangaru Vakili (Golden Door), and finally the Garbhagriha where the deity stands. The idol of Venkateswara is a 'Swayambhu' (self-manifested) black stone figure — not carved by human hands, according to tradition. The deity stands in a contrapposto pose (slightly inclined to the right), adorned with extraordinary jewelry — diamond-studded gold crowns (Kiritam), emerald-studded necklaces, diamond bangles, and a perpetually changing floral garland. The Padikavali (outer enclosure) stretches for 1.5 km — devotees walk this circumambulation (pradakshina) path for darshan. The temple complex includes dozens of mandapams, subsidiary shrines, marriage halls, sacred tanks, and the famous hair-donation facility."
    },
    facts: [
      { title: "₹1,000 Crore+ in Donations Annually", fact: "Tirupati receives approximately ₹1,000 crore in hundi (donation box) cash donations every year, plus gold, jewelry, and other valuables — making it the wealthiest active religious institution in the world." },
      { title: "50,000 Hair Donations Daily", fact: "Every day, approximately 50,000 pilgrims offer their hair at Tirupati's tonsuring facilities — more hair is processed here than anywhere else in the world. The hair is sold globally." },
      { title: "6-Month Waiting List", fact: "Special darshan slots at Tirupati often have waiting lists of over 6 months during peak season. The base cost for 'paid' VIP darshan (Srivari Seva) is ₹3,000–₹10,000 per person." },
      { title: "Sweat on the Idol", fact: "Devotees and priests claim that the back of the deity's head is warm and that a faint sound of the sea can be heard if you stand close to the idol — a mystery never explained." }
    ],
    festivals: {
      heading: "Festivals & Rituals",
      content: "Brahmotsavam (September, 9 days) is the grandest festival at Tirupati — the deity is taken out in procession on nine different vahanas (divine vehicles) through the temple streets over 9 days. The Garuda Vahana (eagle) procession draws the largest crowds. During Brahmotsavam, the number of daily pilgrims can exceed 500,000. Vaikunta Ekadashi (December) is especially auspicious — devotees believe that the gates of Vaikunta (Vishnu's heaven) open on this day, and being present at Tirupati guarantees entry. Pilgrims stand in queue for 12-24 hours for this darshan. Rathasaptami (February) celebrates Surya (Sun God) with the deity placed on the Surya Prabha Vahana. Daily rituals: 6 alankara sevas from 2:30 AM to midnight — the Thomala Seva (flower adornment) and Archana Seva are particularly popular. The evening Ekantha Seva (private time for the deity, 'putting him to sleep') involves ancient Vedic chants and is one of the most intimate rituals in Indian temple tradition."
    },
    visitor: {
      bestTime: "Avoid peak festival times unless you specifically want that experience. January–February and June–July are relatively quieter.",
      timings: "Temple opens at 2:30 AM. Darshan happens in batches throughout the day until midnight. Average wait time: 4-20 hours.",
      tips: [
        "Book Srivari Darshan online at tirumala.org at least 2 months in advance. Free darshan (Sarva Darshan) is available but may require 8-20 hour wait.",
        "The journey up the Tirumala hill by bus or car takes 45-90 minutes. On foot, the sacred Alipiri Mettu path has 3,550 steps — a popular act of devotion.",
        "Dress code: traditional attire mandatory. Men — dhoti (available at the counter); Women — saree or salwar kameez.",
        "All electronic devices must be deposited outside — no mobile phones inside the temple complex.",
        "The Prasadam (Laddu) is distributed to each visitor. It is unique, delicious, and has a GI tag.",
        "The entire Tirumala complex is vegetarian — no non-veg food is permitted anywhere on the hill."
      ]
    },
    conclusion: {
      heading: "Why You Should Visit",
      content: "Tirupati Balaji is not just a pilgrimage — it is an experience of scale, devotion, and surrender that is unlike anything else in the world. When you finally stand before the dark, jewel-bedecked form of Venkateswara after hours of waiting — surrounded by thousands of others who have come from every corner of India, every social background, every age — and the priest parts the curtain for those 30 sacred seconds of darshan, you will understand why 100,000 people a day make this journey. It is the divine compressed into a moment. Govinda."
    }
  }
];

const tirthplaces = [
  { id: 101, name: "Varanasi", state: "Uttar Pradesh", description: "The spiritual capital of India, where the Ganges carries the prayers of millennia. Known for its ghats, Dev Deepawali, and the belief that dying here grants moksha.", image: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&q=80&w=800" },
  { id: 102, name: "Rameshwaram", state: "Tamil Nadu", description: "A sacred island at the southernmost tip of India where Lord Rama worshipped Shiva before crossing to Lanka. Part of the Char Dham pilgrimage.", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800" },
  { id: 103, name: "Haridwar", state: "Uttarakhand", description: "Gateway to the gods — where the Ganges leaves the Himalayas. Host to the Kumbh Mela every 12 years, the largest human gathering on Earth.", image: "https://images.unsplash.com/photo-1590050752117-23a9d7fc6bbd?auto=format&fit=crop&q=80&w=800" },
  { id: 104, name: "Vrindavan", state: "Uttar Pradesh", description: "The sacred forest where Lord Krishna spent his childhood — every lane, every tree here is believed to be infused with Krishna's divine play (Lila).", image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=800" },
];

const didYouKnow = [
  { title: "The Floating Stones of Rameshwaram", fact: "Stones found near Rameshwaram are said to float on water — believed to be remnants of the Ram Setu bridge built by Nala, the divine architect, for Lord Rama's army." },
  { title: "The World's Largest Kitchen", fact: "The Jagannath Temple kitchen in Puri feeds up to 100,000 people daily using 752 clay ovens — food is cooked in pots stacked 7 high, and the topmost cooks first. It has never shut down in 900 years." },
  { title: "The Eternal Flame of Jwala Ji", fact: "In the Jwala Ji temple in Himachal Pradesh, natural gas flames have been burning from rock fissures for centuries with no external fuel source — Akbar himself tried to extinguish them and failed." },
  { title: "Tirupati's Daily Offerings", fact: "The Tirupati temple offers Lord Venkateswara 56 varieties of food (Chhappan Bhog) every day and receives over ₹3,500 crore in annual donations — more than any other religious institution in the world." },
];

// ── Section Icons ──────────────────────────────────────────────────────────────
const sectionIcons: Record<string, React.ReactNode> = {
  "Introduction":          <Eye className="w-5 h-5" />,
  "History":               <BookOpen className="w-5 h-5" />,
  "Religious Significance":<Flame className="w-5 h-5" />,
  "Architecture":          <Building2 className="w-5 h-5" />,
  "Interesting Facts":     <Lightbulb className="w-5 h-5" />,
  "Festivals & Rituals":   <Calendar className="w-5 h-5" />,
  "Visitor Information":   <Navigation className="w-5 h-5" />,
  "Why You Should Visit":  <Star className="w-5 h-5" />,
};

// ── Article Modal ──────────────────────────────────────────────────────────────
function TempleArticle({ temple, onClose }: { temple: Temple; onClose: () => void }) {
  const [openSection, setOpenSection] = useState<string | null>("Introduction");

  const sections = [
    temple.introduction,
    temple.history,
    temple.significance,
    temple.architecture,
    { heading: "Interesting Facts", content: "" },
    temple.festivals,
    { heading: "Visitor Information", content: "" },
    temple.conclusion,
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative max-w-4xl mx-auto my-8 mx-4 bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero */}
        <div className="relative h-72 md:h-96">
          <img src={temple.image} alt={temple.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/20">
            <X className="w-6 h-6" />
          </button>
          <div className="absolute bottom-0 left-0 p-8">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">{temple.type}</span>
              <span className="px-3 py-1 bg-white/10 text-white text-xs rounded-full">{temple.deity}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-1">{temple.name}</h1>
            <p className="text-orange-300 text-sm font-medium flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />{temple.location}
            </p>
            <p className="text-stone-300 text-sm italic mt-1">"{temple.tagline}"</p>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-6 md:p-10 space-y-3">
          {sections.map((sec) => {
            const isOpen = openSection === sec.heading;
            if (sec.heading === "Interesting Facts") {
              return (
                <div key={sec.heading} className="border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden">
                  <button
                    className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isOpen ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-stone-50 dark:hover:bg-stone-800'}`}
                    onClick={() => setOpenSection(isOpen ? null : sec.heading)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`p-2 rounded-xl ${isOpen ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-stone-100 text-stone-500 dark:bg-stone-800'}`}>
                        {sectionIcons[sec.heading]}
                      </span>
                      <span className={`font-bold text-base ${isOpen ? 'text-orange-600 dark:text-orange-400' : 'text-stone-800 dark:text-stone-200'}`}>{sec.heading}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="p-5 pt-0 space-y-3">
                          {temple.facts.map((f, i) => (
                            <div key={i} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4">
                              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">✦ {f.title}</p>
                              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{f.fact}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            if (sec.heading === "Visitor Information") {
              return (
                <div key={sec.heading} className="border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden">
                  <button
                    className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isOpen ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-stone-50 dark:hover:bg-stone-800'}`}
                    onClick={() => setOpenSection(isOpen ? null : sec.heading)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`p-2 rounded-xl ${isOpen ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-stone-100 text-stone-500 dark:bg-stone-800'}`}>
                        {sectionIcons[sec.heading]}
                      </span>
                      <span className={`font-bold text-base ${isOpen ? 'text-orange-600 dark:text-orange-400' : 'text-stone-800 dark:text-stone-200'}`}>{sec.heading}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="p-5 pt-2 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4">
                              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Best Time to Visit</p>
                              <p className="text-sm text-stone-700 dark:text-stone-300">{temple.visitor.bestTime}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-4">
                              <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Temple Timings</p>
                              <p className="text-sm text-stone-700 dark:text-stone-300">{temple.visitor.timings}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Important Tips</p>
                            <ul className="space-y-2">
                              {temple.visitor.tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300">
                                  <span className="text-orange-500 mt-0.5 shrink-0">•</span>{tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            return (
              <div key={sec.heading} className="border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden">
                <button
                  className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isOpen ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-stone-50 dark:hover:bg-stone-800'}`}
                  onClick={() => setOpenSection(isOpen ? null : sec.heading)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-xl ${isOpen ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-stone-100 text-stone-500 dark:bg-stone-800'}`}>
                      {sectionIcons[sec.heading] || <Info className="w-5 h-5" />}
                    </span>
                    <span className={`font-bold text-base ${isOpen ? 'text-orange-600 dark:text-orange-400' : 'text-stone-800 dark:text-stone-200'}`}>{sec.heading}</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-6 pb-6 pt-2">
                        <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-sm md:text-base">{sec.content}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function TempleKnowledge() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);

  const filteredTemples = useMemo(() => temples.filter(temple =>
    (temple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     temple.location.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (activeCategory === 'all' || activeCategory === 'temples')
  ), [searchQuery, activeCategory]);

  const filteredTirths = useMemo(() => tirthplaces.filter(tirth =>
    (tirth.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     tirth.state.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (activeCategory === 'all' || activeCategory === 'tirths')
  ), [searchQuery, activeCategory]);

  return (
    <div className="pb-20 bg-stone-50 dark:bg-stone-950 min-h-screen">
      {/* Temple Article Modal */}
      <AnimatePresence>
        {selectedTemple && <TempleArticle temple={selectedTemple} onClose={() => setSelectedTemple(null)} />}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative h-[50vh] flex items-center overflow-hidden mb-12">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero/temples-hero.png"
            alt="Sacred Temples"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Sacred Temples & Tirthplaces</h1>
            <p className="text-lg text-stone-200 max-w-2xl mx-auto">Explore India's divine heritage — click any temple for a full in-depth article covering history, architecture, rituals, and visitor guide.</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search + Filter */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200 dark:border-stone-800 p-4 mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input type="text" placeholder="Search temples, cities, significance..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all dark:text-white" />
            </div>
            <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl">
              {['all', 'temples', 'tirths'].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === cat ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-24">
          {/* Temples Grid */}
          {(activeCategory === 'all' || activeCategory === 'temples') && filteredTemples.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl"><Sparkles className="w-6 h-6 text-orange-600" /></div>
                <div>
                  <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">Ancient Temples</h2>
                  <p className="text-stone-500 dark:text-stone-400">Click any temple to read the full in-depth article</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredTemples.map((temple) => (
                    <motion.div key={temple.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
                      className="group bg-white dark:bg-stone-900 rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedTemple(temple)}>
                      <div className="h-56 relative overflow-hidden">
                        <img src={temple.image} alt={temple.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">{temple.type}</span>
                        <div className="absolute bottom-3 left-4 flex items-center text-white text-xs font-medium"><MapPin className="w-3.5 h-3.5 mr-1.5 text-orange-400" />{temple.location}</div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-1">{temple.name}</h3>
                        <p className="text-orange-500 text-xs font-semibold mb-3 italic">"{temple.tagline}"</p>
                        <p className="text-stone-500 dark:text-stone-400 text-xs mb-1"><span className="font-semibold">Deity:</span> {temple.deity}</p>
                        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed mb-5 line-clamp-2">{temple.introduction.content}</p>
                        <button className="flex items-center gap-2 text-orange-600 font-bold text-sm group-hover:gap-3 transition-all">
                          Read Full Article <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* Did You Know */}
          <section>
            <div className="bg-stone-900 dark:bg-orange-950/20 rounded-[3rem] p-10 md:p-14 relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-orange-500/20 p-3 rounded-2xl"><Lightbulb className="w-6 h-6 text-orange-400" /></div>
                  <h2 className="text-3xl font-serif font-bold text-white">Did You Know?</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {didYouKnow.map((item, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl">
                      <h4 className="text-orange-400 font-bold text-xs mb-2 uppercase tracking-wider">{item.title}</h4>
                      <p className="text-stone-300 text-sm leading-relaxed">{item.fact}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Tirthplaces */}
          {(activeCategory === 'all' || activeCategory === 'tirths') && filteredTirths.length > 0 && (
            <section className="pb-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl"><BookOpen className="w-6 h-6 text-blue-600" /></div>
                <div>
                  <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">Sacred Tirthplaces</h2>
                  <p className="text-stone-500 dark:text-stone-400">Holy pilgrimage sites for spiritual awakening</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTirths.map((tirth) => (
                  <motion.div key={tirth.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
                    className="group relative h-72 rounded-3xl overflow-hidden shadow-xl">
                    <img src={tirth.image} alt={tirth.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">Tirth</span>
                        <span className="text-stone-300 text-xs">{tirth.state}</span>
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-white mb-2">{tirth.name}</h3>
                      <p className="text-stone-300 text-sm max-w-md">{tirth.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          <VedicWisdomSections />

          {filteredTemples.length === 0 && filteredTirths.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800">
              <Search className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-white mb-2">No results found</h3>
              <p className="text-stone-500 mb-6">Try a different search term or category.</p>
              <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors">
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
