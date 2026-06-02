import React from 'react'
import {
  Target, Users, Briefcase, Star, Shield, Bell,
  Zap, Globe, Heart, Award, TrendingUp, CheckCircle,
} from 'lucide-react'

const iconMap = { Target, Users, Briefcase, Star, Shield, Bell, Zap, Globe, Heart, Award, TrendingUp, CheckCircle }

export default function FeatureCard({ icon, title, description, color = 'royal', index = 0 }) {
  const Icon = iconMap[icon] || Zap
  const isRoyal = color === 'royal'

  const iconBg = isRoyal
    ? 'bg-royal-50 text-royal-600 group-hover:bg-royal-600 group-hover:text-white'
    : 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white'

  return (
    <div
      className="card card-hover p-6 group cursor-default animate-fade-up animate-fill-both"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${iconBg}`}>
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <h3 className="text-navy-900 font-semibold text-base mb-2 leading-snug">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
