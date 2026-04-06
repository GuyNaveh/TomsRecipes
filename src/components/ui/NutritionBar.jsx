import React from 'react';

const macros = [
  { key: 'calories', label: 'קלוריות', unit: 'קק"ל', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { key: 'protein', label: 'חלבון', unit: 'גרם', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { key: 'carbs', label: 'פחמימות', unit: 'גרם', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  { key: 'fat', label: 'שומן', unit: 'גרם', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
];

export default function NutritionBar({ nutrition = {}, compact = false }) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-3">
        {macros.map(({ key, label, unit, color }) => (
          <span key={key} className={`text-xs ${color}`}>
            <span className="font-medium">{nutrition[key] ?? '—'}</span>
            <span className="text-slate-400 mr-0.5">{unit}</span>
            <span className="text-slate-500 mr-0.5">{label}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {macros.map(({ key, label, unit, color, bg }) => (
        <div
          key={key}
          className={`rounded-lg border p-3 flex flex-col items-center gap-1 ${bg}`}
        >
          <span className={`text-lg font-bold ${color}`}>
            {nutrition[key] ?? '—'}
          </span>
          <span className="text-xs text-slate-400">{unit}</span>
          <span className="text-xs text-slate-300 font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
}
