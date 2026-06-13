"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/providers';

interface TimelinePhase {
  id: string;
  label: string;
  icon: string;
  percentage: number; // 0 to 100 representing position on timeline
  isPast: boolean;
  isActive: boolean;
}

export default function JourneyTimeline() {
  const { activeColors } = useTheme();

  const phases: TimelinePhase[] = [
    { id: 'dep', label: 'Departure', percentage: 0, isPast: true, isActive: false, icon: 'M12 2l3 3h-2v4h-2V5H9l3-3zM5 11h14v2H5v-2zm0 4h14v2H5v-2zm0 4h14v2H5v-2z' },
    { id: 'meal1', label: 'Lunch', percentage: 15, isPast: true, isActive: false, icon: 'M3 13h18v-2H3v2zm14-5V5c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v3H3v2h18V8h-4zm-6-3h2v2h-2V5z' },
    { id: 'relax', label: 'Zen Mode', percentage: 40, isPast: false, isActive: true, icon: 'M12 2.5a2.5 2.5 0 0 1 5 0v3a2.5 2.5 0 0 1-5 0v-3z' },
    { id: 'meal2', label: 'Light Meal', percentage: 80, isPast: false, isActive: false, icon: 'M3 13h18v-2H3v2z' },
    { id: 'arr', label: 'Arrival', percentage: 100, isPast: false, isActive: false, icon: 'M12 22l-3-3h2v-4h2v4h2l-3 3zM5 11h14v2H5v-2zm0-4h14v2H5V7zm0-4h14v2H5V3z' },
  ];

  // Assume we are 40% through the flight
  const currentProgress = 40;

  return (
    <div className="w-full py-6">
      <h3 className="text-sm font-medium tracking-widest text-gray-400 uppercase mb-8">My Journey</h3>
      
      <div className="relative w-full h-12 px-6">
        
        {/* Track Background */}
        <div className="absolute top-1/2 left-6 right-6 h-1 -translate-y-1/2 bg-white/10 rounded-full overflow-hidden">
          {/* Progress Fill */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${currentProgress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ backgroundColor: activeColors.accent }}
          />
        </div>

        {/* Timeline Nodes */}
        {phases.map((phase) => (
          <div 
            key={phase.id}
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `calc(${phase.percentage}% + ${phase.percentage === 0 ? '24px' : phase.percentage === 100 ? '-24px' : '0px'})` }}
          >
            {/* Node Circle */}
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${
                phase.isActive 
                  ? 'bg-black w-8 h-8' 
                  : phase.isPast 
                    ? 'bg-black' 
                    : 'bg-black border-white/20'
              }`}
              style={{
                borderColor: phase.isActive || phase.isPast ? activeColors.accent : 'rgba(255,255,255,0.2)'
              }}
            >
              {/* Inner dot for active */}
              {phase.isActive && (
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeColors.accent, boxShadow: `0 0 10px ${activeColors.accent}` }} />
              )}
            </div>

            {/* Label */}
            <div 
              className={`absolute top-10 whitespace-nowrap text-[10px] font-medium tracking-widest uppercase transition-colors duration-300 ${
                phase.isActive ? 'text-white' : phase.isPast ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {phase.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
