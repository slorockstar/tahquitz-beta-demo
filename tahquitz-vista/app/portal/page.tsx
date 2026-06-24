'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AircraftConfig, getAircraftConfig, saveAircraftConfig, ZoneHardwareConfig } from '@/lib/config-store';
import { useTheme } from '@/app/providers';

export default function ConfigurationPortal() {
  const router = useRouter();
  const { activeColors } = useTheme();
  const [config, setConfig] = useState<AircraftConfig | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    setConfig(getAircraftConfig());
  }, []);

  if (!config) return null;

  const handleUpdateZone = (zoneId: string, updates: Partial<ZoneHardwareConfig>) => {
    setConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        zones: prev.zones.map(z => z.id === zoneId ? { ...z, ...updates } : z)
      };
    });
  };

  const handleSave = () => {
    saveAircraftConfig(config);
    alert('Configuration saved to Master Config!');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pt-10 px-8 pb-32 overflow-y-auto">
      
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="mb-12 border-b border-white/10 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-light tracking-[0.2em] uppercase">Configuration Portal</h1>
            <p className="text-gray-400 tracking-widest text-sm mt-2 uppercase">Aircraft Master Definitions & LOPA Setup</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </header>

        {/* Steps */}
        <div className="flex gap-4 mb-10">
          {[1, 2, 3].map(step => (
            <div 
              key={step} 
              className={`flex-1 h-1 rounded-full transition-colors ${activeStep >= step ? 'bg-white' : 'bg-white/10'}`}
              style={activeStep >= step ? { backgroundColor: activeColors.accent } : {}}
            />
          ))}
        </div>

        {/* Step 1: Aircraft Profile */}
        {activeStep === 1 && (
          <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <h2 className="text-xl font-medium tracking-widest uppercase mb-6">Step 1: Aircraft Profile</h2>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-widest text-gray-500 uppercase">Tail Number</label>
                <input 
                  type="text" 
                  value={config.tailNumber}
                  onChange={e => setConfig({ ...config, tailNumber: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-widest text-gray-500 uppercase">Aircraft Model</label>
                <input 
                  type="text" 
                  value={config.aircraftModel}
                  onChange={e => setConfig({ ...config, aircraftModel: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50"
                />
              </div>
              <div className="flex flex-col gap-2 col-span-2">
                <label className="text-xs tracking-widest text-gray-500 uppercase">Customer Name / Program</label>
                <input 
                  type="text" 
                  value={config.customerName}
                  onChange={e => setConfig({ ...config, customerName: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            <div className="flex justify-end mt-12">
              <button 
                onClick={() => setActiveStep(2)}
                className="px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase text-black"
                style={{ backgroundColor: activeColors.accent || '#FFF' }}
              >
                Next: Hardware Setup
              </button>
            </div>
          </motion.section>
        )}

        {/* Step 2: Zone Hardware Config */}
        {activeStep === 2 && (
          <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-xl font-medium tracking-widest uppercase mb-6">Step 2: LOPA Hardware Assignment</h2>
            <p className="text-gray-400 text-sm mb-8">Define the installed capabilities for each zone. This dictates what widgets are generated in the Cabin Dashboard.</p>

            <div className="space-y-6">
              {config.zones.map(zone => (
                <div key={zone.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-medium uppercase tracking-widest mb-4">{zone.id.replace('_', ' ')}</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    
                    {/* Media Checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${zone.hasMonitors ? 'bg-white border-white' : 'border-white/30 group-hover:border-white/50'}`}>
                        {zone.hasMonitors && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={zone.hasMonitors} onChange={e => handleUpdateZone(zone.id, { hasMonitors: e.target.checked })} />
                      <span className="text-xs uppercase tracking-widest text-gray-300 group-hover:text-white">Video Monitors</span>
                    </label>

                    {/* Audio Checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${zone.hasSpeakers ? 'bg-white border-white' : 'border-white/30 group-hover:border-white/50'}`}>
                        {zone.hasSpeakers && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={zone.hasSpeakers} onChange={e => handleUpdateZone(zone.id, { hasSpeakers: e.target.checked })} />
                      <span className="text-xs uppercase tracking-widest text-gray-300 group-hover:text-white">Audio / Speakers</span>
                    </label>

                    {/* Climate Checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${zone.hasClimate ? 'bg-white border-white' : 'border-white/30 group-hover:border-white/50'}`}>
                        {zone.hasClimate && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={zone.hasClimate} onChange={e => handleUpdateZone(zone.id, { hasClimate: e.target.checked })} />
                      <span className="text-xs uppercase tracking-widest text-gray-300 group-hover:text-white">Climate Control</span>
                    </label>

                    {/* Shades Checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${zone.hasShades ? 'bg-white border-white' : 'border-white/30 group-hover:border-white/50'}`}>
                        {zone.hasShades && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={zone.hasShades} onChange={e => handleUpdateZone(zone.id, { hasShades: e.target.checked })} />
                      <span className="text-xs uppercase tracking-widest text-gray-300 group-hover:text-white">Window Shades</span>
                    </label>

                    {/* Lighting Checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${zone.hasLighting ? 'bg-white border-white' : 'border-white/30 group-hover:border-white/50'}`}>
                        {zone.hasLighting && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={zone.hasLighting} onChange={e => handleUpdateZone(zone.id, { hasLighting: e.target.checked })} />
                      <span className="text-xs uppercase tracking-widest text-gray-300 group-hover:text-white">Lighting Zones</span>
                    </label>

                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-12">
              <button 
                onClick={() => setActiveStep(1)}
                className="px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase text-white bg-white/10 hover:bg-white/20"
              >
                Back
              </button>
              <button 
                onClick={() => setActiveStep(3)}
                className="px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase text-black"
                style={{ backgroundColor: activeColors.accent || '#FFF' }}
              >
                Next: Verify & Deploy
              </button>
            </div>
          </motion.section>
        )}

        {/* Step 3: Verify and Deploy */}
        {activeStep === 3 && (
          <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-xl font-medium tracking-widest uppercase mb-6">Step 3: Verification</h2>
            <p className="text-gray-400 text-sm mb-8">This generated configuration payload acts as the master file for the aircraft ATP documents and dynamic dashboard rendering.</p>

            <div className="bg-black border border-white/20 p-6 rounded-2xl overflow-x-auto relative group">
               <button className="absolute top-4 right-4 bg-white/10 px-4 py-2 rounded-full text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Copy JSON</button>
               <pre className="text-sm font-mono text-green-400">
                 {JSON.stringify(config, null, 2)}
               </pre>
            </div>

            <div className="flex justify-between mt-12">
              <button 
                onClick={() => setActiveStep(2)}
                className="px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase text-white bg-white/10 hover:bg-white/20"
              >
                Back
              </button>
              <button 
                onClick={handleSave}
                className="px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase text-black"
                style={{ backgroundColor: activeColors.accent || '#FFF' }}
              >
                Save & Update Dashboard
              </button>
            </div>
          </motion.section>
        )}

      </div>
    </div>
  );
}
