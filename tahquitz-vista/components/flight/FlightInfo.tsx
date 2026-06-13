"use client";

import React, { useState } from 'react';
import { useTheme } from '@/app/providers';

interface FlightInfoProps {
  origin?: string;
  destination?: string;
  altitude?: number;
  timeRemaining?: string;
}

export default function FlightInfo({ 
  origin = "Hamburg, EDHI", 
  destination = "Los Angeles, KLAX",
  altitude = 41000,
  timeRemaining = "11 hours 17 min"
}: FlightInfoProps) {
  const { activeColors } = useTheme();

  return (
    <div className="w-full flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-light mb-1 text-white/90">Welcome Aboard</h2>
          <p className="text-sm text-gray-400 font-medium tracking-wide">{origin} to {destination}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono font-medium tracking-tight">{timeRemaining}</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">To Destination</div>
        </div>
      </div>

      <div className="w-full h-32 rounded-2xl bg-black/40 border border-white/5 relative overflow-hidden flex items-center justify-center p-4">
        {/* Mock Map / Plane representation */}
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 50% 50%, ${activeColors.accent}, transparent 70%)` }} />
        
        <div className="flex justify-between items-center w-full max-w-sm z-10 relative">
          <div className="flex flex-col items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white/20 border-2 border-white/50" />
            <span className="text-[10px] uppercase tracking-widest text-gray-400">EDHI</span>
          </div>
          
          <div className="flex-1 border-t border-dashed border-white/20 mx-4 relative">
             <svg 
                className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" 
                width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeColors.accent} strokeWidth="1.5"
             >
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 3-4 4L2 14l-1 1 3 3 3 3 1-1-1-3 4-4 3 6l1.2-.7.6-1.1L16 13l8.2-3.5c1.5-1.5 2-3.5 1.5-4.5-.5-1-2.5-.5-4 1L17.8 19.2z" />
             </svg>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeColors.accent, boxShadow: `0 0 10px ${activeColors.accent}` }} />
            <span className="text-[10px] uppercase tracking-widest text-gray-400">KLAX</span>
          </div>
        </div>

        {/* Altitude Marker */}
        <div className="absolute bottom-2 left-4 text-xs font-mono text-gray-500">ALT: {(altitude/1000).toFixed(1)}K FT</div>
      </div>
    </div>
  );
}
