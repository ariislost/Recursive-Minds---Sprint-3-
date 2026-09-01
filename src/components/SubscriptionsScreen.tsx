import React, { useState } from 'react';
import { Subscription, AppUser } from '../types';
import { 
  Plus, 
  Trash2, 
  CreditCard, 
  Calendar, 
  Globe, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check
} from 'lucide-react';

interface PlanTier {
  tierName: string;
  cost: number;
  currency: 'INR' | 'USD';
  cycle: 'monthly' | 'yearly';
  displayCost: string;
}

interface ServicePreset {
  serviceId: string;
  name: string;
  logoText: string;
  plans: PlanTier[];
}

const SERVICE_PRESETS: Record<'India' | 'USA', ServicePreset[]> = {
  India: [
    {
      serviceId: 'netflix-in',
      name: 'Netflix',
      logoText: 'NF',
      plans: [
        { tierName: 'Mobile', cost: 149, currency: 'INR', cycle: 'monthly', displayCost: '₹149/mo' },
        { tierName: 'Basic', cost: 199, currency: 'INR', cycle: 'monthly', displayCost: '₹199/mo' },
        { tierName: 'Standard', cost: 499, currency: 'INR', cycle: 'monthly', displayCost: '₹499/mo' },
        { tierName: 'Premium', cost: 649, currency: 'INR', cycle: 'monthly', displayCost: '₹649/mo' },
      ],
    },
    {
      serviceId: 'spotify-in',
      name: 'Spotify',
      logoText: 'SP',
      plans: [
        { tierName: 'Individual', cost: 119, currency: 'INR', cycle: 'monthly', displayCost: '₹119/mo' },
        { tierName: 'Duo', cost: 149, currency: 'INR', cycle: 'monthly', displayCost: '₹149/mo' },
        { tierName: 'Family', cost: 179, currency: 'INR', cycle: 'monthly', displayCost: '₹179/mo' },
        { tierName: 'Student', cost: 59, currency: 'INR', cycle: 'monthly', displayCost: '₹59/mo' },
      ],
    },
    {
      serviceId: 'youtube-in',
      name: 'YouTube Premium',
      logoText: 'YT',
      plans: [
        { tierName: 'Individual', cost: 139, currency: 'INR', cycle: 'monthly', displayCost: '₹139/mo' },
        { tierName: 'Family', cost: 299, currency: 'INR', cycle: 'monthly', displayCost: '₹299/mo' },
        { tierName: 'Student', cost: 79, currency: 'INR', cycle: 'monthly', displayCost: '₹79/mo' },
      ],
    },
    {
      serviceId: 'prime-in',
      name: 'Amazon Prime',
      logoText: 'AP',
      plans: [
        { tierName: 'Monthly', cost: 299, currency: 'INR', cycle: 'monthly', displayCost: '₹299/mo' },
        { tierName: 'Annual', cost: 1499, currency: 'INR', cycle: 'yearly', displayCost: '₹1,499/yr' },
        { tierName: 'Lite Annual', cost: 799, currency: 'INR', cycle: 'yearly', displayCost: '₹799/yr' },
      ],
    },
    {
      serviceId: 'hotstar-in',
      name: 'Disney+ Hotstar',
      logoText: 'DH',
      plans: [
        { tierName: 'Super (Annual)', cost: 899, currency: 'INR', cycle: 'yearly', displayCost: '₹899/yr' },
        { tierName: 'Premium (Monthly)', cost: 299, currency: 'INR', cycle: 'monthly', displayCost: '₹299/mo' },
        { tierName: 'Premium (Annual)', cost: 1499, currency: 'INR', cycle: 'yearly', displayCost: '₹1,499/yr' },
      ],
    },
  ],
  USA: [
    {
      serviceId: 'netflix-us',
      name: 'Netflix',
      logoText: 'NF',
      plans: [
        { tierName: 'Standard with Ads', cost: 6.99, currency: 'USD', cycle: 'monthly', displayCost: '$6.99/mo' },
        { tierName: 'Standard', cost: 15.49, currency: 'USD', cycle: 'monthly', displayCost: '$15.49/mo' },
        { tierName: 'Premium', cost: 22.99, currency: 'USD', cycle: 'monthly', displayCost: '$22.99/mo' },
      ],
    },
    {
      serviceId: 'spotify-us',
      name: 'Spotify',
      logoText: 'SP',
      plans: [
        { tierName: 'Individual', cost: 11.99, currency: 'USD', cycle: 'monthly', displayCost: '$11.99/mo' },
        { tierName: 'Duo', cost: 16.99, currency: 'USD', cycle: 'monthly', displayCost: '$16.99/mo' },
        { tierName: 'Family', cost: 19.99, currency: 'USD', cycle: 'monthly', displayCost: '$19.99/mo' },
        { tierName: 'Student', cost: 5.99, currency: 'USD', cycle: 'monthly', displayCost: '$5.99/mo' },
      ],
    },
    {
      serviceId: 'youtube-us',
      name: 'YouTube Premium',
      logoText: 'YT',
      plans: [
        { tierName: 'Individual', cost: 13.99, currency: 'USD', cycle: 'monthly', displayCost: '$13.99/mo' },
        { tierName: 'Family', cost: 22.99, currency: 'USD', cycle: 'monthly', displayCost: '$22.99/mo' },
        { tierName: 'Student', cost: 7.99, currency: 'USD', cycle: 'monthly', displayCost: '$7.99/mo' },
      ],
    },
    {
      serviceId: 'prime-us',
      name: 'Amazon Prime',
      logoText: 'AP',
      plans: [
        { tierName: 'Prime Monthly', cost: 14.99, currency: 'USD', cycle: 'monthly', displayCost: '$14.99/mo' },
        { tierName: 'Prime Annual', cost: 139, currency: 'USD', cycle: 'yearly', displayCost: '$139/yr' },
        { tierName: 'Prime Student', cost: 7.49, currency: 'USD', cycle: 'monthly', displayCost: '$7.49/mo' },
      ],
    },
    {
      serviceId: 'disney-us',
      name: 'Disney+',
      logoText: 'D+',
      plans: [
        { tierName: 'Basic (With Ads)', cost: 7.99, currency: 'USD', cycle: 'monthly', displayCost: '$7.99/mo' },
        { tierName: 'Premium (No Ads)', cost: 13.99, currency: 'USD', cycle: 'monthly', displayCost: '$13.99/mo' },
        { tierName: 'Duo Basic (Disney+ & Hulu)', cost: 9.99, currency: 'USD', cycle: 'monthly', displayCost: '$9.99/mo' },
      ],
    },
  ],
};

