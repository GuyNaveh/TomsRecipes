import React, { useState } from 'react';
import Button from '../ui/Button.jsx';
import { getSupabaseClient } from '../../api/supabase.js';

export default function ImportFromUrl({ onImport, apiKey }) {
  const [expanded, setExpanded] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleImport() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const sb = getSupabaseClient();
      const { data, error: fnError } = await sb.functions.invoke('fetch-recipe', {
        body: { url: url.trim(), claudeApiKey: apiKey },
      });
      if (fnError) throw new Error(fnError.message || 'שגיאה בייבוא מ-URL');
      onImport(data);
      setUrl('');
      setExpanded(false);
    } catch (err) {
      setError(err.message || 'שגיאה בייבוא מ-URL');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-700/50 overflow-hidden">
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors text-sm font-medium"
      >
        <span>ייבא מ-URL</span>
        <span
          className={`transition-transform duration-200 text-xs ${expanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="p-4 flex flex-col gap-3 border-t border-slate-700/50 bg-slate-800/20">
          <p className="text-xs text-slate-400">
            הדבק קישור לדף מתכון ו-Claude יחלץ את הפרטים אוטומטית
          </p>

          {!apiKey && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-300">
              יש להגדיר מפתח Claude בהגדרות
            </div>
          )}

          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            dir="ltr"
            disabled={!apiKey}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!apiKey || !url.trim()}
            loading={loading}
            onClick={handleImport}
          >
            ייבא מ-URL
          </Button>
        </div>
      )}
    </div>
  );
}
