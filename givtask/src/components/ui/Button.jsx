import React from 'react'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  violet: 'btn-violet',
  danger: 'inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: '', // default from class
  lg: 'px-8 py-4 text-base',
  xl: 'px-10 py-5 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const base = variants[variant] || variants.primary
  const sizeClass = size !== 'md' ? sizes[size] : ''
  const widthClass = fullWidth ? 'w-full justify-center' : ''
  const disabledClass = disabled || loading ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizeClass} ${widthClass} ${disabledClass} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  )
}
