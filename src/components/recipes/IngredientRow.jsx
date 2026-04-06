import React from 'react';
import { UNITS } from '../../utils/constants.js';

export default function IngredientRow({ ingredient, onChange, onRemove }) {
  const { amount, unit, name } = ingredient;

  return (
    <div className="flex items-center gap-2">
      {/* Amount */}
      <input
        type="number"
        value={amount}
        onChange={(e) => onChange({ ...ingredient, amount: e.target.value })}
        placeholder="כמות"
        min="0"
        dir="ltr"
        className="w-20 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors text-left"
      />

      {/* Unit */}
      <select
        value={unit}
        onChange={(e) => onChange({ ...ingredient, unit: e.target.value })}
        className="w-28 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors"
      >
        {UNITS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>

      {/* Ingredient name */}
      <input
        type="text"
        value={name}
        onChange={(e) => onChange({ ...ingredient, name: e.target.value })}
        placeholder="שם המצרך"
        className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors"
      />

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm"
        aria-label="הסר מצרך"
      >
        ✕
      </button>
    </div>
  );
}
