import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Search, FileText, Bell, DollarSign, User,
  Briefcase, Star, TrendingUp, CheckCircle2, ArrowRight, ExternalLink,
  ChevronRight, Zap, ArrowUpRight, RefreshCw,
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { freelancerNotifications } from '../../data/index.js'
import { useRole } from '../../context/RoleContext.jsx'
import { tasksApi, applicationsApi } from '../../services/api.js'
import { sortTasksByMatch, matchColor } from '../../utils/skillMatch.js'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',       href: '/dashboard/freelancer' },
  { icon: Search,          label: 'Browse Projects', href: '/tasks' },
  { icon: FileText,        label: 'My Contracts',    href: '/dashboard/freelancer/contracts' },
  { icon: DollarSign,      label: 'Earnings',        href: '/dashboard/freelancer/earnings' },
  { icon: Bell,            label: 'Notifications',   href: '/dashboard/freelancer/notifications', badge: 2 },
  { icon: User,            label: 'My Profile',      href: '/profile/freelancer' },
]

const STATUS_STYLE = {
  shortlisted: 'bg-royal-500/20 text-royal-300 border-royal-500/30',
  accepted:    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  rejected:    'bg-red-500/20 text-red-300 border-red-500/30',
  pending:     'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

function KpiCard({ icon: Icon, value, label, trend, sub, color }) {
  const colors = {
    blue:   { bg: 'bg-royal-600/10',   text: 'text-royal-400' },
    violet: { bg: 'bg-violet-600/10',  text: 'text-violet-400' },
    green:  { bg: 'bg-emerald-600/10', text: 'text-emerald-400' },
    amber:  { bg: 'bg-amber-500/10',   text: 'text-amber-400' },
  }
  const c = colors[color] || colors.blue
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/8 transition-all duration-200">
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
      {sub && <p className="text-xs text-emerald-400 font-semibold mt-1">{sub}</p>}
    </div>
  )
}

