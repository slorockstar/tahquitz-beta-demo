"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./providers";
import AircraftLOPA from "@/components/layout/AircraftLOPA";
import SkeuomorphicDial from "@/components/controls/SkeuomorphicDial";
import TactileSwitch from "@/components/controls/TactileSwitch";
import TahquitzAssistant from "@/components/ai/TahquitzAssistant";
import FlightInfo from "@/components/flight/FlightInfo";
import LightingControl from "@/components/lighting/LightingControl";
import MediaGallery from "@/components/media/MediaGallery";

type ViewState = 'lopa' | 'dashboard';

export default function Home() {
  const { activeColors } = useTheme();
  
  const [activeView, setActiveView] = useState<ViewState>('lopa');
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [activeZoneName, setActiveZoneName] = useState<string | null>(null);

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

  return (
    <main className="min-h-screen relative overflow-hidden bg-black flex flex-col">
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: activeColors.accent }}
      />

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
      </header>

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
              {/* Masonry Grid Layout matching new requirements */}
              <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 grid-flow-row-dense">
                
                {/* Flight Tracker (Spans 2 columns on larger screens) */}
                <section className="col-span-1 md:col-span-2 bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                  <FlightInfo />
                </section>

                {/* Advanced Lighting Panel */}
                <section className="bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-sm flex flex-col justify-between">
                  <LightingControl label="Ceiling Wash" />
                  <div className="mt-8">
                    <LightingControl label="Accent Strips" />
                  </div>
                </section>

                {/* Climate Controls */}
                <section className="bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-sm flex flex-col items-center justify-center">
                  <h3 className="w-full text-left text-sm text-gray-400 uppercase tracking-widest mb-6">Environment</h3>
                  <SkeuomorphicDial initialValue={72} label="TEMP °F" />
                  <div className="flex justify-between w-full mt-8 px-2">
                    <TactileSwitch label="SHADES" />
                    <TactileSwitch label="AIRFLOW" />
                  </div>
                </section>

                {/* Media Gallery (Spans full width) */}
                <section className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                  <h3 className="text-sm font-medium tracking-widest text-gray-400 uppercase mb-6">Jellyfin AVOD Streaming</h3>
                  <MediaGallery />
                </section>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <TahquitzAssistant />

    </main>
  );
}
