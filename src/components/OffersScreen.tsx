import React, { useState } from 'react';
import { Item, PerkOffer } from '../types';
import { OFFERS_DATA } from '../data/offersData';
import { 
  Gift, 
  Plus, 
  Trash2, 
  Calendar, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ExternalLink,
  Camera,
  Tag
} from 'lucide-react';

interface OffersScreenProps {
  items: Item[];
  onNavigateToUpload: () => void;
}

interface BrandPerkTier {
  tierName: string;
  category: 'Warranty Renewals' | 'Trade-Ins' | 'Extended Care';
  discountText: string;
  promoCode: string;
  savingsEstimate: string;
  portalUrl: string;
  description: string;
}

interface BrandPreset {
  brandId: string;
  brandName: string;
  logoText: string;
  matchedKeywords: string[];
  tiers: BrandPerkTier[];
}

const BRAND_PRESETS: BrandPreset[] = [
  {
    brandId: 'apple',
    brandName: 'Apple',
    logoText: 'AP',
    matchedKeywords: ['apple', 'macbook', 'mac', 'iphone', 'ipad', 'airpods', 'watch'],
    tiers: [
      {
        tierName: 'Trade-In Upgrade Credit',
        category: 'Trade-Ins',
        discountText: '₹22,000 Credit',
        promoCode: 'M3UPGRADE',
        savingsEstimate: '₹22,000',
        portalUrl: 'https://www.apple.com/shop/trade-in',
        description: 'Trade in expiring MacBooks, iPhones or iPads for guaranteed instant credit toward latest models.',
      },
      {
        tierName: 'AppleCare+ Renewal Discount',
        category: 'Warranty Renewals',
        discountText: '15% OFF Renewal',
        promoCode: 'APPLECARE15',
        savingsEstimate: '₹3,500',
        portalUrl: 'https://mysupport.apple.com/',
        description: 'Extend AppleCare+ protection monthly after 1-year standard warranty expires.',
      },
      {
        tierName: 'Battery Replacement Program',
        category: 'Extended Care',
        discountText: '20% Battery Voucher',
        promoCode: 'APLBATT20',
        savingsEstimate: '₹2,100',
        portalUrl: 'https://support.apple.com/mac/repair',
        description: 'Authorized battery diagnostic & replacement subsidy for 2+ year old MacBooks.',
      },
    ],
  },
  {
    brandId: 'sony',
    brandName: 'Sony',
    logoText: 'SN',
    matchedKeywords: ['sony', 'tv', 'bravia', 'playstation', 'wh-1000xm', 'alpha', 'audio', 'soundbar'],
    tiers: [
      {
        tierName: 'Protect Plus Extended Care',
        category: 'Extended Care',
        discountText: '25% OFF Extended Plan',
        promoCode: 'SONY25CARE',
        savingsEstimate: '₹4,500',
        portalUrl: 'https://www.sony.co.in/electronics/support/articles/warranty',
        description: '2 extra years of comprehensive OLED panel & hardware coverage with zero deductible.',
      },
      {
        tierName: 'PlayStation Care Renewal',
        category: 'Warranty Renewals',
        discountText: '₹1,500 Off Care Shield',
        promoCode: 'PSCARE1500',
        savingsEstimate: '₹1,500',
        portalUrl: 'https://www.playstation.com/support/hardware/warranty/',
        description: 'Accidental drop & power surge protection warranty for PS5 consoles and controllers.',
      },
      {
        tierName: 'Headphones Audio Trade-Up',
        category: 'Trade-Ins',
        discountText: '₹5,000 Trade-In',
        promoCode: 'SONYAUDIO5K',
        savingsEstimate: '₹5,000',
        portalUrl: 'https://www.sony.co.in/trade-in',
        description: 'Upgrade 1000XM-series headphones to latest noise-canceling flagship.',
      },
    ],
  },
  {
    brandId: 'samsung',
    brandName: 'Samsung',
    logoText: 'SS',
    matchedKeywords: ['samsung', 'galaxy', 'tv', 'oled', 'qled', 'fridge', 'refrigerator', 'washing machine'],
    tiers: [
      {
        tierName: 'Samsung Care+ Shield',
        category: 'Extended Care',
        discountText: '35% OFF Shield Plan',
        promoCode: 'SAMSUNGCARE35',
        savingsEstimate: '₹3,999',
        portalUrl: 'https://www.samsung.com/in/offer/samsung-care-plus/',
        description: 'Accidental liquid damage & screen replacement protection for Galaxy and Smart TVs.',
      },
      {
        tierName: 'Galaxy Device Trade-In',
        category: 'Trade-Ins',
        discountText: '₹18,000 Bonus Value',
        promoCode: 'GALAXYTRADE18',
        savingsEstimate: '₹18,000',
        portalUrl: 'https://www.samsung.com/in/trade-in/',
        description: 'Guaranteed buyback credit on older Galaxy S/Z series towards new flagship devices.',
      },
      {
        tierName: 'Appliance Inverter Compressor Warranty',
        category: 'Warranty Renewals',
        discountText: '10-Yr Compressor Cert',
        promoCode: 'SAMAPP10YR',
        savingsEstimate: '₹2,500',
        portalUrl: 'https://www.samsung.com/in/support/warranty/',
        description: 'Digital Inverter motor & compressor warranty registration and free service tune-up.',
      },
    ],
  },
  {
    brandId: 'philips',
    brandName: 'Philips',
    logoText: 'PH',
    matchedKeywords: ['philips', 'airfryer', 'shaver', 'trimmer', 'iron', 'mixer', 'hue', 'sonicare'],
    tiers: [
      {
        tierName: 'Philips Care Instant Replacement',
        category: 'Warranty Renewals',
        discountText: '30% OFF Plan',
        promoCode: 'PHILIPS30',
        savingsEstimate: '₹1,800',
        portalUrl: 'https://www.philips.co.in/c-m/consumer-support',
        description: 'Instant replacement guarantee on kitchen & grooming electronics before warranty expires.',
      },
      {
        tierName: 'Sonicare Brush Head & Handle Upgrade',
        category: 'Trade-Ins',
        discountText: '₹1,200 Buyback Voucher',
        promoCode: 'SONICARE12',
        savingsEstimate: '₹1,200',
        portalUrl: 'https://www.philips.co.in/c-m-pe/electric-toothbrushes',
        description: 'Recycle old electric toothbrush handle for discount toward Sonicare DiamondClean.',
      },
    ],
  },
  {
    brandId: 'bose',
    brandName: 'Bose',
    logoText: 'BO',
    matchedKeywords: ['bose', 'headphones', 'quietcomfort', 'soundbar', 'speaker', 'earbuds'],
    tiers: [
      {
        tierName: 'Bose Acoustic Trade-Up',
        category: 'Trade-Ins',
        discountText: '₹8,500 Credit',
        promoCode: 'BOSETRADE8K',
        savingsEstimate: '₹8,500',
        portalUrl: 'https://www.bose.com/trade-in',
        description: 'Upgrade aging headphones or soundbars to QuietComfort Ultra with guaranteed buyback.',
      },
      {
        tierName: 'Bose Care Extended Warranty',
        category: 'Extended Care',
        discountText: '20% OFF 2-Yr Shield',
        promoCode: 'BOSECARE20',
        savingsEstimate: '₹2,200',
        portalUrl: 'https://www.bose.com/support',
        description: 'Manufacturer coverage extending against battery degradation and driver damage.',
      },
    ],
  },
  {
    brandId: 'lg',
    brandName: 'LG',
    logoText: 'LG',
    matchedKeywords: ['lg', 'oled', 'washer', 'dryer', 'refrigerator', 'air conditioner', 'ac', 'tv'],
    tiers: [
      {
        tierName: 'LG Direct Maintenance & Compressor',
        category: 'Warranty Renewals',
        discountText: '20% OFF AMC',
        promoCode: 'LGSHIELD20',
        savingsEstimate: '₹2,750',
        portalUrl: 'https://www.lg.com/in/support/warranty',
        description: 'Extend cooling compressor & motor warranty for an extra 3 years with annual inspections.',
      },
      {
        tierName: 'OLED Burn-In Protection Renewal',
        category: 'Extended Care',
        discountText: '25% OFF Panel Care',
        promoCode: 'LGOLED25',
        savingsEstimate: '₹6,000',
        portalUrl: 'https://www.lg.com/in/support',
        description: 'Dedicated 5-year OLED panel burn-in warranty extension for G & C series displays.',
      },
    ],
  },
  {
    brandId: 'dell',
    brandName: 'Dell',
    logoText: 'DL',
    matchedKeywords: ['dell', 'xps', 'inspiron', 'alienware', 'laptop', 'monitor'],
    tiers: [
      {
        tierName: 'Dell ProSupport Plus Extension',
        category: 'Extended Care',
        discountText: '25% OFF Plan',
        promoCode: 'DELLPLUS25',
        savingsEstimate: '₹5,200',
        portalUrl: 'https://www.dell.com/en-in/lp/warranty-extension',
        description: 'Next-business-day on-site repair, motherboard coverage & battery health replacement.',
      },
    ],
  },
  {
    brandId: 'dyson',
    brandName: 'Dyson',
    logoText: 'DY',
    matchedKeywords: ['dyson', 'vacuum', 'purifier', 'hair dryer', 'airwrap', 'v15'],
    tiers: [
      {
        tierName: 'Dyson Trade-Up & Upgrade Voucher',
        category: 'Trade-Ins',
        discountText: '₹6,000 Voucher',
        promoCode: 'DYSONTRADE6K',
        savingsEstimate: '₹6,000',
        portalUrl: 'https://www.dyson.in/trade-up',
        description: 'Exchange any vacuum or air purifier for instant store credit toward latest models.',
      },
    ],
  },
];

