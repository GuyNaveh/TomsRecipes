import React, { useEffect } from 'react';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${sizeClasses[size] ?? sizeClasses.md} bg-card rounded-xl border border-slate-700/50 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
          {title && (
            <h2 className="text-lg font-heading font-semibold text-slate-100">{title}</h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mr-auto text-slate-400 hover:text-slate-100 transition-colors text-xl leading-none"
            aria-label="סגור"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
