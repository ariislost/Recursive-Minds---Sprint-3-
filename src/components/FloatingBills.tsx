import React from 'react';
import { motion } from 'motion/react';

interface FlyingBill {
  id: number;
  type: 'receipt' | 'bill' | 'invoice' | 'note';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotateStart: number;
  rotateEnd: number;
  duration: number;
  delay: number;
  scale: number;
  opacity: number;
}

const BILLS_CONFIG: FlyingBill[] = [
  { id: 1, type: 'receipt', startX: -15, startY: 25, endX: 115, endY: 45, rotateStart: -25, rotateEnd: 35, duration: 18, delay: 0, scale: 0.9, opacity: 0.45 },
  { id: 2, type: 'bill', startX: 115, startY: 70, endX: -20, endY: 30, rotateStart: 15, rotateEnd: -45, duration: 22, delay: 2, scale: 1.1, opacity: 0.4 },
  { id: 3, type: 'invoice', startX: -10, startY: 80, endX: 110, endY: 15, rotateStart: -10, rotateEnd: 50, duration: 25, delay: 5, scale: 0.8, opacity: 0.35 },
  { id: 4, type: 'receipt', startX: 30, startY: 110, endX: 85, endY: -15, rotateStart: 30, rotateEnd: -20, duration: 16, delay: 8, scale: 0.95, opacity: 0.5 },
  { id: 5, type: 'note', startX: 110, startY: 10, endX: -15, endY: 85, rotateStart: -40, rotateEnd: 25, duration: 20, delay: 4, scale: 0.85, opacity: 0.38 },
  { id: 6, type: 'receipt', startX: -20, startY: 50, endX: 120, endY: 75, rotateStart: 10, rotateEnd: 60, duration: 24, delay: 11, scale: 1.05, opacity: 0.42 },
  { id: 7, type: 'bill', startX: 80, startY: 115, endX: 15, endY: -20, rotateStart: -15, rotateEnd: 35, duration: 19, delay: 7, scale: 0.75, opacity: 0.32 },
  { id: 8, type: 'invoice', startX: -15, startY: 10, endX: 115, endY: 90, rotateStart: 45, rotateEnd: -30, duration: 27, delay: 13, scale: 1.0, opacity: 0.35 }
];

export const FloatingBills: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[2]">
      {BILLS_CONFIG.map((item) => (
        <motion.div
          key={item.id}
          initial={{
            x: `${item.startX}vw`,
            y: `${item.startY}vh`,
            rotate: item.rotateStart,
            opacity: 0,
            scale: item.scale
          }}
          animate={{
            x: [`${item.startX}vw`, `${(item.startX + item.endX) / 2 + (item.id % 2 === 0 ? 5 : -5)}vw`, `${item.endX}vw`],
            y: [`${item.startY}vh`, `${(item.startY + item.endY) / 2 + (item.id % 2 === 0 ? -8 : 8)}vh`, `${item.endY}vh`],
            rotate: [item.rotateStart, (item.rotateStart + item.rotateEnd) / 2, item.rotateEnd],
            opacity: [0, item.opacity, item.opacity * 0.9, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "easeInOut",
          }}
          className="absolute"
        >
          {item.type === 'receipt' && (
            <div className="w-20 sm:w-28 p-2 sm:p-2.5 rounded-[4px] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl space-y-1 transform-gpu">
              <div className="flex justify-between items-center border-b border-white/20 pb-1">
                <div className="w-8 h-1 bg-[var(--color-accent)]/80 rounded-full" />
                <div className="w-3 h-1 bg-white/50 rounded-full" />
              </div>
              <div className="space-y-0.5 pt-0.5">
                <div className="w-full h-0.5 bg-white/30 rounded" />
                <div className="w-3/4 h-0.5 bg-white/25 rounded" />
                <div className="w-5/6 h-0.5 bg-white/20 rounded" />
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-white/15">
                <div className="w-5 h-1 bg-white/40 rounded" />
                <div className="w-6 h-1 bg-[var(--color-accent)]/90 rounded" />
              </div>
              {/* Receipt sawtooth cut bottom */}
              <div className="flex justify-between -mb-2 pt-1 opacity-40">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1 bg-white/30 rotate-45 transform" />
                ))}
              </div>
            </div>
          )}

          {item.type === 'bill' && (
            <div className="w-24 sm:w-32 h-14 sm:h-18 p-2 rounded-[6px] bg-[#102422]/50 backdrop-blur-md border border-[var(--color-accent)]/30 shadow-2xl flex flex-col justify-between transform-gpu">
              <div className="flex justify-between items-center">
                <span className="text-[8px] sm:text-[9px] font-mono text-[var(--color-accent)]/90 font-bold">$100</span>
                <span className="text-[7px] text-white/50 tracking-wider">CLAIM SYNC</span>
                <span className="text-[8px] sm:text-[9px] font-mono text-[var(--color-accent)]/90 font-bold">$100</span>
              </div>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-[var(--color-accent)]/40 mx-auto flex items-center justify-center bg-white/5">
                <div className="w-3 h-3 rounded-full bg-[var(--color-accent)]/30" />
              </div>
              <div className="flex justify-between items-center text-[6px] text-white/40 font-mono">
                <span>SERIES 2026</span>
                <span>FEDERAL VAULT</span>
              </div>
            </div>
          )}

          {item.type === 'invoice' && (
            <div className="w-22 sm:w-30 p-2 rounded-[5px] bg-white/10 backdrop-blur-md border border-white/25 shadow-xl space-y-1.5 transform-gpu">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]/70" />
                <div className="w-10 h-1 bg-white/60 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-1 py-1 border-y border-white/15">
                <div className="w-full h-1 bg-white/30 rounded" />
                <div className="w-full h-1 bg-white/20 rounded" />
                <div className="w-full h-1 bg-white/25 rounded" />
                <div className="w-full h-1 bg-[var(--color-accent)]/50 rounded" />
              </div>
              <div className="w-12 h-1 bg-white/40 rounded ml-auto" />
            </div>
          )}

          {item.type === 'note' && (
            <div className="w-18 sm:w-24 h-12 sm:h-16 p-1.5 rounded-[4px] bg-[#0c1f2e]/60 backdrop-blur-md border border-white/20 shadow-lg flex flex-col justify-between transform-gpu">
              <div className="w-4 h-1 bg-[var(--color-accent)]/90 rounded" />
              <div className="space-y-0.5">
                <div className="w-full h-0.5 bg-white/30 rounded" />
                <div className="w-4/5 h-0.5 bg-white/20 rounded" />
              </div>
              <div className="w-3 h-3 rounded-full border border-white/30 self-end" />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};
