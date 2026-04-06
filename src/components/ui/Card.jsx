import React from 'react';

export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-card rounded-xl border border-slate-700/50 ${className}`}>
      {children}
    </div>
  );
}
