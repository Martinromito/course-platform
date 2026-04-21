// src/components/ui/Button.tsx
// Componente de botón reutilizable con variantes

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: React.ReactNode;
}

const variants: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-[#b04b2b] to-[#8d3a21] hover:from-[#d15d38] hover:to-[#b04b2b] text-white shadow-lg shadow-[#b04b2b]/20 hover:shadow-[#b04b2b]/30',
  secondary:
    'bg-[#3e2723] hover:bg-[#5d4037] text-white',
  outline:
    'border border-[#b04b2b] text-[#b04b2b] hover:bg-[#b04b2b]/10',
  ghost:
    'text-[#5d4037] hover:bg-[#efebe9] hover:text-[#3e2723]',
  danger:
    'bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-700/25',
};

const sizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
