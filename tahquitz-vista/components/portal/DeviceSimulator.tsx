'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type DeviceType = 'crew_terminal' | 'tablet' | 'phone' | 'handset' | 'wall_controller';

interface DeviceSimulatorProps {
  themeMode: 'light' | 'dark';
  accentColor: string;
}

export default function DeviceSimulator({ themeMode, accentColor }: DeviceSimulatorProps) {
  const [activeDevice, setActiveDevice] = useState<DeviceType>('tablet');

  const devices: { id: DeviceType; name: string; width: number; height: number; scale: number; role: string }[] = [
    { id: 'crew_terminal', name: 'Crew Terminal', width: 1024, height: 768, scale: 0.7, role: 'crew' },
    { id: 'tablet', name: 'Passenger Tablet', width: 1024, height: 768, scale: 0.7, role: 'passenger' },
    { id: 'phone', name: 'Passenger Phone', width: 390, height: 844, scale: 0.8, role: 'passenger' },
    { id: 'handset', name: 'Passenger Handset', width: 320, height: 600, scale: 0.9, role: 'passenger' },
    { id: 'wall_controller', name: '4.3" Wall Controller', width: 480, height: 320, scale: 1.0, role: 'passenger' },
  ];

  const current = devices.find(d => d.id === activeDevice) || devices[1];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] rounded-3xl border border-white/10 overflow-hidden relative p-8">
      
      {/* Device Selector */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 bg-white/5 backdrop-blur-md p-2 rounded-full border border-white/10 z-20">
        {devices.map(device => (
          <button
            key={device.id}
            onClick={() => setActiveDevice(device.id)}
            className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors ${
              activeDevice === device.id ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {device.name}
          </button>
        ))}
      </div>

      {/* Simulator Stage */}
      <div className="flex-1 w-full flex items-center justify-center relative mt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDevice}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: current.scale }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative"
            style={{ 
              width: current.width, 
              height: current.height,
            }}
          >
            {/* Device Hardware Frame */}
            <div className={`absolute inset-0 border-[12px] border-[#1a1a1a] rounded-[2rem] shadow-2xl overflow-hidden ${
              activeDevice === 'wall_controller' ? 'border-[#333]' : ''
            }`}>
              {/* Fake Camera / Notch */}
              {(activeDevice === 'phone' || activeDevice === 'tablet') && (
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 bg-[#1a1a1a] z-50 ${
                  activeDevice === 'phone' ? 'w-32 h-6 rounded-b-xl' : 'w-2 h-2 mt-2 rounded-full'
                }`} />
              )}
              
              {/* The Iframe to the actual app */}
              <div className="w-full h-full bg-black relative">
                {/* We pass URL parameters so the app knows it's being simulated and what role it has */}
                <iframe 
                  src={`/?simulate=true&role=${current.role}&device=${activeDevice}&accent=${encodeURIComponent(accentColor)}`}
                  className="w-full h-full border-0"
                  title="Tahquitz GUI Simulator"
                />
                
                {/* Overlay to intercept clicks if we want it to be purely visual, but let's allow interaction! */}
                {/* <div className="absolute inset-0 pointer-events-none" /> */}
              </div>
            </div>
            
            {/* Device Label */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center w-full">
               <p className="text-white text-sm font-medium tracking-widest uppercase">{current.name}</p>
               <p className="text-gray-500 text-[10px] tracking-widest uppercase mt-1">Resolution: {current.width}x{current.height} • Role: {current.role}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
