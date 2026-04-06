import React, { useState } from 'react';
import { PRESET_TAGS, TAG_COLOR_MAP, DEFAULT_TAG_COLOR } from '../../utils/constants.js';
import TagBadge from './TagBadge.jsx';

export default function TagSelector({ selected = [], onChange, className = '' }) {
  const [customInput, setCustomInput] = useState('');

  const presetLabels = PRESET_TAGS.map((t) => t.label);
  const customTags = selected.filter((t) => !presetLabels.includes(t));

  function togglePreset(label) {
    if (selected.includes(label)) {
      onChange(selected.filter((t) => t !== label));
    } else {
      onChange([...selected, label]);
    }
  }

  function addCustomTag() {
    const trimmed = customInput.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
    }
    setCustomInput('');
  }

  function removeTag(label) {
    onChange(selected.filter((t) => t !== label));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    }
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Preset tags */}
      <div className="flex flex-wrap gap-2">
        {PRESET_TAGS.map((tag) => {
          const isSelected = selected.includes(tag.label);
          return (
            <button
              key={tag.label}
              type="button"
              onClick={() => togglePreset(tag.label)}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border transition-opacity ${tag.color} ${
                isSelected ? 'opacity-100 ring-2 ring-offset-1 ring-offset-slate-800 ring-teal-500' : 'opacity-60 hover:opacity-90'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Custom tags already added */}
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customTags.map((tag) => (
            <TagBadge
              key={tag}
              label={tag}
              colorClass={DEFAULT_TAG_COLOR}
              onRemove={() => removeTag(tag)}
            />
          ))}
        </div>
      )}

      {/* Add custom tag input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="תגית מותאמת אישית..."
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-colors"
        />
        <button
          type="button"
          onClick={addCustomTag}
          disabled={!customInput.trim()}
          className="px-3 py-1.5 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          הוסף
        </button>
      </div>
    </div>
  );
}
