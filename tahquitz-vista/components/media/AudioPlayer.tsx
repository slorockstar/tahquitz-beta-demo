'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/providers';

export default function AudioPlayer() {
  const { activeColors } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [activeEq, setActiveEq] = useState('Acoustic');
  
  // Dummy track data
  const tracks = [
    { title: "Fly Me to the Moon", artist: "Frank Sinatra", album: "It Might as Well Be Swing" },
    { title: "Come Fly With Me", artist: "Frank Sinatra", album: "Come Fly With Me" },
  ];
  
  const currentTrack = tracks[0];

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 relative overflow-hidden">
      
      {/* Decorative Blur Background */}
      <div 
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: activeColors.accent || '#D4AF37' }}
      />

      <div className="flex justify-between items-start z-10">
        <h3 className="text-xs font-medium tracking-widest text-gray-400 uppercase">Cabin Audio</h3>
        <span className="text-[10px] tracking-widest uppercase text-white/50 border border-white/10 px-2 py-1 rounded-full">High-Fidelity Speakers</span>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 z-10 py-4">
         <div className="w-full text-center mb-6">
            <h4 className="text-2xl font-light text-white mb-1">{currentTrack.title}</h4>
            <p className="text-sm text-gray-400">{currentTrack.artist}</p>
         </div>

         {/* Playback Controls */}
         <div className="flex items-center gap-6">
            <button className="text-white/50 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                <line x1="5" y1="19" x2="5" y2="5"></line>
              </svg>
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 rounded-full flex items-center justify-center text-black transition-transform hover:scale-105"
              style={{ backgroundColor: activeColors.accent || '#FFF' }}
            >
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="ml-1">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>
            <button className="text-white/50 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </button>
         </div>
      </div>

      <div className="flex flex-col gap-4 z-10 mt-auto">
        {/* EQ Presets */}
        <div className="flex justify-between items-center gap-2">
           {['Acoustic', 'Cinema', 'Bass Boost'].map(eq => (
             <button 
                key={eq}
                onClick={() => setActiveEq(eq)}
                className={`flex-1 py-2 text-[9px] uppercase tracking-widest rounded-lg border transition-colors ${activeEq === eq ? 'text-black font-bold border-transparent' : 'text-gray-400 border-white/10 hover:border-white/30 bg-white/5'}`}
                style={{ backgroundColor: activeEq === eq ? activeColors.accent : undefined }}
             >
               {eq}
             </button>
           ))}
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-4 w-full">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 shrink-0">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          </svg>
          <div className="flex-1 h-1 bg-white/10 rounded-full relative">
            <div 
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-300" 
              style={{ width: `${volume}%`, backgroundColor: activeColors.accent || '#FFF' }}
            />
            <input 
              type="range" 
              min="0" max="100" 
              value={volume} 
              onChange={(e) => setVolume(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
