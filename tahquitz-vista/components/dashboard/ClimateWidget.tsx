'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/providers';

export default function ClimateWidget() {
  const { activeColors } = useTheme();
  const [temp, setTemp] = useState(72);
  const [fanSpeed, setFanSpeed] = useState(2); // 1, 2, 3

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] select-none">
      <div className="w-full flex justify-between items-center mb-4">
        <h3 className="text-[10px] tracking-widest text-gray-400 uppercase font-medium">Climate</h3>
        <div className="text-[9px] tracking-widest uppercase px-3 py-1 bg-black/50 border border-white/10 rounded-full shadow-inner">Auto</div>
      </div>
      
      {/* Skeuomorphic Circular Temp Display */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Machined Metal Outer Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-black/40 shadow-[inset_0_4px_10px_rgba(0,0,0,0.5),0_2px_5px_rgba(255,255,255,0.1)]"></div>
        {/* Deep Inner Well */}
        <div className="absolute inset-2 rounded-full bg-black shadow-[inset_0_10px_20px_rgba(0,0,0,1)] flex items-center justify-center">
           <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
             <motion.circle 
               cx="50" cy="50" r="42" 
               fill="none" 
               stroke={activeColors.accent || "#D4AF37"} 
               strokeWidth="4" 
               strokeDasharray="263.8"
               strokeDashoffset={263.8 - (263.8 * ((temp - 60) / 25))}
               strokeLinecap="round"
               className="transition-all duration-300 ease-out drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"
               style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
             />
           </svg>
           <div className="flex flex-col items-center justify-center z-10">
             <div className="text-4xl font-light text-white flex items-start" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.3)' }}>
               {temp}<span className="text-xl text-gray-500 mt-1">°</span>
             </div>
             <span className="text-[9px] tracking-[0.3em] text-gray-500 uppercase mt-1">Target</span>
           </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full flex justify-between items-center mt-6 px-2">
        <button 
          onClick={() => setTemp(prev => Math.max(60, prev - 1))}
          className="w-12 h-12 rounded-full bg-gradient-to-b from-white/10 to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.5)] border border-white/10 flex items-center justify-center text-xl active:scale-95 transition-transform text-white/70 hover:text-white"
        >
          -
        </button>
        <div className="flex gap-2 bg-black/40 p-2 rounded-full border border-white/5 shadow-inner">
           {[1, 2, 3].map(speed => (
             <button 
                key={speed}
                onClick={() => setFanSpeed(speed)}
                className={`w-6 h-1.5 rounded-full transition-all ${fanSpeed >= speed ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-white/10'}`}
             />
           ))}
        </div>
        <button 
          onClick={() => setTemp(prev => Math.min(85, prev + 1))}
          className="w-12 h-12 rounded-full bg-gradient-to-b from-white/10 to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_4px_10px_rgba(0,0,0,0.5)] border border-white/10 flex items-center justify-center text-xl active:scale-95 transition-transform text-white/70 hover:text-white"
        >
          +
        </button>
      </div>
    </div>
  );
}
