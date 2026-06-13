"use client";

import { useState } from "react";
import SkeuomorphicDial from "@/components/controls/SkeuomorphicDial";
import { useTheme } from "./providers";

export default function Home() {
  const { themeConfig, updateTheme, activeColors } = useTheme();
  
  // Simulated state for a UI payload response
  const [lastPayload, setLastPayload] = useState<number | null>(null);

  const handleDialRelease = (val: number) => {
    // This is where we'd dispatch to Tahquitz Core via WebSockets
    console.log(`[NETWORK EVENT] Dispatching payload to Tahquitz Core -> Dimmer: ${val}%`);
    setLastPayload(val);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-8 gap-16 flex-wrap">
      {/* Interactive Dial Section */}
      <section className="flex flex-col items-center">
        <div className="mb-12 text-center max-w-md">
          <h1 className="text-3xl font-light tracking-widest uppercase mb-4">Master Suite</h1>
          <p className="text-gray-500 text-sm">
            Drag the dial to adjust lighting. Notice the instant local response (Optimistic UI). 
            The system only sends the network payload when you release the dial to prevent ARINC bus flooding.
          </p>
        </div>

        <SkeuomorphicDial 
          initialValue={75} 
          label="OVERHEAD DIMMER" 
          onChangeComplete={handleDialRelease} 
        />

        {lastPayload !== null && (
          <div className="mt-8 px-4 py-2 rounded-md bg-black/40 border border-white/10 font-mono text-xs text-green-400">
            [PAYLOAD DISPATCHED] Level: {lastPayload}%
          </div>
        )}
      </section>

      {/* Hot-Skinning Theme Controls (Mocking the Screenshot) */}
      <aside className="w-96 rounded-xl border border-white/10 p-6" style={{ background: 'var(--bg-color)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
        <h2 className="text-xl font-medium mb-1">Appearance</h2>
        <p className="text-sm text-gray-500 mb-8">Configure the agent's visual theme and display preferences.</p>

        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-lg border border-white/5">
            <div>
              <div className="font-medium">Appearance</div>
              <div className="text-xs text-gray-500">Select light, dark, or inherit system settings.</div>
            </div>
            <select 
              className="bg-black/50 border border-white/20 rounded px-2 py-1 text-sm outline-none"
              value={themeConfig.mode}
              onChange={(e) => updateTheme({ mode: e.target.value as any })}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <h3 className="font-medium mb-3">{themeConfig.mode === 'light' ? 'Light Theme' : 'Dark Theme'}</h3>
            <div className="space-y-2">
              {/* Background Color Picker */}
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="text-sm">Background</span>
                <div className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded">
                  <input 
                    type="color" 
                    value={activeColors.background}
                    onChange={(e) => {
                      const newColors = { ...activeColors, background: e.target.value };
                      updateTheme(themeConfig.mode === 'light' ? { lightTheme: newColors } : { darkTheme: newColors });
                    }}
                    className="w-5 h-5 cursor-pointer rounded border-0"
                  />
                  <span className="font-mono text-xs">{activeColors.background.toUpperCase()}</span>
                </div>
              </div>

              {/* Accent Color Picker */}
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="text-sm">Accent</span>
                <div className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded">
                  <input 
                    type="color" 
                    value={activeColors.accent}
                    onChange={(e) => {
                      const newColors = { ...activeColors, accent: e.target.value };
                      updateTheme(themeConfig.mode === 'light' ? { lightTheme: newColors } : { darkTheme: newColors });
                    }}
                    className="w-5 h-5 cursor-pointer rounded border-0"
                  />
                  <span className="font-mono text-xs">{activeColors.accent.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
