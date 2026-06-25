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
  const [pushZone, setPushZone] = useState('master_suite');
  const [pushMedia, setPushMedia] = useState('velocity_rising');

  return (
    <div className="w-full h-full flex overflow-hidden">
      
      {/* Left Sidebar: Massive Crew Data Matrix */}
      <div className="w-[420px] h-full border-r border-white/10 bg-black/80 backdrop-blur-3xl flex flex-col p-6 overflow-y-auto">
         
         <div className="mb-8">
           <h2 className="text-sm text-red-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             Master Overrides
           </h2>
           <p className="text-[10px] text-gray-500 uppercase tracking-widest">Global Aircraft Control</p>
         </div>

         <div className="grid grid-cols-2 gap-3 mb-10">
           <button className="py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all">
             Boarding Lights
           </button>
           <button className="py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all">
             All Shades Down
           </button>
           <button className="col-span-2 py-3 bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-900/50 rounded-xl text-xs font-bold tracking-widest uppercase transition-all">
             Emergency Purge
           </button>
         </div>

         {/* Active Crew Calls */}
         <div className="mb-10">
           <h2 className="text-sm text-white font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
             Active Crew Calls
             <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">1</span>
           </h2>
           <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                 <div>
                   <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Master Suite</p>
                   <p className="text-[10px] text-gray-400 mt-1">Passenger requesting beverage service.</p>
                 </div>
                 <span className="text-[10px] text-blue-400 font-mono">02:14</span>
              </div>
              <button className="w-full py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded text-[10px] font-bold uppercase tracking-widest transition-colors">
                 Acknowledge & Clear
              </button>
           </div>
         </div>

         {/* Cabin Media Matrix */}
         <div className="mb-10">
           <h2 className="text-sm text-white font-bold uppercase tracking-widest mb-4">Cabin Media Matrix</h2>
           <div className="flex flex-col gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                 <div>
                   <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Main Lounge</p>
                   <p className="text-xs font-bold text-white uppercase tracking-widest truncate max-w-[200px]">Velocity Rising (2024)</p>
                 </div>
                 <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                 </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center">
                 <div>
                   <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Master Suite</p>
                   <p className="text-xs font-bold text-white uppercase tracking-widest truncate max-w-[200px]">Spotify: Miles Davis</p>
                 </div>
                 <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                 </span>
              </div>
           </div>
         </div>

         {/* Zone Content Pushing */}
         <div className="mb-10">
           <h2 className="text-sm text-white font-bold uppercase tracking-widest mb-4">Push Content to Zone</h2>
           <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 block">Target Zone</label>
                <select 
                  value={pushZone}
                  onChange={(e) => setPushZone(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="main_lounge">Main Lounge</option>
                  <option value="master_suite">Master Suite</option>
                  <option value="galley">Galley</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 block">Media Asset</label>
                <select 
                  value={pushMedia}
                  onChange={(e) => setPushMedia(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="velocity_rising">Velocity Rising (Movie)</option>
                  <option value="dune">Dune (Movie)</option>
                  <option value="safety_briefing">Safety Briefing (Forced)</option>
                </select>
              </div>
              <button className="w-full mt-2 py-3 bg-white text-black hover:bg-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"></path><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                 Force Play Media
              </button>
           </div>
         </div>

         {/* Maintenance & Network */}
         <div className="mb-6">
           <h2 className="text-sm text-white font-bold uppercase tracking-widest mb-4">Maintenance & Network</h2>
           <div className="flex flex-col gap-4">
              
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 block">Cabin Wi-Fi SSID</label>
                <input 
                  type="text" 
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white mb-3 focus:outline-none focus:border-white/30"
                />
                <button className="w-full py-2 bg-white/10 text-white hover:bg-white/20 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors">Save Network</button>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                 <h3 className="text-[10px] text-gray-400 uppercase tracking-widest mb-4">LRU Status Matrix</h3>
                 <div className="flex flex-col gap-3">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] uppercase tracking-widest">CMU (Cabin Mgmt)</span>
                     <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] uppercase tracking-widest">MPEG Server 1</span>
                     <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] uppercase tracking-widest">Amp (Zone 3)</span>
                     <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]" />
                   </div>
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
