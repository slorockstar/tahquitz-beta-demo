"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { jellyfin, JellyfinItem } from '@/services/JellyfinClient';
import { useTheme } from '@/app/providers';

export default function MediaGallery() {
  const { activeColors } = useTheme();
  const [movies, setMovies] = useState<JellyfinItem[]>([]);
  const [series, setSeries] = useState<JellyfinItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMedia() {
      // Fetch both movies and series in parallel
      const [fetchedMovies, fetchedSeries] = await Promise.all([
        jellyfin.getLatestMedia('Movie'),
        jellyfin.getLatestMedia('Series')
      ]);
      setMovies(fetchedMovies);
      setSeries(fetchedSeries);
      setLoading(false);
    }
    fetchMedia();
  }, []);

  const handlePlay = (item: JellyfinItem) => {
    console.log(`[MediaGallery] Sync to Monitor -> Playing: ${item.Name}`);
    // In the future, this emits a WebSocket payload to Tahquitz Core to start playback on the bulkhead monitor
  };

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-pulse w-8 h-8 rounded-full" style={{ backgroundColor: activeColors.accent }} />
      </div>
    );
  }

  const renderGrid = (title: string, items: JellyfinItem[]) => (
    <div className="mb-10 w-full">
      <h3 className="text-sm font-medium tracking-widest text-gray-400 uppercase mb-4 pl-2">{title}</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
        {items.map((item) => (
          <motion.div
            key={item.Id}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePlay(item)}
            className="flex-none w-32 md:w-40 snap-start cursor-pointer group relative"
          >
            <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-black/50 border border-white/10 relative shadow-lg">
              {/* If we had real poster URLs, we'd use an <img /> tag here. For the mock, we generate gradients */}
              <div 
                className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ 
                  background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)), linear-gradient(${Math.random() * 360}deg, #222, #444)` 
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                {/* Play Icon */}
                <svg width="40" height="40" viewBox="0 0 24 24" fill={activeColors.accent} stroke="none">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
            <div className="mt-2 text-xs font-medium text-white/90 truncate pl-1">{item.Name}</div>
            <div className="text-[10px] text-gray-500 pl-1">{item.ProductionYear || 'Unknown'}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col pt-2">
      {renderGrid('Movies', movies)}
      {renderGrid('Television', series)}
    </div>
  );
}
