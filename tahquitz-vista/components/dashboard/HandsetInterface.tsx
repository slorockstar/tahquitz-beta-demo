'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function HandsetInterface() {
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="w-full h-full bg-transparent flex items-center justify-between p-6 overflow-hidden">
      
      {/* Left: Transport Controls & Now Playing */}
      <div className="flex flex-col justify-between h-full w-2/3">
         
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded bg-white/10 flex-shrink-0 overflow-hidden relative shadow-[0_0_15px_rgba(255,255,255,0.1)]">
               <img src="/api/placeholder/64/64" alt="Album Art" className="w-full h-full object-cover opacity-80" />
            </div>
            <div>
               <h3 className="text-sm font-bold uppercase tracking-widest text-white">Miles Davis</h3>
               <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Kind of Blue (FLAC)</p>
            </div>
         </div>

         <div className="flex items-center gap-8 mt-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <polygon points="19 20 9 12 19 4 19 20"></polygon>
                 <line x1="5" y1="19" x2="5" y2="5"></line>
              </svg>
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                   <rect x="6" y="4" width="4" height="16"></rect>
                   <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                   <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <polygon points="5 4 15 12 5 20 5 4"></polygon>
                 <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </button>
         </div>

      </div>

      {/* Right: Headphone Volume & Call Button */}
      <div className="w-1/3 h-full border-l border-white/10 pl-6 flex flex-col justify-between items-center">
         
         {/* Vertical Volume Slider for Headphone Jack */}
         <div className="flex-1 w-12 bg-white/5 rounded-full relative flex flex-col items-center py-4 cursor-pointer group">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mb-2">
               <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
               <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
            </svg>
            
            <div className="flex-1 w-1 bg-white/10 rounded-full relative my-2 overflow-hidden">
               <div 
                 className="absolute bottom-0 w-full bg-white rounded-full transition-all"
                 style={{ height: `${volume}%` }}
               />
            </div>

            <span className="text-[10px] font-bold text-white">{volume}</span>
         </div>

         {/* Call Attendant */}
         <button className="w-full mt-4 py-3 bg-blue-900/30 border border-blue-500/30 text-blue-400 hover:bg-blue-900/50 rounded-xl flex items-center justify-center transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
               <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
         </button>

      </div>

    </div>
  );
}
