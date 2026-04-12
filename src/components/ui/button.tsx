import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary:
      'bg-rank-primary hover:bg-rank-primary-dark text-white focus:ring-rank-primary',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-600',
    outline:
      'border border-gray-700 hover:border-gray-600 text-white focus:ring-gray-600',
    ghost: 'text-gray-300 hover:bg-gray-800 focus:ring-gray-700',
    destructive:
      'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
