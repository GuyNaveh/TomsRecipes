import React from 'react';

export default function Toggle({ options = [], value, onChange, className = '' }) {
  return (
    <div className={`inline-flex rounded-lg overflow-hidden border border-slate-600 ${className}`}>
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-teal-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
