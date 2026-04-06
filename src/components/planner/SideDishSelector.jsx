import React from 'react';

export default function SideDishSelector({ sideDishId, sideDishes = [], onChange }) {
  function handleRandom() {
    if (sideDishes.length === 0) return;
    const random = sideDishes[Math.floor(Math.random() * sideDishes.length)];
    onChange(random.id);
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      <span className="text-xs text-slate-500 shrink-0">תוספת:</span>
      <select
        value={sideDishId || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500 transition-colors"
      >
        <option value="">ללא תוספת</option>
        {sideDishes.map((dish) => (
          <option key={dish.id} value={dish.id}>
            {dish.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleRandom}
        title="תוספת אקראית"
        className="px-2 py-0.5 rounded text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
      >
        🎲
      </button>
    </div>
  );
}
