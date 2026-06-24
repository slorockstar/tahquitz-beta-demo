'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/providers';

export default function FlightDataWidget() {
  const { activeColors } = useTheme();
  
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().substring(11, 16) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 select-none overflow-hidden relative">
      
      {/* Decorative Accent */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: activeColors.accent || '#D4AF37' }}
      />

      <div className="flex justify-between items-start w-full">
        <div>
          <h3 className="text-xs tracking-widest text-gray-500 uppercase font-medium mb-1">Current Location</h3>
          <p className="text-lg text-white font-light">Above: Mediterranean Sea</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] tracking-widest text-gray-500 uppercase font-medium mb-1">Time</p>
           <p className="text-sm font-mono text-white" style={{ color: activeColors.accent || '#D4AF37' }}>{time || '14:32 UTC'}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        
        {/* Altitude */}
        <div className="flex flex-col">
          <span className="text-[10px] tracking-widest text-gray-500 uppercase font-medium mb-1">Altitude</span>
          <div className="flex items-baseline gap-1">
             <span className="text-3xl font-light text-white">41,000</span>
             <span className="text-xs text-gray-400">FT</span>
          </div>
        </div>

        {/* Speed */}
        <div className="flex flex-col">
          <span className="text-[10px] tracking-widest text-gray-500 uppercase font-medium mb-1">Ground Speed</span>
          <div className="flex items-baseline gap-1">
             <span className="text-3xl font-light text-white">540</span>
             <span className="text-xs text-gray-400">KTS</span>
          </div>
        </div>

        {/* OAT */}
        <div className="flex flex-col">
          <span className="text-[10px] tracking-widest text-gray-500 uppercase font-medium mb-1">Outside Air Temp</span>
          <div className="flex items-baseline gap-1">
             <span className="text-3xl font-light text-white">-54</span>
             <span className="text-xs text-gray-400">°C</span>
          </div>
        </div>

      </div>
    </div>
  );
}
