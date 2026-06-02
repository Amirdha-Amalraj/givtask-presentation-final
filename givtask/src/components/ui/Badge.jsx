import React from 'react'

const variantMap = {
  default: 'bg-slate-100 text-slate-700',
  royal: 'bg-royal-50 text-royal-700',
  violet: 'bg-violet-50 text-violet-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  navy: 'bg-navy-50 text-navy-700',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
        ${variantMap[variant] || variantMap.default} ${className}`}
    >
      {children}
    </span>
  )
}
