import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ThemeMode } from '../types';
import { Palette, Check, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ThemeSwitcherProps {
  compact?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ compact = false }) => {
  const { theme, setTheme, themeConfig, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectTheme = (themeId: ThemeMode) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="theme-switcher-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[var(--color-accent-border)] text-xs font-medium text-white/90 transition-all cursor-pointer shadow-xs active:scale-95 ${
          isOpen ? 'ring-2 ring-[var(--color-accent-border)] bg-white/10' : ''
        }`}
        title="Change UI Theme Colors"
      >
        <div className="flex items-center gap-1.5">
          {/* Swatch dots for active theme */}
          <span 
            className="w-2.5 h-2.5 rounded-full ring-1 ring-white/30 shrink-0 shadow-xs"
            style={{ backgroundColor: themeConfig.accent }}
          />
          <Palette className="w-3.5 h-3.5 text-[var(--color-accent)]" />
        </div>

        {!compact && (
          <span className="hidden md:inline-block font-sans text-white/80">
            {themeConfig.shortName}
          </span>
        )}

        <ChevronDown className={`w-3 h-3 text-white/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-72 sm:w-80 rounded-[22px] bg-[#0A131F]/95 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/80 p-3.5 z-50 text-white font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2 pb-2.5 mb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  UI Theme Colors
                </span>
              </div>
              <span className="text-[10px] text-white/40 font-mono">
                {availableThemes.length} presets
              </span>
            </div>

            {/* Theme Options List */}
            <div className="space-y-1.5">
              {availableThemes.map((item) => {
                const isActive = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    id={`theme-option-${item.id}`}
                    onClick={() => handleSelectTheme(item.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-[16px] border transition-all text-left cursor-pointer group ${
                      isActive
                        ? 'bg-white/15 border-[var(--color-accent)] shadow-md shadow-black/40'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Dual Color Swatch Circle */}
                      <div className="relative w-8 h-8 rounded-full border border-white/20 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                        <div 
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${item.accent} 0%, ${item.bgBase} 100%)`
                          }}
                        />
                        <span 
                          className="relative w-3.5 h-3.5 rounded-full border border-white/30 shadow-xs"
                          style={{ backgroundColor: item.accent }}
                        />
                      </div>

                      {/* Text details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isActive ? 'text-[var(--color-accent)]' : 'text-white'}`}>
                            {item.shortName}
                          </span>
                          {item.id === 'yellow-blue' && (
                            <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[9px] text-white/60 font-mono">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-white/50 line-clamp-1 mt-0.5">
                          {item.name}
                        </p>
                      </div>
                    </div>

                    {/* Checkmark indicator */}
                    <div className="shrink-0 pl-2">
                      {isActive ? (
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[#081018] shadow-xs"
                          style={{ backgroundColor: item.accent }}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/20 group-hover:border-white/40" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer note */}
            <div className="mt-3 pt-2 px-1 text-[10px] text-white/40 text-center border-t border-white/5">
              Theme automatically matches all screens, buttons, radar &amp; badges.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
