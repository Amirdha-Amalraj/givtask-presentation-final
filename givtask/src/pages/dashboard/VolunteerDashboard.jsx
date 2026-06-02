import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Search, ClipboardList, Bell, Heart, User,
  CheckCircle2, Clock, Star, ArrowRight, ArrowUpRight, Zap,
  TrendingUp, Activity, ChevronRight, ExternalLink, Sparkles, RefreshCw,
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { volunteerNotifications } from '../../data/index.js'
import { useRole } from '../../context/RoleContext.jsx'
import { tasksApi, applicationsApi } from '../../services/api.js'
import { sortTasksByMatch, matchColor } from '../../utils/skillMatch.js'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',       href: '/dashboard/volunteer' },
  { icon: Search,          label: 'Browse Tasks',    href: '/tasks' },
  { icon: ClipboardList,   label: 'My Applications', href: '/dashboard/volunteer/applications' },
  { icon: Bell,            label: 'Notifications',   href: '/dashboard/volunteer/notifications', badge: 2 },
  { icon: Heart,           label: 'Saved Tasks',     href: '/dashboard/volunteer/saved' },
  { icon: User,            label: 'My Profile',      href: '/profile/volunteer' },
]

const STATUS_STYLE = {
  shortlisted: 'bg-royal-500/20 text-royal-300 border border-royal-500/30',
  accepted:    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  rejected:    'bg-red-500/20 text-red-300 border border-red-500/30',
  pending:     'bg-amber-500/20 text-amber-300 border border-amber-500/30',
}

function KpiCard({ icon: Icon, value, label, trend, color }) {
  const colors = {
    blue:   { bg: 'bg-royal-600/10',   text: 'text-royal-400' },
    violet: { bg: 'bg-violet-600/10',  text: 'text-violet-400' },
    green:  { bg: 'bg-emerald-600/10', text: 'text-emerald-400' },
    amber:  { bg: 'bg-amber-500/10',   text: 'text-amber-400' },
  }
  const c = colors[color] || colors.blue
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/8 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={17} className={c.text} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
            <TrendingUp size={10} />{trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.03em' }}>
        {value ?? <span className="text-white/30">—</span>}
      </p>
      <p className="text-slate-400 text-xs mt-0.5">{label}</p>
    </div>
  )
}

function TaskMiniCard({ task }) {
  const mc = task.matchScore ? matchColor(task.matchScore.score) : null;
  return (
    <Link
      to={`/tasks/${task.id}`}
      className="rounded-2xl bg-[#161B22] border border-white/8 p-4 hover:border-white/20 hover:bg-[#1C2128] transition-all duration-200 group block"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${task.orgLogoColor} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
          {task.orgLogo}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.type === 'Paid' ? 'bg-royal-500/20 text-royal-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
            {task.type}
          </span>
          {mc && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mc.bg} ${mc.text} ${mc.border}`}>
              {task.matchScore.score}% Match
            </span>
          )}
        </div>
      </div>
      <p className="text-sm font-semibold text-white leading-snug mb-1 line-clamp-2 group-hover:text-royal-300 transition-colors">{task.title}</p>
      <p className="text-xs text-slate-500 mb-3">{task.org}</p>
      <div className="flex flex-wrap gap-1">
        {(task.skills || []).slice(0, 2).map(s => {
          const isMatch = task.matchScore?.matchingSkills.includes(s)
          return (
            <span key={s} className={`text-[10px] px-2 py-0.5 rounded-md ${isMatch ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/8 text-slate-400'}`}>
              {s}
            </span>
          )
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between">
        <span className="text-[10px] text-slate-600">{task.applicants ?? 0} applicants</span>
        <span className="text-[10px] text-royal-400 font-semibold flex items-center gap-0.5">Apply <ArrowRight size={10} /></span>
      </div>
    </Link>
  )
}

