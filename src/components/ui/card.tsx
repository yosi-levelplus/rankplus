import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-gray-900 border border-gray-800 rounded-lg shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-800 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <h3 className={`text-lg font-semibold text-white ${className}`} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
