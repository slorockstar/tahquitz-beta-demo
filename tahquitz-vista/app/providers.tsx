"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme configuration matching the Apex backend schema (like the provided screenshot)
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  foreground: string;
  accent: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  lightTheme: ThemeColors;
  darkTheme: ThemeColors;
}

const defaultTheme: ThemeConfig = {
  mode: 'dark',
  lightTheme: {
    background: '#EEEEEE',
    foreground: '#101010',
    accent: '#007ACC',
  },
  darkTheme: {
    background: '#101010', // Deep black for VVIP OLED panels
    foreground: '#FFFFFF',
    accent: '#D4AF37', // Default Tahquitz Gold
  }
};

interface ThemeContextProps {
  themeConfig: ThemeConfig;
  updateTheme: (newConfig: Partial<ThemeConfig>) => void;
  activeColors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextProps>({
  themeConfig: defaultTheme,
  updateTheme: () => {},
  activeColors: defaultTheme.darkTheme,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(defaultTheme);

  // In a real scenario, this is where we'd fetch the `config.json` payload from the network
  // and set the initial theme state. For now, we simulate "hot-skinning" via state updates.

  const updateTheme = (newConfig: Partial<ThemeConfig>) => {
    setThemeConfig(prev => ({ ...prev, ...newConfig }));
  };

  const isDark = themeConfig.mode === 'dark' || 
    (themeConfig.mode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const activeColors = isDark ? themeConfig.darkTheme : themeConfig.lightTheme;

  // Dynamically inject CSS variables onto the root document for Tailwind & inline styling
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--bg-color', activeColors.background);
    root.style.setProperty('--fg-color', activeColors.foreground);
    root.style.setProperty('--accent-color', activeColors.accent);
  }, [activeColors]);

  return (
    <ThemeContext.Provider value={{ themeConfig, updateTheme, activeColors }}>
      <div 
        style={{ 
          backgroundColor: 'var(--bg-color)', 
          color: 'var(--fg-color)' 
        }}
        className="min-h-screen transition-colors duration-500"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
