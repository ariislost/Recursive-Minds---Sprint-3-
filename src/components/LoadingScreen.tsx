import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import citySkyscrapersBg from '../assets/images/city_skyscrapers_bills_bg_1788282427983.jpg';
import { FloatingBills } from './FloatingBills';

interface LoadingScreenProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onComplete, 
  minDurationMs = 2200 
}) => {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(100, Math.floor((elapsed / minDurationMs) * 100));
      
      // Add natural easing/step feeling
      setProgress(prev => {
        if (rawProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFinished(true);
            setTimeout(onComplete, 600);
          }, 300);
          return 100;
        }
        return Math.max(prev, rawProgress);
      });
    }, 30);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#081018] overflow-hidden select-none"
        >
          {/* Background image layer */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <img
              src={citySkyscrapersBg}
              alt="Skyscrapers & Floating Bills"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-60 scale-105"
            />
            {/* Cinematic Moody Fog Overlays */}
            <div className="absolute inset-0 bg-[#081018]/40 backdrop-blur-[1px]" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#081018]/50 to-[#081018]/90" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#081018] via-transparent to-[#081018]/70" />
          </div>

          {/* Dynamic Floating/Flying Bills & Receipts across skyscrapers */}
          <FloatingBills />

          {/* SVG Viewport Rounded Progress Frame - Exactly matching the uploaded images */}
          <div className="absolute inset-4 sm:inset-8 lg:inset-10 pointer-events-none z-10">
            <svg
              className="w-full h-full overflow-visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Subtle background track */}
              <rect
                x="2"
                y="2"
                width="calc(100% - 4px)"
                height="calc(100% - 4px)"
                rx="24"
                ry="24"
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1.5"
              />
              {/* Active animated stroke progress */}
              <rect
                x="2"
                y="2"
                width="calc(100% - 4px)"
                height="calc(100% - 4px)"
                rx="24"
                ry="24"
                fill="none"
                stroke="rgba(255, 255, 255, 0.75)"
                strokeWidth="2"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - progress}
                strokeLinecap="round"
                className="transition-all duration-75 ease-out drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
              />
            </svg>
          </div>

          {/* Top Header / Brand Mark */}
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <span className="text-[11px] font-medium tracking-[0.25em] text-white/70 uppercase">
                ClaimSync • Vault
              </span>
            </div>
            <div className="text-[11px] font-mono tracking-widest text-white/40 uppercase">
              {progress < 100 ? 'INITIALIZING ENGINE' : 'READY'}
            </div>
          </div>

          {/* Bottom Left Minimalist Percentage Display (Matching the screenshot exactly) */}
          <div className="relative z-20 flex flex-col justify-end mt-auto">
            <div className="flex items-baseline gap-3">
              <span className="text-6xl sm:text-8xl lg:text-9xl font-extralight tracking-tight text-white/90 font-mono drop-shadow-md">
                {progress}%
              </span>
            </div>
            <div className="text-xs sm:text-sm font-light text-white/50 tracking-wide mt-1 pl-1">
              Synchronizing warranties, receipts & recurring expenses
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
