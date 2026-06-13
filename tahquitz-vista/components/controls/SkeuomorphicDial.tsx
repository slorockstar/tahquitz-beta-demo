"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useTheme } from '../../app/providers';

interface SkeuomorphicDialProps {
  initialValue?: number; // 0 to 100
  onChangeComplete?: (val: number) => void;
  label?: string;
}

export default function SkeuomorphicDial({ 
  initialValue = 0, 
  onChangeComplete,
  label = "DIMMER"
}: SkeuomorphicDialProps) {
  const { activeColors } = useTheme();
  
  // Optimistic UI state: The dial spins instantly on the screen
  const [currentValue, setCurrentValue] = useState(initialValue);
  
  const dialRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Framer motion values for smooth physics interpolation
  const rotation = useMotionValue((initialValue / 100) * 270 - 135); // Maps 0-100 to -135deg to +135deg

  // Whenever the rotation value changes, calculate the numeric 0-100 value locally
  useEffect(() => {
    return rotation.on("change", (latestRotation) => {
      // Convert -135 to 135 range back to 0 to 100
      let normalized = ((latestRotation + 135) / 270) * 100;
      // Clamp bounds
      if (normalized < 0) normalized = 0;
      if (normalized > 100) normalized = 100;
      
      setCurrentValue(Math.round(normalized));
    });
  }, [rotation]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    calculateRotation(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    calculateRotation(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      
      // FIRE THE PAYLOAD: We only send the network request ON RELEASE
      // This protects the ARINC 429 bus from being flooded by thousands of 
      // micro-updates while the passenger is simply dragging the dial.
      if (onChangeComplete) {
        onChangeComplete(currentValue);
      }
    }
  };

  const calculateRotation = (clientX: number, clientY: number) => {
    if (!dialRef.current) return;
    
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Offset angle to put 0 degrees at the bottom
    angle = angle + 90;
    
    // Normalize to -180 to 180
    if (angle > 180) angle -= 360;

    // Apply hardware-like rotation limits (-135 to 135 degrees)
    if (angle < -135) angle = -135;
    if (angle > 135) angle = 135;

    rotation.set(angle);
  };

  // Convert the 0-100 value into a dasharray length for the circular progress ring
  const strokeDasharray = `${(currentValue / 100) * 283} 283`;

  return (
    <div className="flex flex-col items-center select-none touch-none">
      <div 
        className="relative w-48 h-48 rounded-full flex items-center justify-center mb-6"
        style={{
          boxShadow: `inset 0 0 20px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5)`,
          background: `linear-gradient(145deg, #1A1A1A, #0A0A0A)`
        }}
      >
        {/* Progress Ring indicating current setting */}
        <svg className="absolute w-full h-full -rotate-[135deg]" viewBox="0 0 100 100">
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="4" 
            strokeDasharray="212 283" 
          />
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke={activeColors.accent} 
            strokeWidth="4" 
            strokeDasharray={strokeDasharray} 
            strokeLinecap="round"
            className="transition-all duration-75 ease-out"
          />
        </svg>

        {/* The tactile physical knob */}
        <motion.div
          ref={dialRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-32 h-32 rounded-full cursor-grab active:cursor-grabbing relative z-10"
          style={{
            rotate: rotation,
            background: `radial-gradient(circle at 50% 50%, #2A2A2A, #111)`,
            border: `1px solid rgba(255,255,255,0.1)`,
            boxShadow: `inset 0 2px 5px rgba(255,255,255,0.1), 0 10px 20px rgba(0,0,0,0.6)`
          }}
        >
          {/* Knob Indicator Divot */}
          <div 
            className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: activeColors.accent,
              boxShadow: `0 0 10px ${activeColors.accent}`
            }}
          />
          
          {/* Subtle metal brushing texture lines could go here */}
        </motion.div>
      </div>

      <div className="text-center">
        <div className="text-sm font-medium tracking-[0.2em] text-gray-400 mb-2">
          {label}
        </div>
        <div className="text-4xl font-light tabular-nums" style={{ color: activeColors.accent }}>
          {currentValue}<span className="text-xl text-gray-500">%</span>
        </div>
      </div>
    </div>
  );
}
