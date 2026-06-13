"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/providers';

interface TactileSwitchProps {
  initialState?: boolean;
  label?: string;
  onToggle?: (state: boolean) => void;
}

export default function TactileSwitch({ initialState = false, label, onToggle }: TactileSwitchProps) {
  const { activeColors } = useTheme();
  const [isOn, setIsOn] = useState(initialState);

  const toggleSwitch = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="w-16 h-28 rounded-full relative p-2 cursor-pointer transition-colors duration-300"
        style={{
          boxShadow: `inset 0 10px 20px rgba(0,0,0,0.8)`,
          background: isOn ? `${activeColors.accent}30` : '#111' // 30 hex opacity
        }}
        onClick={toggleSwitch}
      >
        <motion.div
          layout
          initial={false}
          animate={{
            y: isOn ? 0 : 48, // Move down when off
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="w-12 h-12 rounded-full absolute top-2 left-2 z-10"
          style={{
            background: `radial-gradient(circle at 50% 20%, #444, #111)`,
            border: `1px solid rgba(255,255,255,0.1)`,
            boxShadow: `0 5px 15px rgba(0,0,0,0.8), inset 0 2px 2px rgba(255,255,255,0.2)`
          }}
        >
          {/* LED Indicator on the thumb */}
          <div 
            className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full transition-colors duration-300"
            style={{ 
              backgroundColor: isOn ? activeColors.accent : '#333',
              boxShadow: isOn ? `0 0 8px ${activeColors.accent}` : 'none'
            }}
          />
        </motion.div>
      </div>

      {label && (
        <span className="text-xs font-medium tracking-[0.2em] text-gray-500 uppercase">
          {label}
        </span>
      )}
    </div>
  );
}
