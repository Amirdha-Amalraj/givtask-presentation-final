import React from 'react'
import { Zap, Award, Star, TrendingUp } from 'lucide-react'

const tiers = [
  { name: 'Starter', min: 0,   max: 200,  color: 'text-slate-500',   bg: 'bg-slate-100' },
  { name: 'Rising',  min: 200, max: 500,  color: 'text-amber-600',   bg: 'bg-amber-50' },
  { name: 'Impact',  min: 500, max: 800,  color: 'text-royal-600',   bg: 'bg-royal-50' },
  { name: 'Champion',min: 800, max: 1000, color: 'text-violet-600',  bg: 'bg-violet-50' },
]

export default function ImpactScoreWidget({ score = 740, badges = [] }) {
  const tier = tiers.find(t => score >= t.min && score < t.max) || tiers[tiers.length - 1]
  const nextTier = tiers[tiers.indexOf(tier) + 1]
  const progress = nextTier
    ? ((score - tier.min) / (tier.max - tier.min)) * 100
    : 100

  // SVG arc for circular progress
  const r = 42
  const circ = 2 * Math.PI * r
  const offset = circ - (progress / 100) * circ

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy-900">Impact Score</h3>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${tier.bg} ${tier.color}`}>
          {tier.name}
        </span>
      </div>

      {/* Circular gauge */}
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#F1F5F9" strokeWidth="8" />
            <circle
              cx="50" cy="50" r={r}
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-navy-900 tracking-tight">{score}</span>
            <span className="text-[9px] text-slate-400 font-medium">/ 1000</span>
          </div>
        </div>

        <div className="flex-1">
          {nextTier && (
            <p className="text-xs text-slate-500 mb-2">
              <span className="font-semibold text-navy-800">{tier.max - score} pts</span> to {nextTier.name}
            </p>
          )}
          <div className="space-y-1.5">
            {[
              { icon: Zap, label: 'Tasks done', value: '5' },
              { icon: Star, label: 'Avg. rating', value: '4.8' },
              { icon: TrendingUp, label: 'This month', value: '+120' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Icon size={11} /> {label}
                </span>
                <span className="font-semibold text-navy-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-navy-700 mb-2 flex items-center gap-1.5">
            <Award size={13} className="text-amber-500" /> Earned badges
          </p>
          <div className="flex flex-wrap gap-1.5">
            {badges.map(b => (
              <span key={b} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
