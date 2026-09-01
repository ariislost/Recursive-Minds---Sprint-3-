export interface Item {
  id: string;
  user_id: string;
  product: string;
  brand: string;
  purchase_date: string; // YYYY-MM-DD
  warranty_months: number;
  price: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' | string;
  created_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  name: string;
  cost: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP' | string;
  cycle: 'monthly' | 'yearly';
  renewal_date: string; // YYYY-MM-DD
  created_at?: string;
}

export interface AppUser {
  id: string;
  email: string;
  name?: string;
}

export type TabType = 'upload' | 'dashboard' | 'subscriptions' | 'offers';

export type ThemeMode = 'yellow-blue' | 'red-blue' | 'green-blue';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  shortName: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  accentSecondary: string;
  bgBase: string;
  bgCard: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  gradient: string;
  description: string;
}

export interface PerkOffer {
  id: string;
  brand: string;
  category: 'Warranty Renewals' | 'Trade-Ins' | 'Extended Care';
  badgeType: 'EXTENDED WARRANTY' | 'TRADE IN' | 'EXTENDED CARE' | 'WARRANTY RENEWAL';
  title: string;
  description: string;
  discountText: string;
  promoCode: string;
  portalUrl: string;
  portalName: string;
  matchedKeywords: string[];
  savingsEstimate?: string;
  validUntil?: string;
}

export interface ExtractedWarrantyData {
  product: string;
  brand: string;
  purchase_date: string;
  warranty_months: number;
  price: number;
  currency: string;
  rawText: string;
  confidenceNotes: string[];
}
