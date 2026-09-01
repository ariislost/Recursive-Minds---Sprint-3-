import React, { useState, useRef, useEffect } from 'react';
import { TabType, Item, Subscription, ThemeMode } from '../types';
import { useTheme } from '../context/ThemeContext';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  RotateCcw, 
  Camera, 
  LayoutDashboard, 
  CreditCard, 
  Gift, 
  ArrowRight,
  Loader2,
  Compass,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AiAssistantChatProps {
  currentTab: TabType;
  onNavigate: (tab: TabType) => void;
  items: Item[];
  subscriptions: Subscription[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestedTab?: TabType | null;
  actionLabel?: string | null;
  themeSwitch?: ThemeMode | null;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: '📸 Scan Receipt', prompt: 'How do I scan and OCR a new receipt?' },
  { label: '📋 View Vault', prompt: 'Show me my active items and warranties' },
  { label: '💳 Subscriptions', prompt: 'Where can I check my monthly recurring bills?' },
  { label: '🎁 Perks & Deals', prompt: 'Find trade-in and warranty deals for my hardware' },
  { label: '🎨 Red & Blue Theme', prompt: 'Switch UI theme to Red and Blue' },
  { label: '🌿 Green & Blue Theme', prompt: 'Switch UI theme to Green and Blue' },
  { label: '⚡ Yellow & Blue Theme', prompt: 'Switch UI theme to default Yellow and Blue' },
  { label: '⏳ Expiring Items', prompt: 'Are any of my warranties expiring soon?' },
];

