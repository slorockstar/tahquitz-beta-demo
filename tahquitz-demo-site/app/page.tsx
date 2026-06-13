"use client";

import { useState } from "react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'vista' | 'apex'>('vista');

  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tahquitz-accent opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation Header */}
      <nav className="w-full p-8 flex justify-between items-center glass-panel z-10">
        <div className="text-2xl font-light tracking-[0.3em] uppercase text-white">
          Tahquitz <span className="text-tahquitz-accent font-medium">AG</span>
        </div>
        <div className="text-sm tracking-widest text-gray-400 uppercase">Beta Preview Program</div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-16 z-10">
        <h1 className="text-5xl md:text-7xl font-thin tracking-tight mb-6">
          The Future of <span className="text-tahquitz-accent">VVIP Cabin Software.</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mb-12">
          Hardware-agnostic. Data-driven. Zero technical debt. Experience the world's first truly software-defined ecosystem designed exclusively for Head-of-State aerospace.
        </p>

        {/* Tab Switcher */}
        <div className="flex space-x-4 mb-16 p-2 rounded-full glass-panel">
          <button
            onClick={() => setActiveTab('vista')}
            className={`px-8 py-3 rounded-full text-sm tracking-widest uppercase transition-all duration-300 ${
              activeTab === 'vista'
                ? 'bg-tahquitz-accent text-black font-medium gold-glow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Tahquitz Vista (UI)
          </button>
          <button
            onClick={() => setActiveTab('apex')}
            className={`px-8 py-3 rounded-full text-sm tracking-widest uppercase transition-all duration-300 ${
              activeTab === 'apex'
                ? 'bg-tahquitz-accent text-black font-medium gold-glow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Tahquitz Apex (Cloud)
          </button>
        </div>

        {/* Dynamic Content Area based on Tab */}
        <div className="w-full max-w-5xl transition-all duration-500 ease-in-out">
          {activeTab === 'vista' ? (
            <div className="glass-panel rounded-3xl p-12 text-left transform transition-all hover:scale-[1.01] border-t-4 border-t-tahquitz-accent">
              <h2 className="text-3xl font-light mb-4">Tahquitz <span className="font-medium text-tahquitz-accent">Vista</span></h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                The visible face of the brand. An ultra-premium, deeply responsive frontend layer built using React and Next.js. Vista implements hyper-minimalist layout mechanics with rich, skeuomorphic depth parameters, transitioning smoothly across flight phases.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                  <div className="text-tahquitz-accent text-xl mb-2">✦ Hot-Skinning</div>
                  <div className="text-sm text-gray-500">Swap corporate branding instantly over satellite networks.</div>
                </div>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                  <div className="text-tahquitz-accent text-xl mb-2">✦ Skeuomorphic</div>
                  <div className="text-sm text-gray-500">Tactile, physics-based dials that feel real under glass.</div>
                </div>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                  <div className="text-tahquitz-accent text-xl mb-2">✦ Zero-Install</div>
                  <div className="text-sm text-gray-500">Renders instantly as a PWA on passenger personal devices.</div>
                </div>
              </div>
              <button className="btn-luxury w-full md:w-auto">Launch Vista Demo</button>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-left transform transition-all hover:scale-[1.01] border-t-4 border-t-blue-500">
              <h2 className="text-3xl font-light mb-4">Tahquitz <span className="font-medium text-blue-500">Apex</span></h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                The Ground Engine. A multi-tenant cloud-based fleet manager and visual cabin configurator. Apex converts simple checklist room requirements directly into a production-grade deployment file, stripping months of engineering time.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                  <div className="text-blue-500 text-xl mb-2">⬡ Visual Configurator</div>
                  <div className="text-sm text-gray-500">Drag-and-drop cabin asset mapping.</div>
                </div>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                  <div className="text-blue-500 text-xl mb-2">⬡ Automated ATPs</div>
                  <div className="text-sm text-gray-500">Compiles granular, FAA-compliant test procedures automatically.</div>
                </div>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                  <div className="text-blue-500 text-xl mb-2">⬡ Core Sync</div>
                  <div className="text-sm text-gray-500">Pushes strict JSON schemas directly to the airborne OS.</div>
                </div>
              </div>
              <button className="btn-luxury border-blue-500 text-blue-500 hover:bg-blue-500/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] w-full md:w-auto">Launch Apex Portal</button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full p-8 text-center text-xs text-gray-600 tracking-widest uppercase mt-24">
        © 2026 Kovach Design. Strictly Confidential. Project AntiGravity.
      </footer>
    </main>
  );
}
