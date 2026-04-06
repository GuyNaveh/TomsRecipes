import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_COOK_NAMES } from '../utils/constants.js';

const LS_KEY = 'matakon_settings';

const DEFAULT_SETTINGS = {
  claudeApiKey: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  cookNames: [...DEFAULT_COOK_NAMES],
};

function readFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS, cookNames: [...DEFAULT_COOK_NAMES] };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS, cookNames: [...DEFAULT_COOK_NAMES] };
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(readFromStorage);

  useEffect(() => {
    const stored = readFromStorage();
    setSettings(stored);
  }, []);

  const updateSettings = useCallback((partial) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const saveSettings = useCallback((partial) => {
    updateSettings(partial);
  }, [updateSettings]);

  return { settings, updateSettings, saveSettings };
}
