import React, { useState, useEffect } from 'react';

interface AtmosphericCloudIntroProps {
  onComplete?: () => void;
  autoCloseMs?: number;
}

export const AtmosphericCloudIntro: React.FC<AtmosphericCloudIntroProps> = ({
  onComplete,
  autoCloseMs = 900
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isParting, setIsParting] = useState<boolean>(false);

  useEffect(() => {
    // Smooth Apple-grade parting transition at 450ms
    const tPart = setTimeout(() => {
      setIsParting(true);
    }, 450);

    // Fully unmount from DOM
    const tEnd = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, autoCloseMs);

    return () => {
      clearTimeout(tPart);
      clearTimeout(tEnd);
    };
  }, [autoCloseMs, onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#07080A] select-none pointer-events-none overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isParting ? 'opacity-0 scale-102 backdrop-blur-none' : 'opacity-100 scale-100 backdrop-blur-xl'
      }`}
    >
      {/* Background Soft Atmospheric Mist Gradients - Dark Grey / Charcoal Mist */}
      <div 
        className={`absolute -left-20 top-0 bottom-0 w-3/4 pointer-events-none transition-transform duration-700 ease-out ${
          isParting ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-80'
        }`}
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, rgba(255, 255, 255, 0.04) 0%, rgba(18, 19, 23, 0.75) 45%, transparent 75%)',
          filter: 'blur(35px)'
        }}
      />

      <div 
        className={`absolute -right-20 top-0 bottom-0 w-3/4 pointer-events-none transition-transform duration-700 ease-out ${
          isParting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-80'
        }`}
        style={{
          background: 'radial-gradient(ellipse at 70% 50%, rgba(200, 205, 215, 0.04) 0%, rgba(18, 19, 23, 0.75) 45%, transparent 75%)',
          filter: 'blur(35px)'
        }}
      />

      {/* Center Refined Geometric Emblem & Loading Readout in Pure Black / Slate Grey */}
      <div className="relative flex flex-col items-center justify-center text-center z-20 px-6">
        {/* Isobar Ring Animation */}
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-20 h-20 rounded-full border border-zinc-700/50 flex items-center justify-center animate-spin" style={{ animationDuration: '12s' }}>
            <div className="w-14 h-14 rounded-full border border-dashed border-zinc-600/40" />
          </div>

          {/* Center SVG Micro-Crescent & Isobar Emblem - Frosted Obsidian Dark Grey */}
          <div className="absolute w-12 h-12 rounded-2xl bg-zinc-900/90 border border-zinc-700/60 backdrop-blur-2xl flex items-center justify-center text-zinc-100 shadow-[0_0_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)]">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-6 h-6 text-zinc-200"
            >
              <circle cx="12" cy="12" r="9" strokeOpacity="0.25" strokeDasharray="3 2" />
              <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.5 5.5 0 1 1-7.54-7.54C12.92 3.04 12.46 3 12 3z" />
              <circle cx="12" cy="12" r="1.5" fill="#e4e4e7" />
            </svg>
          </div>
        </div>

        {/* Minimal Brand Typography */}
        <h1 className="font-mono text-base font-semibold tracking-[0.28em] uppercase text-white">
          SKYCAST
        </h1>
        <div className="text-[9px] font-mono tracking-[0.24em] uppercase text-zinc-400 mt-0.5">
          Atmospheric Nowcasting
        </div>

        {/* Progress Indicator - Monochromatic Minimalist Pill */}
        <div className="mt-4 flex items-center space-x-2 text-[10px] font-mono text-zinc-400 bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-800 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-200 animate-ping" />
          <span className="tracking-wider">INITIALIZING CONVECTIVE SENSORS...</span>
        </div>
      </div>
    </div>
  );
};
