import React from 'react';
import { TAG_COLOR_MAP, DEFAULT_TAG_COLOR } from '../../utils/constants.js';

export default function TagBadge({ label, onRemove, colorClass }) {
  const resolvedColor = colorClass ?? TAG_COLOR_MAP[label] ?? DEFAULT_TAG_COLOR;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${resolvedColor}`}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity leading-none"
          aria-label={`הסר ${label}`}
        >
          ✕
        </button>
      )}
    </span>
  );
}
