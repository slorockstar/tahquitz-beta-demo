'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AircraftLOPA from '../layout/AircraftLOPA';

interface CrewTerminalLayoutProps {
  onSelectZone: (id: string, name: string) => void;
}

export default function CrewTerminalLayout({ onSelectZone }: CrewTerminalLayoutProps) {
  const [ssid, setSsid] = useState('TAHQUITZ_VVIP_5G');
  const [password, setPassword] = useState('Kovach2026!');

  return (
    <div className="w-full h-full flex overflow-hidden">
      
      {/* Left Sidebar: Master Controls & Maintenance */}
      <div className="w-80 h-full border-r border-white/10 bg-black/50 backdrop-blur-xl flex flex-col p-6 overflow-y-auto">
         
         <div className="mb-8">
           <h2 className="text-xs text-red-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             Master Overrides
           </h2>
           <p className="text-[10px] text-gray-500 uppercase tracking-widest">Global Aircraft Control</p>
         </div>

         <div className="flex flex-col gap-4 mb-10">
           <button className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-bold tracking-widest uppercase transition-all">
             Boarding Lights On
           </button>
           <button className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-bold tracking-widest uppercase transition-all">
             All Shades Down
           </button>
           <button className="w-full py-4 bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-900/50 rounded-xl text-sm font-bold tracking-widest uppercase transition-all">
             Emergency Purge
           </button>
         </div>

         <div className="mb-6">
           <h2 className="text-xs text-white font-bold uppercase tracking-widest mb-1">Maintenance & Network</h2>
         </div>

         <div className="flex flex-col gap-6">
            
            {/* SSID Config */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 block">Cabin Wi-Fi SSID</label>
              <input 
                type="text" 
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-white/30"
              />
              <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 block">Wi-Fi Password</label>
              <input 
                type="text" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
              />
              <button className="w-full mt-3 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-lg">Save Network</button>
            </div>

            {/* LRU Status */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
               <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-4">LRU Status Matrix</h3>
               <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center">
                   <span className="text-xs uppercase tracking-widest">CMU (Cabin Mgmt)</span>
                   <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-xs uppercase tracking-widest">SCU (Shade Ctrl)</span>
                   <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-xs uppercase tracking-widest">MPEG Server 1</span>
                   <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-xs uppercase tracking-widest">Amp (Zone 3)</span>
                   <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]" />
                 </div>
               </div>
            </div>

         </div>

      </div>

      {/* Right Side: Full LOPA View */}
      <div className="flex-1 relative overflow-y-auto">
        <AircraftLOPA onSelectZone={onSelectZone} />
      </div>

    </div>
  );
}
