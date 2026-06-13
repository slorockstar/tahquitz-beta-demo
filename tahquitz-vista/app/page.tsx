"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./providers";
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

type ViewState = 'lopa' | 'dashboard';

export default function Home() {
  const { activeColors } = useTheme();
  
  const [activeView, setActiveView] = useState<ViewState>('lopa');
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [activeZoneName, setActiveZoneName] = useState<string | null>(null);
  const [immersionMode, setImmersionMode] = useState<ImmersionMode>('Default');
  const [isLightingPanelOpen, setIsLightingPanelOpen] = useState(false);

  // ... (keep handleZoneSelect, etc.)
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
          <h1 className="text-xl font-light tracking-widest uppercase">
            {activeView === 'lopa' ? 'TAHQUITZ VVIP' : activeZoneName}
          </h1>
        </div>
        
        {/* Mock Status Bar */}
        <div className="flex items-center gap-6 text-xs text-gray-500 font-mono hidden md:flex">
          <span>ALT: 41,000 FT</span>
          <span>OAT: -54°C</span>
          <span style={{ color: activeColors.accent }}>14:32 UTC</span>
        </div>
      </header>

      {/* Main Sliding Content Area */}
      <div className="flex-1 relative w-full overflow-hidden">
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
              <div className="max-w-[1400px] mx-auto p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Left Column: 3D Map & Timeline (Spans 8 cols) */}
                <div className="col-span-1 md:col-span-8 flex flex-col gap-8">
                  {/* Betria-style Interactive 3D Globe */}
                  <section className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm relative h-[500px]">
                    <InteractiveFlightMap />
                  </section>

                  {/* Reaktor-style "My Journey" Timeline */}
                  <section className="bg-white/5 border border-white/5 rounded-3xl px-8 py-4 backdrop-blur-sm hidden md:block">
                    <JourneyTimeline />
                  </section>

                  {/* Jellyfin AVOD Gallery */}
                  <section className="bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                    <MediaGallery />
                  </section>
                </div>

                {/* Right Column: Cabin Controls (Spans 4 cols) */}
                <div className="col-span-1 md:col-span-4 flex flex-col gap-8">
                  
                  {/* Origin Concept: Environment Selector */}
                  <section className="bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                    <EnvironmentSelector currentMode={immersionMode} onModeChange={setImmersionMode} />
                  </section>

                  {/* Lighting Master Widget (Opens Panel) */}
                  <section 
                    onClick={() => setIsLightingPanelOpen(true)}
                    className="bg-black/40 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer rounded-3xl p-8 backdrop-blur-md flex flex-col items-center justify-center min-h-[160px] group relative overflow-hidden"
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                      style={{ background: `linear-gradient(45deg, transparent, ${activeColors.accent})` }}
                    />
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={activeColors.accent} strokeWidth="1.5" className="mb-4 group-hover:scale-110 transition-transform">
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                    <h3 className="text-sm font-medium tracking-widest text-white uppercase">Lighting Master</h3>
                    <p className="text-xs text-gray-500 tracking-widest mt-1">15 Active Zones</p>
                  </section>

                  <section className="bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-sm flex flex-col items-center">
                    <h3 className="w-full text-left text-sm text-gray-400 uppercase tracking-widest mb-6">Climate</h3>
                    <SkeuomorphicDial initialValue={72} label="TEMP °F" />
                  </section>

                  <section className="w-full">
                     <WindowShadeControl />
                  </section>

                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TahquitzAssistant />

    </main>
  );
}
