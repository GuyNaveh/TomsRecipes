import React from 'react';
import { VIEWS } from '../../utils/constants.js';

const navItems = [
  { view: VIEWS.RECIPES, label: 'מתכונים' },
  { view: VIEWS.PLANNER, label: 'תכנון' },
  { view: VIEWS.SETTINGS, label: 'הגדרות' },
];

export default function NavBar({ view, onViewChange, storageMode = 'local', user = null, onSignOut }) {
  return (
    <nav className="sticky top-0 z-40 bg-slate-900 border-b border-slate-700/50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Right: App name */}
        <span className="font-heading text-xl font-bold text-slate-100 shrink-0">
          מתכונן
        </span>

        {/* Center: navigation buttons */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = view === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onViewChange(item.view)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Left: storage icon + user info */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-lg"
            title={storageMode === 'supabase' ? 'ענן' : 'מקומי'}
            aria-label={storageMode === 'supabase' ? 'אחסון ענן' : 'אחסון מקומי'}
          >
            {storageMode === 'supabase' ? '☁️' : '💾'}
          </span>

          {user && (
            <>
              <span className="text-xs text-slate-400 max-w-[120px] truncate">
                {user.email}
              </span>
              <button
                type="button"
                className="px-2 py-1 rounded-lg text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                onClick={onSignOut}
                aria-label="התנתק"
              >
                יציאה
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