export const AiAssistantChat: React.FC<AiAssistantChatProps> = ({
  currentTab,
  onNavigate,
  items,
  subscriptions,
}) => {
  const { theme, setTheme, themeConfig, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnreadNotice, setHasUnreadNotice] = useState(true);

  const getInitialMessages = (): ChatMessage[] => [
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hi! I'm your **ClaimSync AI Guide**.\n\nYou currently have **${items.length}** tracked device${items.length === 1 ? '' : 's'} and **${subscriptions.length}** active subscription${subscriptions.length === 1 ? '' : 's'}. Current UI theme is **${themeConfig.shortName}**.\n\nWhere would you like to go or what would you like to customize?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnreadNotice(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) {
      setInputMessage('');
    }

    // Check if user is asking to change theme
    const lower = query.toLowerCase();
    if (lower.includes('theme') || lower.includes('color') || lower.includes('palette')) {
      if (lower.includes('red') || lower.includes('rose') || lower.includes('crimson')) {
        setTheme('red-blue');
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            sender: 'assistant',
            text: "I've switched the UI theme to **Red & Blue** (Crimson Rose & Midnight Blue)! All screens, indicators, borders, and controls are now synchronized in Red & Blue.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }
      if (lower.includes('green') || lower.includes('emerald') || lower.includes('mint')) {
        setTheme('green-blue');
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            sender: 'assistant',
            text: "I've switched the UI theme to **Green & Blue** (Emerald Mint & Cobalt Blue)! All screens and charts are now synchronized in Green & Blue.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }
      if (lower.includes('yellow') || lower.includes('amber') || lower.includes('gold') || lower.includes('default')) {
        setTheme('yellow-blue');
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            sender: 'assistant',
            text: "I've switched the UI theme to default **Yellow & Blue** (Amber Gold & Slate Blue).",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          currentTab,
          items,
          subscriptions,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text || "I'm ready to help you navigate through the app.",
        suggestedTab: data.suggestedTab || null,
        actionLabel: data.actionLabel || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error calling AI assistant API:', err);
      // Local fallback in case network error occurs
      let fallbackTab: TabType | null = null;
      let fallbackLabel: string | null = null;
      let fallbackText = "I can guide you anywhere across ClaimSync.";

      if (lower.includes('scan') || lower.includes('camera') || lower.includes('upload') || lower.includes('receipt')) {
        fallbackTab = 'upload';
        fallbackLabel = 'Open Snap Camera HUD';
        fallbackText = "Head to the **Snap Camera HUD** to scan and OCR receipt details automatically.";
      } else if (lower.includes('subscription') || lower.includes('bill') || lower.includes('monthly')) {
        fallbackTab = 'subscriptions';
        fallbackLabel = 'Go to Subscriptions';
        fallbackText = `You have ${subscriptions.length} recurring subscription(s) in your **Subscriptions** dashboard.`;
      } else if (lower.includes('offer') || lower.includes('deal') || lower.includes('perk') || lower.includes('trade')) {
        fallbackTab = 'offers';
        fallbackLabel = 'View Perks & Renewals';
        fallbackText = "Explore brand-verified trade-ins and warranty discounts in **Offers & Renewals**.";
      } else {
        fallbackTab = 'dashboard';
        fallbackLabel = 'Go to Dashboard';
        fallbackText = "Your **Dashboard** tracks all device warranties, expiry alerts, and claim drafts.";
      }

      const fallbackMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        suggestedTab: fallbackTab,
        actionLabel: fallbackLabel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages(getInitialMessages());
  };

  const handleActionClick = (tab: TabType) => {
    onNavigate(tab);
  };

  const getTabIcon = (tab?: TabType | null) => {
    switch (tab) {
      case 'upload':
        return <Camera className="w-3.5 h-3.5 text-[var(--color-accent)]" />;
      case 'subscriptions':
        return <CreditCard className="w-3.5 h-3.5 text-[var(--color-accent)]" />;
      case 'offers':
        return <Gift className="w-3.5 h-3.5 text-[var(--color-accent)]" />;
      default:
        return <LayoutDashboard className="w-3.5 h-3.5 text-[var(--color-accent)]" />;
    }
  };

  return (
    <>
      {/* Floating Bottom-Right Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <motion.button
          type="button"
          id="ai-assistant-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative p-3.5 rounded-full shadow-2xl border transition-all duration-300 flex items-center justify-center cursor-pointer group backdrop-blur-xl ${
            isOpen
              ? 'bg-accent text-[#081018] border-accent shadow-[var(--color-accent-glow)]'
              : 'bg-[var(--color-slate-bg)]/90 text-white border-white/20 hover:border-[var(--color-accent-border)] hover:bg-white/10'
          }`}
          title="ClaimSync AI Navigator"
        >
          {isOpen ? (
            <X className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <div className="relative">
              <Bot className="w-5 h-5 text-[var(--color-accent)] group-hover:text-white transition-colors stroke-[2.2]" />
              <Sparkles className="w-2.5 h-2.5 text-[var(--color-accent)] absolute -top-1.5 -right-1.5 animate-pulse" />
            </div>
          )}

          {/* Unread beacon badge */}
          {hasUnreadNotice && !isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[var(--color-accent)] border-2 border-[var(--color-slate-bg)]"></span>
            </span>
          )}
        </motion.button>
      </div>

      {/* Chatbox Window Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-22 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[390px] h-[520px] max-h-[78vh] flex flex-col rounded-[26px] bg-[var(--color-slate-bg)]/95 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/80 overflow-hidden text-white font-sans transition-colors duration-300"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] flex items-center justify-center text-[var(--color-accent)] shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>ClaimSync AI Guide</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-[9px] font-mono font-semibold">
                      Live
                    </span>
                  </div>
                  <div className="text-[10px] text-white/50 font-light flex items-center gap-1">
                    <Compass className="w-3 h-3 text-[var(--color-accent)]" />
                    <span>In-App Navigator &amp; Copilot</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="p-2.5 border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(qp.prompt)}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)] text-white/70 border border-white/10 hover:border-[var(--color-accent-border)] text-[10px] font-medium whitespace-nowrap transition-all cursor-pointer shrink-0"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[18px] p-3 leading-relaxed ${
                        isUser
                          ? 'bg-accent text-[#081018] font-medium rounded-br-xs shadow-md'
                          : 'bg-white/10 text-white/90 border border-white/10 rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line break-words">
                        {msg.text.split('**').map((chunk, i) =>
                          i % 2 === 1 ? (
                            <strong key={i} className={isUser ? 'font-black' : 'text-[var(--color-accent)] font-bold'}>
                              {chunk}
                            </strong>
                          ) : (
                            chunk
                          )
                        )}
                      </div>

                      {/* Interactive Navigation Action Button inside message */}
                      {msg.suggestedTab && (
                        <div className="mt-2.5 pt-2 border-t border-white/15">
                          <button
                            type="button"
                            onClick={() => handleActionClick(msg.suggestedTab!)}
                            className="w-full py-2 px-3 rounded-[12px] bg-accent hover:opacity-90 text-[#081018] font-bold text-xs flex items-center justify-between transition-transform active:scale-95 shadow-md shadow-[var(--color-accent-glow)] cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              {getTabIcon(msg.suggestedTab)}
                              <span>{msg.actionLabel || `Go to ${msg.suggestedTab}`}</span>
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-white/40 px-1 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-[18px] w-fit text-white/60">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--color-accent)]" />
                  <span className="text-[11px] font-medium">Navigating ClaimSync...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/10 bg-white/5 backdrop-blur-md">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask to navigate or change UI theme..."
                  className="flex-1 bg-black/30 border border-white/15 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/40 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2.5 rounded-full bg-accent hover:opacity-90 disabled:opacity-40 disabled:hover:opacity-40 text-[#081018] transition-all cursor-pointer disabled:cursor-not-allowed shadow-md shadow-[var(--color-accent-glow)] active:scale-95 shrink-0"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
