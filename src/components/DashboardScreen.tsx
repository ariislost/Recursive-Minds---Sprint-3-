import React, { useState } from 'react';
import { Item, AppUser } from '../types';
import { calculateExpiryDate, getDaysUntilExpiry } from '../utils/ocrExtraction';
import { ClaimModal } from './ClaimModal';
import { 
  Trash2, 
  ShieldCheck, 
  Plus, 
  Sparkles,
  Star,
  Clock,
  ChevronRight,
  Receipt,
  AlertTriangle
} from 'lucide-react';

interface DashboardScreenProps {
  items: Item[];
  currentUser: AppUser | null;
  onDeleteItem: (id: string) => Promise<void>;
  onNavigateToUpload: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  items,
  currentUser,
  onDeleteItem,
  onNavigateToUpload,
}) => {
  const [selectedItemForClaim, setSelectedItemForClaim] = useState<Item | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Process and sort items by soonest expiry
  const processedItems = items.map((item) => {
    const expiryDate = calculateExpiryDate(item.purchase_date, item.warranty_months);
    const daysLeft = getDaysUntilExpiry(expiryDate);
    
    let status: 'urgent' | 'warning' | 'safe';
    if (daysLeft < 7) {
      status = 'urgent'; // red <7 days
    } else if (daysLeft < 30) {
      status = 'warning'; // yellow <30 days
    } else {
      status = 'safe'; // green else
    }

    return {
      ...item,
      expiryDate,
      daysLeft,
      status,
    };
  }).sort((a, b) => a.daysLeft - b.daysLeft);

  // Stats calculation
  const criticalCount = processedItems.filter(i => i.status === 'urgent').length;
  const warningCount = processedItems.filter(i => i.status === 'warning').length;
  const secureCount = processedItems.filter(i => i.status === 'safe').length;

  // Group Money at Risk: Items expiring within 60 days
  const itemsExpiringWithin60Days = processedItems.filter((i) => i.daysLeft <= 60);

  const moneyAtRiskByCurrency: Record<string, { total: number; count: number }> = {};
  itemsExpiringWithin60Days.forEach((item) => {
    const curr = item.currency || 'INR';
    if (!moneyAtRiskByCurrency[curr]) {
      moneyAtRiskByCurrency[curr] = { total: 0, count: 0 };
    }
    moneyAtRiskByCurrency[curr].total += Number(item.price) || 0;
    moneyAtRiskByCurrency[curr].count += 1;
  });

  const handleDelete = async (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    try {
      setDeletingId(item.id);
      await onDeleteItem(item.id);
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrencySymbol = (currency: string) => {
    switch (currency?.toUpperCase()) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return `${currency} `;
    }
  };

  const getBrandInitials = (brandName: string) => {
    if (!brandName) return 'PR';
    const parts = brandName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return brandName.slice(0, 2).toUpperCase();
  };

  // Primary risk currency total display
  const primaryCurrency = Object.keys(moneyAtRiskByCurrency)[0] || 'INR';
  const primaryRiskTotal = moneyAtRiskByCurrency[primaryCurrency]?.total || 0;

  return (
    <div className="w-full space-y-8">
      {/* SECTION 1: WoodNest Inspired Cinematic Hero Section */}
      <section className="relative pt-4 sm:pt-6 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Big Headline & Social Proof */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span className="text-[11px] font-medium tracking-wide text-white/80 uppercase">
                Autonomous Warranty Vault
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.08]">
              Protect Every <br className="hidden sm:block" />
              Dollar Spent
            </h1>

            <p className="text-sm sm:text-base text-white/70 max-w-lg leading-relaxed font-light">
              Mobile-first OCR warranty protection & subscription burn manager. Scan your receipts to recover money before warranties expire.
            </p>

            {/* Rating / Proof Badge */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                <Star className="w-4 h-4 fill-[var(--color-accent)] text-[var(--color-accent)]" />
                <span>4.9</span>
              </div>
              <span className="text-xs text-white/50 font-light">
                from 1,800+ claims protected
              </span>
            </div>
          </div>

          {/* Right Column: Floating Glassmorphic Vault Card (inspired by booking widget) */}
          <div className="lg:col-span-5">
            <div className="glass-panel p-6 rounded-[28px] space-y-5 shadow-2xl border border-white/15 relative overflow-hidden">
              
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                    Vault Risk Radar
                  </div>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    Money at Risk
                  </h3>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
                </div>
              </div>

              {/* Status Pills Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="glass-panel-subtle p-3 rounded-[14px]">
                  <div className="text-[10px] uppercase tracking-wider text-white/50 font-medium">
                    Expiring Soon
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    <span>{criticalCount + warningCount} Items</span>
                  </div>
                </div>

                <div className="glass-panel-subtle p-3 rounded-[14px]">
                  <div className="text-[10px] uppercase tracking-wider text-white/50 font-medium">
                    Active Vault
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{items.length} Total</span>
                  </div>
                </div>
              </div>

              {/* Price / Exposure Row */}
              <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
                    {formatCurrencySymbol(primaryCurrency)}{primaryRiskTotal.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-white/50">
                    Total warranty exposure
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8664A]/20 border border-[#E8664A]/40 text-[#E8664A] text-[11px] font-semibold">
                    <span>{criticalCount} Critical</span>
                  </div>
                </div>
              </div>

              {/* Crisp White CTA Button */}
              <button
                id="hero-scan-cta-btn"
                onClick={onNavigateToUpload}
                className="w-full py-3.5 px-4 bg-white hover:bg-white/90 active:scale-99 text-[#081018] font-bold text-sm rounded-[14px] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Scan New Receipt</span>
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: Filter / Summary Counters */}
      <section className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="glass-panel p-4 rounded-[20px] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 border border-white/10">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">
              Critical
            </div>
            <div className="text-xs text-white/40 hidden sm:block">
              Expiring &lt; 7 days
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-red-400 font-mono">
            {criticalCount < 10 ? `0${criticalCount}` : criticalCount}
          </div>
        </div>

        <div className="glass-panel p-4 rounded-[20px] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 border border-white/10">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">
              Warning
            </div>
            <div className="text-xs text-white/40 hidden sm:block">
              Expiring &lt; 30 days
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-300 font-mono">
            {warningCount < 10 ? `0${warningCount}` : warningCount}
          </div>
        </div>

        <div className="glass-panel p-4 rounded-[20px] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 border border-white/10">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">
              Secure
            </div>
            <div className="text-xs text-white/40 hidden sm:block">
              Safe &gt; 30 days
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
            {secureCount < 10 ? `0${secureCount}` : secureCount}
          </div>
        </div>
      </section>

      {/* SECTION 3: Expiring Warranties Card List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Protected Assets
            </h3>
            <p className="text-xs text-white/60">
              Sorted by soonest expiration. Tap any card to generate a claim letter.
            </p>
          </div>
          
          <button
            id="view-all-scan-btn"
            onClick={onNavigateToUpload}
            className="text-xs font-semibold text-[var(--color-accent)] hover:underline transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>+ Scan Receipt</span>
          </button>
        </div>

        {processedItems.length === 0 ? (
          <div className="glass-panel p-8 sm:p-12 rounded-[24px] border border-white/10 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto text-[var(--color-accent)] border border-white/10">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">No items in your vault yet</h4>
              <p className="text-xs text-white/60 mt-1 max-w-md mx-auto leading-relaxed">
                Scan your purchase receipts using local OCR to automatically extract warranty terms and track expiry dates.
              </p>
            </div>
            <button
              id="empty-state-scan-btn"
              onClick={onNavigateToUpload}
              className="px-6 py-3 rounded-full bg-white hover:bg-white/90 text-[#081018] font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Scan First Receipt</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {processedItems.map((item) => {
              // Status Badge Styles
              let statusLabel = (
                <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {item.daysLeft}d left
                </div>
              );

              if (item.daysLeft < 0) {
                statusLabel = (
                  <button
                    onClick={() => setSelectedItemForClaim(item)}
                    className="text-[10px] bg-[#E8664A] hover:bg-[#d7573d] text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                  >
                    EXPIRED CLAIM
                  </button>
                );
              } else if (item.status === 'urgent') {
                statusLabel = (
                  <button
                    onClick={() => setSelectedItemForClaim(item)}
                    className="text-[10px] bg-[#E8664A] hover:bg-[#d7573d] text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                  >
                    CLAIM NOW
                  </button>
                );
              } else if (item.status === 'warning') {
                statusLabel = (
                  <div className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {item.daysLeft} Days Left
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  id={`item-card-${item.id}`}
                  onClick={() => setSelectedItemForClaim(item)}
                  className="glass-panel p-4 sm:p-5 rounded-[20px] flex items-center justify-between border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all cursor-pointer shadow-lg group"
                >
                  {/* Left: Avatar + Item Name & Expiry */}
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] bg-white/10 border border-white/10 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 text-[var(--color-accent)] uppercase">
                      {getBrandInitials(item.brand)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white text-sm sm:text-base truncate group-hover:text-[var(--color-accent)] transition-colors">
                        {item.product}
                      </div>
                      <div className="text-xs text-white/50 truncate mt-0.5">
                        {item.brand} • Exp. {item.expiryDate}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price, Status/Action, Delete */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-bold text-sm sm:text-base text-white font-mono">
                        {formatCurrencySymbol(item.currency)}{Number(item.price).toLocaleString()}
                      </div>
                      <div className="mt-1 flex justify-end">
                        {statusLabel}
                      </div>
                    </div>

                    <button
                      id={`delete-item-${item.id}`}
                      onClick={(e) => handleDelete(e, item)}
                      disabled={deletingId === item.id}
                      className="p-2 rounded-[10px] text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                      title="Delete item"
                      aria-label={`Delete ${item.product}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Claim Modal */}
      {selectedItemForClaim && (
        <ClaimModal
          item={selectedItemForClaim}
          currentUser={currentUser}
          onClose={() => setSelectedItemForClaim(null)}
        />
      )}
    </div>
  );
};


