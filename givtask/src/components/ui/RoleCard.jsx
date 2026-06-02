import React from 'react'
import { ArrowRight, Check } from 'lucide-react'

export default function RoleCard({ icon: Icon, title, description, perks = [], color = 'royal', selected = false, onClick }) {
  const isRoyal = color === 'royal'
  const isViolet = color === 'violet'
  const isNavy = color === 'navy'

  const gradients = {
    royal: 'from-royal-500 to-royal-700',
    violet: 'from-violet-500 to-violet-700',
    navy: 'from-navy-700 to-navy-900',
  }

  const rings = {
    royal: 'ring-royal-500',
    violet: 'ring-violet-500',
    navy: 'ring-navy-700',
  }

  const iconColors = {
    royal: 'text-royal-600 bg-royal-50',
    violet: 'text-violet-600 bg-violet-50',
    navy: 'text-navy-700 bg-navy-50',
  }

  const checkColors = {
    royal: 'text-royal-600',
    violet: 'text-violet-600',
    navy: 'text-navy-700',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left card p-6 md:p-8 cursor-pointer transition-all duration-300 group
        hover:shadow-card-hover hover:-translate-y-1 focus:outline-none
        ${selected ? `ring-2 ${rings[color]} shadow-card-hover -translate-y-1` : ''}
      `}
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${iconColors[color]}`}>
        <Icon size={24} strokeWidth={1.8} />
      </div>

      {/* Title & description */}
      <h3 className="text-navy-900 font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-5">{description}</p>

      {/* Perks */}
      <ul className="space-y-2 mb-6">
        {perks.map((perk, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
            <Check size={14} className={`mt-0.5 flex-shrink-0 ${checkColors[color]}`} />
            {perk}
          </li>
        ))}
      </ul>

      {/* CTA row */}
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${checkColors[color]} group-hover:underline`}>
          Get started
        </span>
        <div
          className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradients[color]} flex items-center justify-center
            transform group-hover:translate-x-1 transition-transform duration-200`}
        >
          <ArrowRight size={14} className="text-white" />
        </div>
      </div>
    </button>
  )
}
