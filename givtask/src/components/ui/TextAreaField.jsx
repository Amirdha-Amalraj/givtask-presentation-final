import React from 'react'
import { AlertCircle } from 'lucide-react'

export default function TextAreaField({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
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
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className={`input-field resize-none ${borderClass} ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''}`}
      />
      <div className="flex justify-between mt-1.5">
        {error ? (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={12} />
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-slate-500">{hint}</p>
        ) : (
          <span />
        )}
        {maxLength && (
          <p className="text-xs text-slate-400">{(value || '').length}/{maxLength}</p>
        )}
      </div>
    </div>
  )
}
