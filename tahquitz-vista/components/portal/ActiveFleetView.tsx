'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AircraftConfig } from '@/lib/config-store';
import TactileSwitch from '@/components/controls/TactileSwitch';

interface ActiveFleetViewProps {
  aircraft: AircraftConfig;
  onBack: () => void;
}

export default function ActiveFleetView({ aircraft, onBack }: ActiveFleetViewProps) {
  const [activeTab, setActiveTab] = useState<'CSDB' | 'Media' | 'Features'>('Media');

  return (
    <div className="w-full h-full flex flex-col text-white">
      
      {/* Top Header */}
      <div className="flex items-center justify-between p-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <line x1="19" y1="12" x2="5" y2="12"></line>
               <polyline points="12 19 5 12 12 5"></polyline>
             </svg>
          </button>
          <div>
            <h1 className="text-2xl font-light tracking-widest">{aircraft.customerName}</h1>
            <p className="text-sm text-gray-500 uppercase tracking-widest">{aircraft.aircraftModel} / {aircraft.tailNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-green-900/30 text-green-400 border border-green-500/30 rounded-full text-xs font-bold tracking-widest uppercase">
             {aircraft.status}
           </div>
           <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
             {['CSDB', 'Media', 'Features'].map(tab => (
               <button 
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`px-6 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${
                   activeTab === tab ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
                 }`}
               >
                 {tab}
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">

        {/* The Aircraft Silhouette Header (Inspired by Nice) */}
        <div className="w-full h-64 mb-8 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden flex items-center justify-center">
           {/* Abstract Livery Visualization */}
           <div className="absolute inset-0 z-0 opacity-20" style={{ background: `linear-gradient(135deg, ${aircraft.liveryColor || '#D4AF37'}, transparent)` }} />
           
           <svg viewBox="0 0 800 200" className="w-[800px] z-10" fill="none" stroke="white" strokeWidth="2">
             {/* Simplified Airplane Silhouette */}
             <path d="M 150 100 L 300 100 L 400 50 L 500 100 L 700 100 Q 750 100 750 80 L 750 60 L 700 80 L 150 80 Q 100 80 100 90 Q 100 100 150 100 Z" fill={aircraft.liveryColor || "rgba(255,255,255,0.1)"} />
             <path d="M 400 100 L 450 150 L 550 150 L 500 100 Z" fill="rgba(255,255,255,0.05)" />
           </svg>

           <div className="absolute bottom-6 left-6">
              <p className="text-xs tracking-widest text-gray-400 uppercase">Custom Livery Rendering</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: aircraft.liveryColor || '#D4AF37' }} />
                <span className="text-sm">{aircraft.liveryColor || 'Default Gold'}</span>
              </div>
           </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'CSDB' && (
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
               <h3 className="text-lg font-light mb-6 tracking-widest uppercase">Software Information</h3>
               
               <div className="flex justify-between items-center py-4 border-b border-white/5">
                 <span className="text-sm text-gray-400">Current CSDB Version</span>
                 <span className="text-sm font-bold text-green-400">{aircraft.softwareVersion}</span>
               </div>
               <div className="flex justify-between items-center py-4 border-b border-white/5">
                 <span className="text-sm text-gray-400">Offered Update</span>
                 <span className="text-sm font-bold text-yellow-500">SCDP1-02-B / RC03</span>
               </div>
               <div className="flex justify-between items-center py-4 border-b border-white/5">
                 <span className="text-sm text-gray-400">Sync Status</span>
                 <span className="text-sm font-bold text-gray-300">Idle (Fully Synced)</span>
               </div>

               <button className="w-full mt-8 py-4 bg-white text-black font-bold tracking-widest uppercase text-xs rounded-xl hover:bg-gray-200 transition-colors">
                 Manage Configuration (OTA)
               </button>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
               <h3 className="text-lg font-light mb-6 tracking-widest uppercase">Hardware Zones</h3>
               <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                 {aircraft.zones.map(z => (
                   <div key={z.id} className="flex justify-between items-center p-4 bg-black/50 rounded-xl border border-white/5">
                     <span className="text-sm font-bold tracking-widest uppercase">{z.id.replace('_', ' ')}</span>
                     <span className="text-xs text-green-500">Online</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'Media' && (
          <div className="flex flex-col gap-8">
             <div className="flex justify-between items-end">
               <div>
                 <h2 className="text-2xl font-light tracking-widest uppercase mb-1">Content Manager</h2>
                 <p className="text-sm text-gray-400">Tahquitz Media Pipeline (Powered by Spafax Integration)</p>
               </div>
               <button className="px-6 py-3 bg-[#8A2BE2] hover:bg-[#9370DB] text-white font-bold tracking-widest uppercase text-xs rounded-xl transition-colors shadow-[0_0_20px_rgba(138,43,226,0.4)]">
                 + Create New Deployment Cycle
               </button>
             </div>

             {/* Spafax-Inspired Analytics Row */}
             <div className="grid grid-cols-2 gap-8">
                
                {/* Genres Chart Mock */}
                <div className="bg-[#f8f9fa] text-black rounded-3xl p-8 shadow-xl relative overflow-hidden">
                   <div className="flex justify-between items-start mb-8">
                     <h3 className="text-xl font-medium">Genres</h3>
                     <div className="text-right text-xs text-gray-500 font-medium">
                       <p>Total titles: 208</p>
                       <p>Cycle: May 2026</p>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-between">
                     {/* Fake Pie Chart */}
                     <div className="w-48 h-48 rounded-full bg-[conic-gradient(#6b46c1_0%_32%,#805ad5_32%_52%,#9f7aea_52%_61%,#b794f4_61%_68%,#d6bcfa_68%_75%,#e9d8fd_75%_80%,#faf5ff_80%_83%,#4c1d95_83%_100%)] shadow-lg shadow-purple-500/20 transform rotate-45" />
                     
                     {/* Legend */}
                     <div className="flex flex-col gap-2">
                       <div className="flex justify-between gap-8 text-xs font-medium"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#6b46c1]"/> Drama</span> <span>32.4%</span></div>
                       <div className="flex justify-between gap-8 text-xs font-medium"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#805ad5]"/> Comedy</span> <span>20.2%</span></div>
                       <div className="flex justify-between gap-8 text-xs font-medium"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#9f7aea]"/> Action</span> <span>8.7%</span></div>
                       <div className="flex justify-between gap-8 text-xs font-medium"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#b794f4]"/> Thriller</span> <span>7.4%</span></div>
                       <div className="flex justify-between gap-8 text-xs font-medium"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#d6bcfa]"/> Romance</span> <span>7.1%</span></div>
                     </div>
                   </div>
                </div>

                {/* Distributor Chart Mock */}
                <div className="bg-[#f8f9fa] text-black rounded-3xl p-8 shadow-xl relative overflow-hidden">
                   <div className="flex justify-between items-start mb-8">
                     <h3 className="text-xl font-medium">Distributor</h3>
                     <div className="text-right text-xs text-gray-500 font-medium">
                       <p>Total titles: 272</p>
                       <p>Cycle: May 2026</p>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-between">
                     {/* Fake Pie Chart */}
                     <div className="w-48 h-48 rounded-full bg-[conic-gradient(#3182ce_0%_15%,#2b6cb0_15%_27%,#2c5282_27%_37%,#2a4365_37%_46%,#6b46c1_46%_53%,#805ad5_53%_58%,#9f7aea_58%_61%,#b794f4_61%_64%,#4c1d95_64%_100%)] shadow-lg shadow-blue-500/20 transform rotate-90" />
                     
                     {/* Legend */}
                     <div className="flex flex-col gap-2">
                       <div className="flex justify-between gap-8 text-xs font-medium"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#3182ce]"/> Universal</span> <span>13.4%</span></div>
                       <div className="flex justify-between gap-8 text-xs font-medium"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#2b6cb0]"/> Paramount</span> <span>12.1%</span></div>
                       <div className="flex justify-between gap-8 text-xs font-medium"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#2c5282]"/> Warner Bros</span> <span>9.9%</span></div>
                       <div className="flex justify-between gap-8 text-xs font-medium"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#2a4365]"/> Sony Pictures</span> <span>9.6%</span></div>
                       <div className="flex justify-between gap-8 text-xs font-medium"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#6b46c1]"/> Buena Vista</span> <span>7.0%</span></div>
                     </div>
                   </div>
                </div>

             </div>
             
             {/* Scheduled Deployments */}
             <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mt-4">
                <h3 className="text-lg font-light mb-6 tracking-widest uppercase">Scheduled Release Cycles</h3>
                <div className="flex items-center justify-between p-6 bg-black/50 border border-white/5 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-white tracking-widest uppercase">July 2026 Summer Blockbusters</h4>
                    <p className="text-sm text-gray-400 mt-1">45 New Movies, 120 Music Albums, UI Winter Theme Removal</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest">Pending Activation</p>
                    <p className="text-sm text-white mt-1">Scheduled for: 01-JUL-2026 00:00 UTC</p>
                  </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
