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

  const [activeVideo, setActiveVideo] = useState<JellyfinItem | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

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
    setActiveVideo(item);
  };

  const handlePiP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-pulse w-8 h-8 rounded-full" style={{ backgroundColor: activeColors.accent }} />
      </div>
    );
  }

  // Active Video Player Mode
  if (activeVideo) {
    return (
      <div className="w-full h-full flex flex-col bg-black rounded-2xl overflow-hidden relative group">
        
        {/* Top Controls Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity">
          <div>
             <h2 className="text-white text-lg font-medium">{activeVideo.Name}</h2>
             <p className="text-gray-400 text-xs tracking-widest uppercase">{activeVideo.ProductionYear || 'Unknown'}</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePiP}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
              title="Picture in Picture"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <rect x="11" y="11" width="8" height="6" rx="1" ry="1"></rect>
              </svg>
            </button>
            <button 
              onClick={() => setActiveVideo(null)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
              title="Close Player"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Dummy Video Player */}
        <video 
          ref={videoRef}
          src="https://www.w3schools.com/html/mov_bbb.mp4" 
          className="w-full h-full object-cover"
          autoPlay 
          controls 
          crossOrigin="anonymous"
        />
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
              {/* Render Image or Fallback */}
              {item.ImageTags?.Primary ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={jellyfin.getImageUrl(item.Id, item.ImageTags.Primary)} 
                  alt={item.Name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div 
                  className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ 
                    background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)), linear-gradient(${Math.random() * 360}deg, #222, #444)` 
                  }}
                />
              )}
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
    <div className="w-full h-full flex flex-col pt-2 overflow-y-auto no-scrollbar">
      {renderGrid('Movies', movies)}
      {renderGrid('Television', series)}
    </div>
  );
}
