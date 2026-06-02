import React from 'react'
import { Quote } from 'lucide-react'
import Badge from './Badge.jsx'

export default function TestimonialCard({ name, role, org, avatar, avatarColor, quote, type, index = 0 }) {
  const badgeVariant = type === 'NGO' ? 'royal' : type === 'Freelancer' ? 'violet' : 'emerald'

  return (
    <div
      className="card p-6 flex flex-col gap-4 animate-fade-up animate-fill-both"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between">
        <Quote size={24} className="text-royal-200 flex-shrink-0" />
        <Badge variant={badgeVariant}>{type}</Badge>
      </div>

      <p className="text-navy-800 text-sm leading-relaxed flex-1 italic">
        "{quote}"
      </p>

      <div className="flex items-center gap-3 pt-2 border-t border-[#F1F5F9]">
        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
        >
          {avatar}
        </div>
        <div>
          <p className="text-navy-900 text-sm font-semibold leading-tight">{name}</p>
          <p className="text-slate-400 text-xs mt-0.5">{role} · {org}</p>
        </div>
      </div>
    </div>
  )
}