export default function VolunteerDashboard() {
  const { userName, userEmail, userId, userSkills } = useRole()
  const [tab, setTab] = useState('all')

  // Backend data
  const [applications, setApplications] = useState([])
  const [recommended,  setRecommended]  = useState([])
  const [loadingApps,  setLoadingApps]  = useState(true)
  const [loadingRec,   setLoadingRec]   = useState(true)

  // Derived stats from real data
  const totalApplied   = applications.length
  const shortlisted    = applications.filter(a => a.status === 'shortlisted').length
  const accepted       = applications.filter(a => a.status === 'accepted').length

  // User object for DashboardLayout — built inside component using hook values
  const displayName = userName || 'Volunteer'
  const dashUser = {
    name:        displayName,
    initials:    displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    email:       userEmail || '',
    roleLabel:   'Volunteer',
    avatarColor: 'from-royal-500 to-violet-600',
    profileHref: '/profile/volunteer',
  }

  // Derived impact score from real application data
  const impactScore = Math.min(accepted * 150 + shortlisted * 50 + totalApplied * 20, 1000)

  const loadApplications = useCallback(async () => {
    if (!userId) { setLoadingApps(false); return }
    try {
      const data = await applicationsApi.forUser(userId)
      setApplications(data || [])
    } catch { /* silently show empty state */ }
    finally  { setLoadingApps(false) }
  }, [userId])

  const loadRecommended = useCallback(async () => {
    try {
      const data = await tasksApi.list({ task_type: 'volunteer' })
      const sorted = sortTasksByMatch(data || [], userSkills || [])
      setRecommended(sorted.slice(0, 3))
    } catch { /* silently show empty state */ }
    finally  { setLoadingRec(false) }
  }, [userSkills])

  useEffect(() => { loadApplications() }, [loadApplications])
  useEffect(() => { loadRecommended()  }, [loadRecommended])

  // Filter applications for current tab
  const filteredApps = tab === 'all'
    ? applications
    : applications.filter(a => a.status === tab)

  const quickActions = [
    { icon: Search,       label: 'Browse tasks',   sub: `${recommended.length} available`,       href: '/tasks',                            color: 'bg-royal-600 hover:bg-royal-700' },
    { icon: User,         label: 'View profile',   sub: 'Complete profile',                        href: '/profile/volunteer',                color: 'bg-violet-600 hover:bg-violet-700' },
    { icon: ClipboardList,label: 'Applications',   sub: `${totalApplied} submitted`,               href: '/dashboard/volunteer/applications',  color: 'bg-navy-700 hover:bg-navy-800' },
  ]

  return (
    <DashboardLayout navItems={navItems} user={dashUser} pageTitle="Dashboard">
      <div className="min-h-screen bg-[#0D1117]">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-b from-[#0D1117] to-[#111827] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
                    Active
                  </span>
                  {shortlisted > 0 && (
                    <span className="text-slate-500 text-xs">{shortlisted} application{shortlisted !== 1 ? 's' : ''} shortlisted</span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Welcome back, {displayName.split(' ')[0]} 👋
                </h1>
                <p className="text-slate-400 text-sm mt-1.5 max-w-lg">
                  {totalApplied > 0
                    ? <>You have <span className="text-white font-semibold">{totalApplied} application{totalApplied !== 1 ? 's' : ''}</span> submitted{shortlisted > 0 ? ` · ${shortlisted} shortlisted` : ''}.</>
                    : <>Browse volunteer and paid tasks and apply with your skills.</>
                  }
                </p>
              </div>
              <Link
                to="/tasks"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-royal-600 hover:bg-royal-500 text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-lg shadow-royal-900/40 flex-shrink-0 self-start"
              >
                <Sparkles size={15} /> Browse opportunities
              </Link>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
              <KpiCard icon={CheckCircle2} value={accepted}    label="Tasks accepted"  color="green"  />
              <KpiCard icon={ClipboardList}value={totalApplied}label="Applied"          color="blue"   />
              <KpiCard icon={Star}         value={shortlisted}  label="Shortlisted"     color="amber"  />
              <KpiCard icon={Zap}          value={impactScore} label="Impact score" color="violet" />
            </div>
          </div>
        </div>

        {/* ── MAIN ─────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Quick actions */}
              <div className="grid grid-cols-3 gap-3">
                {quickActions.map(a => (
                  <Link key={a.href} to={a.href} className={`${a.color} rounded-2xl p-4 text-white transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-lg`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center"><a.icon size={15} /></div>
                      <ArrowUpRight size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm font-bold leading-tight">{a.label}</p>
                    <p className="text-xs text-white/60 mt-0.5">{a.sub}</p>
                  </Link>
                ))}
              </div>

              {/* Applications */}
              <div className="rounded-2xl bg-[#161B22] border border-white/8 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                  <div>
                    <h2 className="text-sm font-bold text-white">My Applications</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{totalApplied} total</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex bg-white/5 rounded-lg p-0.5 gap-0.5">
                      {['all', 'shortlisted', 'pending'].map(t => (
                        <button key={t} onClick={() => setTab(t)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-all ${tab === t ? 'bg-white/15 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {loadingApps ? (
                  <div className="flex items-center gap-2 px-5 py-8 text-slate-500 text-xs">
                    <RefreshCw size={13} className="animate-spin" /> Loading applications…
                  </div>
                ) : filteredApps.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <ClipboardList size={24} className="text-white/20 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">
                      {tab === 'all' ? 'No applications yet.' : `No ${tab} applications.`}
                    </p>
                    {tab === 'all' && (
                      <Link to="/tasks" className="mt-2 inline-flex text-xs text-royal-400 hover:underline">Browse tasks →</Link>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {filteredApps.slice(0, 5).map(app => (
                      <div key={app.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/4 transition-colors group">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.task?.orgLogoColor || 'from-royal-500 to-violet-600'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg`}>
                          {app.task?.orgLogo || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{app.task?.title || 'Task'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {app.task?.org || 'NGO'} · {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[app.status] || STATUS_STYLE.pending}`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                          {app.task?.id && (
                            <Link to={`/tasks/${app.task.id}`}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/8 text-slate-400 hover:text-white transition-all">
                              <ExternalLink size={13} />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended tasks */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-white">Recommended for you</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Volunteer opportunities from backend</p>
                  </div>
                  <Link to="/tasks" className="text-xs text-royal-400 hover:text-royal-300 font-medium flex items-center gap-0.5">
                    Browse all <ChevronRight size={12} />
                  </Link>
                </div>

                {loadingRec ? (
                  <div className="flex items-center gap-2 text-slate-500 text-xs py-4">
                    <RefreshCw size={13} className="animate-spin" /> Loading tasks…
                  </div>
                ) : recommended.length === 0 ? (
                  <div className="rounded-2xl bg-[#161B22] border border-white/8 p-6 text-center">
                    <p className="text-xs text-slate-500 mb-2">No volunteer tasks available right now.</p>
                    <Link to="/tasks" className="text-xs text-royal-400 hover:underline">Browse all tasks →</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {recommended.map(task => <TaskMiniCard key={task.id} task={task} />)}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div className="space-y-5">

              {/* Impact score */}
              <div className="rounded-2xl bg-gradient-to-br from-royal-900/50 via-[#161B22] to-violet-900/30 border border-white/10 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Impact Score</h3>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
                      <circle cx="32" cy="32" r="26" fill="none" stroke="url(#ig2)" strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={163.4} strokeDashoffset={163.4 * (1 - (totalApplied > 0 ? Math.min(totalApplied / 10, 1) : 0.05))} />
                      <defs>
                        <linearGradient id="ig2" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#7C3AED"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{totalApplied > 0 ? `${Math.min(totalApplied * 10, 100)}%` : '0%'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white tracking-tight">{impactScore}</p>
                    <p className="text-xs text-slate-500">/ 1000 pts</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Applied',     val: totalApplied,  icon: ClipboardList },
                    { label: 'Shortlisted', val: shortlisted,   icon: Star },
                    { label: 'Accepted',    val: accepted,      icon: CheckCircle2 },
                  ].map(({ label, val, icon: Icon }) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500"><Icon size={11} />{label}</span>
                      <span className="font-bold text-slate-200">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="rounded-2xl bg-[#161B22] border border-white/8 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                  <h3 className="text-xs font-bold text-white">Notifications</h3>
                  <Link to="/dashboard/volunteer/notifications" className="text-xs text-royal-400 hover:text-royal-300">View all</Link>
                </div>
                <div className="divide-y divide-white/5">
                  {volunteerNotifications.slice(0, 4).map(n => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${!n.read ? 'bg-royal-500/5' : 'hover:bg-white/3'} transition-colors`}>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-royal-400' : 'bg-white/20'}`} />
                      <div>
                        <p className="text-xs text-slate-300 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="rounded-2xl bg-[#161B22] border border-white/8 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-white">Top skills</h3>
                  <Link to="/profile/volunteer" className="text-[10px] text-royal-400 hover:underline">Edit</Link>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(userSkills && userSkills.length > 0) ? userSkills.map(s => (
                    <span key={s} className="text-[10px] bg-royal-500/15 text-royal-300 border border-royal-500/20 px-2.5 py-1 rounded-lg font-medium">{s}</span>
                  )) : (
                    <p className="text-[11px] text-slate-500">No skills added. <Link to="/profile/volunteer" className="text-royal-400 hover:underline">Add skills →</Link></p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
