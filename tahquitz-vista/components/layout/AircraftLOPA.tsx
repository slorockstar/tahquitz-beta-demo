"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/providers';

interface Zone {
  id: string;
  name: string;
  path: string;
  cx: number;
  cy: number;
}

const ZONES: Zone[] = [
  { 
    id: 'cockpit', 
    name: 'Cockpit', 
    path: 'M 150 50 Q 200 10 250 50 L 250 150 L 150 150 Z',
    cx: 200, cy: 90
  },
  { 
    id: 'galley', 
    name: 'Galley', 
    path: 'M 150 160 L 250 160 L 250 240 L 150 240 Z',
    cx: 200, cy: 200
  },
  { 
    id: 'lounge', 
    name: 'Main Lounge', 
    path: 'M 150 250 L 250 250 L 250 500 L 150 500 Z',
    cx: 200, cy: 375
  },
  { 
    id: 'master_suite', 
    name: 'Master Suite', 
    path: 'M 150 510 L 250 510 L 250 700 Q 200 740 150 700 Z',
    cx: 200, cy: 605
  }
];

interface AircraftLOPAProps {
  onSelectZone: (zoneId: string, zoneName: string) => void;
}

export default function AircraftLOPA({ onSelectZone }: AircraftLOPAProps) {
  const { activeColors } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto py-12">
      <h2 className="text-2xl font-light tracking-widest uppercase mb-12 text-center text-white/80">
        Select Your Zone
      </h2>
      
      <div className="relative w-full aspect-[1/2] max-h-[70vh]">
        <svg 
          viewBox="0 0 400 800" 
          className="w-full h-full drop-shadow-2xl"
          style={{ filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.5))' }}
        >
          {/* Main Aircraft Fuselage Outline */}
          <path 
            d="M 140 50 Q 200 -10 260 50 L 260 700 Q 200 760 140 700 Z" 
            fill="rgba(20,20,20,0.8)" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="2"
          />

          {/* Interactive Zones */}
          {ZONES.map((zone) => (
            <g key={zone.id} className="group cursor-pointer" onClick={() => onSelectZone(zone.id, zone.name)}>
              <motion.path
                d={zone.path}
                fill="rgba(255,255,255,0.02)"
                stroke={activeColors.accent}
                strokeWidth="1"
                initial={{ opacity: 0.6 }}
                whileHover={{ 
                  fill: `${activeColors.accent}40`, // 40 hex opacity
                  opacity: 1,
                  strokeWidth: 2
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="transition-colors"
              />
              <text 
                x={zone.cx} 
                y={zone.cy} 
                textAnchor="middle" 
                alignmentBaseline="middle"
                className="text-[10px] uppercase tracking-widest font-medium pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"
                fill="#FFF"
              >
                {zone.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
