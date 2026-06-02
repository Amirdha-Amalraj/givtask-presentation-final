import React from 'react'

export default function MiniBarChart({ data = [], valueKey = 'amount', labelKey = 'month', color = '#2563EB', label = '' }) {
  const values = data.map(d => d[valueKey])
  const max = Math.max(...values) || 1

  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-xs font-semibold text-navy-700">{label}</p>}
      <div className="flex items-end gap-1.5 h-16">
        {data.map((item, i) => {
          const height = Math.max(4, (item[valueKey] / max) * 100)
          const isLast = i === data.length - 1
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex items-end justify-center" style={{ height: '52px' }}>
                <div
                  className="w-full rounded-t-md transition-all duration-500 cursor-default"
                  style={{
                    height: `${height}%`,
                    background: isLast
                      ? `linear-gradient(to top, ${color}, #7C3AED)`
                      : '#E2E8F0',
                    minHeight: '4px',
                  }}
                />
                {/* Tooltip */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-navy-900 text-white text-[10px] px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {typeof item[valueKey] === 'number' && item[valueKey] >= 1000
                    ? `₹${(item[valueKey] / 1000).toFixed(0)}K`
                    : item[valueKey]}
                </div>
              </div>
              <span className="text-[10px] text-slate-400">{item[labelKey]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
