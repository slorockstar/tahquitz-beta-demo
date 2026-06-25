'use client';

import React, { useState } from 'react';
import TactileSwitch from '../controls/TactileSwitch';

interface WallControllerInterfaceProps {
  zoneName: string;
}

export default function WallControllerInterface({ zoneName }: WallControllerInterfaceProps) {
  const [lightsOn, setLightsOn] = useState(true);
  const [shadesOpen, setShadesOpen] = useState(false);
  const [monitorOn, setMonitorOn] = useState(true);
  const [temperature, setTemperature] = useState(72);

  return (
    <div className="w-full h-full bg-black flex flex-col p-6 overflow-hidden text-white relative">
      
      {/* Background glow based on active state */}
      <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 ${lightsOn ? 'bg-white' : 'bg-transparent'}`} />

      {/* Header */}
      <div className="flex justify-between items-end mb-6 relative z-10">
         <div>
           <h2 className="text-xl font-light tracking-widest uppercase">{zoneName}</h2>
           <p className="text-[10px] text-gray-500 tracking-widest uppercase mt-1">Environmental Snapshot</p>
         </div>
         <div className="text-right">
           <h3 className="text-2xl font-light">{temperature}°</h3>
           <p className="text-[10px] text-gray-500 tracking-widest uppercase mt-1">Climate</p>
         </div>
      </div>

      {/* Dense Toggle Grid */}
      <div className="flex-1 grid grid-cols-2 gap-4 relative z-10">
         
         {/* Master Lights Toggle */}
         <div 
           onClick={() => setLightsOn(!lightsOn)}
           className={`rounded-2xl border p-4 flex flex-col justify-between cursor-pointer transition-colors ${
             lightsOn ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/5'
           }`}
         >
            <div className="flex justify-between items-start">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={lightsOn ? 'text-yellow-500' : 'text-gray-500'}>
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <div className={`w-3 h-3 rounded-full ${lightsOn ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-gray-700'}`} />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest">Master Lights</h4>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{lightsOn ? 'ON (Boarding)' : 'OFF'}</p>
            </div>
         </div>

         {/* Master Shades Toggle */}
         <div 
           onClick={() => setShadesOpen(!shadesOpen)}
           className={`rounded-2xl border p-4 flex flex-col justify-between cursor-pointer transition-colors ${
             shadesOpen ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/5'
           }`}
         >
            <div className="flex justify-between items-start">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={shadesOpen ? 'text-blue-400' : 'text-gray-500'}>
                 <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                 <line x1="4" y1="12" x2="20" y2="12"></line>
              </svg>
              <div className={`w-3 h-3 rounded-full ${shadesOpen ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'bg-gray-700'}`} />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest">All Shades</h4>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{shadesOpen ? 'OPEN' : 'CLOSED'}</p>
            </div>
         </div>

         {/* Monitor Power Toggle */}
         <div 
           onClick={() => setMonitorOn(!monitorOn)}
           className={`rounded-2xl border p-4 flex flex-col justify-between cursor-pointer transition-colors ${
             monitorOn ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/5'
           }`}
         >
            <div className="flex justify-between items-start">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={monitorOn ? 'text-green-400' : 'text-gray-500'}>
                 <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                 <line x1="8" y1="21" x2="16" y2="21"></line>
                 <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <div className={`w-3 h-3 rounded-full ${monitorOn ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-gray-700'}`} />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest">Zone Monitor</h4>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{monitorOn ? 'POWER ON' : 'STANDBY'}</p>
            </div>
         </div>

         {/* Call Attendant */}
         <div className="rounded-2xl bg-blue-900/30 border border-blue-500/30 p-4 flex flex-col justify-between cursor-pointer hover:bg-blue-900/50 transition-colors">
            <div className="flex justify-between items-start">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                 <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                 <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Call Attendant</h4>
            </div>
         </div>

      </div>

    </div>
  );
}
