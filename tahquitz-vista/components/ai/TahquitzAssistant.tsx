"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/app/providers';

export default function TahquitzAssistant() {
  const { activeColors } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [query, setQuery] = useState("");

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setQuery(""); // Clear text when starting voice
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    console.log(`[Tahquitz AI] Processing Command: "${query}"`);
    // Here we would send the string to Tahquitz Core / LLM for ARINC translation
    
    setQuery("");
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-center w-full h-14 rounded-full overflow-hidden backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500"
        style={{ 
          background: 'linear-gradient(135deg, rgba(30,30,30,0.8), rgba(10,10,10,0.9))',
          boxShadow: isListening ? `0 0 40px ${activeColors.accent}40` : '0 10px 30px rgba(0,0,0,0.5)'
        }}
      >
        {/* Animated Listening Waveform (simulated) */}
        <AnimatePresence>
          {isListening && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-0 opacity-20 pointer-events-none flex items-center justify-center gap-1"
            >
              {[1,2,3,4,5].map((i) => (
                <motion.div
                  key={i}
                  animate={{ height: ["20%", "80%", "20%"] }}
                  transition={{ repeat: Infinity, duration: 0.8 + (i * 0.1), ease: "easeInOut" }}
                  className="w-1 rounded-full"
                  style={{ backgroundColor: activeColors.accent }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Field */}
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? "Listening..." : "Ask Tahquitz..."}
          className="w-full h-full bg-transparent outline-none pl-6 pr-16 text-white placeholder:text-white/30 z-10 font-light"
          disabled={isListening}
        />

        {/* Voice/Mic Button */}
        <button 
          type="button"
          onClick={handleVoiceToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors"
          style={{ 
            backgroundColor: isListening ? activeColors.accent : 'rgba(255,255,255,0.05)',
            color: isListening ? '#000' : activeColors.accent 
          }}
        >
          {/* Simple SVG Mic Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </button>
      </form>
    </div>
  );
}
