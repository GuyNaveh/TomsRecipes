import { createClient } from '@supabase/supabase-js';

const LS_KEY = 'matakon_settings';

let _client = null;

function readSettings() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function getSupabaseClient() {
  if (_client) return _client;
  const { supabaseUrl, supabaseAnonKey } = readSettings();
  if (supabaseUrl && supabaseAnonKey) {
    _client = createClient(supabaseUrl, supabaseAnonKey);
    return _client;
  }
  return null;
}

export function reinitSupabase() {
  _client = null;
}

export function isSupabaseConfigured() {
  const { supabaseUrl, supabaseAnonKey } = readSettings();
  return Boolean(supabaseUrl && supabaseAnonKey);
}
