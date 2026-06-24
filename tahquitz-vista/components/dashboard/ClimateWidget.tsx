'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/providers';

export default function ClimateWidget() {
  const { activeColors } = useTheme();
  const [temp, setTemp] = useState(72);
  const [fanSpeed, setFanSpeed] = useState(2); // 1, 2, 3

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 select-none">
      <div className="w-full flex justify-between items-center mb-4">
        <h3 className="text-sm tracking-widest text-gray-400 uppercase font-medium">Climate</h3>
        <div className="text-[10px] tracking-widest uppercase px-2 py-1 bg-white/10 rounded-full">Auto</div>
      </div>
      
      {/* Circular Temp Display */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
          <motion.circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke={activeColors.accent || "#D4AF37"} 
            strokeWidth="3" 
            strokeDasharray="282.7"
            strokeDashoffset={282.7 - (282.7 * ((temp - 60) / 25))}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
            style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
          />
        </svg>
        <div className="flex flex-col items-center justify-center z-10">
          <div className="text-4xl font-light text-white flex items-start">
            {temp}<span className="text-xl text-gray-400 mt-1">°</span>
          </div>
          <span className="text-[10px] tracking-widest text-gray-400 uppercase mt-1">Target</span>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full flex justify-between items-center mt-6">
        <button 
          onClick={() => setTemp(prev => Math.max(60, prev - 1))}
          className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-xl transition-colors"
        >
          -
        </button>
        <div className="flex gap-2">
           {[1, 2, 3].map(speed => (
             <button 
                key={speed}
                onClick={() => setFanSpeed(speed)}
                className={`w-8 h-2 rounded-full transition-colors ${fanSpeed >= speed ? 'bg-white' : 'bg-white/20'}`}
             />
           ))}
        </div>
        <button 
          onClick={() => setTemp(prev => Math.min(85, prev + 1))}
          className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-xl transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
