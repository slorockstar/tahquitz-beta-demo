"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/app/providers';
import LightingControl from './LightingControl'; // The RGB Slider
import TactileSwitch from '../controls/TactileSwitch'; // The binary switch

interface LightingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  zoneName: string;
}

export default function LightingPanel({ isOpen, onClose, zoneName }: LightingPanelProps) {
  const { activeColors, updateTheme } = useTheme();

  // Mock state for dimmers
  const [tableLights, setTableLights] = useState(80);
  const [readingLights, setReadingLights] = useState(0);

  const applyScenario = (scenario: 'Boarding' | 'Dining' | 'Sleep' | 'Wake') => {
    let newAccent = activeColors.accent;
    
    if (scenario === 'Boarding') {
      newAccent = '#D4AF37'; // Tahquitz Gold
      setTableLights(100);
      setReadingLights(50);
    } else if (scenario === 'Dining') {
      newAccent = '#E5E4E2'; // Platinum
      setTableLights(60);
      setReadingLights(0);
    } else if (scenario === 'Sleep') {
      newAccent = '#004B87'; // Deep Blue
      setTableLights(0);
      setReadingLights(0);
    } else if (scenario === 'Wake') {
      newAccent = '#DA8A67'; // Sunrise Copper
      setTableLights(40);
      setReadingLights(80);
    }

    updateTheme({ darkTheme: { ...activeColors, accent: newAccent } });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sliding Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[400px] max-w-[90vw] bg-black/80 border-l border-white/10 z-50 overflow-y-auto no-scrollbar shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-black/90 backdrop-blur-md px-8 py-6 border-b border-white/5 z-10 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-light text-white uppercase tracking-widest">{zoneName} Lighting</h2>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Master Control Panel</p>
              </div>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Global Presets */}
            <div className="px-8 py-6 border-b border-white/5">
              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold tracking-widest text-white uppercase transition-all">
                  All Bright
                </button>
                <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold tracking-widest text-gray-300 uppercase transition-all">
                  All Dim
                </button>
                <button className="flex-1 py-3 bg-black hover:bg-white/5 border border-white/5 rounded-xl text-xs font-bold tracking-widest text-gray-500 uppercase transition-all">
                  All Off
                </button>
              </div>
              
              <div className="mt-6">
                 <h3 className="text-[10px] tracking-widest text-gray-500 uppercase font-medium mb-3">Light Scenarios</h3>
                 <div className="grid grid-cols-2 gap-2">
                   {['Boarding', 'Dining', 'Sleep', 'Wake'].map(scenario => (
                      <button 
                        key={scenario}
                        onClick={() => applyScenario(scenario as any)}
                        className="py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold tracking-widest text-white uppercase transition-all flex justify-center items-center gap-2"
                        style={{ color: activeColors.accent }}
                      >
                        {scenario}
                      </button>
                   ))}
                 </div>
              </div>
            </div>

            {/* RGB Washes */}
            <div className="px-8 py-6 border-b border-white/5 flex flex-col gap-8">
              <LightingControl label="Ceiling Dome" />
              <LightingControl label="Up Wash" />
              <LightingControl label="Down Wash" />
              <LightingControl label="Kickstrip" />
              <LightingControl label="Bar Accent" />
            </div>

            {/* Dimmers & Toggles */}
            <div className="px-8 py-6 flex flex-col gap-6">
              
              {/* Dimmer: Table Lights */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between text-xs tracking-widest text-gray-400 uppercase font-medium">
                  <span>Table Lights</span>
                  <span>{tableLights}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={tableLights} onChange={e => setTableLights(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer transition-all duration-1000"
                  style={{ background: `linear-gradient(to right, ${activeColors.accent} ${tableLights}%, rgba(255,255,255,0.1) ${tableLights}%)` }}
                />
              </div>

              {/* Dimmer: Reading Lights */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between text-xs tracking-widest text-gray-400 uppercase font-medium">
                  <span>Reading</span>
                  <span>{readingLights}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={readingLights} onChange={e => setReadingLights(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer transition-all duration-1000"
                  style={{ background: `linear-gradient(to right, ${activeColors.accent} ${readingLights}%, rgba(255,255,255,0.1) ${readingLights}%)` }}
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4 mt-4 pb-20">
                <TactileSwitch label="Ceiling Spots" initialState={true} />
                <TactileSwitch label="Bar Cabinet" initialState={false} />
                <TactileSwitch label="Bar Top" initialState={true} />
                <TactileSwitch label="Galley Prep" initialState={false} />
              </div>

            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
