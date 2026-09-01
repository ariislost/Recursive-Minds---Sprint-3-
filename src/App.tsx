import React, { useState, useEffect } from 'react';
import { AppUser, Item, Subscription, TabType } from './types';
import { 
  getCurrentUser, 
  fetchItems, 
  addItem, 
  deleteItem, 
  fetchSubscriptions, 
  addSubscription, 
  deleteSubscription, 
  signOut,
  seedUserDataIfNeeded
} from './services/supabase';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { UploadScreen } from './components/UploadScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { SubscriptionsScreen } from './components/SubscriptionsScreen';
import { OffersScreen } from './components/OffersScreen';
import { AiAssistantChat } from './components/AiAssistantChat';
import { LoadingScreen } from './components/LoadingScreen';
import { LogoutTransitionScreen } from './components/LogoutTransitionScreen';
import { AnimatedPerimeterFrame } from './components/AnimatedPerimeterFrame';
import { FloatingBills } from './components/FloatingBills';
import { calculateExpiryDate, getDaysUntilExpiry } from './utils/ocrExtraction';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import citySkyscrapersBg from './assets/images/city_skyscrapers_bills_bg_1788282427983.jpg';

export default function App() {
  const [showInitialLoading, setShowInitialLoading] = useState(true);
  const [showLogoutTransition, setShowLogoutTransition] = useState(false);
  const [isLoggingInOrOut, setIsLoggingInOrOut] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  const [items, setItems] = useState<Item[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
          await loadUserData(user.id, user.email);
        }
      } catch (err) {
        console.error('Error checking auth:', err);
      } finally {
        setLoadingUser(false);
      }
    }
    initAuth();
  }, []);

  const loadUserData = async (userId: string, email?: string) => {
    setLoadingData(true);
    try {
      await seedUserDataIfNeeded(userId, email);
      const [fetchedItems, fetchedSubs] = await Promise.all([
        fetchItems(userId),
        fetchSubscriptions(userId),
      ]);
      setItems(fetchedItems);
      setSubscriptions(fetchedSubs);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAuthSuccess = async (user: AppUser) => {
    setIsLoggingInOrOut('Verifying Credentials & Unlocking Vault...');
    try {
      setCurrentUser(user);
      await loadUserData(user.id, user.email);
      setCurrentTab('dashboard');
    } finally {
      setTimeout(() => {
        setIsLoggingInOrOut(null);
      }, 500);
    }
  };

  const handleLogout = async () => {
    setShowLogoutTransition(true);
  };

  const handleLogoutTransitionComplete = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setItems([]);
      setSubscriptions([]);
    } finally {
      setShowLogoutTransition(false);
    }
  };

  const handleSaveItem = async (itemData: Omit<Item, 'id' | 'created_at'>) => {
    const created = await addItem(itemData);
    setItems(prev => [created, ...prev.filter(i => i.id !== created.id)]);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!currentUser) return;
    await deleteItem(itemId, currentUser.id);
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleAddSubscription = async (subData: Omit<Subscription, 'id' | 'created_at'>) => {
    const created = await addSubscription(subData);
    setSubscriptions(prev => [...prev.filter(s => s.id !== created.id), created]);
  };

  const handleDeleteSubscription = async (subId: string) => {
    if (!currentUser) return;
    await deleteSubscription(subId, currentUser.id);
    setSubscriptions(prev => prev.filter(s => s.id !== subId));
  };

  if (showInitialLoading) {
    return (
      <LoadingScreen onComplete={() => setShowInitialLoading(false)} />
    );
  }

  if (showLogoutTransition) {
    return (
      <LogoutTransitionScreen onComplete={handleLogoutTransitionComplete} />
    );
  }

  if (loadingUser || isLoggingInOrOut) {
    return (
      <div className="min-h-screen bg-[var(--color-slate-bg)] flex items-center justify-center relative overflow-hidden transition-colors duration-300">
        {/* Continuous Animated Perimeter Frame during login/loading */}
        <AnimatedPerimeterFrame isContinuous={true} />

        {/* Flying Bills in background during login */}
        <FloatingBills />

        <img 
          src={citySkyscrapersBg} 
          alt="Atmospheric Background" 
          referrerPolicy="no-referrer" 
          className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
        />
        <div className="relative z-10 text-center space-y-3 glass-panel p-8 sm:p-10 rounded-[28px] border border-white/20 shadow-2xl max-w-sm mx-4 backdrop-blur-xl">
          <Loader2 className="w-9 h-9 animate-spin text-[var(--color-accent)] mx-auto" />
          <p className="text-xs font-semibold text-white/90 uppercase tracking-widest">
            {isLoggingInOrOut || 'Opening ClaimSync Vault...'}
          </p>
          <p className="text-[11px] text-white/50 font-light">
            Synchronizing cryptographic keys & records
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[var(--color-slate-bg)] text-white relative flex flex-col justify-center overflow-x-hidden transition-colors duration-300">
        {/* Animated Continuous Perimeter Frame across the Login screen */}
        <AnimatedPerimeterFrame isContinuous={true} />

        {/* Flying Bills & Receipts across the Skyscrapers */}
        <FloatingBills />

        {/* Background Image Layer with Fog Vignette */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <img 
            src={citySkyscrapersBg} 
            alt="Atmospheric Skyscrapers & Bills Landscape" 
            referrerPolicy="no-referrer" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-slate-bg)] via-[var(--color-slate-bg)]/70 to-[var(--color-slate-bg)]/90" />
        </div>
        <div className="relative z-10">
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    );
  }

  const urgentCount = items.filter((item) => {
    try {
      const expiryDate = calculateExpiryDate(item.purchase_date, item.warranty_months);
      const daysLeft = getDaysUntilExpiry(expiryDate);
      return daysLeft < 7;
    } catch {
      return false;
    }
  }).length;

  return (
    <div className="min-h-screen bg-[var(--color-slate-bg)] text-white flex flex-col font-sans relative selection:bg-[var(--color-accent-subtle)] selection:text-white transition-colors duration-300">
      {/* Static Perimeter Frame after logging in */}
      <AnimatedPerimeterFrame isContinuous={false} />

      {/* Flying Bills & Receipts across the Skyscrapers */}
      <FloatingBills />

      {/* Background Image Layer with Moody Skyscraper & Floating Bills Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img 
          src={citySkyscrapersBg} 
          alt="Atmospheric City Landscape" 
          referrerPolicy="no-referrer" 
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[var(--color-slate-bg)]/60 to-[var(--color-slate-bg)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-slate-bg)]/80 via-transparent to-[var(--color-slate-bg)]" />
      </div>

      {/* Top Glassmorphic Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        itemsCount={items.length}
        subsCount={subscriptions.length}
        urgentCount={urgentCount > 0 ? urgentCount : 1}
        items={items}
        onReplayLoading={() => setShowInitialLoading(true)}
      />

      {/* Main Content View Frame */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32">
        {loadingData ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4 glass-panel rounded-[24px]">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-accent)]" />
            <p className="text-xs font-medium text-white/70 tracking-wide">
              Synchronizing active warranties & recurring plans...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {currentTab === 'upload' && (
                <UploadScreen
                  currentUser={currentUser}
                  onSaveItem={handleSaveItem}
                  onSuccessNavigate={() => setCurrentTab('dashboard')}
                />
              )}

              {currentTab === 'dashboard' && (
                <DashboardScreen
                  items={items}
                  currentUser={currentUser}
                  onDeleteItem={handleDeleteItem}
                  onNavigateToUpload={() => setCurrentTab('upload')}
                />
              )}

              {currentTab === 'subscriptions' && (
                <SubscriptionsScreen
                  subscriptions={subscriptions}
                  currentUser={currentUser}
                  onAddSubscription={handleAddSubscription}
                  onDeleteSubscription={handleDeleteSubscription}
                />
              )}

              {currentTab === 'offers' && (
                <OffersScreen
                  items={items}
                  onNavigateToUpload={() => setCurrentTab('upload')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Floating Bottom-Right AI Assistant Chatbox */}
      <AiAssistantChat
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        items={items}
        subscriptions={subscriptions}
      />
    </div>
  );
}
