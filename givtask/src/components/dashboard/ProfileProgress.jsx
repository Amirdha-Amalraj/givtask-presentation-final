import React from 'react'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const defaultItems = [
  { label: 'Add profile photo', done: false },
  { label: 'Complete bio', done: true },
  { label: 'Add your skills', done: true },
  { label: 'Verify email', done: true },
  { label: 'Apply to first task', done: false },
]

export default function ProfileProgress({ percent = 72, items = defaultItems, profileHref = '#' }) {
  const color = percent >= 80 ? 'bg-emerald-500' : percent >= 50 ? 'bg-royal-600' : 'bg-amber-500'
  const textColor = percent >= 80 ? 'text-emerald-600' : percent >= 50 ? 'text-royal-600' : 'text-amber-600'

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-navy-900">Profile completion</h3>
        <span className={`text-sm font-bold ${textColor}`}>{percent}%</span>
      </div>

      {/* Bar */}
      <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Checklist */}
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm">
            {item.done
              ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
              : <Circle size={15} className="text-slate-300 flex-shrink-0" />
            }
            <span className={item.done ? 'text-slate-400 line-through' : 'text-navy-700'}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>

      <Link
        to={profileHref}
        className="flex items-center gap-1.5 text-xs font-semibold text-royal-600 hover:underline mt-1"
      >
        Complete profile <ArrowRight size={12} />
      </Link>
    </div>
  )
}
