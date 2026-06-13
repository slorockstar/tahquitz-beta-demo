"use client";

import React, { useState } from 'react';
import { useTheme } from '@/app/providers';

interface LightingControlProps {
  label: string;
}

export default function LightingControl({ label }: LightingControlProps) {
  const { activeColors } = useTheme();
  const [isOn, setIsOn] = useState(true);
  const [brightness, setBrightness] = useState(80);
  const [hue, setHue] = useState(200); // 0-360
  const [saturation, setSaturation] = useState(100);

  // Convert HSL to Hex for sending to ARINC/Aircraft (mock logic)
  const emitColorChange = (h: number, s: number, b: number) => {
    // In production, this would convert to RGBW channels and send via WebSocket
    console.log(`[Lighting] ${label} updated: Hue=${h}, Sat=${s}, Bright=${b}`);
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setHue(val);
    emitColorChange(val, saturation, brightness);
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setBrightness(val);
    emitColorChange(hue, saturation, val);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium tracking-widest text-gray-400 uppercase">{label}</h3>
        
        {/* Simple Power Toggle */}
        <button 
          onClick={() => setIsOn(!isOn)}
          className={`w-12 h-6 rounded-full p-1 transition-colors ${isOn ? 'bg-white/20' : 'bg-black/40'} border border-white/10`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isOn ? 'translate-x-6 shadow-[0_0_10px_white]' : 'translate-x-0 opacity-50'}`} />
        </button>
      </div>

      <div className={`transition-opacity duration-500 ${isOn ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
        
        {/* Brightness Slider */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Brightness</span>
            <span>{brightness}%</span>
          </div>
          <input 
            type="range" 
            min="0" max="100" 
            value={brightness}
            onChange={handleBrightnessChange}
            className="w-full h-2 bg-black rounded-full appearance-none outline-none overflow-hidden"
            style={{
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)'
            }}
          />
        </div>

        {/* Hue/Color Slider */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Color Spectrum</span>
          </div>
          <div className="relative w-full h-4 rounded-full" style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
            <input 
              type="range" 
              min="0" max="360" 
              value={hue}
              onChange={handleHueChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {/* Custom Thumb indicator */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg pointer-events-none transition-transform"
              style={{ 
                left: `calc(${(hue / 360) * 100}% - 12px)`,
                backgroundColor: `hsl(${hue}, ${saturation}%, 50%)`
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