export default function FreelancerDashboard() {
  const { userName, userEmail, userId, userSkills } = useRole()

  const [applications, setApplications] = useState([])
  const [paidTasks,    setPaidTasks]    = useState([])
  const [loadingApps,  setLoadingApps]  = useState(true)
  const [loadingTasks, setLoadingTasks] = useState(true)

  const totalApplied  = applications.length
  const shortlisted   = applications.filter(a => a.status === 'shortlisted').length
  const accepted      = applications.filter(a => a.status === 'accepted').length

  // Calculate earnings (mock project values)
  // For MVP: assume each accepted project is ₹25,000 for demonstration. 
  // In a real app we'd sum task.budget if it was added to schema.
  const totalEarnings = accepted * 25000
  const formattedEarnings = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalEarnings)

  // DashboardLayout user object — built inside component
  const displayName = userName || 'Freelancer'
  const dashUser = {
    name:        displayName,
    initials:    displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    email:       userEmail || '',
    roleLabel:   'Freelancer',
    avatarColor: 'from-violet-500 to-royal-600',
    profileHref: '/profile/freelancer',
  }

  const loadApplications = useCallback(async () => {
    if (!userId) { setLoadingApps(false); return }
    try {
      const data = await applicationsApi.forUser(userId)
      setApplications(data || [])
    } catch { /* empty state */ }
    finally  { setLoadingApps(false) }
  }, [userId])

  const loadPaidTasks = useCallback(async () => {
    try {
      const data = await tasksApi.list({ task_type: 'paid' })
      const sorted = sortTasksByMatch(data || [], userSkills || [])
      setPaidTasks(sorted.slice(0, 3))
    } catch { /* empty state */ }
    finally  { setLoadingTasks(false) }
  }, [userSkills])

  useEffect(() => { loadApplications() }, [loadApplications])
  useEffect(() => { loadPaidTasks()    }, [loadPaidTasks])

  const quickActions = [
    { icon: Search,  label: 'Find projects',    sub: `${paidTasks.length} paid tasks`,   href: '/tasks',                         color: 'bg-violet-600 hover:bg-violet-700' },
    { icon: FileText,label: 'Applications',     sub: `${totalApplied} submitted`,        href: '/dashboard/freelancer/contracts', color: 'bg-royal-600 hover:bg-royal-700' },
    { icon: User,    label: 'My portfolio',     sub: 'View public profile',               href: '/profile/freelancer',             color: 'bg-navy-700 hover:bg-navy-800' },
  ]

  return (
    <DashboardLayout navItems={navItems} user={dashUser} pageTitle="Dashboard">
      <div className="min-h-screen bg-[#0D1117]">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-b from-[#0D1117] to-[#111827] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-7">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-violet-400 bg-violet-400/10 border border-violet-400/20 px-2.5 py-1 rounded-full">Freelancer</span>
                  {accepted > 0 && <span className="text-slate-500 text-xs">{accepted} active contract{accepted !== 1 ? 's' : ''}</span>}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {displayName.split(' ')[0]}'s workspace
                </h1>
                <p className="text-slate-400 text-sm mt-1.5">
                  {totalApplied > 0
                    ? <>{totalApplied} application{totalApplied !== 1 ? 's' : ''} submitted · {shortlisted} shortlisted</>
                    : <>Find paid NGO projects that match your skills.</>
                  }
                </p>
              </div>
              <Link
                to="/tasks"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-lg shadow-violet-900/40 flex-shrink-0 self-start"
              >
                <Search size={15} /> Find new projects
              </Link>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard icon={Briefcase}    value={totalApplied} label="Applications"   color="blue"   />
              <KpiCard icon={Star}         value={shortlisted}  label="Shortlisted"    color="violet" />
              <KpiCard icon={DollarSign}   value={formattedEarnings} label="Total earnings" color="green" />
              <KpiCard icon={CheckCircle2} value={accepted}     label="Active contracts" color="amber" />
            </div>
          </div>
        </div>

        {/* ── MAIN ─────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left */}
            <div className="lg:col-span-2 space-y-6">

              {/* Quick actions */}
              <div className="grid grid-cols-3 gap-3">
                {quickActions.map(a => (
                  <Link key={a.href} to={a.href} className={`${a.color} rounded-2xl p-4 text-white transition-all duration-200 group hover:-translate-y-0.5`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center"><a.icon size={15} /></div>
                      <ArrowUpRight size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm font-bold">{a.label}</p>
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
                  <Link to="/dashboard/freelancer/contracts" className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-0.5">
                    View all <ChevronRight size={12} />
                  </Link>
                </div>

                {loadingApps ? (
                  <div className="flex items-center gap-2 px-5 py-8 text-slate-500 text-xs">
                    <RefreshCw size={13} className="animate-spin" /> Loading applications…
                  </div>
                ) : applications.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <Briefcase size={24} className="text-white/20 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 mb-2">No applications yet.</p>
                    <Link to="/tasks" className="text-xs text-violet-400 hover:underline">Browse paid projects →</Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {applications.slice(0, 5).map(app => (
                      <div key={app.id} className="flex items-center gap-3 px-5 py-4 hover:bg-white/3 transition-colors group">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.task?.orgLogoColor || 'from-violet-500 to-royal-600'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg`}>
                          {app.task?.orgLogo || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{app.task?.title || 'Task'}</p>
                          <p className="text-xs text-slate-500">{app.task?.org} · {app.task?.type}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[app.status] || STATUS_STYLE.pending}`}>
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

              {/* Paid opportunities */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-white">Recommended Paid Projects</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Matched to your skills</p>
                  </div>
                  <Link to="/tasks?task_type=paid" className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-0.5">
                    Browse all <ChevronRight size={12} />
                  </Link>
                </div>

                {loadingTasks ? (
                  <div className="flex items-center gap-2 text-slate-500 text-xs py-4">
                    <RefreshCw size={13} className="animate-spin" /> Loading…
                  </div>
                ) : paidTasks.length === 0 ? (
                  <div className="rounded-2xl bg-[#161B22] border border-white/8 p-6 text-center">
                    <p className="text-xs text-slate-500 mb-2">No paid tasks available right now.</p>
                    <Link to="/tasks" className="text-xs text-violet-400 hover:underline">Browse all tasks →</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {paidTasks.map(task => {
                      const mc = task.matchScore ? matchColor(task.matchScore.score) : null;
                      return (
                        <Link key={task.id} to={`/tasks/${task.id}`}
                          className="rounded-2xl bg-[#161B22] border border-white/8 p-4 hover:border-violet-500/30 hover:bg-[#1C2128] transition-all duration-200 group block">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${task.orgLogoColor} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                              {task.orgLogo}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-royal-500/20 text-royal-300">Paid</span>
                              {mc && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mc.bg} ${mc.text} ${mc.border}`}>
                                  {task.matchScore.score}% Match
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-white leading-snug mb-1 line-clamp-2 group-hover:text-violet-300 transition-colors">{task.title}</p>
                          <p className="text-xs text-slate-500 mb-2">{task.org}</p>
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
                            <span className="text-[10px] text-violet-400 font-semibold flex items-center gap-0.5">Apply <ArrowRight size={10} /></span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="space-y-5">

              {/* Profile card */}
              <div className="rounded-2xl bg-gradient-to-br from-violet-900/40 via-[#161B22] to-royal-900/20 border border-white/10 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-royal-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{displayName}</p>
                    <p className="text-xs text-slate-500">Freelancer</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {userSkills && userSkills.length > 0 ? (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {userSkills.slice(0, 4).map(s => (
                          <span key={s} className="text-[10px] bg-violet-500/15 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-md">{s}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No skills added yet.</p>
                  )}
                </div>
                <Link to="/profile/freelancer"
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-white/8 hover:bg-white/15 text-sm font-semibold text-white transition-colors">
                  View public profile <ExternalLink size={13} />
                </Link>
              </div>

              {/* Portfolio */}
              <div className="rounded-2xl bg-[#161B22] border border-white/8 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                  <h3 className="text-xs font-bold text-white">Portfolio</h3>
                  <Link to="/profile/freelancer" className="text-xs text-violet-400 hover:text-violet-300">Edit</Link>
                </div>
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-slate-500 mb-2">Add portfolio items on your profile.</p>
                  <Link to="/profile/freelancer" className="text-xs text-violet-400 hover:underline">View profile →</Link>
                </div>
              </div>

              {/* Notifications */}
              <div className="rounded-2xl bg-[#161B22] border border-white/8 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                  <h3 className="text-xs font-bold text-white">Notifications</h3>
                  <Link to="/dashboard/freelancer/notifications" className="text-xs text-violet-400 hover:text-violet-300">View all</Link>
                </div>
                <div className="divide-y divide-white/5">
                  {freelancerNotifications.slice(0, 3).map(n => (
                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${!n.read ? 'bg-violet-500/5' : 'hover:bg-white/3'} transition-colors`}>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-violet-400' : 'bg-white/20'}`} />
                      <div>
                        <p className="text-xs text-slate-300 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
