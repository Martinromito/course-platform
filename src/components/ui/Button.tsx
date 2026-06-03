// src/components/ui/Button.tsx
// Componente de botón reutilizable con variantes — Paleta artesanal

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: React.ReactNode;
}

const variants: Record<string, string> = {
  primary:
    'bg-[#8B7355] hover:bg-[#705E45] text-white shadow-sm hover:shadow-md',
  secondary:
    'bg-[#1A1A1A] hover:bg-[#333333] text-white',
  outline:
    'border border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-white',
  ghost:
    'text-[#4A4A4A] hover:bg-[#F2F0ED] hover:text-[#1A1A1A]',
  danger:
    'bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-700/25',
};

const sizes: Record<string, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-3.5 text-base',
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
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8B7355]/40 focus:ring-offset-2 focus:ring-offset-[#FAF8F4]
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
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
