'use client';

import React, { useState, useEffect } from 'react';
import ReactGridLayout, { Layout } from 'react-grid-layout';
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
import { useTheme } from '@/app/providers';

// Responsive grid parameters
const GRID_COLS = 12;
const ROW_HEIGHT = 120;

// Default layout prior to customization
const defaultLayout: any[] = [
  { i: 'map', x: 0, y: 0, w: 8, h: 4 },
  { i: 'climate', x: 8, y: 0, w: 4, h: 3 },
  { i: 'timeline', x: 0, y: 4, w: 8, h: 1 },
  { i: 'media', x: 0, y: 5, w: 8, h: 3 },
  { i: 'lighting', x: 8, y: 3, w: 4, h: 2 },
  { i: 'seat', x: 8, y: 5, w: 4, h: 2 },
  { i: 'service', x: 8, y: 7, w: 4, h: 2 },
  { i: 'shades', x: 0, y: 8, w: 4, h: 2 },
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

  if (!isMounted) return null; // Avoid hydration mismatch

  return (
    <div id="dashboard-container" className="w-full h-full pb-24">
      <div className="w-full flex justify-between items-center mb-6">
        <h2 className="text-xl font-light tracking-[0.2em] text-white/80">YOUR SPACE</h2>
        <span className="text-xs text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
          Drag Widgets to Personalize
        </span>
      </div>

      <Grid
        className="layout"
        layout={layout}
        cols={GRID_COLS}
        rowHeight={ROW_HEIGHT}
        width={width}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
        margin={[24, 24] as [number, number]}
        isBounded={true}
      >
        
        {/* FLIGHT MAP WIDGET */}
        <div key="map" className="relative group bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 transition-colors">
          <div className="drag-handle absolute top-0 left-0 w-full h-8 z-50 cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
            <div className="w-8 h-1 rounded-full bg-white/30"></div>
          </div>
          <InteractiveFlightMap />
        </div>

        {/* CLIMATE WIDGET */}
        <div key="climate" className="relative group">
          <div className="drag-handle absolute top-2 right-2 w-8 h-8 z-50 cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white/50 hover:text-white">✥</span>
          </div>
          <ClimateWidget />
        </div>

        {/* TIMELINE WIDGET */}
        <div key="timeline" className="relative group bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 flex items-center p-4 hover:border-white/30 transition-colors">
           <div className="drag-handle absolute top-2 right-2 w-8 h-8 z-50 cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white/50 hover:text-white">✥</span>
          </div>
          <div className="w-full h-full transform scale-90 origin-left">
            <JourneyTimeline />
          </div>
        </div>

        {/* MEDIA GALLERY */}
        <div key="media" className="relative group bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 p-4 hover:border-white/30 transition-colors">
          <div className="drag-handle absolute top-0 left-0 w-full h-8 z-50 cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
            <div className="w-8 h-1 rounded-full bg-white/30"></div>
          </div>
          <div className="w-full h-full overflow-hidden">
             <MediaGallery />
          </div>
        </div>

        {/* LIGHTING MASTER */}
        <div key="lighting" className="relative group h-full w-full">
           <div className="drag-handle absolute top-2 right-2 w-8 h-8 z-50 cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white/50 hover:text-white">✥</span>
          </div>
          <section 
            onClick={openLightingPanel}
            className="w-full h-full bg-black/40 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer rounded-3xl p-6 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
              style={{ background: `linear-gradient(45deg, transparent, ${activeColors.accent})` }}
            />
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={activeColors.accent} strokeWidth="1.5" className="mb-4 group-hover:scale-110 transition-transform">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
            <h3 className="text-sm font-medium tracking-widest text-white uppercase text-center">Lighting</h3>
          </section>
        </div>

        {/* SEAT WIDGET */}
        <div key="seat" className="relative group">
           <div className="drag-handle absolute top-2 right-2 w-8 h-8 z-50 cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white/50 hover:text-white">✥</span>
          </div>
          <SeatWidget />
        </div>

        {/* SERVICE WIDGET */}
        <div key="service" className="relative group">
           <div className="drag-handle absolute top-2 right-2 w-8 h-8 z-50 cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white/50 hover:text-white">✥</span>
          </div>
          <ServiceWidget />
        </div>

        {/* WINDOW SHADES */}
        <div key="shades" className="relative group">
           <div className="drag-handle absolute top-2 right-2 w-8 h-8 z-50 cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white/50 hover:text-white">✥</span>
          </div>
          <div className="w-full h-full bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex flex-col items-center justify-center">
             <WindowShadeControl />
          </div>
        </div>

      </Grid>
    </div>
  );
}
