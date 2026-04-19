import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Sun, Moon, Star, Calendar, Clock, 
  ChevronRight, Sparkles, BookOpen, Compass,
  Layout, Activity, Info, X, Zap, Loader2
} from 'lucide-react';
import VisualPanchangTimeline from './VisualPanchangTimeline';

// --- Types ---
type ToolType = 'lunar' | 'muhurta' | 'chronology' | 'timeline' | null;
type WisdomType = 'mantri' | 'timings' | 'disha' | null;

// --- Data ---
const REGIONAL_CALENDARS = [
  {
    id: 'vikram',
    title: 'Vikram Samvat',
    region: 'North & West India',
    description: 'A lunar calendar starting after the new moon (Amanta) or full moon (Purnimanta). The new year typically falls on Chaitra Shukla Pratipada.',
    color: 'from-orange-500/10 to-transparent',
    icon: <Sun className="w-6 h-6 text-orange-500" />
  },
  {
    id: 'shaka',
    title: 'Shaka Samvat',
    region: 'National Calendar & South India',
    description: 'Adopted as the Indian National Calendar, it starts from the vernal equinox. Significant in Maharashtra (Gudi Padwa) and Karnataka/Andhra (Ugadi).',
    color: 'from-blue-500/10 to-transparent',
    icon: <Globe className="w-6 h-6 text-blue-500" />
  },
  {
    id: 'malayalam',
    title: 'Malayalam Calendar (Kollavarsham)',
    region: 'Kerala',
    description: 'A solar calendar where the month starts when the Sun enters a zodiac sign. New Year is celebrated as Vishu or Chingam 1st.',
    color: 'from-emerald-500/10 to-transparent',
    icon: <Compass className="w-6 h-6 text-emerald-500" />
  },
  {
    id: 'bengali',
    title: 'Bengali Calendar (Bangabda)',
    region: 'West Bengal & Bangladesh',
    description: 'A solar calendar based on the Surya Siddhanta. Poila Baisakh marks the beginning of the new year.',
    color: 'from-red-500/10 to-transparent',
    icon: <Calendar className="w-6 h-6 text-red-500" />
  }
];

const ADVANCED_WISDOM = [
  {
    id: 'mantri',
    title: 'Mantri Mandala',
    subtitle: 'The Celestial Governance',
    content: "Every Samvat Year has a 'Planetary Cabinet'. In Vikrama Samvata 2083, Guru (Jupiter) reigns as King 👑, ensuring a focus on spiritual wealth and wisdom. Chandra serves as the Commander-in-Chief ⚔️, influencing emotional tides and nourishment.",
    icon: <Star className="w-6 h-6 text-yellow-500" />,
    linkText: 'Explore Depth'
  },
  {
    id: 'timings',
    title: 'Sacred Timings',
    subtitle: 'Beyond the Hours',
    content: "Understand intervals like Brahma Muhurta (Pre-dawn) for meditation, Vijaya Muhurta for successful ventures, and Godhuli (Sunset) for peace. Each 'Muhurta' represents a unique cosmic alignment.",
    icon: <Clock className="w-6 h-6 text-purple-500" />,
    linkText: 'Explore Depth'
  },
  {
    id: 'disha',
    title: 'Disha Shool & Vasa',
    subtitle: 'Space & Direction Wisdom',
    content: "Avoid 'Disha Shool' (Directional Pain) to align with favorable flows. For instance, traveling West on Sundays is often avoided. It also guides 'Agnivasa' and 'Shivavasa' for auspicious ceremonies.",
    icon: <Compass className="w-6 h-6 text-blue-500" />,
    linkText: 'Explore Depth'
  }
];

const TOOLS = [
  {
    id: 'lunar',
    title: 'Lunar Phase Tracker',
    subtitle: 'Waxing & Waning',
    description: 'A precision visualizer for the 30 Tithis of the Lunar Month. Understand the transition from Shukla (Bright) to Krishna (Dark) Paksha.',
    icon: <Moon className="w-6 h-6 text-blue-400" />,
    tag: 'Lunar Phase'
  },
  {
    id: 'muhurta',
    title: 'Muhurta Mastery',
    subtitle: 'The Auspicious Seconds',
    description: 'Go deeper into technical timings like Ravi Yoga, Tri Pushkara Yoga, and Anandadi Yogas. Identify exactly when the universe is aligned.',
    icon: <Sparkles className="w-6 h-6 text-amber-400" />,
    tag: 'Muhurta'
  },
  {
    id: 'chronology',
    title: 'Vedic Chronology',
    subtitle: 'The Great Epochs',
    description: 'Track the vast timelines of Dharma. Explore the transition of Samvatsaras and the influence of the 2083 Mantri Mandala.',
    icon: <Activity className="w-6 h-6 text-red-400" />,
    tag: 'Epochs'
  },
  {
    id: 'timeline',
    title: 'Visual Vedic Almanac',
    subtitle: 'Timeline Chart',
    description: 'Experience the Panchang in a revolutionary linear format. Visualize Tithi transitions, Nakshatra flow, and Muhurta alignments.',
    icon: <Layout className="w-6 h-6 text-emerald-400" />,
    tag: 'Timeline'
  }
];

