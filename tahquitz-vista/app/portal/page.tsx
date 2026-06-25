'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AircraftConfig, getFleetConfig, saveFleetConfig } from '@/lib/config-store';

import DashboardView from '@/components/portal/DashboardView';
import RFQWizard from '@/components/portal/RFQWizard';
import DevelopmentView from '@/components/portal/DevelopmentView';
import ActiveFleetView from '@/components/portal/ActiveFleetView';

type PortalState = 'dashboard' | 'rfq_wizard' | 'development' | 'active_fleet';

export default function FleetPortal() {
  const [fleet, setFleet] = useState<AircraftConfig[]>([]);
  const [activeState, setActiveState] = useState<PortalState>('dashboard');
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftConfig | null>(null);
  const [activeNav, setActiveNav] = useState('Dashboard');

  useEffect(() => {
    setFleet(getFleetConfig());
  }, []);

  const handleSelectProject = (aircraft: AircraftConfig) => {
    setSelectedAircraft(aircraft);
    if (aircraft.status === 'Active') {
      setActiveState('active_fleet');
    } else {
      setActiveState('development');
    }
  };

  const handleNewProject = () => {
    setActiveState('rfq_wizard');
  };

  const handleBackToDashboard = () => {
    setFleet(getFleetConfig()); // Refresh in case changes were made
    setActiveState('dashboard');
    setSelectedAircraft(null);
  };

  const handleApproveDev = () => {
    if (selectedAircraft) {
      // Move from Development to Active for demo purposes
      const updated = { ...selectedAircraft, status: 'Active' as const, softwareVersion: 'v1.0.0 (Release)' };
      const newFleet = fleet.map(a => a.tailNumber === updated.tailNumber ? updated : a);
      saveFleetConfig(newFleet);
      setFleet(newFleet);
      setSelectedAircraft(updated);
      setActiveState('active_fleet');
    }
  };

  const navItems = ['Dashboard', 'CSDB', 'Features', 'Media', 'Admin'];

  return (
    <div className="flex h-screen w-full bg-black text-white font-sans overflow-hidden">
      
      {/* Persistent Left Sidebar */}
      <div className="w-64 border-r border-white/5 bg-[#050505] flex flex-col z-50 relative">
        <div className="p-8 border-b border-white/5">
          <h1 className="text-xl font-light tracking-widest uppercase text-white">Tahquitz</h1>
          <p className="text-xs text-yellow-500 font-bold tracking-widest uppercase mt-1">Apex</p>
        </div>
        
        <nav className="flex-1 py-8 flex flex-col gap-2 px-4">
          {navItems.map(item => (
            <button
              key={item}
              onClick={() => {
                setActiveNav(item);
                if (item === 'Dashboard') handleBackToDashboard();
              }}
              className={`text-left px-4 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors ${
                activeNav === item ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">JD</div>
             <div>
               <p className="text-xs font-bold text-white">Admin User</p>
               <p className="text-[10px] text-gray-500 uppercase tracking-widest">Kovach Design</p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-[#111]">
        <AnimatePresence mode="wait">
          
          {activeState === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0"
            >
              <DashboardView 
                fleet={fleet} 
                onSelectProject={handleSelectProject} 
                onNewProject={handleNewProject} 
              />
            </motion.div>
          )}

          {activeState === 'rfq_wizard' && (
            <motion.div 
              key="rfq_wizard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 overflow-y-auto bg-black"
            >
              <button 
                onClick={handleBackToDashboard}
                className="absolute top-8 right-8 z-50 text-gray-500 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold bg-white/5 px-4 py-2 rounded-full border border-white/10"
              >
                Cancel & Return
              </button>
              <RFQWizard />
            </motion.div>
          )}

          {activeState === 'development' && selectedAircraft && (
            <motion.div 
              key="development"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0"
            >
              <DevelopmentView 
                aircraft={selectedAircraft} 
                onBack={handleBackToDashboard}
                onApprove={handleApproveDev}
              />
            </motion.div>
          )}

          {activeState === 'active_fleet' && selectedAircraft && (
            <motion.div 
              key="active_fleet"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0"
            >
              <ActiveFleetView 
                aircraft={selectedAircraft} 
                onBack={handleBackToDashboard} 
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
