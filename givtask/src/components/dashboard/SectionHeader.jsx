import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function SectionHeader({ title, subtitle, action, actionHref, icon: Icon }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
          {Icon && <Icon size={15} className="text-royal-500" />}
          {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && actionHref && (
        <Link
          to={actionHref}
          className="flex items-center gap-1 text-xs font-semibold text-royal-600 hover:underline"
        >
          {action} <ArrowRight size={12} />
        </Link>
      )}
    </div>
  )
}
