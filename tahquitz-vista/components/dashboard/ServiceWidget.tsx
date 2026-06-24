'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/providers';

export default function ServiceWidget() {
  const { activeColors } = useTheme();
  const [called, setCalled] = useState(false);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 select-none">
      <h3 className="text-sm tracking-widest text-gray-400 uppercase font-medium absolute top-6 left-6">Cabin Crew</h3>
      
      <button 
        onClick={() => setCalled(!called)}
        className="relative group flex items-center justify-center mt-4"
      >
        <div 
          className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-500 ${called ? 'opacity-50' : 'opacity-0 group-hover:opacity-20'}`}
          style={{ backgroundColor: activeColors.accent || '#D4AF37' }}
        />
        <div 
          className="w-24 h-24 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 relative overflow-hidden bg-black/40 backdrop-blur-sm"
          style={{ borderColor: called ? (activeColors.accent || '#D4AF37') : 'rgba(255,255,255,0.2)' }}
        >
           <span className="text-3xl relative z-10">{called ? '✨' : '🛎️'}</span>
        </div>
      </button>

      <div className="mt-6 text-center h-8">
         <p className={`text-sm uppercase tracking-widest font-semibold transition-colors duration-300 ${called ? 'text-white' : 'text-gray-500'}`}>
           {called ? 'Crew En Route' : 'Call Attendant'}
         </p>
      </div>
    </div>
  );
}
