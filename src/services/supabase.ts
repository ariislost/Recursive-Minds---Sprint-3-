import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { Item, Subscription, AppUser } from '../types';

const STORAGE_KEY_AUTH = 'claimsync_current_user';
const STORAGE_KEY_ITEMS = 'claimsync_items';
const STORAGE_KEY_SUBS = 'claimsync_subscriptions';
const STORAGE_KEY_CONFIG = 'claimsync_supabase_config';
const STORAGE_KEY_SEEDED = 'claimsync_has_seeded_';

// Initial Supabase Config
const metaEnv = (import.meta as any).env || {};
let supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
let supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

// Check saved custom config
try {
  const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (savedConfig) {
    const parsed = JSON.parse(savedConfig);
    if (parsed.url && parsed.key) {
      supabaseUrl = parsed.url;
      supabaseAnonKey = parsed.key;
    }
  }
} catch (e) {
  console.warn('Error reading saved Supabase config:', e);
}

export let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('YOUR_SUPABASE')) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('Could not initialize Supabase client:', err);
  }
}

export function isSupabaseConfigured(): boolean {
  return !!supabase;
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ url, key }));
  supabaseUrl = url;
  supabaseAnonKey = key;
  if (url && key) {
    supabase = createClient(url, key);
  } else {
    supabase = null;
  }
}

// ----------------------------------------------------
// Mock Data Seeder (3 items, 2 subscriptions)
// ----------------------------------------------------
export function getInitialSeedItems(userId: string): Item[] {
  const today = new Date();
  
  // Item 1: Samsung TV expiring in ~20 days (Yellow warning)
  const tvDate = new Date(today);
  tvDate.setMonth(today.getMonth() - 11);
  tvDate.setDate(today.getDate() - 10);
  
  // Item 2: Apple MacBook expiring in ~5 days (Red urgent warning)
  const macDate = new Date(today);
  macDate.setMonth(today.getMonth() - 23);
  macDate.setDate(today.getDate() - 25);

  // Item 3: Whirlpool Refrigerator expiring in ~20 months (Green safe)
  const fridgeDate = new Date(today);
  fridgeDate.setMonth(today.getMonth() - 4);

  return [
    {
      id: 'mock-item-1',
      user_id: userId,
      product: '55" OLED 4K Smart TV',
      brand: 'Samsung',
      purchase_date: tvDate.toISOString().split('T')[0],
      warranty_months: 12,
      price: 64999,
      currency: 'INR',
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-item-2',
      user_id: userId,
      product: 'MacBook Pro 16" M3 Max',
      brand: 'Apple',
      purchase_date: macDate.toISOString().split('T')[0],
      warranty_months: 24,
      price: 2499,
      currency: 'USD',
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-item-3',
      user_id: userId,
      product: '340L Double Door Refrigerator',
      brand: 'Whirlpool',
      purchase_date: fridgeDate.toISOString().split('T')[0],
      warranty_months: 24,
      price: 32500,
      currency: 'INR',
      created_at: new Date().toISOString(),
    },
  ];
}

export function getInitialSeedSubscriptions(userId: string): Subscription[] {
  const today = new Date();
  
  const netflixDate = new Date(today);
  netflixDate.setDate(today.getDate() + 8);

  const spotifyDate = new Date(today);
  spotifyDate.setDate(today.getDate() + 19);

  return [
    {
      id: 'mock-sub-1',
      user_id: userId,
      name: 'Netflix 4K Ultra',
      cost: 649,
      currency: 'INR',
      cycle: 'monthly',
      renewal_date: netflixDate.toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-sub-2',
      user_id: userId,
      name: 'Spotify Premium Family',
      cost: 11.99,
      currency: 'USD',
      cycle: 'monthly',
      renewal_date: spotifyDate.toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    },
  ];
}

// ----------------------------------------------------
// Authentication API
// ----------------------------------------------------
export async function getCurrentUser(): Promise<AppUser | null> {
  if (supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        return {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
        };
      }
    } catch (e) {
      console.warn('Supabase getUser error:', e);
    }
  }

  // Local storage fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading local user:', e);
  }
  return null;
}

export async function signIn(email: string, password: string): Promise<{ user: AppUser | null; error: string | null }> {
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { user: null, error: error.message };
      if (data.user) {
        const appUser: AppUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || email.split('@')[0],
        };
        await seedUserDataIfNeeded(appUser.id, appUser.email);
        return { user: appUser, error: null };
      }
    } catch (err: any) {
      return { user: null, error: err.message || 'Authentication failed' };
    }
  }

  // Local Auth Fallback
  if (!email || !password) {
    return { user: null, error: 'Email and password are required' };
  }
  if (password.length < 6) {
    return { user: null, error: 'Password must be at least 6 characters' };
  }

  const userId = 'user_' + btoa(email.toLowerCase()).replace(/=/g, '').slice(0, 16);
  const appUser: AppUser = {
    id: userId,
    email,
    name: email.split('@')[0],
  };
  localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(appUser));
  await seedUserDataIfNeeded(appUser.id, appUser.email);

  return { user: appUser, error: null };
}

