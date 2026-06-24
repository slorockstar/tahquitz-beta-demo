'use client';

import React, { useState, useEffect } from 'react';
import ReactGridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import InteractiveFlightMap from '../flight/InteractiveFlightMap';
import JourneyTimeline from '../flight/JourneyTimeline';
import ClimateWidget from './ClimateWidget';
import SeatWidget from './SeatWidget';
import ServiceWidget from './ServiceWidget';
import MediaGallery from '../media/MediaGallery';
import EnvironmentSelector, { ImmersionMode } from '../layout/EnvironmentSelector';
import WindowShadeControl from '../controls/WindowShadeControl';
import FlightDataWidget from './FlightDataWidget';
import { useTheme } from '@/app/providers';

// Responsive grid parameters
const GRID_COLS = 12;
const ROW_HEIGHT = 120;

// Default layout prior to customization - Reprioritized for Media and Map
const defaultLayout: any[] = [
  { i: 'media', x: 0, y: 0, w: 12, h: 4 },
  { i: 'map', x: 0, y: 4, w: 8, h: 4 },
  { i: 'data', x: 8, y: 4, w: 4, h: 2 },
  { i: 'climate', x: 8, y: 6, w: 4, h: 3 },
  { i: 'timeline', x: 0, y: 8, w: 8, h: 1 },
  { i: 'environment', x: 0, y: 9, w: 4, h: 3 },
  { i: 'shades', x: 4, y: 9, w: 4, h: 3 },
  { i: 'lighting', x: 8, y: 9, w: 4, h: 2 },
  { i: 'seat', x: 8, y: 11, w: 4, h: 2 },
  { i: 'service', x: 8, y: 13, w: 4, h: 2 },
];

interface ModularDashboardProps {
  immersionMode: ImmersionMode;
  setImmersionMode: (mode: ImmersionMode) => void;
  openLightingPanel: () => void;
}

const Grid = ReactGridLayout as any;

