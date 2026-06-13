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
  const { activeColors } = useTheme();

  // Mock state for dimmers
  const [tableLights, setTableLights] = useState(80);
  const [readingLights, setReadingLights] = useState(0);

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
              <button className="w-full mt-2 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-xs font-bold tracking-widest text-[#B39B5E] uppercase transition-all flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12V7H5a2 2 0 010-4h14v4" />
                </svg>
                Light Scenarios
              </button>
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
                  className="w-full h-1 bg-white/10 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
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
                  className="w-full h-1 bg-white/10 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                  style={{ background: `linear-gradient(to right, ${activeColors.accent} ${readingLights}%, rgba(255,255,255,0.1) ${readingLights}%)` }}
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-4 mt-4">
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
