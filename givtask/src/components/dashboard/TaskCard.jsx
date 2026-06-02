import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, Users, ArrowRight, Bookmark } from 'lucide-react'
import Badge from '../ui/Badge.jsx'

export default function TaskCard({ task, compact = false, showApply = true }) {
  const typeVariant = task.type === 'Paid' ? 'royal' : 'emerald'
  const locationVariant = task.location === 'Remote' ? 'violet' : task.location === 'Hybrid' ? 'amber' : 'navy'

  return (
    <div className="card card-hover p-5 flex flex-col gap-4 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Org logo */}
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${task.orgLogoColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
            {task.orgLogo}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              to={`/tasks/${task.id}`}
              className="text-sm font-bold text-navy-900 hover:text-royal-600 transition-colors leading-snug line-clamp-2 block"
            >
              {task.title}
            </Link>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{task.org}</p>
          </div>
        </div>
        <button className="p-1.5 rounded-lg text-slate-300 hover:text-royal-500 hover:bg-royal-50 transition-all flex-shrink-0">
          <Bookmark size={15} />
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant={typeVariant}>{task.type}</Badge>
        <Badge variant={locationVariant}>{task.location}</Badge>
        {task.featured && <Badge variant="amber">⭐ Featured</Badge>}
      </div>

      {!compact && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{task.description}</p>
      )}

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {task.skills.slice(0, 3).map(skill => (
          <span key={skill} className="text-xs bg-[#F1F5F9] text-navy-600 px-2 py-0.5 rounded-md font-medium">
            {skill}
          </span>
        ))}
        {task.skills.length > 3 && (
          <span className="text-xs text-slate-400 px-2 py-0.5">+{task.skills.length - 3}</span>
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between pt-1 border-t border-[#F8FAFC]">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Users size={12} />
            {task.applicants} applied
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {task.duration}
          </span>
          {task.budget && (
            <span className="text-emerald-600 font-semibold">{task.budget}</span>
          )}
        </div>

        {showApply && (
          <Link
            to={`/tasks/${task.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-royal-600 hover:text-royal-800 transition-colors group-hover:gap-1.5"
          >
            View
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