export default function ModularDashboard({ immersionMode, setImmersionMode, openLightingPanel }: ModularDashboardProps) {
  const { activeColors } = useTheme();
  const [layout, setLayout] = useState<any[]>(defaultLayout);
  const [isMounted, setIsMounted] = useState(false);
  const [width, setWidth] = useState(1200); // Default width
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Load from local storage for personalization
    const saved = localStorage.getItem('tahquitz-dashboard-layout');
    if (saved) {
      try {
        setLayout(JSON.parse(saved));
      } catch (e) {
        console.error("Could not parse layout", e);
      }
    }

    // Basic width listener for the grid layout
    const handleResize = () => {
      const container = document.getElementById('dashboard-container');
      if (container) setWidth(container.clientWidth);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onLayoutChange = (newLayout: any) => {
    setLayout(newLayout);
    localStorage.setItem('tahquitz-dashboard-layout', JSON.stringify(newLayout));
  };

  const resetLayout = () => {
    setLayout(defaultLayout);
    localStorage.removeItem('tahquitz-dashboard-layout');
  };

  if (!isMounted) return null; // Avoid hydration mismatch

  return (
    <div id="dashboard-container" className={`w-full h-full pb-24 ${isEditing ? 'editing-mode' : ''}`}>
      <div className="w-full flex justify-between items-center mb-6 px-2">
        <h2 className="text-xl font-light tracking-[0.2em] text-white/80">YOUR SPACE</h2>
        <div className="flex gap-4">
          {isEditing && (
             <button 
               onClick={resetLayout}
               className="text-xs text-red-400 hover:text-red-300 uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-full border border-red-500/20 transition-colors"
             >
               Reset Layout
             </button>
          )}
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition-colors ${
              isEditing 
                ? 'bg-white text-black border-white' 
                : 'text-gray-400 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isEditing ? 'Done Editing' : 'Edit Layout'}
          </button>
        </div>
      </div>

      <Grid
        className="layout"
        layout={layout}
        cols={GRID_COLS}
        rowHeight={ROW_HEIGHT}
        width={width}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
        isDraggable={isEditing}
        isResizable={isEditing}
        margin={[24, 24] as [number, number]}
        isBounded={true}
      >
        
        {/* MEDIA GALLERY */}
        <div key="media" className={`relative group bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border ${isEditing ? 'border-white/50 animate-pulse' : 'border-white/10'}`}>
          {isEditing && (
            <div className="drag-handle absolute top-0 left-0 w-full h-8 z-50 cursor-move flex items-center justify-center bg-black/50">
              <div className="w-8 h-1 rounded-full bg-white/50"></div>
            </div>
          )}
          <div className="w-full h-full overflow-hidden pt-2">
             <MediaGallery />
          </div>
        </div>

        {/* FLIGHT MAP WIDGET */}
        <div key="map" className={`relative group bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border ${isEditing ? 'border-white/50 animate-pulse' : 'border-white/10'}`}>
          {isEditing && (
            <div className="drag-handle absolute top-0 left-0 w-full h-8 z-50 cursor-move flex items-center justify-center bg-black/50">
              <div className="w-8 h-1 rounded-full bg-white/50"></div>
            </div>
          )}
          <InteractiveFlightMap />
        </div>

        {/* FLIGHT DATA WIDGET */}
        <div key="data" className={`relative group ${isEditing ? 'ring-2 ring-white/50 rounded-3xl animate-pulse' : ''}`}>
          {isEditing && (
            <div className="drag-handle absolute top-2 right-2 w-8 h-8 z-50 cursor-move flex items-center justify-center bg-black/50 rounded-full">
              <span className="text-white">✥</span>
            </div>
          )}
          <FlightDataWidget />
        </div>

        {/* CLIMATE WIDGET */}
        <div key="climate" className={`relative group ${isEditing ? 'ring-2 ring-white/50 rounded-3xl animate-pulse' : ''}`}>
          {isEditing && (
             <div className="drag-handle absolute top-2 right-2 w-8 h-8 z-50 cursor-move flex items-center justify-center bg-black/50 rounded-full">
              <span className="text-white">✥</span>
            </div>
          )}
          <ClimateWidget />
        </div>

        {/* ENVIRONMENT SELECTOR */}
        <div key="environment" className={`relative group ${isEditing ? 'ring-2 ring-white/50 rounded-3xl animate-pulse' : ''}`}>
          {isEditing && (
             <div className="drag-handle absolute top-2 right-2 w-8 h-8 z-50 cursor-move flex items-center justify-center bg-black/50 rounded-full">
              <span className="text-white">✥</span>
            </div>
          )}
          <div className="w-full h-full bg-white/5 border border-white/5 rounded-3xl p-6 backdrop-blur-md overflow-hidden">
             <EnvironmentSelector currentMode={immersionMode} onModeChange={setImmersionMode} />
          </div>
        </div>

        {/* TIMELINE WIDGET */}
        <div key="timeline" className={`relative group bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border flex items-center p-4 ${isEditing ? 'border-white/50 animate-pulse' : 'border-white/10'}`}>
          {isEditing && (
             <div className="drag-handle absolute top-2 right-2 w-8 h-8 z-50 cursor-move flex items-center justify-center bg-black/50 rounded-full">
              <span className="text-white">✥</span>
            </div>
          )}
          <div className="w-full h-full transform scale-90 origin-left">
            <JourneyTimeline />
          </div>
        </div>

        {/* LIGHTING MASTER */}
        <div key="lighting" className={`relative group h-full w-full ${isEditing ? 'ring-2 ring-white/50 rounded-3xl animate-pulse' : ''}`}>
          {isEditing && (
             <div className="drag-handle absolute top-2 right-2 w-8 h-8 z-50 cursor-move flex items-center justify-center bg-black/50 rounded-full">
              <span className="text-white">✥</span>
            </div>
          )}
          <section 
            onClick={openLightingPanel}
            className="w-full h-full bg-black/40 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer rounded-3xl p-6 backdrop-blur-md flex flex-col relative overflow-hidden"
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
              style={{ background: `linear-gradient(45deg, transparent, ${activeColors.accent})` }}
            />
            
            <h3 className="text-xs tracking-widest text-gray-500 uppercase font-medium mb-4">Lighting Master</h3>
            
            <div className="flex items-center gap-4 flex-1">
              <div 
                className="w-12 h-12 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] border-2 border-white/20"
                style={{ backgroundColor: activeColors.accent || '#FFF', boxShadow: `0 0 20px ${activeColors.accent || '#FFF'}` }}
              />
              <div className="flex flex-col">
                <span className="text-2xl font-light text-white">15<span className="text-sm text-gray-400 ml-1">ZONES</span></span>
                <span className="text-[9px] tracking-widest text-gray-500 uppercase mt-1">Tap to configure</span>
              </div>
            </div>
          </section>
        </div>

        {/* SEAT WIDGET */}
        <div key="seat" className={`relative group ${isEditing ? 'ring-2 ring-white/50 rounded-3xl animate-pulse' : ''}`}>
          {isEditing && (
             <div className="drag-handle absolute top-2 right-2 w-8 h-8 z-50 cursor-move flex items-center justify-center bg-black/50 rounded-full">
              <span className="text-white">✥</span>
            </div>
          )}
          <SeatWidget />
        </div>

        {/* SERVICE WIDGET */}
        <div key="service" className={`relative group ${isEditing ? 'ring-2 ring-white/50 rounded-3xl animate-pulse' : ''}`}>
           {isEditing && (
             <div className="drag-handle absolute top-2 right-2 w-8 h-8 z-50 cursor-move flex items-center justify-center bg-black/50 rounded-full">
              <span className="text-white">✥</span>
            </div>
          )}
          <ServiceWidget />
        </div>

        {/* WINDOW SHADES */}
        <div key="shades" className={`relative group overflow-hidden bg-white/5 backdrop-blur-md rounded-3xl border ${isEditing ? 'border-white/50 animate-pulse' : 'border-white/10'}`}>
           {isEditing && (
             <div className="drag-handle absolute top-2 right-2 w-8 h-8 z-50 cursor-move flex items-center justify-center bg-black/50 rounded-full">
              <span className="text-white">✥</span>
            </div>
          )}
          <div className="w-full h-full overflow-hidden flex flex-col">
             <WindowShadeControl />
          </div>
        </div>

      </Grid>
    </div>
  );
}
