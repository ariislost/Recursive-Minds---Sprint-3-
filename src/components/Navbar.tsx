import React, { useState } from 'react';
import { TabType, AppUser, Item } from '../types';
import { useTheme } from '../context/ThemeContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import { 
  ShieldCheck, 
  Lock, 
  Camera, 
  LayoutDashboard, 
  CreditCard, 
  Gift, 
  X,
} from 'lucide-react';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  currentUser: AppUser | null;
  onLogout: () => void;
  itemsCount: number;
  subsCount: number;
  urgentCount?: number;
  onReplayLoading?: () => void;
  items?: Item[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onLogout,
  itemsCount,
  subsCount,
  urgentCount = 1,
  onReplayLoading,
  items = [],
}) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const { themeConfig } = useTheme();

  return (
    <>
      {/* Top Glassmorphic Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[var(--color-slate-bg)]/90 backdrop-blur-xl border-b border-white/10 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 space-y-2.5">
          
          {/* Top Row: ClaimSync Brand + Action Buttons */}
          <div className="flex items-center justify-between gap-3">
            {/* Brand Logo */}
            <div 
              id="brand-logo-btn"
              onClick={() => onTabChange('dashboard')} 
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-8 h-8 rounded-full bg-accent-gradient flex items-center justify-center shadow-md shadow-[var(--color-accent-glow)] group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4.5 h-4.5 text-[#081018] stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                ClaimSync
              </span>
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Switcher Dropdown */}
              <ThemeSwitcher />

              {/* 100% Privacy Guard Pill */}
              <button
                type="button"
                id="privacy-guard-btn"
                onClick={() => setShowPrivacyModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-all cursor-pointer shadow-xs"
                title="View Privacy Architecture"
              >
                <Lock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>100% Privacy Guard</span>
              </button>

              {/* Camera Icon Button */}
              <button
                type="button"
                id="top-snap-receipt-btn"
                onClick={() => onTabChange('upload')}
                className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[var(--color-accent)] border border-[var(--color-accent-border)] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
                title="Snap Camera HUD"
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden lg:inline text-[11px]">Scan</span>
              </button>

              {currentUser && (
                <button
                  id="logout-nav-btn"
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-300 border border-white/10 text-xs font-medium transition-all cursor-pointer shadow-xs"
                  title="Sign Out"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row: Navigation Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pt-1">
            {/* Dashboard Tab */}
            <button
              type="button"
              id="nav-tab-dashboard-header"
              onClick={() => onTabChange('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                currentTab === 'dashboard'
                  ? 'bg-white/15 text-white shadow-xs font-bold border border-white/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Dashboard</span>
            </button>

            {/* Snap Camera HUD Tab */}
            <button
              type="button"
              id="nav-tab-upload-header"
              onClick={() => onTabChange('upload')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                currentTab === 'upload'
                  ? 'bg-white/15 text-white shadow-xs font-bold border border-white/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Camera className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Snap Camera HUD</span>
            </button>

            {/* Subscriptions Tab */}
            <button
              type="button"
              id="nav-tab-subscriptions-header"
              onClick={() => onTabChange('subscriptions')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                currentTab === 'subscriptions'
                  ? 'bg-white/15 text-white shadow-xs font-bold border border-white/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Subscriptions</span>
              {subsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/15 text-white text-[10px] font-bold">
                  {subsCount}
                </span>
              )}
            </button>

            {/* Offers & Renewals Tab */}
            <button
              type="button"
              id="nav-tab-offers-header"
              onClick={() => onTabChange('offers')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                currentTab === 'offers'
                  ? 'bg-white/15 text-white shadow-xs font-bold border border-white/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Gift className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Offers &amp; Renewals</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 100% Privacy Guard Architecture Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[var(--color-slate-bg)] border border-white/20 rounded-[28px] p-6 sm:p-7 shadow-2xl space-y-4 text-white">
            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] flex items-center justify-center text-[var(--color-accent)]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[var(--color-accent)] uppercase block">
                  ZERO-RETENTION ARCHITECTURE
                </span>
                <h3 className="text-lg font-bold text-white">
                  100% Client-Side Privacy
                </h3>
              </div>
            </div>

            <p className="text-xs text-white/70 leading-relaxed font-light">
              ClaimSync processes receipts and warranty documents exclusively on your device:
            </p>

            <div className="space-y-2.5 text-xs text-white/80">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0 mt-1.5"></span>
                <span><strong>No Cloud OCR:</strong> Text extraction runs exclusively inside your browser WebWorker via Tesseract.js.</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0 mt-1.5"></span>
                <span><strong>Zero Image Storage:</strong> Invoice photos are never uploaded to any remote server or third-party AI APIs.</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] shrink-0 mt-1.5"></span>
                <span><strong>Hardware Isolated:</strong> Camera video streams terminate immediately upon frame snapshot.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-3 rounded-full bg-accent text-[#081018] font-bold text-xs cursor-pointer shadow-md active:scale-98"
            >
              Understood &amp; Protected
            </button>
          </div>
        </div>
      )}

      {/* Mobile Floating Bottom Bar */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-slate-bg)]/95 backdrop-blur-xl border-t border-white/10 py-2 px-4 pb-safe shadow-2xl">
        <div className="max-w-md mx-auto flex justify-between items-center relative">
          
          {/* Dashboard Tab */}
          <button
            id="nav-tab-dashboard-mobile"
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              currentTab === 'dashboard' ? 'text-[var(--color-accent)]' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <div className="relative">
              <LayoutDashboard className="w-5 h-5" />
              {urgentCount > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[var(--color-accent)] text-[#091118] text-[8px] font-bold flex items-center justify-center">
                  {urgentCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold tracking-tight">
              Dashboard
            </span>
          </button>

          {/* Subscriptions Tab */}
          <button
            id="nav-tab-subscriptions-mobile"
            onClick={() => onTabChange('subscriptions')}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              currentTab === 'subscriptions' ? 'text-[var(--color-accent)]' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <div className="relative">
              <CreditCard className="w-5 h-5" />
              {subsCount > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-white/20 text-white text-[8px] font-bold flex items-center justify-center">
                  {subsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold tracking-tight">
              Subs
            </span>
          </button>

          {/* Center Elevated Button: Snap Camera HUD */}
          <button
            id="nav-tab-upload-mobile"
            onClick={() => onTabChange('upload')}
            className="flex flex-col items-center gap-0.5 -mt-6 group cursor-pointer focus:outline-none"
          >
            <div className="w-12 h-12 bg-accent-gradient rounded-full flex items-center justify-center border-4 border-[var(--color-slate-bg)] transition-all shadow-lg active:scale-95 group-hover:brightness-110">
              <Camera className="w-5 h-5 text-[#091118] font-bold stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold tracking-tight text-[var(--color-accent)]">
              Scan
            </span>
          </button>

          {/* Offers & Renewals Tab */}
          <button
            id="nav-tab-offers-mobile"
            onClick={() => onTabChange('offers')}
            className={`flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              currentTab === 'offers' ? 'text-[var(--color-accent)]' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Gift className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight">
              Offers
            </span>
          </button>
        </div>
      </footer>
    </>
  );
};
