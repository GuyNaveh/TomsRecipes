import React from 'react';

export default function CookAssigner({ cook, cookNames = [], onChange }) {
  function handleRandom() {
    if (cookNames.length === 0) return;
    const randomName = cookNames[Math.floor(Math.random() * cookNames.length)];
    onChange(randomName);
  }

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      <span className="text-xs text-slate-500 ml-1">טבח:</span>
      {cookNames.map((name) => (
        <button
          key={name}
          onClick={() => onChange(name === cook ? null : name)}
          className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
            cook === name
              ? 'bg-teal-600 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
        >
          {name}
        </button>
      ))}
      <button
        onClick={handleRandom}
        title="בחר אקראי"
        className="px-2 py-0.5 rounded text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
      >
        🎲
      </button>
    </div>
  );
}
