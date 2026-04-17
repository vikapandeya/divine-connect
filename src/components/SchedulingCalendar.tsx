import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Sunrise, Sun, Sunset, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

// Configure standard intervals
const AVAILABLE_SLOTS = [
  { value: "06:00 AM", label: "06:00 AM - 08:00 AM", icon: Sunrise, period: "Morning" },
  { value: "09:00 AM", label: "09:00 AM - 11:00 AM", icon: Sun, period: "Morning" },
  { value: "04:00 PM", label: "04:00 PM - 06:00 PM", icon: Sunset, period: "Evening" },
  { value: "07:00 PM", label: "07:00 PM - 09:00 PM", icon: Moon, period: "Evening" },
];

interface SchedulingCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  selectedTimeSlot: string;
  onTimeSlotSelect: (slot: string) => void;
  daysToDispalay?: number;
}

export default function SchedulingCalendar({
  selectedDate,
  onDateSelect,
  selectedTimeSlot,
  onTimeSlotSelect,
  daysToDispalay = 14
}: SchedulingCalendarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Generate an array of dates dynamically
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    // Reset time to start of day for comparison
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < daysToDispalay; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        
        // Format YYYY-MM-DD
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        const formattedDate = `${year}-${month}-${day}`;
        dates.push({
            dateObj: d,
            formattedString: formattedDate,
            dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
            dayNumber: d.getDate(),
            monthName: d.toLocaleDateString("en-US", { month: "short" }),
            isToday: i === 0,
        });
    }
    return dates;
  }, [daysToDispalay]);

  // Set initial selected date to today if none is selected
  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      onDateSelect(availableDates[0].formattedString);
    }
  }, [selectedDate, availableDates, onDateSelect]);


  const checkScroll = () => {
    if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        // add a small 1px buffer to handle pixel rounding
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  const scrollDates = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const scrollAmount = 200; // Scroll by ~3 items
        if (direction === 'left') {
            scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Picker Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-stone-700 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
            Select Date
          </label>
        </div>

        <div className="relative group/calendar">
            {/* Scroll Buttons */}
            {canScrollLeft && (
                <button 
                  type="button"
                  onClick={() => scrollDates('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 w-8 h-8 flex items-center justify-center bg-white border border-stone-200 rounded-full shadow-md text-stone-600 hover:text-orange-600 hover:border-orange-200 transition-all opacity-0 group-hover/calendar:opacity-100"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            )}
            
            {canScrollRight && (
                <button 
                  type="button"
                  onClick={() => scrollDates('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 w-8 h-8 flex items-center justify-center bg-white border border-stone-200 rounded-full shadow-md text-stone-600 hover:text-orange-600 hover:border-orange-200 transition-all opacity-0 group-hover/calendar:opacity-100"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}

            {/* Dates Container */}
            <div 
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 hide-scrollbar scroll-smooth snap-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {availableDates.map((item) => {
                const isSelected = selectedDate === item.formattedString;
                
                return (
                    <button
                      key={item.formattedString}
                      type="button"
                      onClick={() => onDateSelect(item.formattedString)}
                      className={`flex-shrink-0 w-20 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all snap-start ${
                          isSelected 
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-500 ring-offset-2' 
                            : 'bg-white text-stone-600 border border-stone-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-orange-100' : 'text-stone-400'}`}>
                        {item.dayName}
                      </span>
                      <span className="text-xl font-serif font-bold">
                        {item.dayNumber}
                      </span>
                      <span className={`text-[10px] font-medium ${isSelected ? 'text-orange-100' : 'text-stone-400'}`}>
                        {item.monthName}
                      </span>
                      {item.isToday && (
                          <div className={`mt-1 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>
                             Today
                          </div>
                      )}
                    </button>
                );
              })}
            </div>
        </div>
      </div>

      {/* Time Slots Section */}
      <div>
        <label className="text-sm font-bold text-stone-700 flex items-center mb-3">
          <Clock className="w-4 h-4 mr-2 text-orange-500" />
          Select Time Slot
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AVAILABLE_SLOTS.map((slot) => {
            const isSelected = selectedTimeSlot === slot.value;
            const Icon = slot.icon;
            
            return (
              <button
                key={slot.value}
                type="button"
                onClick={() => onTimeSlotSelect(slot.value)}
                className={`relative overflow-hidden flex items-center p-3 rounded-xl border transition-all ${
                  isSelected 
                    ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' 
                    : 'border-stone-200 bg-white hover:border-orange-300'
                }`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 shrink-0 ${isSelected ? 'bg-orange-500 text-white' : 'bg-stone-50 text-stone-400'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span className={`text-sm font-bold ${isSelected ? 'text-orange-900' : 'text-stone-700'}`}>
                    {slot.label.split(' - ')[0]}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${isSelected ? 'text-orange-600' : 'text-stone-400'}`}>
                    {slot.period}
                  </span>
                </div>
                
                {isSelected && (
                    <motion.div 
                        layoutId="activeTimeSlotIndicator"
                        className="absolute right-0 top-0 bottom-0 w-1 bg-orange-500" 
                    />
                )}
              </button>
            );
          })}
        </div>
      </div>

       <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
