'use client';

import React, { useState } from 'react';
import { AircraftConfig } from '@/lib/config-store';
import DeviceSimulator from './DeviceSimulator';

interface DevelopmentViewProps {
  aircraft: AircraftConfig;
  onBack: () => void;
  onApprove: () => void;
}

export default function DevelopmentView({ aircraft, onBack, onApprove }: DevelopmentViewProps) {
  const [accentColor, setAccentColor] = useState(aircraft.liveryColor || '#D4AF37');
  
  return (
    <div className="w-full h-full flex flex-col text-white bg-black">
      
      {/* Top Header */}
      <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#0a0a0a]">
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
           <div className="px-4 py-2 bg-yellow-900/30 text-yellow-500 border border-yellow-500/30 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
             In Development
           </div>
           <button 
             onClick={onApprove}
             className="px-6 py-2 bg-white text-black font-bold tracking-widest uppercase text-xs rounded-xl hover:bg-gray-200 transition-colors"
           >
             Approve GUI & Create ATP
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Skinning & Customization Tools */}
        <div className="w-[400px] border-r border-white/5 bg-[#0a0a0a] p-8 overflow-y-auto flex flex-col gap-8">
           
           <div>
             <h3 className="text-sm font-bold tracking-widest uppercase text-gray-400 mb-4">Phase 2: GUI Skinning</h3>
             <p className="text-xs text-gray-500 mb-6">Live customize the Master GUI. Changes propagate instantly to the Device Simulator.</p>
           </div>

           {/* Brand Customization */}
           <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-4">Brand Identity</h4>
              
              <div className="mb-4">
                 <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block">Upload Logo (SVG)</label>
                 <div className="w-full h-24 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all">
                    <span className="text-xs font-medium text-gray-500">Drag & Drop Logo</span>
                 </div>
              </div>

              <div>
                 <label className="text-xs text-gray-400 uppercase tracking-widest mb-2 block flex justify-between">
                   <span>Accent Color</span>
                   <span>{accentColor}</span>
                 </label>
                 <div className="flex items-center gap-4">
                   <input 
                     type="color" 
                     value={accentColor}
                     onChange={(e) => setAccentColor(e.target.value)}
                     className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                   />
                   <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                 </div>
              </div>
           </div>

           {/* LOPA Room Editor */}
           <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-4">LOPA Zone Renaming</h4>
              <p className="text-xs text-gray-500 mb-4">Customize the names of zones mapped from the RFQ.</p>
              
              <div className="flex flex-col gap-3">
                 {aircraft.zones.slice(0, 4).map(z => (
                   <div key={z.id}>
                     <label className="text-[10px] uppercase text-gray-500 tracking-widest mb-1 block">Zone {z.id}</label>
                     <input 
                       type="text" 
                       defaultValue={z.id.replace('_', ' ').toUpperCase()} 
                       className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                     />
                   </div>
                 ))}
              </div>
           </div>

        </div>

        {/* Right Side: Interactive Device Simulator */}
        <div className="flex-1 relative">
           <DeviceSimulator themeMode="dark" accentColor={accentColor} />
        </div>

      </div>

    </div>
  );
}