type FilterCategory = 'All Deals' | 'Warranty Renewals' | 'Trade-Ins' | 'Extended Care';

export const OffersScreen: React.FC<OffersScreenProps> = ({
  items,
  onNavigateToUpload,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All Deals');
  const [showOnlyDashboardItems, setShowOnlyDashboardItems] = useState(true);
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [selectedTierLabel, setSelectedTierLabel] = useState<string | null>(null);

  // Custom User Voucher/Perk State
  const [customBrand, setCustomBrand] = useState('');
  const [customDiscount, setCustomDiscount] = useState('');
  const [customCategory, setCustomCategory] = useState<'Warranty Renewals' | 'Trade-Ins' | 'Extended Care'>('Warranty Renewals');
  const [customCode, setCustomCode] = useState('');
  const [customExpiry, setCustomExpiry] = useState(() => {
    const nextQuarter = new Date();
    nextQuarter.setMonth(nextQuarter.getMonth() + 3);
    return nextQuarter.toISOString().split('T')[0];
  });
  const [userVouchers, setUserVouchers] = useState<PerkOffer[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Find match between tracked items in user dashboard and available perks
  const getMatchedUserItem = (offer: PerkOffer): Item | undefined => {
    return items.find((item) => {
      const itemBrandLower = (item.brand || '').toLowerCase().trim();
      const itemProductLower = (item.product || '').toLowerCase().trim();

      return offer.matchedKeywords.some((kw) => {
        const kwLower = kw.toLowerCase().trim();
        if (!kwLower) return false;
        return (
          itemBrandLower.includes(kwLower) ||
          kwLower.includes(itemBrandLower) ||
          itemProductLower.includes(kwLower)
        );
      });
    });
  };

  // Check if a brand preset matches any items in the user dashboard
  const isBrandMatchedToDashboard = (brand: BrandPreset): boolean => {
    return items.some((item) => {
      const itemBrandLower = (item.brand || '').toLowerCase().trim();
      const itemProductLower = (item.product || '').toLowerCase().trim();

      return brand.matchedKeywords.some((kw) => {
        const kwLower = kw.toLowerCase().trim();
        if (!kwLower) return false;
        return (
          itemBrandLower.includes(kwLower) ||
          kwLower.includes(itemBrandLower) ||
          itemProductLower.includes(kwLower)
        );
      });
    });
  };

  const handleCopyCode = (code: string, id: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCodeId(id);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2500);
  };

  const handleSelectTier = (brandName: string, tier: BrandPerkTier) => {
    const formattedName = `${brandName} (${tier.tierName})`;
    setCustomBrand(brandName);
    setCustomDiscount(tier.discountText);
    setCustomCategory(tier.category);
    setCustomCode(tier.promoCode);
    setSelectedTierLabel(formattedName);
    setErrorMsg('');
    setSuccessMsg(`Pre-filled: ${formattedName} - Code: ${tier.promoCode}`);
    
    setTimeout(() => setSuccessMsg(''), 4000);

    const formEl = document.getElementById('manual-voucher-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleAddCustomVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBrand.trim()) {
      setErrorMsg('Brand or device name is required.');
      return;
    }
    if (!customDiscount.trim()) {
      setErrorMsg('Discount or savings value is required.');
      return;
    }

    const newVoucher: PerkOffer = {
      id: `custom-voucher-${Date.now()}`,
      brand: customBrand.trim(),
      category: customCategory,
      badgeType: customCategory === 'Trade-Ins' ? 'TRADE IN' : 'EXTENDED WARRANTY',
      title: `${customBrand.trim()} - ${customCategory}`,
      description: `Tracked voucher: ${customDiscount.trim()} with promo code ${customCode.trim() || 'N/A'}.`,
      discountText: customDiscount.trim(),
      promoCode: customCode.trim() || 'CLAIMDIRECT',
      portalUrl: '#',
      portalName: `${customBrand.trim()} Portal`,
      matchedKeywords: [customBrand.toLowerCase()],
      savingsEstimate: customDiscount.trim(),
      validUntil: customExpiry,
    };

    setUserVouchers(prev => [newVoucher, ...prev]);
    setCustomBrand('');
    setCustomDiscount('');
    setCustomCode('');
    setSelectedTierLabel(null);
    setErrorMsg('');
    setSuccessMsg('Perk voucher added to your active list!');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleDeleteUserVoucher = (id: string) => {
    setUserVouchers(prev => prev.filter(v => v.id !== id));
  };

  // Combine system offers and user added vouchers
  const allOffers = [...userVouchers, ...OFFERS_DATA];

  // Matched offers strictly based on items in the dashboard
  const matchedOffers = allOffers.filter((offer) => {
    if (offer.id.startsWith('custom-voucher')) return true;
    return !!getMatchedUserItem(offer);
  });

  const matchedBrands = BRAND_PRESETS.filter(brand => isBrandMatchedToDashboard(brand));
  const displayedBrandPresets = showOnlyDashboardItems && items.length > 0
    ? matchedBrands
    : BRAND_PRESETS;

  // Base list depending on dashboard filter
  const baseOffersList = (showOnlyDashboardItems && items.length > 0) ? matchedOffers : allOffers;

  // Filter offers by category
  const filteredOffers = baseOffersList.filter((offer) => {
    if (activeFilter === 'All Deals') return true;
    return offer.category === activeFilter;
  });

  const isNewAccount = items.length === 0;

  return (
    <div className="w-full space-y-6">
      
      {/* Offers & Renewals Main Container (identical design to SubscriptionsScreen & DashboardScreen) */}
      <section className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 flex flex-col space-y-6 shadow-2xl">
        
        {/* Header with Title, Filter Dropdown & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
              <span className="text-xs uppercase tracking-widest font-semibold text-white/60">
                Warranty Perks &amp; Renewals Radar
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mt-1">
              Offers &amp; Renewals
            </h2>
            <p className="text-xs text-white/60 mt-0.5 font-light">
              Brand-direct referral links, warranty extensions &amp; instant trade-in credits verified for your hardware.
            </p>
          </div>

          {/* Category Filter Pill matching Region Switcher */}
          <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1.5 self-start sm:self-auto backdrop-blur-md">
            <Tag className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <select
              id="perk-category-dropdown"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as FilterCategory)}
              className="text-xs bg-transparent border-none font-semibold text-white outline-none cursor-pointer [&>option]:bg-[#091118] [&>option]:text-white"
            >
              <option value="All Deals">ALL DEALS</option>
              <option value="Warranty Renewals">WARRANTY RENEWALS</option>
              <option value="Trade-Ins">TRADE-INS &amp; BUYBACK</option>
              <option value="Extended Care">EXTENDED CARE</option>
            </select>
          </div>
        </div>

        {/* Quick Add / Popular Brand Protection Plans (matching Service Presets in SubscriptionsScreen) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block">
              {showOnlyDashboardItems && items.length > 0 
                ? 'Matched Hardware Brands in Vault:' 
                : 'Popular Brand Protection Plans & Trade-Ins:'}
            </span>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowOnlyDashboardItems(!showOnlyDashboardItems)}
                  className="text-[10px] text-[var(--color-accent)] hover:underline font-mono cursor-pointer"
                >
                  {showOnlyDashboardItems 
                    ? `Show All Catalog (${BRAND_PRESETS.length} Brands)` 
                    : `Only My Vault (${matchedBrands.length} Brands)`}
                </button>
              )}
              <span className="text-[10px] text-[var(--color-accent)] font-mono">
                {displayedBrandPresets.length} brand{displayedBrandPresets.length === 1 ? '' : 's'} available
              </span>
            </div>
          </div>

          {/* Expandable Service/Brand Cards Grid (exact same card UI as SubscriptionsScreen) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayedBrandPresets.map((brand) => {
              const isExpanded = expandedBrand === brand.brandId;
              const hasSelectedPlan = selectedTierLabel?.startsWith(brand.brandName);
              const isVaultMatched = isBrandMatchedToDashboard(brand);

              return (
                <div
                  key={brand.brandId}
                  className={`rounded-[18px] border transition-all duration-200 overflow-hidden ${
                    isExpanded 
                      ? 'bg-white/10 border-[var(--color-accent-border)] shadow-lg' 
                      : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                  }`}
                >
                  {/* Brand Header Row (Click to Expand Plans) */}
                  <button
                    type="button"
                    onClick={() => setExpandedBrand(isExpanded ? null : brand.brandId)}
                    className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-xs text-[var(--color-accent)]">
                        {brand.logoText}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <span>{brand.brandName}</span>
                          {isVaultMatched && (
                            <span className="px-1.5 py-0.2 rounded bg-accent text-[#081018] text-[9px] font-black tracking-tight">
                              In Vault
                            </span>
                          )}
                          {hasSelectedPlan && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                          )}
                        </div>
                        <div className="text-[10px] text-white/50">
                          {brand.tiers.length} referral tiers available
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

                  {/* Perk Tiers Sub-Chips */}
                  {isExpanded && (
                    <div className="p-3 pt-1 border-t border-white/10 bg-black/20 space-y-1.5">
                      {brand.tiers.map((tier) => {
                        const isThisPlanSelected = selectedTierLabel === `${brand.brandName} (${tier.tierName})`;

                        return (
                          <button
                            key={tier.tierName}
                            type="button"
                            onClick={() => handleSelectTier(brand.brandName, tier)}
                            className={`w-full p-2 rounded-[10px] text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                              isThisPlanSelected
                                ? 'bg-accent text-[#081018] font-bold shadow-md'
                                : 'bg-white/5 hover:bg-white/15 text-white/90 border border-white/10'
                            }`}
                          >
                            <span className="truncate pr-2">
                              {tier.tierName}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0 font-mono font-bold">
                              <span>{tier.discountText}</span>
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

        {/* Offers & Renewals List (matching layout of Subscriptions list in SubscriptionsScreen) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Active Referral Offers &amp; Renewals ({filteredOffers.length})
            </span>
            {items.length > 0 && (
              <span className="text-[11px] text-[var(--color-accent)] font-semibold">
                {matchedOffers.length} matched to vault
              </span>
            )}
          </div>

          {filteredOffers.length === 0 ? (
            <div className="py-10 text-center space-y-3 border border-dashed border-white/15 rounded-[20px] bg-white/5">
              <Gift className="w-8 h-8 text-white/30 mx-auto" />
              <p className="text-sm font-semibold text-white">No active offers matched</p>
              <p className="text-xs text-white/50 max-w-xs mx-auto font-light">
                {isNewAccount 
                  ? 'Scan your receipts in Snap Camera HUD to unlock brand-direct referral links and renewal discounts.'
                  : 'No offers in this category for your tracked devices. Select a tier above or explore all catalog.'}
              </p>
              <div className="flex justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onNavigateToUpload}
                  className="px-4 py-2 rounded-full bg-accent hover:opacity-90 text-[#081018] font-bold text-xs cursor-pointer active:scale-95 transition-transform flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan Receipt Now</span>
                </button>
                {showOnlyDashboardItems && (
                  <button
                    type="button"
                    onClick={() => setShowOnlyDashboardItems(false)}
                    className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Explore All
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredOffers.map((offer) => {
                const matchedItem = getMatchedUserItem(offer);
                const isCopied = copiedCodeId === offer.id;
                const isCustomUserVoucher = offer.id.startsWith('custom-voucher');

                return (
                  <div
                    key={offer.id}
                    id={`offer-item-${offer.id}`}
                    className="flex justify-between items-center py-3.5 group hover:bg-white/5 px-3 rounded-[14px] transition-colors gap-3"
                  >
                    {/* Left: Brand Monogram + Title + Badges + Description */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-[12px] bg-white/10 border border-white/10 text-[var(--color-accent)] flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                        {offer.brand.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-white truncate flex items-center gap-2 flex-wrap">
                          <span>{offer.title}</span>
                          {matchedItem && (
                            <span className="px-2 py-0.5 rounded-full bg-accent text-[#081018] text-[9px] font-black tracking-tight">
                              ✓ {matchedItem.product}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/10 text-white/70">
                            {offer.category}
                          </span>
                        </div>

                        <div className="text-[11px] text-white/50 flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="truncate max-w-xs sm:max-w-md">{offer.description}</span>
                          {offer.validUntil && (
                            <span className="hidden sm:flex items-center gap-1 text-white/40">
                              <Calendar className="w-3 h-3" />
                              Valid {offer.validUntil}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Discount + Code + Copy & Link Buttons */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      <div className="text-right">
                        <div className="font-bold text-white font-mono text-sm sm:text-base">
                          {offer.discountText}
                        </div>
                        <div className="text-[10px] text-white/50 font-mono">
                          Code: <span className="text-[var(--color-accent)] font-bold">{offer.promoCode}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          id={`copy-offer-btn-${offer.id}`}
                          onClick={() => handleCopyCode(offer.promoCode, offer.id)}
                          className={`px-3 py-1.5 rounded-[10px] text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isCopied
                              ? 'bg-accent text-[#081018]'
                              : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>

                        {offer.portalUrl && offer.portalUrl !== '#' && (
                          <a
                            href={offer.portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-[10px] bg-white/10 hover:bg-accent hover:text-[#081018] text-white border border-white/10 transition-all flex items-center justify-center cursor-pointer"
                            title={`Redeem on ${offer.portalName || `${offer.brand} Portal`}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {isCustomUserVoucher && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUserVoucher(offer.id)}
                            className="p-2 rounded-[8px] text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                            title="Delete voucher"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Benefits & Savings Radar Bar (matching Total Monthly Burn Radar Bar in Subscriptions) */}
        <div className="pt-4 border-t border-white/10">
          <div className="glass-panel-subtle p-4 rounded-[18px] flex justify-between items-center flex-wrap gap-3">
            <div>
              <span className="text-xs uppercase font-semibold text-white/50 tracking-wider block">
                Total Unlocked Referral &amp; Upgrade Value
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono mt-0.5 block">
                {isNewAccount ? '₹0' : '₹45,549+'} <span className="text-xs font-sans text-[var(--color-accent)] font-bold">Estimated Savings</span>
              </span>
            </div>

            <div className="text-right">
              <div className="text-xs font-semibold text-white font-mono flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]"></span>
                <span>{items.length} Vault Device{items.length === 1 ? '' : 's'} Active</span>
              </div>
              <div className="text-[10px] text-white/50 font-light mt-0.5">
                100% Verified Manufacturer Referral Links
              </div>
            </div>
          </div>
        </div>

        {/* Manual Voucher Tracking Form (matching Manual Subscription Form in SubscriptionsScreen) */}
        <div id="manual-voucher-form" className="pt-2">
          <form onSubmit={handleAddCustomVoucher} className="space-y-4 glass-panel-subtle p-5 sm:p-6 rounded-[22px] border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[var(--color-accent)]" />
                <h3 className="text-sm font-semibold text-white">
                  {customBrand ? `Track Voucher for ${customBrand}` : 'Track Custom Brand Referral / Voucher'}
                </h3>
              </div>
              {customBrand && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomBrand('');
                    setCustomDiscount('');
                    setCustomCode('');
                    setSelectedTierLabel(null);
                  }}
                  className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer font-bold"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {successMsg && (
              <div className="p-3 bg-white/10 border border-[var(--color-accent-border)] rounded-[12px] text-xs text-[var(--color-accent)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-[var(--color-accent)]" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-[12px] text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Brand or Device Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">
                  Brand / Device Name
                </label>
                <input
                  type="text"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  placeholder="e.g. Sony, Apple, Dyson"
                  className="w-full bg-black/20 border border-white/10 rounded-[12px] px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                />
              </div>

              {/* Discount / Savings Value */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">
                  Discount / Benefit
                </label>
                <input
                  type="text"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(e.target.value)}
                  placeholder="e.g. 25% OFF, ₹5,000 Credit"
                  className="w-full bg-black/20 border border-white/10 rounded-[12px] px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[var(--color-accent)] focus:outline-none transition-colors font-mono"
                />
              </div>

              {/* Perk Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">
                  Category
                </label>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as any)}
                  className="w-full bg-[#091118] border border-white/10 rounded-[12px] px-3 py-2.5 text-xs text-white focus:border-[var(--color-accent)] focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="Warranty Renewals">Warranty Renewals</option>
                  <option value="Trade-Ins">Trade-Ins</option>
                  <option value="Extended Care">Extended Care</option>
                </select>
              </div>

              {/* Promo Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">
                  Promo Code
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="e.g. CLAIMDIRECT"
                  className="w-full bg-black/20 border border-white/10 rounded-[12px] px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[var(--color-accent)] focus:outline-none transition-colors font-mono uppercase"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-white/50">
                Custom perks are saved locally to your current session vault.
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-accent hover:opacity-90 text-[#081018] font-bold text-xs transition-all shadow-md shadow-[var(--color-accent-glow)] active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Save &amp; Track Voucher</span>
              </button>
            </div>
          </form>
        </div>

      </section>
    </div>
  );
};
