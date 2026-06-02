import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({ icon: Icon, label, value, sub, trend, trendValue, color = 'royal', className = '' }) {
  const colorMap = {
    royal:   { bg: 'bg-royal-50',   icon: 'text-royal-600',   ring: 'ring-royal-100' },
    violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  ring: 'ring-violet-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   ring: 'ring-amber-100' },
    navy:    { bg: 'bg-navy-50',    icon: 'text-navy-700',    ring: 'ring-navy-100' },
    rose:    { bg: 'bg-rose-50',    icon: 'text-rose-600',    ring: 'ring-rose-100' },
  }
  const c = colorMap[color] || colorMap.royal

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'

  return (
    <div className={`card p-5 flex flex-col gap-3 ${className}`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} ring-4 ${c.ring}`}>
          <Icon size={18} className={c.icon} strokeWidth={1.8} />
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
            <TrendIcon size={13} />
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-navy-900 tracking-tight" style={{ letterSpacing: '-0.025em' }}>{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}
