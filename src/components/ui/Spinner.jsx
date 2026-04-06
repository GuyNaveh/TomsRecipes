import React from 'react';

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export default function Spinner({ size = 'md', className = '' }) {
  const sizeCls = sizeMap[size] ?? sizeMap.md;
  return (
    <div
      className={`${sizeCls} rounded-full border-2 border-slate-600 border-t-teal-400 animate-spin ${className}`}
      role="status"
      aria-label="טוען..."
    />
  );
}