export async function signUp(email: string, password: string, name?: string): Promise<{ user: AppUser | null; error: string | null }> {
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || email.split('@')[0] },
        },
      });
      if (error) return { user: null, error: error.message };
      if (data.user) {
        const appUser: AppUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: name || email.split('@')[0],
        };
        await seedUserDataIfNeeded(appUser.id, appUser.email);
        return { user: appUser, error: null };
      }
    } catch (err: any) {
      return { user: null, error: err.message || 'Sign up failed' };
    }
  }

  // Local Auth Fallback
  if (!email || !password) {
    return { user: null, error: 'Email and password are required' };
  }
  if (password.length < 6) {
    return { user: null, error: 'Password must be at least 6 characters' };
  }

  const userId = 'user_' + btoa(email.toLowerCase()).replace(/=/g, '').slice(0, 16);
  const appUser: AppUser = {
    id: userId,
    email,
    name: name || email.split('@')[0],
  };
  localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(appUser));
  await seedUserDataIfNeeded(appUser.id, appUser.email);

  return { user: appUser, error: null };
}

export async function signOut(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
  }
  localStorage.removeItem(STORAGE_KEY_AUTH);
}

// ----------------------------------------------------
// Database Operations (Items / Warranties)
// ----------------------------------------------------
export async function seedUserDataIfNeeded(userId: string, email?: string): Promise<void> {
  const seedKey = STORAGE_KEY_SEEDED + userId;
  const alreadySeeded = localStorage.getItem(seedKey);
  if (alreadySeeded === 'true') return;

  // Requirement: Only seed mock items + subscriptions for designated demo account (demo@claimsync.app)
  const isDemo = email?.toLowerCase() === 'demo@claimsync.app';
  if (!isDemo) {
    localStorage.setItem(seedKey, 'true');
    return;
  }

  const existingItems = await fetchItems(userId);
  const existingSubs = await fetchSubscriptions(userId);

  if (existingItems.length === 0) {
    const mockItems = getInitialSeedItems(userId);
    for (const item of mockItems) {
      await addItem(item);
    }
  }

  if (existingSubs.length === 0) {
    const mockSubs = getInitialSeedSubscriptions(userId);
    for (const sub of mockSubs) {
      await addSubscription(sub);
    }
  }

  localStorage.setItem(seedKey, 'true');
}

export async function fetchItems(userId: string): Promise<Item[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as Item[];
      }
    } catch (e) {
      console.warn('Supabase fetchItems fallback to local:', e);
    }
  }

  // Local Storage Fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (raw) {
      const allItems: Item[] = JSON.parse(raw);
      return allItems.filter(i => i.user_id === userId);
    }
  } catch (e) {
    console.error('Error loading local items:', e);
  }
  return [];
}

export async function addItem(item: Omit<Item, 'id' | 'created_at'> & { id?: string }): Promise<Item> {
  const newItem: Item = {
    ...item,
    id: item.id || 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([newItem])
        .select()
        .single();

      if (!error && data) {
        // Also cache locally
        saveItemLocally(data as Item);
        return data as Item;
      }
    } catch (e) {
      console.warn('Supabase insert item failed, saving locally:', e);
    }
  }

  saveItemLocally(newItem);
  return newItem;
}

function saveItemLocally(item: Item) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    const list: Item[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex(i => i.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save item locally:', e);
  }
}

export async function deleteItem(itemId: string, userId: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);
      if (error) console.warn('Supabase delete error:', error);
    } catch (e) {
      console.warn('Supabase delete failed:', e);
    }
  }

  // Remove from local storage
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (raw) {
      const list: Item[] = JSON.parse(raw);
      const filtered = list.filter(i => i.id !== itemId);
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(filtered));
    }
    return true;
  } catch (e) {
    console.error('Failed to delete item locally:', e);
    return false;
  }
}

// ----------------------------------------------------
// Database Operations (Subscriptions)
// ----------------------------------------------------
export async function fetchSubscriptions(userId: string): Promise<Subscription[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('renewal_date', { ascending: true });

      if (!error && data) {
        return data as Subscription[];
      }
    } catch (e) {
      console.warn('Supabase fetchSubscriptions fallback to local:', e);
    }
  }

  // Local Storage Fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBS);
    if (raw) {
      const allSubs: Subscription[] = JSON.parse(raw);
      return allSubs.filter(s => s.user_id === userId);
    }
  } catch (e) {
    console.error('Error loading local subscriptions:', e);
  }
  return [];
}

export async function addSubscription(sub: Omit<Subscription, 'id' | 'created_at'> & { id?: string }): Promise<Subscription> {
  const newSub: Subscription = {
    ...sub,
    id: sub.id || 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([newSub])
        .select()
        .single();

      if (!error && data) {
        saveSubLocally(data as Subscription);
        return data as Subscription;
      }
    } catch (e) {
      console.warn('Supabase insert subscription failed, saving locally:', e);
    }
  }

  saveSubLocally(newSub);
  return newSub;
}

function saveSubLocally(sub: Subscription) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBS);
    const list: Subscription[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex(s => s.id === sub.id);
    if (index >= 0) {
      list[index] = sub;
    } else {
      list.push(sub);
    }
    localStorage.setItem(STORAGE_KEY_SUBS, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save subscription locally:', e);
  }
}

export async function deleteSubscription(subId: string, userId: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subId)
        .eq('user_id', userId);
      if (error) console.warn('Supabase delete subscription error:', error);
    } catch (e) {
      console.warn('Supabase delete failed:', e);
    }
  }

  // Remove from local storage
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBS);
    if (raw) {
      const list: Subscription[] = JSON.parse(raw);
      const filtered = list.filter(s => s.id !== subId);
      localStorage.setItem(STORAGE_KEY_SUBS, JSON.stringify(filtered));
    }
    return true;
  } catch (e) {
    console.error('Failed to delete subscription locally:', e);
    return false;
  }
}
