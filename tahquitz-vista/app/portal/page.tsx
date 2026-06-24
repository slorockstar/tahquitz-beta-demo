'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AircraftConfig, getAircraftConfig, saveAircraftConfig, ZoneHardwareConfig } from '@/lib/config-store';
import { useTheme } from '@/app/providers';

type PortalView = 'login' | 'dashboard' | 'aircraft_select' | 'lopa_upload' | 'analysis' | 'lopa_setup' | 'grd_generator';

export default function ConfigurationPortal() {
  const router = useRouter();
  const { activeColors } = useTheme();
  const [config, setConfig] = useState<AircraftConfig | null>(null);
  const [view, setView] = useState<PortalView>('login');
  
  // Mock Data States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAircraft, setSelectedAircraft] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingGRD, setIsGeneratingGRD] = useState(false);

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setView('dashboard');
  };

  const handleAircraftSubmit = () => {
    if (!selectedAircraft) {
      alert("Please select an aircraft model.");
      return;
    }
    setConfig(prev => prev ? { ...prev, aircraftModel: selectedAircraft } : null);
    setView('lopa_upload');
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setView('analysis');
      simulateAnalysis();
    }, 2000);
  };

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3500);
  };

  const handleDeployToGRD = () => {
    setView('grd_generator');
    setIsGeneratingGRD(true);
    setTimeout(() => {
      setIsGeneratingGRD(false);
    }, 2500);
  };

  const exportPackage = () => {
    saveAircraftConfig(config);
    alert('GRD & ATP Package Exported Successfully! Database config pushed to Aircraft Node.');
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pt-10 px-8 pb-32 overflow-y-auto">
      
      <div className="max-w-5xl mx-auto w-full">
        {/* Header (Hidden on Login) */}
        {view !== 'login' && (
          <header className="mb-12 border-b border-white/10 pb-6 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-light tracking-[0.2em] uppercase">Tahquitz Apex</h1>
              <p className="text-gray-400 tracking-widest text-sm mt-2 uppercase">Fleet Lifecycle & Configuration Manager</p>
            </div>
            <div className="flex gap-6 items-center">
              <button 
                onClick={() => router.push('/')}
                className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
              >
                ← Exit to Aircraft
              </button>
            </div>
          </header>
        )}

        <AnimatePresence mode="wait">
          {/* 1. LOGIN SCREEN */}
          {view === 'login' && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-md">
                <h2 className="text-2xl font-light tracking-[0.2em] uppercase mb-8 text-center text-white">Tahquitz Apex</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-gray-500 mb-2">Integrator / Client Email</label>
                    <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors" placeholder="integrator@vip.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-gray-500 mb-2">Secure Password</label>
                    <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-colors" placeholder="••••••••" />
                  </div>
                  <button type="submit" className="w-full py-4 rounded-full text-sm font-bold tracking-widest uppercase text-black mt-4 transition-transform hover:scale-[1.02] active:scale-95" style={{ backgroundColor: activeColors.accent || '#FFF' }}>
                    Authenticate
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* 2. DASHBOARD */}
          {view === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-xl font-light tracking-widest uppercase">Your Projects</h2>
                <button onClick={() => setView('aircraft_select')} className="px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase text-black" style={{ backgroundColor: activeColors.accent || '#FFF' }}>
                  + New Aircraft Project
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mock Existing Project */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-colors cursor-pointer group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: activeColors.accent || '#FFF' }} />
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-medium">{config.tailNumber}</h3>
                      <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{config.aircraftModel}</p>
                    </div>
                    <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-[10px] uppercase tracking-widest border border-green-500/20">Active</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-6">{config.customerName}</div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Deployed: Today</span>
                    <button onClick={() => setView('lopa_setup')} className="text-white group-hover:underline">Edit Config →</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. AIRCRAFT SELECTION */}
          {view === 'aircraft_select' && (
            <motion.div key="aircraft_select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto w-full">
              <h2 className="text-xl font-light tracking-widest uppercase mb-4">Step 1: Aircraft Definition</h2>
              <p className="text-gray-400 text-sm mb-8">Select the airframe for the new project. This defines the baseline dimensions and physical capabilities of the integration.</p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <label className="block text-xs tracking-widest uppercase text-gray-400 mb-4">Airframe Model</label>
                <div className="grid grid-cols-2 gap-4">
                  {['Boeing 747-8', 'Boeing 777X', 'Boeing 737 BBJ', 'Airbus A319 neo', 'Airbus A350'].map(model => (
                    <button 
                      key={model}
                      onClick={() => setSelectedAircraft(model)}
                      className={`p-4 border rounded-xl text-left transition-colors ${selectedAircraft === model ? 'border-white bg-white/10 text-white' : 'border-white/10 text-gray-500 hover:border-white/30'}`}
                    >
                      <h3 className="font-medium">{model}</h3>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleAircraftSubmit} className="px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase text-black" style={{ backgroundColor: activeColors.accent || '#FFF' }}>
                  Next: LOPA Upload
                </button>
              </div>
            </motion.div>
          )}

          {/* 4. LOPA UPLOAD */}
          {view === 'lopa_upload' && (
            <motion.div key="lopa_upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto w-full">
              <h2 className="text-xl font-light tracking-widest uppercase mb-4">Step 2: LOPA Ingestion</h2>
              <p className="text-gray-400 text-sm mb-8">Upload the client's LOPA (Layout of Passenger Accommodations) PDF. Apex AI will parse the document to automatically extract the zones and layout that fit this specific {config.aircraftModel || 'aircraft'}.</p>

              <div 
                onClick={simulateUpload}
                className={`border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all ${isUploading ? 'border-white/50 bg-white/5' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-xs uppercase tracking-widest text-gray-400">Parsing LOPA Document...</p>
                  </div>
                ) : (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-500 mb-6">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    <h3 className="text-lg font-medium text-white mb-2">Drag & Drop LOPA PDF</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Or click to browse files</p>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* 5. AI SCOPE ANALYSIS */}
          {view === 'analysis' && (
            <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto w-full">
              <h2 className="text-xl font-light tracking-widest uppercase mb-4">Step 3: AI Zone Analysis</h2>
              
              {isAnalyzing ? (
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 mb-8 relative">
                      <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin" style={{ borderTopColor: 'transparent', borderRightColor: activeColors.accent, borderBottomColor: activeColors.accent, borderLeftColor: activeColors.accent }}></div>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Apex AI Extracting Zones...</h3>
                    <div className="flex flex-col gap-2 text-xs uppercase tracking-widest text-gray-500 mt-4">
                      <p className="animate-pulse">Reading Layout of Passenger Accommodations...</p>
                      <p className="animate-pulse animation-delay-200">Defining bounding coordinates for {config.aircraftModel}...</p>
                      <p className="animate-pulse animation-delay-400">Mapping Private Suites, VIP Bedrooms, and Lounges...</p>
                    </div>
                 </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                    <h3 className="text-green-400 text-sm font-bold uppercase tracking-widest mb-4">✓ LOPA Parsed Successfully</h3>
                    <p className="text-sm text-gray-300 mb-4">The following zones were successfully extracted and mapped to the {config.aircraftModel} layout template:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {config.zones.map(z => (
                        <div key={z.id} className="bg-black/30 border border-green-500/20 px-3 py-2 rounded text-xs text-green-300 uppercase tracking-widest">
                          {z.id.replace('_', ' ')}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                     <button onClick={() => setView('lopa_setup')} className="px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase text-black" style={{ backgroundColor: activeColors.accent || '#FFF' }}>
                        Verify Hardware
                     </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 6. LOPA SETUP (Hardware Assignment) */}
          {view === 'lopa_setup' && (
            <motion.div key="lopa_setup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-xl font-light tracking-widest uppercase">Step 4: Hardware Assignment</h2>
              </div>
              <p className="text-gray-400 text-sm mb-8">Verify the specific hardware capabilities installed inside each of the extracted zones. This will dictate exactly what documentation and UI screens are generated.</p>

              <div className="space-y-6">
                {config.zones.map(zone => (
                  <div key={zone.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-medium uppercase tracking-widest mb-4">{zone.id.replace('_', ' ')}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {[
                        { flag: 'hasMonitors', label: 'Monitors' },
                        { flag: 'hasSpeakers', label: 'Speakers' },
                        { flag: 'hasHeadphones', label: 'Headphones' },
                        { flag: 'hasLighting', label: 'Lighting' },
                        { flag: 'hasClimate', label: 'Climate' },
                        { flag: 'hasShades', label: 'Shades' },
                        { flag: 'hasMovingMap', label: 'Moving Map' },
                        { flag: 'hasPassengerCall', label: 'Pax Call' },
                        { flag: 'hasAuxPorts', label: 'Aux/HDMI' }
                      ].map(item => {
                        const isChecked = zone[item.flag as keyof ZoneHardwareConfig] as boolean;
                        return (
                          <label key={item.flag} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex flex-shrink-0 items-center justify-center transition-colors ${isChecked ? 'bg-white border-white' : 'border-white/30 group-hover:border-white/50'}`}>
                              {isChecked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                            <input type="checkbox" className="hidden" checked={isChecked} onChange={e => handleUpdateZone(zone.id, { [item.flag]: e.target.checked })} />
                            <span className="text-[10px] uppercase tracking-widest text-gray-300 group-hover:text-white truncate">{item.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-12">
                <button onClick={() => setView('dashboard')} className="px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase text-white bg-white/10 hover:bg-white/20">
                  Save Draft & Exit
                </button>
                <button onClick={handleDeployToGRD} className="px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase text-black" style={{ backgroundColor: activeColors.accent || '#FFF' }}>
                  Next: Generate ATP / GRD
                </button>
              </div>
            </motion.div>
          )}

          {/* 7. GRD / ATP GENERATOR */}
          {view === 'grd_generator' && (
            <motion.div key="grd_generator" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-5xl mx-auto w-full">
              <h2 className="text-xl font-light tracking-widest uppercase mb-4">Step 5: Automated GRD & ATP Generator</h2>
              <p className="text-gray-400 text-sm mb-8">Tahquitz Apex dynamically generates the 80+ page Graphics Requirements Document (GRD) and Acceptance Test Plan (ATP) based specifically on the LOPA layout and hardware toggles assigned.</p>

              {isGeneratingGRD ? (
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center text-center h-[50vh]">
                    <div className="w-20 h-20 mb-8 relative">
                      <div className="absolute inset-0 border-4 border-white/10 rounded-xl"></div>
                      <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-xl animate-spin" style={{ borderTopColor: 'transparent', borderRightColor: activeColors.accent, borderBottomColor: activeColors.accent, borderLeftColor: activeColors.accent }}></div>
                    </div>
                    <h3 className="text-xl font-light tracking-widest uppercase text-white mb-4">Compiling {config.aircraftModel} GRD Document...</h3>
                    <div className="flex flex-col gap-3 text-xs uppercase tracking-widest text-gray-500">
                      <p className="animate-pulse">Generating LOPA Icon Reference Matrix...</p>
                      <p className="animate-pulse animation-delay-200">Pruning Video UI mocks for Lavatory zones...</p>
                      <p className="animate-pulse animation-delay-400">Compiling Tri-State Lighting Scenarios...</p>
                      <p className="animate-pulse animation-delay-600">Exporting ATP Verification Steps...</p>
                    </div>
                 </div>
              ) : (
                <div className="space-y-6">
                  {/* Mock GRD Document Preview */}
                  <div className="bg-[#1A1A1A] border border-white/20 rounded-2xl overflow-hidden shadow-2xl relative">
                     <div className="bg-black/50 border-b border-white/10 px-6 py-4 flex justify-between items-center">
                        <div className="text-xs tracking-widest text-gray-400 uppercase font-mono">Tahquitz_GRD_{config.tailNumber}_Rev_1.pdf</div>
                        <div className="text-[10px] bg-white/10 px-2 py-1 rounded text-white tracking-widest">84 Pages Generated</div>
                     </div>
                     
                     <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                       {/* Left Page Mock */}
                       <div className="bg-white text-black p-8 shadow-lg h-[400px] overflow-hidden relative">
                         <div className="border-b-2 border-black pb-2 mb-6 flex justify-between">
                            <span className="font-bold text-xs">{config.tailNumber} CMI GRD</span>
                            <span className="text-xs">Page 11 of 84</span>
                         </div>
                         <h3 className="text-lg font-bold mb-4" style={{ color: activeColors.accent || '#000' }}>4.0 Primary Interface Menus</h3>
                         <h4 className="text-sm font-bold mb-2">4.1 Overview</h4>
                         <p className="text-[10px] text-gray-600 mb-6">This section outlines the main interface menus, which are consistent global elements – the top bar and bottom bar menus. Each of the menus and their function are outlined below along with their configurable elements.</p>
                         
                         <h4 className="text-sm font-bold mb-2">4.2 Top navigation bar</h4>
                         <p className="text-[10px] text-gray-600 mb-4">The top bar is the main primary menu within the CMI; this menu allows crew members to easily navigate to key sections within the interface.</p>
                         <div className="w-full h-12 bg-black rounded-t-lg mb-4 flex justify-between items-center px-4 text-white">
                           <span className="text-[8px]">HOME</span>
                           <span className="text-[8px]">{config.tailNumber}</span>
                           <span className="text-[8px]">TTD 02:16</span>
                         </div>
                       </div>

                       {/* Right Page Mock */}
                       <div className="bg-white text-black p-8 shadow-lg h-[400px] overflow-hidden relative">
                         <div className="border-b-2 border-black pb-2 mb-6 flex justify-between">
                            <span className="font-bold text-xs">{config.tailNumber} CMI GRD</span>
                            <span className="text-xs">Page 31 of 84</span>
                         </div>
                         <h3 className="text-lg font-bold mb-4" style={{ color: activeColors.accent || '#000' }}>Appendix C - Control Matrix</h3>
                         <div className="w-full border border-gray-300 text-[6px]">
                           <div className="flex bg-gray-200 border-b border-gray-300 font-bold">
                             <div className="flex-1 p-1 border-r border-gray-300">Zone</div>
                             <div className="w-12 p-1 border-r border-gray-300 text-center">Monitors</div>
                             <div className="w-12 p-1 border-r border-gray-300 text-center">Audio</div>
                             <div className="w-12 p-1 text-center">Lighting</div>
                           </div>
                           {config.zones.slice(0,5).map(z => (
                             <div key={z.id} className="flex border-b border-gray-300 last:border-b-0">
                               <div className="flex-1 p-1 border-r border-gray-300 uppercase">{z.id.replace('_', ' ')}</div>
                               <div className="w-12 p-1 border-r border-gray-300 text-center text-green-600 font-bold">{z.hasMonitors ? 'Yes' : 'No'}</div>
                               <div className="w-12 p-1 border-r border-gray-300 text-center text-green-600 font-bold">{z.hasSpeakers ? 'Yes' : 'No'}</div>
                               <div className="w-12 p-1 text-center text-green-600 font-bold">{z.hasLighting ? 'Yes' : 'No'}</div>
                             </div>
                           ))}
                         </div>
                         <div className="mt-8 text-[8px] text-gray-500 italic">
                           * Document automatically compiled by Tahquitz Apex based on {config.aircraftModel} hardware selection.
                         </div>
                       </div>
                     </div>
                  </div>

                  <div className="flex justify-between mt-8 items-center">
                    <button onClick={() => setView('lopa_setup')} className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                      ← Back to Config
                    </button>
                    <button onClick={exportPackage} className="px-10 py-4 rounded-full text-sm font-bold tracking-[0.2em] uppercase text-black transition-transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]" style={{ backgroundColor: activeColors.accent || '#FFF' }}>
                      Export GRD & ATP Package
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
