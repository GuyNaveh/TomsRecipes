import React, { useState } from 'react';
import Button from '../ui/Button.jsx';
import { extractRecipeFromText } from '../../api/claude.js';

export default function ImportFreeText({ onImport, apiKey }) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleImport() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const parsed = await extractRecipeFromText(text.trim(), apiKey);
      onImport(parsed);
      setText('');
      setExpanded(false);
    } catch (err) {
      setError(err.message || 'שגיאה בייבוא המתכון');
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
        <span>ייבא ממקור אחר</span>
        <span
          className={`transition-transform duration-200 text-xs ${expanded ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="p-4 flex flex-col gap-3 border-t border-slate-700/50 bg-slate-800/20">
          <p className="text-xs text-slate-400">
            הדבק טקסט של מתכון ו-Claude יחלץ אותו אוטומטית
          </p>

          {!apiKey && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-300">
              יש להגדיר מפתח Claude בהגדרות
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="הדבק כאן את טקסט המתכון..."
            rows={6}
            disabled={!apiKey}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors resize-y disabled:opacity-50 disabled:cursor-not-allowed"
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
            disabled={!apiKey || !text.trim()}
            loading={loading}
            onClick={handleImport}
          >
            ייבא מתכון
          </Button>
        </div>
      )}
    </div>
  );
}
