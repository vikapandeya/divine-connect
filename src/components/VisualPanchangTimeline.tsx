import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Clock, Info } from 'lucide-react';

interface TimelineSection {
  label: string;
  time?: string;
  width: number; // percentage
  color: string;
}

interface TimelineRow {
  title: string;
  sections: TimelineSection[];
}

export default function VisualPanchangTimeline() {
  const tithiRow: TimelineRow = {
    title: "Tithi",
    sections: [
      { label: "Dwitiya", time: "10:49", width: 25, color: "bg-orange-500/20" },
      { label: "Tritiya", width: 75, color: "bg-orange-500/10" }
    ]
  };

  const nakshatraRow: TimelineRow = {
    title: "Nakshatra",
    sections: [
      { label: "Bharani", time: "07:10", width: 10, color: "bg-blue-500/20" },
      { label: "Krittika", time: "04:35 (Next)", width: 85, color: "bg-blue-500/10" },
      { label: "Rohini", width: 5, color: "bg-blue-500/5" }
    ]
  };

  const yogaRow: TimelineRow = {
    title: "Yoga",
    sections: [
      { label: "Ayushmana", time: "08:02", width: 60, color: "bg-purple-500/20" },
      { label: "Saubhagya", width: 40, color: "bg-purple-500/10" }
    ]
  };

  const karanaRow: TimelineRow = {
    title: "Karana",
    sections: [
      { label: "Kaulava", time: "10:49", width: 25, color: "bg-emerald-500/20" },
      { label: "Taitila", time: "09:07", width: 45, color: "bg-emerald-500/15" },
      { label: "Garaja", width: 30, color: "bg-emerald-500/10" }
    ]
  };

  const weekdayRow: TimelineRow = {
    title: "Weekday",
    sections: [
      { label: "Raviwara", width: 100, color: "bg-stone-500/10" }
    ]
  };

  const rows = [tithiRow, nakshatraRow, yogaRow, karanaRow, weekdayRow];

  return (
    <div className="w-full bg-stone-50 dark:bg-stone-900 rounded-[2.5rem] p-8 border border-stone-200 dark:border-stone-800 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-500" />
            Vedic Timeline Chart
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Linear visualization of cosmic transitions for April 19, 2026</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-stone-800 p-3 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
           <div className="flex flex-col items-center px-4 border-r border-stone-200 dark:border-stone-700">
              <Sun className="w-5 h-5 text-orange-500 mb-1" />
              <span className="text-[10px] font-black text-stone-400 uppercase">Sunrise</span>
              <span className="text-xs font-bold text-stone-900 dark:text-white">05:52 AM</span>
           </div>
           <div className="flex flex-col items-center px-4">
              <Sun className="w-5 h-5 text-red-500 mb-1" />
              <span className="text-[10px] font-black text-stone-400 uppercase">Sunset</span>
              <span className="text-xs font-bold text-stone-900 dark:text-white">06:49 PM</span>
           </div>
        </div>
      </div>

      <div className="space-y-6 relative">
        {/* Hour Markers */}
        <div className="flex justify-between px-20 mb-2 opacity-30">
          {[5, 7, 9, 11, 1, 3, 5, 7, 9, 11, 1, 3, 5].map((hour, i) => (
            <span key={i} className="text-[10px] font-mono font-bold text-stone-500">{hour}</span>
          ))}
        </div>

        {rows.map((row, idx) => (
          <div key={idx} className="flex items-center group">
            <div className="w-20 text-right pr-6 shrink-0">
              <span className="text-xs font-black text-stone-400 uppercase tracking-widest">{row.title}</span>
            </div>
            <div className="flex-grow h-12 bg-stone-200 dark:bg-stone-800 rounded-xl overflow-hidden flex shadow-inner relative">
              {row.sections.map((section, sIdx) => (
                <motion.div
                  key={sIdx}
                  initial={{ width: 0 }}
                  animate={{ width: `${section.width}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 + sIdx * 0.2 }}
                  className={`${section.color} h-full relative border-r border-white/10 dark:border-black/10 flex items-center justify-center group/section`}
                >
                  <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 truncate px-2">{section.label}</span>
                  {section.time && (
                    <div className="absolute -bottom-1 left-[-1px] w-0.5 h-3 bg-stone-400 dark:bg-stone-600">
                       <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-stone-500 whitespace-nowrap">
                         {section.time}
                       </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-12 p-6 bg-stone-100 dark:bg-stone-800/50 rounded-3xl border border-stone-200 dark:border-stone-800">
           <div className="flex items-start gap-4">
              <Info className="w-5 h-5 text-stone-400 shrink-0 mt-1" />
              <div>
                 <h5 className="text-sm font-bold text-stone-900 dark:text-white mb-2">How to read this chart</h5>
                 <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                   This linear almanac visualizes the duration and transitions of various Vedic elements throughout the 24-hour cycle. 
                   Vertical lines indicate the exact time a Tithi, Nakshatra, or Karana ends and the next begins. Use this for precise planning of auspicious activities.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