// --- Mini Tools Components ---

const LunarPhaseTracker = () => {
    // Current date is April 19, 2026. 
    // April 17 is New Moon (Amavasya) approximately. So Apr 19 is Shukla Dwitiya/Tritiya.
    const tithis = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        name: i < 15 ? `Shukla ${i + 1}` : `Krishna ${i - 14}`,
        isCurrent: i === 1 // Dwitiya
    }));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2">
                {tithis.map((t) => (
                    <div 
                        key={t.id}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 border transition-all ${
                            t.isCurrent 
                            ? 'bg-orange-500 border-orange-400 scale-110 shadow-lg shadow-orange-500/20' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                    >
                        <Moon className={`w-4 h-4 mb-1 ${t.isCurrent ? 'text-white' : 'text-stone-500'}`} />
                        <span className={`text-[8px] font-bold text-center leading-tight ${t.isCurrent ? 'text-white' : 'text-stone-500'}`}>
                            {t.id}
                        </span>
                    </div>
                ))}
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl">
                <h4 className="text-orange-400 font-bold mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Current Phase: Shukla Dwitiya
                </h4>
                <p className="text-stone-400 text-xs"> The mental energy is growing as the Moon moves away from the Sun. An excellent time for starting new creative projects.</p>
            </div>
        </div>
    );
};

const VedicChronologyTracker = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-black text-stone-500 uppercase">Current Kaliyuga Year</span>
                    <h4 className="text-2xl font-serif text-white">5,127 Years</h4>
                    <div className="mt-2 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-[1%] h-full bg-orange-500" />
                    </div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-black text-stone-500 uppercase">Current Samvatsara</span>
                    <h4 className="text-2xl font-serif text-white">Siddharthi</h4>
                    <p className="text-stone-500 text-xs mt-1">The 53rd year in the 60-year Jupiter cycle.</p>
                </div>
            </div>
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                <p className="text-stone-300 text-sm italic">"Time is a wheel, and we are but observers of its grand rotation. Every Samvat brings a new cosmic flavor to humanity."</p>
            </div>
        </div>
    );
};

