"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../providers";
import AircraftLOPA from "@/components/layout/AircraftLOPA";
import SkeuomorphicDial from "@/components/controls/SkeuomorphicDial";
import TactileSwitch from "@/components/controls/TactileSwitch";
import TahquitzAssistant from "@/components/ai/TahquitzAssistant";
import InteractiveFlightMap from "@/components/flight/InteractiveFlightMap";
import JourneyTimeline from "@/components/flight/JourneyTimeline";
import EnvironmentSelector, { ImmersionMode } from "@/components/layout/EnvironmentSelector";
import LightingControl from "@/components/lighting/LightingControl";
import MediaGallery from "@/components/media/MediaGallery";

import WindowShadeControl from "@/components/controls/WindowShadeControl";
import LightingPanel from "@/components/lighting/LightingPanel";
import ModularDashboard from "@/components/dashboard/ModularDashboard";
import CrewTerminalLayout from "@/components/dashboard/CrewTerminalLayout";
import HandsetInterface from "@/components/dashboard/HandsetInterface";
import WallControllerInterface from "@/components/dashboard/WallControllerInterface";

type ViewState = 'lopa' | 'dashboard';

export default function Home() {
  const { activeColors, updateTheme } = useTheme();
  
  const [activeView, setActiveView] = useState<ViewState>('lopa');
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [activeZoneName, setActiveZoneName] = useState<string | null>(null);
  const [immersionMode, setImmersionMode] = useState<ImmersionMode>('Default');
  const [isLightingPanelOpen, setIsLightingPanelOpen] = useState(false);
  
  // Simulator State
  const [simRole, setSimRole] = useState<string | null>(null);
  const [simDevice, setSimDevice] = useState<string | null>(null);
  const [simGradient, setSimGradient] = useState<string | null>(null);

  useEffect(() => {
    // Read query parameters for simulator mode
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('simulate') === 'true') {
        const accent = params.get('accent');
        const role = params.get('role');
        const device = params.get('device');
        const gradient = params.get('gradient');
        
        if (accent && accent !== activeColors.accent) {
          updateTheme({ darkTheme: { ...activeColors, accent } });
        }
        if (role) setSimRole(role);
        if (device) setSimDevice(device);
        if (gradient) setSimGradient(gradient);
      }
    }
  }, []);

  const handleZoneSelect = (id: string, name: string) => {
    setActiveZoneId(id);
    setActiveZoneName(name);
    setActiveView('dashboard');
  };

  const handleBackToLOPA = () => {
    setActiveView('lopa');
    setActiveZoneId(null);
    setActiveZoneName(null);
  };

  const handleVoiceCommand = (command: string) => {
    if (command === 'lights') {
      setIsLightingPanelOpen(true);
    }
  };

  const variants = {
    initial: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 30 }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 30 }
    })
  };

  const direction = activeView === 'dashboard' ? 1 : -1;

  // Digital Wallpaper Background Logic (Origin Concept)
  const getBackgroundClass = () => {
    if (simGradient) return simGradient;
    switch (immersionMode) {
      case 'Zen': return 'bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]';
      case 'Productivity': return 'bg-gradient-to-br from-[#0f172a] to-[#1e1b4b]';
      case 'Cinema': return 'bg-black';
      default: return 'bg-black';
    }
  };

  return (
    <main className={`min-h-screen relative overflow-hidden flex flex-col transition-colors duration-1000 ${getBackgroundClass()}`}>
      
      {/* Lighting Slide-Over Panel */}
      <LightingPanel 
        isOpen={isLightingPanelOpen} 
        onClose={() => setIsLightingPanelOpen(false)} 
        zoneName={activeZoneName || 'Cabin'} 
      />

      {/* Dynamic Background Glow */}
      {immersionMode === 'Default' && (
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 pointer-events-none transition-colors duration-1000"
          style={{ backgroundColor: activeColors.accent }}
        />
      )}

      {/* Persistent Top Navigation Bar */}
      {simDevice !== 'handset' && simDevice !== 'wall_controller' && (
        <header className="w-full h-20 flex items-center justify-between px-8 z-20 border-b border-white/5 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <AnimatePresence>
              {activeView === 'dashboard' && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={handleBackToLOPA}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-light tracking-widest uppercase flex items-center gap-3">
                {activeView === 'lopa' ? 'TAHQUITZ VVIP' : activeZoneName}
                {simRole === 'crew' && (
                   <span className="px-2 py-1 bg-red-900/50 border border-red-500/50 text-red-500 rounded text-[10px] font-bold">CREW MODE</span>
                )}
              </h1>
              {activeView === 'lopa' && (
                <button 
                  onClick={() => window.location.href = '/portal'}
                  className="text-xs text-gray-500 hover:text-white uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 hover:border-white/20 transition-all bg-white/5"
                >
                  Configuration Portal
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Sliding Content Area */}
      <div className="flex-1 relative w-full overflow-hidden">
        
        {simDevice === 'crew_terminal' ? (
           <CrewTerminalLayout onSelectZone={handleZoneSelect} />
        ) : simDevice === 'handset' ? (
           <HandsetInterface />
        ) : simDevice === 'wall_controller' ? (
           <WallControllerInterface zoneName={activeZoneName || 'Cabin'} />
        ) : (
          <AnimatePresence custom={direction} initial={false}>
            {activeView === 'lopa' && (
              <motion.div
                key="lopa"
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0 w-full h-full overflow-y-auto"
              >
                <AircraftLOPA onSelectZone={handleZoneSelect} />
              </motion.div>
            )}

            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                custom={direction}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0 w-full h-full overflow-y-auto pb-32"
              >
                <div className="max-w-[1400px] mx-auto p-4 md:p-8 pt-4">
                  <ModularDashboard 
                    zoneId={activeZoneId || 'lounge'}
                    immersionMode={immersionMode}
                    setImmersionMode={setImmersionMode}
                    openLightingPanel={() => setIsLightingPanelOpen(true)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <TahquitzAssistant onCommand={handleVoiceCommand} />

    </main>
  );
}
