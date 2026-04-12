import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-rank-primary ${
          error
            ? 'border-red-700 focus:ring-red-600'
            : 'border-gray-700 focus:border-gray-600'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