interface SubscriptionsScreenProps {
  subscriptions: Subscription[];
  currentUser: AppUser | null;
  onAddSubscription: (sub: Omit<Subscription, 'id' | 'created_at'>) => Promise<void>;
  onDeleteSubscription: (id: string) => Promise<void>;
}

export const SubscriptionsScreen: React.FC<SubscriptionsScreenProps> = ({
  subscriptions,
  currentUser,
  onAddSubscription,
  onDeleteSubscription,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<'India' | 'USA'>('India');
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [selectedPlanLabel, setSelectedPlanLabel] = useState<string | null>(null);
  
  // Manual Subscription Form State (Always visible)
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP' | string>('INR');
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [renewalDate, setRenewalDate] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle plan tier selection
  const handleSelectTier = (serviceName: string, plan: PlanTier) => {
    const formattedName = `${serviceName} (${plan.tierName})`;
    setName(formattedName);
    setCost(plan.cost.toString());
    setCurrency(plan.currency);
    setCycle(plan.cycle);
    setSelectedPlanLabel(formattedName);
    setErrorMsg('');
    setSuccessMsg(`Pre-filled: ${formattedName} - ${plan.displayCost}`);
    
    // Auto clear success notice
    setTimeout(() => setSuccessMsg(''), 4000);

    const nextDate = new Date();
    if (plan.cycle === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    setRenewalDate(nextDate.toISOString().split('T')[0]);

    // Smooth scroll down to the form if on mobile
    const formEl = document.getElementById('manual-subscription-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleCountryChange = (country: 'India' | 'USA') => {
    setSelectedCountry(country);
    setExpandedService(null);
    setSelectedPlanLabel(null);
    if (country === 'India') {
      setCurrency('INR');
    } else {
      setCurrency('USD');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Please log in to manage subscriptions.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Subscription name is required.');
      return;
    }
    const parsedCost = parseFloat(cost);
    if (isNaN(parsedCost) || parsedCost <= 0) {
      setErrorMsg('Please enter a valid cost.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddSubscription({
        user_id: currentUser.id,
        name: name.trim(),
        cost: parsedCost,
        currency,
        cycle,
        renewal_date: renewalDate || new Date().toISOString().split('T')[0],
      });

      // Reset form
      setName('');
      setCost('');
      setSelectedPlanLabel(null);
      setErrorMsg('');
      setSuccessMsg('Subscription added successfully!');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      setErrorMsg(`Failed to save subscription: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sub: Subscription) => {
    try {
      setDeletingId(sub.id);
      await onDeleteSubscription(sub.id);
    } catch (err) {
      console.error('Failed to delete subscription:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate Monthly Burn per currency
  const monthlyBurnByCurrency: Record<string, number> = {};
  subscriptions.forEach((sub) => {
    const curr = sub.currency || 'INR';
    const numCost = Number(sub.cost) || 0;
    const monthlyNormalized = sub.cycle === 'yearly' ? numCost / 12 : numCost;
    monthlyBurnByCurrency[curr] = (monthlyBurnByCurrency[curr] || 0) + monthlyNormalized;
  });

  const formatCurrencySymbol = (curr: string) => {
    switch (curr?.toUpperCase()) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return `${curr} `;
    }
  };

  const primaryCurr = selectedCountry === 'India' ? 'INR' : 'USD';
  const primaryMonthlyBurn = monthlyBurnByCurrency[primaryCurr] || 0;

  return (
    <div className="w-full space-y-6">
      
      {/* Subscriptions Main Card */}
      <section className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 flex flex-col space-y-6 shadow-2xl">
        
        {/* Header with Title, Country Dropdown & Monthly Burn */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
              <span className="text-xs uppercase tracking-widest font-semibold text-white/60">
                Recurring Burn Radar
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mt-1">
              Active Subscriptions
            </h2>
            <p className="text-xs text-white/60 mt-0.5 font-light">
              Manage recurring subscriptions & eliminate forgotten ghost charges.
            </p>
          </div>

          {/* Region Switcher */}
          <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1.5 self-start sm:self-auto backdrop-blur-md">
            <Globe className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <select
              id="subscription-country-dropdown"
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value as 'India' | 'USA')}
              className="text-xs bg-transparent border-none font-semibold text-white outline-none cursor-pointer [&>option]:bg-[#091118] [&>option]:text-white"
            >
              <option value="India">INDIA (₹)</option>
              <option value="USA">USA ($)</option>
            </select>
          </div>
        </div>

        {/* Enhanced Quick Add with Full Tier/Plan Choices */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block">
              Quick Add Popular Services & Plan Tiers:
            </span>
            <span className="text-[10px] text-[var(--color-accent)] font-mono">
              {selectedCountry === 'India' ? '5 services • 18 plans' : '5 services • 17 plans'}
            </span>
          </div>

          {/* Expandable Service Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SERVICE_PRESETS[selectedCountry].map((service) => {
              const isExpanded = expandedService === service.serviceId;
              const hasSelectedPlan = selectedPlanLabel?.startsWith(service.name);

              return (
                <div
                  key={service.serviceId}
                  className={`rounded-[18px] border transition-all duration-200 overflow-hidden ${
                    isExpanded 
                      ? 'bg-white/10 border-[var(--color-accent-border)] shadow-lg' 
                      : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                  }`}
                >
                  {/* Service Header Row (Click to Expand Plans) */}
                  <button
                    type="button"
                    onClick={() => setExpandedService(isExpanded ? null : service.serviceId)}
                    className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-xs text-[var(--color-accent)]">
                        {service.logoText}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <span>{service.name}</span>
                          {hasSelectedPlan && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                          )}
                        </div>
                        <div className="text-[10px] text-white/50">
                          {service.plans.length} plan tiers available
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-white/50 hover:text-white text-xs">
                      <span className="text-[11px] font-mono text-white/60">
                        {isExpanded ? 'Hide' : 'Tiers'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Plan Tiers Sub-Chips */}
                  {isExpanded && (
                    <div className="p-3 pt-1 border-t border-white/10 bg-black/20 space-y-1.5">
                      {service.plans.map((plan) => {
                        const isThisPlanSelected = selectedPlanLabel === `${service.name} (${plan.tierName})`;

                        return (
                          <button
                            key={plan.tierName}
                            type="button"
                            onClick={() => handleSelectTier(service.name, plan)}
                            className={`w-full p-2 rounded-[10px] text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                              isThisPlanSelected
                                ? 'bg-accent text-[#081018] font-bold shadow-md'
                                : 'bg-white/5 hover:bg-white/15 text-white/90 border border-white/10'
                            }`}
                          >
                            <span className="truncate pr-2">
                              {plan.tierName}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0 font-mono font-bold">
                              <span>{plan.displayCost}</span>
                              {isThisPlanSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Active Recurring Plans ({subscriptions.length})
            </span>
          </div>

          {subscriptions.length === 0 ? (
            <div className="py-10 text-center space-y-3 border border-dashed border-white/15 rounded-[20px] bg-white/5">
              <CreditCard className="w-8 h-8 text-white/30 mx-auto" />
              <p className="text-sm font-semibold text-white">No active subscriptions tracked</p>
              <p className="text-xs text-white/50 max-w-xs mx-auto font-light">
                Select any plan tier above or use the manual form below to monitor monthly costs.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {subscriptions.map((sub) => {
                const renewal = new Date(sub.renewal_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                renewal.setHours(0, 0, 0, 0);
                const daysToRenew = Math.ceil((renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={sub.id}
                    id={`sub-item-${sub.id}`}
                    className="flex justify-between items-center py-3.5 group hover:bg-white/5 px-3 rounded-[14px] transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-[12px] bg-white/10 border border-white/10 text-[var(--color-accent)] flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                        {sub.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-white truncate">
                          {sub.name}
                        </div>
                        <div className="text-[11px] text-white/50 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3 h-3 text-white/40" />
                          <span>Renews {sub.renewal_date}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            daysToRenew <= 7 ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {daysToRenew <= 0 ? 'Due' : `${daysToRenew}d left`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      <div className="text-right">
                        <div className="font-bold text-white font-mono text-sm sm:text-base">
                          {formatCurrencySymbol(sub.currency)}{Number(sub.cost).toLocaleString()}/{sub.cycle === 'yearly' ? 'yr' : 'mo'}
                        </div>
                        {sub.cycle === 'yearly' && (
                          <div className="text-[10px] text-white/50">
                            ≈ {formatCurrencySymbol(sub.currency)}{(Number(sub.cost) / 12).toFixed(2)}/mo
                          </div>
                        )}
                      </div>

                      <button
                        id={`delete-sub-${sub.id}`}
                        type="button"
                        onClick={() => handleDelete(sub)}
                        disabled={deletingId === sub.id}
                        className="p-2 rounded-[8px] text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                        title="Delete subscription"
                        aria-label={`Delete ${sub.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Monthly Burn Radar Bar */}
        <div className="pt-4 border-t border-white/10">
          <div className="glass-panel-subtle p-4 rounded-[18px] flex justify-between items-center">
            <div>
              <span className="text-xs uppercase font-semibold text-white/50 tracking-wider block">
                Total Monthly Burn ({primaryCurr})
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono mt-0.5 block">
                {formatCurrencySymbol(primaryCurr)}{primaryMonthlyBurn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {Object.keys(monthlyBurnByCurrency).length > 1 && (
              <div className="text-right">
                {Object.entries(monthlyBurnByCurrency).map(([curr, amt]) => curr !== primaryCurr && (
                  <div key={curr} className="text-xs font-semibold text-white/70 font-mono">
                    {curr}: {formatCurrencySymbol(curr)}{amt.toFixed(2)}/mo
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ALWAYS-VISIBLE Manual "Add Subscription" Form */}
        <div id="manual-subscription-form" className="pt-2">
          <form onSubmit={handleAddSubmit} className="space-y-4 glass-panel-subtle p-5 sm:p-6 rounded-[22px] border border-white/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--color-accent)]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {name ? `Selected: ${name}` : 'Add / Custom Subscription'}
                </h3>
              </div>
              {name && (
                <button
                  type="button"
                  onClick={() => {
                    setName('');
                    setCost('');
                    setSelectedPlanLabel(null);
                  }}
                  className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer font-medium"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-[12px] text-xs text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-red-300 bg-red-500/20 border border-red-500/30 p-3 rounded-[12px]">
                {errorMsg}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Service Name */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                  Plan / Service Name *
                </label>
                <input
                  id="sub-input-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Netflix (Premium), Spotify"
                  className="w-full glass-input rounded-[10px] p-2.5 text-xs"
                />
              </div>

              {/* Cost */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                  Cost *
                </label>
                <input
                  id="sub-input-cost"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full glass-input rounded-[10px] p-2.5 text-xs"
                />
              </div>

              {/* Currency & Cycle */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                    Currency
                  </label>
                  <select
                    id="sub-input-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full glass-input rounded-[10px] p-2.5 text-xs [&>option]:bg-[#091118] [&>option]:text-white"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                    Billing Cycle
                  </label>
                  <select
                    id="sub-input-cycle"
                    value={cycle}
                    onChange={(e) => setCycle(e.target.value as 'monthly' | 'yearly')}
                    className="w-full glass-input rounded-[10px] p-2.5 text-xs [&>option]:bg-[#091118] [&>option]:text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              {/* Renewal Date */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/60 mb-1.5">
                  Renewal Date *
                </label>
                <input
                  id="sub-input-renewal"
                  type="date"
                  required
                  value={renewalDate}
                  onChange={(e) => setRenewalDate(e.target.value)}
                  className="w-full glass-input rounded-[10px] p-2.5 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              id="save-subscription-btn"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-full bg-accent hover:opacity-90 text-[#081018] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#081018]" />
                  <span>Saving Subscription...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>{name ? `Save "${name}" Plan` : 'Save Custom Subscription'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};



