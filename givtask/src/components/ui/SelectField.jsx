import React from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'

export default function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className = '',
}) {
  const borderClass = error
    ? 'border-red-400 focus:ring-red-400'
    : 'border-[#E2E8F0] focus:ring-royal-500'

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`input-field appearance-none pr-10 ${borderClass} ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronDown size={16} />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}
