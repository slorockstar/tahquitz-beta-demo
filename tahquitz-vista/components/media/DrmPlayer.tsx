'use client';

import React, { useEffect, useRef, useState } from 'react';
// We import shaka from the 'shaka-player' package.
// For Next.js client components, we use dynamic imports or require it inside useEffect
// since Shaka accesses the window object.
import 'shaka-player/dist/controls.css';

interface DrmPlayerProps {
  manifestUri: string;
  posterUri?: string;
  drmLicenseServerUri?: string;
  drmType?: 'com.widevine.alpha' | 'com.microsoft.playready' | 'com.apple.fps.1_0';
}

export default function DrmPlayer({ manifestUri, posterUri, drmLicenseServerUri, drmType }: DrmPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let player: any = null;
    let ui: any = null;

    const initPlayer = async () => {
      // Import shaka-player dynamically to avoid Next.js SSR issues
      const shaka = (await import('shaka-player/dist/shaka-player.ui.js')).default;
      
      // Check if browser is supported
      if (!shaka.Player.isBrowserSupported()) {
        setError('Browser not supported for DRM playback.');
        return;
      }

      if (videoRef.current && containerRef.current) {
        player = new shaka.Player(videoRef.current);
        ui = new shaka.ui.Overlay(player, containerRef.current, videoRef.current);

        // Configure DRM if a license server is provided
        if (drmLicenseServerUri && drmType) {
          player.configure({
            drm: {
              servers: {
                [drmType]: drmLicenseServerUri
              }
            }
          });
        }

        // Listen for error events
        player.addEventListener('error', (event: any) => {
          console.error('Shaka Player Error:', event.detail);
          setError(`Player Error Code: ${event.detail.code}`);
        });

        try {
          // Load the CMAF/DASH manifest
          await player.load(manifestUri);
          console.log('The video has successfully loaded!');
        } catch (e: any) {
          console.error('Error loading video:', e);
          setError(`Error loading video: ${e.message}`);
        }
      }
    };

    initPlayer();

    return () => {
      if (player) {
        player.destroy();
      }
      if (ui) {
        ui.destroy();
      }
    };
  }, [manifestUri, drmLicenseServerUri, drmType]);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-black relative border border-white/10">
      {error && (
        <div className="absolute top-4 left-4 z-50 bg-red-500/90 text-white px-4 py-2 rounded shadow-lg text-sm backdrop-blur-md">
          {error}
        </div>
      )}
      <div ref={containerRef} className="w-full aspect-video bg-black/50">
        <video 
          ref={videoRef} 
          className="w-full h-full"
          poster={posterUri}
          autoPlay={false}
          controls={false} // Shaka UI handles controls
        />
      </div>
      <div className="p-4 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 w-full pointer-events-none">
        {drmLicenseServerUri && (
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-mono text-green-500 tracking-widest uppercase opacity-80">
               DRM SECURED: {drmType}
             </span>
          </div>
        )}
      </div>
    </div>
  );
}
