"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/providers';

type ShadeMode = 'Sheer' | 'Blackout';

export default function WindowShadeControl() {
  const { activeColors } = useTheme();
  const [mode, setMode] = useState<ShadeMode>('Sheer');
  
  // 0 is fully open (up), 100 is fully closed (down)
  const [sheerLevel, setSheerLevel] = useState(0);
  const [blackoutLevel, setBlackoutLevel] = useState(0);

  const currentLevel = mode === 'Sheer' ? sheerLevel : blackoutLevel;
  const setCurrentLevel = mode === 'Sheer' ? setSheerLevel : setBlackoutLevel;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentLevel(parseInt(e.target.value, 10));
  };

  const handleAllOpen = () => {
    setSheerLevel(0);
    setBlackoutLevel(0);
  };

  const handleAllClosed = () => {
    setSheerLevel(100);
    setBlackoutLevel(100);
  };

  return (
    <div className="flex flex-col items-center w-full h-full max-w-[300px] mx-auto bg-black/40 rounded-3xl p-6 border border-white/5 backdrop-blur-md shadow-2xl overflow-hidden">
      <h3 className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-3 w-full text-center shrink-0">Window Shades</h3>

      {/* Mode Toggle */}
      <div className="flex w-full bg-black/60 rounded-full p-1 mb-4 relative border border-white/5 shadow-inner shrink-0">
        <motion.div 
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-full shadow-sm"
          animate={{ x: mode === 'Sheer' ? 0 : '100%' }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        <button 
          onClick={() => setMode('Sheer')}
          className={`flex-1 text-[10px] font-bold tracking-widest uppercase py-2 z-10 transition-colors ${mode === 'Sheer' ? 'text-white' : 'text-gray-500'}`}
        >
          Sheer
        </button>
        <button 
          onClick={() => setMode('Blackout')}
          className={`flex-1 text-[10px] font-bold tracking-widest uppercase py-2 z-10 transition-colors ${mode === 'Blackout' ? 'text-white' : 'text-gray-500'}`}
        >
          Blackout
        </button>
      </div>

      {/* Vertical Slider Wrapper */}
      <div className="relative flex-1 w-16 bg-black/80 rounded-full flex justify-center items-center overflow-hidden border border-white/10 shadow-inner mb-4 group min-h-[100px]">
        
        {/* Dynamic Fill Background */}
        <div 
          className="absolute bottom-0 left-0 right-0 transition-all duration-300 opacity-20"
          style={{ 
            height: `${currentLevel}%`,
            backgroundColor: activeColors.accent
          }}
        />

        {/* Input Range (Rotated vertical) */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={currentLevel}
          onChange={handleSliderChange}
          className="absolute w-[200px] h-full opacity-0 cursor-pointer -rotate-90 origin-center z-20"
        />

        {/* Visual Track */}
        <div className="w-1 h-full bg-white/5 rounded-full relative z-10 pointer-events-none">
          {/* Visual Thumb */}
          <motion.div 
            className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/20 flex items-center justify-center pointer-events-none transition-colors"
            style={{ 
              top: `${currentLevel}%`, 
              marginTop: '-16px',
              backgroundColor: mode === 'Blackout' ? '#111' : '#333'
            }}
          >
            <div className="w-2 h-[2px] bg-white/30 rounded-full" />
          </motion.div>
        </div>
      </div>

      {/* Percentage Display */}
      <div className="text-xl font-light text-white mb-3 shrink-0">
        {currentLevel}<span className="text-xs text-gray-500">%</span>
        <div className="text-[9px] text-gray-500 tracking-widest uppercase mt-0.5 text-center">Closed</div>
      </div>

      {/* Master Controls */}
      <div className="flex w-full gap-2 mt-auto shrink-0">
        <button 
          onClick={handleAllOpen}
          className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-bold tracking-widest text-gray-300 uppercase transition-all active:scale-95"
        >
          Open
        </button>
        <button 
          onClick={handleAllClosed}
          className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-bold tracking-widest text-gray-300 uppercase transition-all active:scale-95"
        >
          Closed
        </button>
      </div>

    </div>
  );
}
