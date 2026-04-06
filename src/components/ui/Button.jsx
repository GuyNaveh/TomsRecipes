import React from 'react';

const variantClasses = {
  primary: 'bg-teal-600 hover:bg-teal-500 text-white',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
  ghost: 'bg-transparent hover:bg-slate-700/50 text-slate-300 hover:text-white',
  danger: 'bg-red-600/80 hover:bg-red-500 text-white',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5',
};

function Spinner() {
  return (
    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
  );
}

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className = '',
  ...props
}) {
  const base =
    'rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2';
  const variantCls = variantClasses[variant] ?? variantClasses.primary;
  const sizeCls = sizeClasses[size] ?? sizeClasses.md;

  return (
    <button
      className={`${base} ${variantCls} ${sizeCls} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
