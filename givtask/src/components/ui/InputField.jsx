import React, { useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function InputField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  hint,
  success,
  required = false,
  disabled = false,
  icon,
  className = '',
  inputClassName = '',
  autoComplete,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  const borderClass = error
    ? 'border-red-400 focus:ring-red-400'
    : success
    ? 'border-emerald-400 focus:ring-emerald-400'
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
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={`input-field ${borderClass} ${icon ? 'pl-10' : ''} ${isPassword || error || success ? 'pr-10' : ''} ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''} ${inputClassName}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {!isPassword && error && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <AlertCircle size={16} />
          </div>
        )}

        {!isPassword && success && !error && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
            <CheckCircle2 size={16} />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}
