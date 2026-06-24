"use client";

import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { useTheme } from '@/app/providers';

export default function InteractiveFlightMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeColors } = useTheme();

  useEffect(() => {
    let phi = 0;
    
    if (!canvasRef.current) return;

    // Convert our hex accent color to RGB for the globe
    const hexToRgb = (hex: string): [number, number, number] => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return [r, g, b];
    };
    
    const glowColor: [number, number, number] = activeColors.accent ? hexToRgb(activeColors.accent) : [1, 0.84, 0];

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 800,
      height: 800,
      phi: 0,
      theta: 0.3,
      dark: 1, // 1 is dark mode
      diffuse: 1.2,
      mapSamples: 20000,
      mapBrightness: 4,
      baseColor: [0.3, 0.3, 0.3], // Dark mode gray base allows white dots to contrast properly
      markerColor: [1, 1, 1], // Pure white markers for cities
      glowColor: glowColor,
      markers: [
        // Dubai DXB
        { location: [25.2532, 55.3657], size: 0.08 },
        // LAX
        { location: [33.9416, -118.4085], size: 0.05 }
      ],
      onRender: (state: Record<string, any>) => {
        // Automatically rotate slowly
        state.phi = phi;
        phi += 0.003;
      }
    } as any);

    return () => {
      globe.destroy();
    };
  }, [activeColors]);

  return (
    <div className="w-full flex flex-col items-center justify-center relative overflow-hidden h-full min-h-[400px]">
      
      {/* Flight Stats Overlay */}
      <div className="absolute top-6 left-6 z-10">
        <h2 className="text-3xl font-light text-white mb-1 drop-shadow-lg">41,000 <span className="text-lg text-gray-400">FT</span></h2>
        <p className="text-sm tracking-widest text-gray-300 uppercase">Ground Speed 540 Kts</p>
      </div>

      <div className="absolute top-6 right-6 z-10 text-right">
        <h2 className="text-3xl font-light text-white mb-1 drop-shadow-lg">15:45</h2>
        <p className="text-sm tracking-widest text-gray-300 uppercase">To Dubai</p>
      </div>

      {/* 3D WebGL Globe */}
      <div className="absolute inset-0 flex items-center justify-center opacity-90 mix-blend-screen pointer-events-auto cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          style={{ width: 400, height: 400 }}
        />
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
    </div>
  );
}