const MuhurtaMasteryTool = () => {
    const Muhurtas = [
        { name: 'Ravi Yoga', time: 'Full Day', type: 'Success', color: 'text-orange-400' },
        { name: 'Anandadi Yoga', time: '05:52 AM - 12:47 PM', type: 'Progress', color: 'text-emerald-400' },
        { name: 'Siddha Yoga', time: '01:22 PM - Sunset', type: 'Completion', color: 'text-blue-400' },
        { name: 'Amrit Kaal', time: '09:30 PM (Night)', type: 'Spiritual', color: 'text-purple-400' }
    ];

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                {Muhurtas.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <div>
                            <span className={`text-xs font-bold ${m.color}`}>{m.name}</span>
                            <div className="flex items-center gap-1 text-[10px] text-stone-500">
                                <Clock className="w-3 h-3" />
                                {m.time}
                            </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-bold text-stone-400 uppercase tracking-widest">{m.type}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Component ---

export default function VedicWisdomSections() {
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const [activeWisdom, setActiveWisdom] = useState<WisdomType>(null);

  return (
    <div className="space-y-24 mt-20">
      {/* Regional Calendar Guides */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-white mb-4">Regional Calendar Guides</h2>
          <p className="text-stone-400">Understanding diverse spiritual time-keeping across India</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REGIONAL_CALENDARS.map((cal) => (
            <motion.div
              key={cal.id}
              whileHover={{ y: -5 }}
              className={`p-8 rounded-[2.5rem] bg-gradient-to-b ${cal.color} border border-white/10 flex flex-col h-full`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                {cal.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{cal.title}</h3>
              <p className="text-xs font-black text-stone-500 uppercase tracking-widest mb-4">{cal.region}</p>
              <p className="text-sm text-stone-400 leading-relaxed flex-grow">
                {cal.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Advanced Vedic Wisdom */}
      <section className="relative">
        <div className="absolute inset-0 bg-orange-500/5 blur-[100px] rounded-full" />
        <div className="relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-white mb-4">Advanced Vedic Wisdom</h2>
            <p className="text-stone-400">Deep insights into cosmic governance and sacred alignments</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {ADVANCED_WISDOM.map((wisdom, i) => (
              <div key={i} className="group p-8 rounded-[2.5rem] bg-stone-900/50 backdrop-blur-sm border border-white/5 hover:border-orange-500/30 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {wisdom.icon}
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-1">{wisdom.title}</h3>
                <p className="text-orange-500 text-sm font-bold mb-4">{wisdom.subtitle}</p>
                <p className="text-stone-400 text-sm leading-relaxed mb-6">
                  {wisdom.content}
                </p>
                <button 
                  onClick={() => setActiveWisdom(wisdom.id as WisdomType)}
                  className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest hover:text-orange-500 transition-colors"
                >
                  {wisdom.linkText}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divine Timekeeping & Tools */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-white mb-4">Divine Timekeeping & Muhurta</h2>
          <p className="text-stone-400">Precision tools for navigating the sacred Vedic almanac</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TOOLS.map((tool) => (
            <div 
              key={tool.id}
              className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                  {tool.icon}
                </div>
                <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-stone-500 uppercase tracking-widest border border-white/5">
                  {tool.tag}
                </span>
              </div>
              <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1">{tool.subtitle}</p>
              <h3 className="text-2xl font-serif font-bold text-white mb-3">{tool.title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-6 max-w-sm">
                {tool.description}
              </p>
              <button 
                onClick={() => setActiveTool(tool.id as ToolType)}
                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all"
              >
                Open Tool
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Tool Modal */}
      <AnimatePresence>
        {(activeTool || activeWisdom) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setActiveTool(null);
                setActiveWisdom(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0d0d0d] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-white">
                    {activeTool 
                      ? TOOLS.find(t => t.id === activeTool)?.title 
                      : ADVANCED_WISDOM.find(w => w.id === activeWisdom)?.title}
                  </h3>
                  <p className="text-stone-500 text-xs uppercase tracking-widest font-bold mt-1">
                    {activeTool 
                      ? TOOLS.find(t => t.id === activeTool)?.subtitle 
                      : ADVANCED_WISDOM.find(w => w.id === activeWisdom)?.subtitle}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setActiveTool(null);
                    setActiveWisdom(null);
                  }}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto flex-grow custom-scrollbar">
                {activeTool === 'lunar' && <LunarPhaseTracker />}
                {activeTool === 'muhurta' && <MuhurtaMasteryTool />}
                {activeTool === 'chronology' && <VedicChronologyTracker />}
                {activeTool === 'timeline' && <VisualPanchangTimeline />}
                
                {activeWisdom === 'mantri' && (
                  <div className="space-y-6 text-stone-300">
                    <p className="leading-relaxed">In Vedic astrology, each year is governed by a 'Planetary Cabinet' (Mantri Mandala). This celestial team influences the global socio-economic and spiritual landscape.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-orange-400 font-bold block mb-1">Raja (The King)</span>
                        <p className="text-sm">Guru (Jupiter) rules this year, bringing expansion of knowledge, spiritual growth, and prosperity to those aligned with Dharma.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <span className="text-blue-400 font-bold block mb-1">Mantri (The Minister)</span>
                        <p className="text-sm">Chandra (Moon) acts as the advisor, emphasizing emotional intelligence, public welfare, and agricultural abundance.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeWisdom === 'timings' && (
                  <div className="space-y-6 text-stone-300">
                    <p className="leading-relaxed">Vedic time is not just linear but qualitative. Specific Muhurtas offer unique cosmic windows for various activities.</p>
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <h5 className="font-bold text-white mb-2 underline decoration-purple-500 underline-offset-4">Brahma Muhurta (04:24 AM - 05:12 AM)</h5>
                        <p className="text-sm">The 'Time of the Creator'. Ideal for meditation, study, and self-reflection as the Sattva Guna is dominant.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <h5 className="font-bold text-white mb-2 underline decoration-emerald-500 underline-offset-4">Vijaya Muhurta (01:50 PM - 02:40 PM)</h5>
                        <p className="text-sm">The 'Time of Victory'. Highly auspicious for starting legal matters, competitive tasks, or important journeys.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <h5 className="font-bold text-white mb-2 underline decoration-orange-500 underline-offset-4">Godhuli (Sunset Period)</h5>
                        <p className="text-sm">Literally 'Dust of the Cows'. A peaceful time suitable for prayer, lighting lamps, and homecoming.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeWisdom === 'disha' && (
                  <div className="space-y-6 text-stone-300">
                    <p className="leading-relaxed">Space and Direction are fundamental in Vedic sciences. Aligning your movements with the cosmic flow prevents friction and invites success.</p>
                    <div className="p-6 rounded-[2rem] bg-stone-900 border border-white/5">
                      <h5 className="font-bold text-orange-400 mb-4 flex items-center gap-2">
                        <Compass className="w-5 h-5" />
                        Disha Shool (Directional Taboos)
                      </h5>
                      <ul className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-widest list-inside list-disc">
                        <li className="text-stone-400">Sun: West</li>
                        <li className="text-stone-400">Mon: East</li>
                        <li className="text-stone-400">Tue: North</li>
                        <li className="text-stone-400">Wed: North</li>
                        <li className="text-stone-400">Thu: South</li>
                        <li className="text-stone-400">Fri: West</li>
                        <li className="text-stone-400">Sat: East</li>
                      </ul>
                      <p className="mt-6 text-stone-500 text-xs italic">Note: These are general guidelines. Consult a Panchang for specific lunar and planetary overlaps.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
