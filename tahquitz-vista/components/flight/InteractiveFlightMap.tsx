"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/app/providers';

export default function InteractiveFlightMap() {
  const { activeColors } = useTheme();

  return (
    <div className="w-full flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[400px] bg-[#050505]">
      
      {/* Flight Stats Overlay */}
      <div className="absolute top-6 left-6 z-20">
        <h2 className="text-3xl font-light text-white mb-1 drop-shadow-lg">41,000 <span className="text-lg text-gray-400">FT</span></h2>
        <p className="text-sm tracking-widest text-gray-300 uppercase">Ground Speed 540 Kts</p>
      </div>

      <div className="absolute top-6 right-6 z-20 text-right">
        <h2 className="text-3xl font-light text-white mb-1 drop-shadow-lg">15:45</h2>
        <p className="text-sm tracking-widest text-gray-300 uppercase">To Dubai (DXB)</p>
      </div>

      {/* Simulated Premium Google Earth / Flight Sim Background */}
      <div className="absolute inset-0 z-0">
        {/* Deep Tech Grid Background */}
        <div className="absolute inset-0 opacity-20" style={{ 
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          transform: 'perspective(1000px) rotateX(60deg) scale(2) translateY(-20%)',
          transformOrigin: 'top center'
        }} />

        {/* Minimalist Continents Outline (Abstract Map) */}
        <svg viewBox="0 0 1000 500" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] opacity-10" fill="none" stroke="white" strokeWidth="1">
           {/* Very rough abstract continent shapes for aesthetic */}
           <path d="M 150 150 Q 200 100 250 150 T 350 200 Q 400 300 300 400 Q 200 350 150 150 Z" />
           <path d="M 450 100 Q 550 50 650 150 T 700 300 Q 600 450 500 350 Z" />
           <path d="M 750 150 Q 800 100 850 200 T 900 350 Q 800 400 750 300 Z" />
        </svg>

        {/* Animated Flight Path: LAX to DXB */}
        <svg viewBox="0 0 1000 500" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full z-10">
          {/* Glowing Arc Path */}
          <path 
            id="flight-path"
            d="M 200 250 Q 500 50 800 250" 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="2" 
            strokeDasharray="5,5" 
          />
          <motion.path 
            d="M 200 250 Q 500 50 800 250" 
            fill="none" 
            stroke={activeColors.accent || '#FFF'} 
            strokeWidth="3" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 0.7 }}
            transition={{ duration: 3, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 10px ${activeColors.accent})` }}
          />

          {/* LAX Origin Marker */}
          <circle cx="200" cy="250" r="4" fill="#FFF" />
          <text x="180" y="270" fill="#FFF" fontSize="10" className="tracking-widest opacity-50">LAX</text>
          
          {/* DXB Destination Marker */}
          <circle cx="800" cy="250" r="4" fill="#FFF" />
          <text x="780" y="270" fill="#FFF" fontSize="10" className="tracking-widest opacity-50">DXB</text>

          {/* Animated Airplane */}
          <motion.g
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "70%" }}
            transition={{ duration: 3, ease: "easeOut" }}
            style={{ offsetPath: `path("M 200 250 Q 500 50 800 250")` }}
          >
            {/* Plane Icon */}
            <svg x="-12" y="-12" width="24" height="24" viewBox="0 0 24 24" fill="white" transform="rotate(45)">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
            {/* Pulse Aura */}
            <motion.circle 
              cx="0" cy="0" r="20" 
              fill="none" 
              stroke={activeColors.accent} 
              strokeWidth="1"
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.g>
        </svg>

      </div>

      {/* Dynamic Ambient Glow overlay */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 mix-blend-screen pointer-events-none transition-colors duration-1000"
        style={{ background: `radial-gradient(circle at center, ${activeColors.accent} 0%, transparent 70%)` }}
      />

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-30" />
    </div>
  );
}
