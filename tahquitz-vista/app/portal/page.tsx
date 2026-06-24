'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AircraftConfig, getAircraftConfig, saveAircraftConfig, ZoneHardwareConfig } from '@/lib/config-store';
import { useTheme } from '@/app/providers';

type PortalView = 'login' | 'dashboard' | 'upload' | 'analysis' | 'lopa_setup' | 'deploy';

export default function ConfigurationPortal() {
  const router = useRouter();
  const { activeColors } = useTheme();
  const [config, setConfig] = useState<AircraftConfig | null>(null);
  const [view, setView] = useState<PortalView>('login');
  
  // Mock Data States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    }, 3000);
  };

  const handleDeploy = () => {
    saveAircraftConfig(config);
    alert('Configuration saved & successfully deployed to the Aircraft node!');
    setView('dashboard'); // Return to projects
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
                <button onClick={() => setView('upload')} className="px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase text-black" style={{ backgroundColor: activeColors.accent || '#FFF' }}>
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

          {/* 3. REQUIREMENTS UPLOAD */}
          {view === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-3xl mx-auto w-full">
              <h2 className="text-xl font-light tracking-widest uppercase mb-4">Step 1: Ingest Requirements</h2>
              <p className="text-gray-400 text-sm mb-8">Upload the client's PDF requirements document or cabin specification. Apex AI will parse the document to map hardware parameters and define project scope automatically.</p>

              <div 
                onClick={simulateUpload}
                className={`border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all ${isUploading ? 'border-white/50 bg-white/5' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-xs uppercase tracking-widest text-gray-400">Uploading Document...</p>
                  </div>
                ) : (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-500 mb-6">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    <h3 className="text-lg font-medium text-white mb-2">Drag & Drop Requirements PDF</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Or click to browse files</p>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* 4. AI SCOPE ANALYSIS */}
          {view === 'analysis' && (
            <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto w-full">
              <h2 className="text-xl font-light tracking-widest uppercase mb-4">Step 2: AI Scope Analysis</h2>
              
              {isAnalyzing ? (
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 mb-8 relative">
                      <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin" style={{ borderTopColor: 'transparent', borderRightColor: activeColors.accent, borderBottomColor: activeColors.accent, borderLeftColor: activeColors.accent }}></div>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Apex AI Parsing Document...</h3>
                    <div className="flex flex-col gap-2 text-xs uppercase tracking-widest text-gray-500 mt-4">
                      <p className="animate-pulse">Extracting LOPA coordinates...</p>
                      <p className="animate-pulse animation-delay-200">Mapping Audio/Video Matrices...</p>
                      <p className="animate-pulse animation-delay-400">Verifying ARINC 429 Protocols...</p>
                    </div>
                 </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                    <h3 className="text-green-400 text-sm font-bold uppercase tracking-widest mb-4">✓ In Scope (Automated Mapping Successful)</h3>
                    <ul className="space-y-3 text-sm text-gray-300">
                      <li className="flex items-start gap-3"><span className="text-green-400">●</span> 32", 42", and 65" 4K Video Monitors mapped successfully.</li>
                      <li className="flex items-start gap-3"><span className="text-green-400">●</span> High-Fidelity Audio arrays and Bluetooth Headphone integration in VIP zones.</li>
                      <li className="flex items-start gap-3"><span className="text-green-400">●</span> Moving Map application mapping successfully.</li>
                      <li className="flex items-start gap-3"><span className="text-green-400">●</span> 15-Zone RGBW LED Lighting mapping via RS-485 arrays.</li>
                    </ul>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                    <h3 className="text-red-400 text-sm font-bold uppercase tracking-widest mb-4">✕ Out of Scope (Hardware Not Supported)</h3>
                    <ul className="space-y-3 text-sm text-gray-300">
                      <li className="flex items-start gap-3"><span className="text-red-400">●</span> Legacy Ku-Band Satellite TV Antenna (Requires manual bridging).</li>
                      <li className="flex items-start gap-3"><span className="text-red-400">●</span> Analog Fax Machine interface requested in Cockpit.</li>
                    </ul>
                  </div>

                  <div className="flex justify-end mt-8">
                     <button onClick={() => setView('lopa_setup')} className="px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase text-black" style={{ backgroundColor: activeColors.accent || '#FFF' }}>
                        Accept & Configure LOPA
                     </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* 5. LOPA SETUP (Formerly Step 2) */}
          {view === 'lopa_setup' && (
            <motion.div key="lopa_setup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-xl font-light tracking-widest uppercase">Step 3: LOPA Hardware Assignment</h2>
              </div>
              <p className="text-gray-400 text-sm mb-8">AI extraction complete. Please verify the installed capabilities for each zone. This dictates what widgets are generated in the Cabin Dashboard.</p>

              <div className="space-y-6">
                {config.zones.map(zone => (
                  <div key={zone.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-medium uppercase tracking-widest mb-4">{zone.id.replace('_', ' ')}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {/* Expanded Checkboxes mapping to new config-store logic */}
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
                  Save & Exit
                </button>
                <button onClick={() => setView('deploy')} className="px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase text-black" style={{ backgroundColor: activeColors.accent || '#FFF' }}>
                  Next: Verify & Deploy
                </button>
              </div>
            </motion.div>
          )}

          {/* 6. DEPLOYMENT (Formerly Step 3) */}
          {view === 'deploy' && (
            <motion.div key="deploy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-light tracking-widest uppercase mb-6">Step 4: ATP Verification & Deployment</h2>
              <p className="text-gray-400 text-sm mb-8">This generated configuration payload acts as the master file for the aircraft ATP documents and dynamic dashboard rendering.</p>

              <div className="bg-black border border-white/20 p-6 rounded-2xl overflow-x-auto relative group">
                 <button className="absolute top-4 right-4 bg-white/10 px-4 py-2 rounded-full text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Copy JSON</button>
                 <pre className="text-[10px] font-mono text-green-400">
                   {JSON.stringify(config, null, 2)}
                 </pre>
              </div>

              <div className="flex justify-between mt-12">
                <button onClick={() => setView('lopa_setup')} className="px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase text-white bg-white/10 hover:bg-white/20">
                  Back
                </button>
                <button onClick={handleDeploy} className="px-8 py-3 rounded-full text-sm font-bold tracking-widest uppercase text-black" style={{ backgroundColor: activeColors.accent || '#FFF' }}>
                  Push to Aircraft Node
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
