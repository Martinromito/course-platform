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
    'bg-gradient-to-r from-[#8B7355] to-[#705E45] hover:from-[#A68B67] hover:to-[#8B7355] text-white shadow-lg shadow-[#8B7355]/20 hover:shadow-[#8B7355]/30',
  secondary:
    'bg-[#1A1A1A] hover:bg-[#333333] text-white',
  outline:
    'border border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355]/5',
  ghost:
    'text-[#4A4A4A] hover:bg-[#F2F0ED] hover:text-[#1A1A1A]',
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
