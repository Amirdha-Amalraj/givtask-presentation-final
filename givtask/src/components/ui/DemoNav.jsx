import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Zap, ChevronUp, ChevronDown, Users, Briefcase, Building2, Shield, Search, FileText, LogIn } from 'lucide-react'
import { useRole } from '../../context/RoleContext.jsx'

const demoRoutes = [
  {
    group: 'Dashboards',
    items: [
      { label: 'Volunteer',  href: '/dashboard/volunteer', role: 'volunteer',  icon: Users,     color: 'text-royal-400',   name: 'Arjun Mehta' },
      { label: 'Freelancer', href: '/dashboard/freelancer',role: 'freelancer', icon: Briefcase, color: 'text-violet-400',  name: 'Kabir Singh' },
      { label: 'NGO',        href: '/dashboard/ngo',       role: 'ngo',        icon: Building2, color: 'text-sky-400',     name: 'EduReach Foundation' },
      { label: 'Admin',      href: '/admin',               role: 'admin',      icon: Shield,    color: 'text-amber-400',   name: 'Admin User' },
    ],
  },
  {
    group: 'Pages',
    items: [
      { label: 'Browse tasks',      href: '/tasks',               role: null, icon: Search,   color: 'text-slate-400' },
      { label: 'Task detail',       href: '/tasks/1',             role: null, icon: FileText,  color: 'text-slate-400' },
      { label: 'NGO profile',       href: '/profile/ngo',         role: null, icon: Building2, color: 'text-slate-400' },
      { label: 'Volunteer profile', href: '/profile/volunteer',   role: null, icon: Users,     color: 'text-slate-400' },
      { label: 'Post a task',       href: '/dashboard/ngo/post-task', role: 'ngo', icon: Briefcase, color: 'text-slate-400', name: 'EduReach Foundation' },
      { label: 'Login',             href: '/login',               role: null, icon: LogIn,     color: 'text-slate-400' },
      { label: 'Register',          href: '/register',            role: null, icon: LogIn,     color: 'text-slate-400' },
    ],
  },
]

export default function DemoNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate  = useNavigate()
  const { role: currentRole, login } = useRole()

  // Hide on landing page only
  if (location.pathname === '/') return null

  const handleNav = (item) => {
    if (item.role) {
      // Auto-login the correct role before navigating
      login(item.role, item.name || item.label, `${item.role}@demo.com`)
    }
    setOpen(false)
    navigate(item.href)
  }

  return (
    <div className="fixed bottom-5 right-5 z-[999] flex flex-col items-end gap-2">
      {open && (
        <div className="w-58 bg-[#0D1117] border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-fade-in" style={{ width: '232px' }}>
          <div className="px-3 py-2.5 border-b border-white/8 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Demo Navigator</p>
              <p className="text-[10px] text-slate-600">
                {currentRole
                  ? <>Logged in as <span className="text-emerald-400 font-semibold">{currentRole}</span></>
                  : 'Not logged in'
                }
              </p>
            </div>
            <Zap size={12} className="text-royal-400" />
          </div>

          {demoRoutes.map(group => (
            <div key={group.group} className="p-1.5">
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-2 py-1">{group.group}</p>
              {group.items.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                return (
                  <button
                    key={item.href}
                    onClick={() => handleNav(item)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors text-left ${
                      isActive
                        ? 'bg-white/12 text-white'
                        : 'text-slate-400 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <Icon size={12} className={isActive ? 'text-white' : item.color} />
                    <span className="flex-1">{item.label}</span>
                    {item.role && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white/70' : 'bg-white/8 text-slate-600'
                      }`}>
                        {item.role}
                      </span>
                    )}
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-royal-400 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3.5 py-2.5 bg-[#0D1117] hover:bg-[#161B22] border border-white/15 hover:border-white/25 text-white rounded-xl shadow-xl transition-all duration-200 text-xs font-semibold"
      >
        <Zap size={13} className="text-royal-400" />
        Demo
        {currentRole && (
          <span className="text-[10px] text-slate-500 font-normal">· {currentRole}</span>
        )}
        {open
          ? <ChevronDown size={12} className="text-slate-500" />
          : <ChevronUp   size={12} className="text-slate-500" />
        }
      </button>
    </div>
  )
}
