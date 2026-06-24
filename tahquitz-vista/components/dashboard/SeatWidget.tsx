'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/providers';

export default function SeatWidget() {
  const { activeColors } = useTheme();
  const [activePreset, setActivePreset] = useState('Lounge');

  const presets = [
    { name: 'TTL', icon: '🛫', desc: 'Takeoff/Landing' },
    { name: 'Lounge', icon: '🛋️', desc: 'Relaxed' },
    { name: 'Dining', icon: '🍽️', desc: 'Upright' },
    { name: 'Sleep', icon: '🛏️', desc: 'Flat Bed' }
  ];

  return (
    <div className="w-full h-full flex flex-col items-start justify-between p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 select-none">
      <div className="w-full flex justify-between items-center mb-4">
        <h3 className="text-sm tracking-widest text-gray-400 uppercase font-medium">Seat Configuration</h3>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 w-full h-full">
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => setActivePreset(preset.name)}
            className="flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300"
            style={{ 
               backgroundColor: activePreset === preset.name ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.02)',
               borderColor: activePreset === preset.name ? (activeColors.accent || '#D4AF37') : 'rgba(255,255,255,0.05)'
            }}
          >
            <span className="text-2xl mb-2">{preset.icon}</span>
            <span className="text-xs font-semibold text-white tracking-wider">{preset.name}</span>
            <span className="text-[9px] text-gray-500 uppercase mt-1">{preset.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
