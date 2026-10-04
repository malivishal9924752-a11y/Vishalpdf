import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'vishalpdf_supabase_config';

interface StoredConfig {
  url: string;
  anonKey: string;
}

export function getSavedSupabaseConfig(): StoredConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

let activeSupabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const config = getSavedSupabaseConfig();
  if (config.url && config.anonKey && config.url.startsWith('http')) {
    if (!activeSupabaseClient) {
      activeSupabaseClient = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return activeSupabaseClient;
  }
  return null;
}

export function resetSupabaseInstance(): void {
  activeSupabaseClient = null;
}

/**
 * Validates connection to a Supabase project by querying health or a table
 */
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      return { success: false, message: 'URL must start with https://' };
    }
    const testClient = createClient(url, anonKey);
    const { error } = await testClient.from('books').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's connected to Supabase but needs SQL schema run
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return { 
          success: true, 
          message: 'Connected to Supabase project! Note: Run the SQL schema to create tables.' 
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection failed' };
  }
}
