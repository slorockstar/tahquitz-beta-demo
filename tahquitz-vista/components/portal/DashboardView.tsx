'use client';

import React from 'react';
import { AircraftConfig } from '@/lib/config-store';

interface DashboardViewProps {
  fleet: AircraftConfig[];
  onSelectProject: (aircraft: AircraftConfig) => void;
  onNewProject: () => void;
}

export default function DashboardView({ fleet, onSelectProject, onNewProject }: DashboardViewProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 bg-green-900/30 border-green-500/30';
      case 'Development': return 'text-yellow-500 bg-yellow-900/30 border-yellow-500/30';
      case 'Validation': return 'text-orange-400 bg-orange-900/30 border-orange-500/30';
      case 'RFQ': return 'text-gray-400 bg-white/10 border-white/20';
      default: return 'text-white bg-white/10 border-white/20';
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-12 text-white overflow-y-auto">
      
      <div className="flex justify-between items-end mb-12">
        <div>
           <h1 className="text-3xl font-light tracking-widest uppercase mb-2">Fleet Lifecycle Manager</h1>
           <p className="text-gray-500 text-sm tracking-widest uppercase">Tahquitz Apex Configuration Portal</p>
        </div>
        <button 
          onClick={onNewProject}
          className="px-6 py-3 bg-white text-black font-bold tracking-widest uppercase text-xs rounded-xl hover:bg-gray-200 transition-colors shadow-lg"
        >
          + Upload New RFQ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {fleet.map((aircraft, i) => (
           <div 
             key={i}
             onClick={() => onSelectProject(aircraft)}
             className="bg-[#0a0a0a] border border-white/10 hover:border-white/30 rounded-3xl p-6 cursor-pointer transition-all hover:scale-[1.02] shadow-2xl relative overflow-hidden group"
           >
             {/* Abstract Livery bg */}
             <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ background: `linear-gradient(135deg, ${aircraft.liveryColor || '#fff'}, transparent)` }} />
             
             <div className="relative z-10">
               <div className="flex justify-between items-start mb-8">
                 <div>
                   <h2 className="text-xl font-bold tracking-widest mb-1">{aircraft.tailNumber}</h2>
                   <p className="text-xs text-gray-400 uppercase tracking-widest">{aircraft.aircraftModel}</p>
                 </div>
                 <div className={`px-3 py-1 rounded-full border text-[9px] font-bold tracking-widest uppercase ${getStatusColor(aircraft.status)}`}>
                   {aircraft.status}
                 </div>
               </div>

               <div className="mb-8">
                 <p className="text-sm font-medium">{aircraft.customerName}</p>
               </div>

               <div className="flex justify-between items-center pt-4 border-t border-white/10">
                 <span className="text-[10px] text-gray-500 tracking-widest uppercase">Software: {aircraft.softwareVersion}</span>
                 <span className="text-[10px] text-white tracking-widest uppercase flex items-center gap-1 group-hover:text-yellow-500 transition-colors">
                   Manage <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                 </span>
               </div>
             </div>
           </div>
         ))}
      </div>

    </div>
  );
}
