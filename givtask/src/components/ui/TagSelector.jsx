import React from 'react'
import { Check, X } from 'lucide-react'

export default function TagSelector({
  label,
  options = [],
  selected = [],
  onToggle,
  max,
  required = false,
  hint,
  error,
  className = '',
}) {
  const isSelected = (tag) => selected.includes(tag)
  const isDisabled = (tag) => max && selected.length >= max && !isSelected(tag)

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          {max && (
            <span className="text-xs text-slate-400">
              {selected.length}/{max} selected
            </span>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((tag) => {
          const active = isSelected(tag)
          const disabled = isDisabled(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => !disabled && onToggle(tag)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                border transition-all duration-150 select-none
                ${active
                  ? 'bg-royal-600 text-white border-royal-600 shadow-sm'
                  : disabled
                  ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-navy-700 border-[#E2E8F0] hover:border-royal-300 hover:text-royal-700 cursor-pointer'
                }
              `}
            >
              {active && <Check size={12} />}
              {tag}
            </button>
          )
        })}
      </div>
      {hint && !error && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
