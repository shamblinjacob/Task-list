import { createClient, SupabaseClient } from "@supabase/supabase-js";

const LS_CONFIG_KEY = "task-list:supabase";

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getStoredConfig(): { url: string; anonKey: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LS_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.url && parsed.anonKey) return { url: parsed.url, anonKey: parsed.anonKey };
    return null;
  } catch {
    return null;
  }
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  window.localStorage.setItem(LS_CONFIG_KEY, JSON.stringify({ url, anonKey }));
}

function resolveConfig(): { url: string; anonKey: string } | null {
  if (envUrl && envAnonKey) return { url: envUrl, anonKey: envAnonKey };
  return getStoredConfig();
}

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const config = resolveConfig();
  if (!config) return null;
  if (!cached) {
    cached = createClient(config.url, config.anonKey, {
      auth: { persistSession: false },
    });
  }
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(resolveConfig());
}

export function getStoredSupabaseConfig(): { url: string; anonKey: string } | null {
  return getStoredConfig();
}
