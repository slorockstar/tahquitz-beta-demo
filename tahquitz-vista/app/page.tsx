'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MarketingHomepage() {
  
  const pillars = [
    {
      title: 'Tahquitz Apex',
      subtitle: 'The Cloud Backend & Fleet Manager',
      description: 'The single pane of glass for OEMs, completion centers, and operators. Manage the entire lifecycle from RFQ generation to active in-flight OTA updates and Media CMS distribution.',
      link: '/portal',
      linkText: 'Launch Apex Portal',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      )
    },
    {
      title: 'Tahquitz Core',
      subtitle: 'The Secure Local OS',
      description: 'A hardware-agnostic translation layer residing securely on the aircraft. Core abstracts legacy ARINC/RS485 protocols, ensuring the modern UI never speaks directly to legacy hardware.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
          <rect x="9" y="9" width="6" height="6"/>
          <line x1="9" y1="1" x2="9" y2="4"/>
          <line x1="15" y1="1" x2="15" y2="4"/>
          <line x1="9" y1="20" x2="9" y2="23"/>
          <line x1="15" y1="20" x2="15" y2="23"/>
          <line x1="20" y1="9" x2="23" y2="9"/>
          <line x1="20" y1="14" x2="23" y2="14"/>
          <line x1="1" y1="9" x2="4" y2="9"/>
          <line x1="1" y1="14" x2="4" y2="14"/>
        </svg>
      )
    },
    {
      title: 'Tahquitz Vista',
      subtitle: 'The VVIP Frontend GUI',
      description: 'An ultra-luxury, context-aware graphical interface. Replacing static legacy screens with dynamic glassmorphism, responsive role-based access (RBAC), and fluid micro-animations.',
      link: '/demo',
      linkText: 'Launch Vista Demo',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      )
    },
    {
      title: 'AI Testing Matrix',
      subtitle: 'Automated QA & Validation',
      description: 'The built-in automated testing framework that validates complex cabin logic (e.g. "If Smoke Detected in Majlis -> Turn lights 100% White -> Override Audio") before ever touching an aircraft.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
          <path d="M12 12 2.1 7.1"/>
          <path d="M12 12l8.5 5.5"/>
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans selection:bg-white/20">
      
      {/* Hero Section */}
      <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="z-10 text-center flex flex-col items-center">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-xs uppercase tracking-[0.4em] text-gray-400 mb-6"
          >
            By Kovach Design
          </motion.p>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-7xl md:text-9xl font-extralight tracking-widest uppercase mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500"
          >
            Tahquitz
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-lg md:text-2xl font-light text-gray-400 tracking-wide max-w-3xl px-8 leading-relaxed"
          >
            The Hardware-Agnostic Ecosystem Disrupting Legacy VVIP Aviation.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 flex flex-col items-center gap-4"
          >
            <p className="text-[10px] uppercase tracking-widest text-gray-500">Scroll to Explore The Architecture</p>
            <div className="w-[1px] h-16 bg-gradient-to-b from-gray-500 to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* The 4 Pillars Section */}
      <div className="w-full max-w-7xl mx-auto px-8 py-32">
        <div className="mb-24 text-center">
          <h2 className="text-3xl font-light tracking-widest uppercase mb-4">The Four Pillars</h2>
          <p className="text-gray-400">A completely abstracted, secure, and infinitely scalable software architecture.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {pillars.map((pillar, i) => (
            <motion.div 
              key={pillar.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 text-gray-300 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                {pillar.icon}
              </div>
              <h3 className="text-2xl font-light tracking-widest uppercase mb-2">{pillar.title}</h3>
              <p className="text-xs text-yellow-500/80 font-bold uppercase tracking-widest mb-6">{pillar.subtitle}</p>
              <p className="text-gray-400 leading-relaxed mb-8">{pillar.description}</p>
              
              {pillar.link && (
                <Link href={pillar.link}>
                  <button className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors group/btn">
                    {pillar.linkText}
                    <svg className="group-hover/btn:translate-x-2 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="w-full border-t border-white/10 py-24 flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-white/5">
         <h2 className="text-2xl font-light tracking-widest uppercase mb-8">Access the Ecosystem</h2>
         <div className="flex gap-6">
            <Link href="/demo">
              <button className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full hover:scale-105 transition-transform shadow-lg shadow-white/20">
                Enter Vista GUI
              </button>
            </Link>
            <Link href="/portal">
              <button className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold uppercase tracking-widest text-xs rounded-full hover:bg-white/10 transition-colors">
                Enter Apex Portal
              </button>
            </Link>
         </div>
         <p className="text-[10px] text-gray-600 tracking-widest uppercase mt-8 text-center max-w-sm">
           Demo Access is strictly password protected.<br/>Authorized personnel only.
         </p>
      </div>

    </div>
  );
}
