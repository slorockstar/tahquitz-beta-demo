"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// This would ideally connect to a global context to change the app's root CSS variables/background video
export type ImmersionMode = 'Default' | 'Productivity' | 'Zen' | 'Cinema';

interface EnvironmentSelectorProps {
  currentMode: ImmersionMode;
  onModeChange: (mode: ImmersionMode) => void;
}

export default function EnvironmentSelector({ currentMode, onModeChange }: EnvironmentSelectorProps) {
  
  const modes: { id: ImmersionMode; label: string; icon: string }[] = [
    { id: 'Default', label: 'VVIP', icon: 'M5 3v4M3 5h4M6 17v4M4 19h4M13 3l2.286 6.857L22 12l-6.714 2.143L13 21l-2.286-6.857L4 12l6.714-2.143L13 3z' }, // Sparkles
    { id: 'Productivity', label: 'Focus', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }, // Target/Work
    { id: 'Zen', label: 'Zen', icon: 'M12 2.5a2.5 2.5 0 0 1 5 0v3a2.5 2.5 0 0 1-5 0v-3zM7 2.5a2.5 2.5 0 0 1 5 0v3a2.5 2.5 0 0 1-5 0v-3z' }, // Calming/Lotus
    { id: 'Cinema', label: 'Cinema', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 0l4 4m12-4l-4 4m-4-4l4 4m-8-4l4 4' } // Film/Monitor
  ];

  return (
    <div className="w-full flex flex-col">
      <h3 className="text-sm font-medium tracking-widest text-gray-400 uppercase mb-6">Digital Environment</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {modes.map((mode) => {
          const isActive = currentMode === mode.id;
          
          return (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onModeChange(mode.id)}
              className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 ${
                isActive 
                  ? 'bg-white/10 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                  : 'bg-black/30 border-white/5 hover:bg-white/5'
              }`}
            >
              <svg 
                width="28" height="28" viewBox="0 0 24 24" 
                fill="none" 
                stroke={isActive ? '#FFF' : '#888'} 
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="mb-3 transition-colors duration-300"
              >
                <path d={mode.icon} />
              </svg>
              <span className={`text-xs uppercase tracking-widest font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {mode.label}
              </span>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute bottom-2 w-1 h-1 rounded-full bg-white"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
