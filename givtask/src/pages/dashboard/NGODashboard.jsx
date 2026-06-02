import React, { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle, Users, Bell, Briefcase, Building2,
  ChevronRight, Clock, Eye, ShieldCheck, ArrowRight, ArrowUpRight,
  TrendingUp, CheckCircle2, ExternalLink, RefreshCw, AlertCircle, Edit, Trash2
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { ngoNotifications } from '../../data/index.js'
import { useRole } from '../../context/RoleContext.jsx'
import { tasksApi, applicationsApi } from '../../services/api.js'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview',      href: '/dashboard/ngo' },
  { icon: PlusCircle,      label: 'Post a Task',   href: '/dashboard/ngo/post-task' },
  { icon: Briefcase,       label: 'Active Tasks',  href: '/dashboard/ngo/tasks' },
  { icon: Users,           label: 'Applicants',    href: '/dashboard/ngo/applicants' },
  { icon: Bell,            label: 'Notifications', href: '/dashboard/ngo/notifications', badge: 2 },
  { icon: Building2,       label: 'NGO Profile',   href: '/profile/ngo' },
]

const STATUS_MAP = {
  pending:     { label: 'New',         cls: 'bg-royal-500/20 text-royal-300 border-royal-500/30' },
  shortlisted: { label: 'Shortlisted', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  accepted:    { label: 'Accepted',    cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  rejected:    { label: 'Rejected',    cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
}

function KpiCard({ icon: Icon, value, label, trend, color }) {
  const colors = {
    blue:   { bg: 'bg-royal-600/10',   icon: 'text-royal-400' },
    violet: { bg: 'bg-violet-600/10',  icon: 'text-violet-400' },
    green:  { bg: 'bg-emerald-600/10', icon: 'text-emerald-400' },
    amber:  { bg: 'bg-amber-500/10',   icon: 'text-amber-400' },
  }
  const c = colors[color] || colors.blue
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/8 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={17} className={c.icon} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
            <TrendingUp size={10} />{trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.03em' }}>
        {value ?? <span className="text-white/30 text-lg">—</span>}
      </p>
      <p className="text-slate-400 text-xs mt-0.5">{label}</p>
    </div>
  )
}

export default function NGODashboard() {
  const { userName, userEmail, userId } = useRole()
  const location = useLocation()
  const currentPath = location.pathname

  // Backend data
  const [tasks,          setTasks]         = useState([])
  const [allApplicants,  setAllApplicants] = useState([])  // flat list across all tasks
  const [loadingTasks,   setLoadingTasks]  = useState(true)
  const [loadingApps,    setLoadingApps]   = useState(true)

  // Derived stats from real backend data
  const activeTasks        = tasks.length
  const totalApplicants    = allApplicants.length
  const pendingApplicants  = allApplicants.filter(a => a.status === 'pending').length
  const shortlistedCount   = allApplicants.filter(a => a.status === 'shortlisted').length

  // DashboardLayout user — built inside component
  const displayName = userName || 'NGO'
  const dashUser = {
    name:        displayName,
    initials:    displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    email:       userEmail || '',
    roleLabel:   'NGO Admin',
    avatarColor: 'from-royal-500 to-royal-700',
    profileHref: '/profile/ngo',
  }

  // Fetch NGO user profile for location/city data
  const [ngoProfile, setNgoProfile] = useState(null)
  useEffect(() => {
    if (!userId) return
    import('../../services/api.js').then(({ authApi }) => {
      authApi.getUser(userId).then(d => setNgoProfile(d)).catch(() => {})
    })
  }, [userId])
  const ngoLocation = ngoProfile ? [ngoProfile.city, ngoProfile.state].filter(Boolean).join(', ') || 'Not set' : '—'

  // Load NGO's tasks
  const loadTasks = useCallback(async () => {
    if (!userId) { setLoadingTasks(false); return }
    try {
      const data = await tasksApi.list({ ngo_id: userId })
      setTasks(data || [])
    } catch { /* empty state */ }
    finally  { setLoadingTasks(false) }
  }, [userId])

  // Load applicants across all tasks
  const loadApplicants = useCallback(async (taskList) => {
    if (!taskList || taskList.length === 0) { setLoadingApps(false); return }
    try {
      const results = await Promise.all(
        taskList.slice(0, 5).map(t => applicationsApi.forTask(t.id).catch(() => []))
      )
      // Flatten and attach task info
      const flat = results.flatMap((apps, i) =>
        (apps || []).map(a => ({ ...a, taskTitle: taskList[i]?.title || 'Task' }))
      )
      // Sort by applied_at descending
      flat.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at))
      setAllApplicants(flat)
    } catch { /* empty state */ }
    finally  { setLoadingApps(false) }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    if (!loadingTasks) loadApplicants(tasks)
  }, [loadingTasks, tasks, loadApplicants])

  // Recent applicants = first 4
  const recentApplicants = allApplicants.slice(0, 4)

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await tasksApi.delete(taskId, userId)
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (err) {
      alert(err.message || 'Failed to delete task')
    }
  }

  const handleUpdateAppStatus = async (appId, status) => {
    try {
      await applicationsApi.updateStatus(appId, status, userId)
      setAllApplicants(apps => apps.map(a => a.id === appId ? { ...a, status } : a))
    } catch (err) {
      alert(err.message || 'Failed to update status')
    }
  }

  // ── Views ───────────────────────────────────────────────────────────────

  const renderTasksView = () => (
    <div className="rounded-2xl bg-[#161B22] border border-white/8 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div>
          <h2 className="text-sm font-bold text-white">All Active Tasks</h2>
          <p className="text-xs text-slate-500 mt-0.5">{activeTasks} posted</p>
        </div>
        <Link to="/dashboard/ngo/post-task" className="text-xs text-royal-400 hover:text-royal-300 font-medium flex items-center gap-0.5">
          <PlusCircle size={11} /> Post new
        </Link>
      </div>

      {loadingTasks ? (
        <div className="flex items-center gap-2 px-5 py-8 text-slate-500 text-xs">
          <RefreshCw size={13} className="animate-spin" /> Loading tasks…
        </div>
      ) : tasks.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Briefcase size={24} className="text-white/20 mx-auto mb-2" />
          <p className="text-xs text-slate-500 mb-3">No tasks posted yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${task.orgLogoColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md`}>
                {task.orgLogo}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500">{task.applicants ?? 0} applicants</span>
                  <span className="text-white/10">·</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={9} />{task.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${task.type === 'Paid' ? 'bg-royal-500/20 text-royal-300 border-royal-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                  {task.type}
                </span>
                <Link to={`/dashboard/ngo/edit-task/${task.id}`} className="p-1.5 rounded-lg bg-white/8 text-slate-400 hover:text-white transition-all" title="Edit">
                  <Edit size={13} />
                </Link>
                <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 rounded-lg bg-white/8 text-red-400 hover:text-red-300 transition-all" title="Delete">
                  <Trash2 size={13} />
                </button>
                <Link to={`/tasks/${task.id}`} className="p-1.5 rounded-lg bg-white/8 text-slate-400 hover:text-white transition-all" title="View Public Page">
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderApplicantsView = () => (
    <div className="rounded-2xl bg-[#161B22] border border-white/8 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div>
          <h2 className="text-sm font-bold text-white">All Applicants</h2>
          <p className="text-xs text-slate-500 mt-0.5">{totalApplicants} total across all tasks</p>
        </div>
      </div>

      {loadingApps ? (
        <div className="flex items-center gap-2 px-5 py-8 text-slate-500 text-xs">
          <RefreshCw size={13} className="animate-spin" /> Loading applicants…
        </div>
      ) : allApplicants.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Users size={24} className="text-white/20 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No applicants yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {allApplicants.map(a => {
            const s = STATUS_MAP[a.status] || STATUS_MAP.pending
            const initials = (a.applicant?.full_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div key={a.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-royal-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{a.applicant?.full_name || 'Applicant'}</p>
                    <p className="text-xs text-slate-500 truncate">{a.applicant?.role} · {a.taskTitle}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {a.status !== 'accepted' && (
                    <button onClick={() => handleUpdateAppStatus(a.id, 'accepted')} className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-md text-xs font-semibold transition-colors">Accept</button>
                  )}
                  {a.status === 'pending' && (
                    <button onClick={() => handleUpdateAppStatus(a.id, 'shortlisted')} className="px-2.5 py-1 bg-royal-500/20 text-royal-400 hover:bg-royal-500/30 rounded-md text-xs font-semibold transition-colors">Shortlist</button>
                  )}
                  {a.status !== 'rejected' && (
                    <button onClick={() => handleUpdateAppStatus(a.id, 'rejected')} className="px-2.5 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-md text-xs font-semibold transition-colors">Reject</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: PlusCircle,  label: 'Post a task',     sub: 'Volunteer or paid',                   href: '/dashboard/ngo/post-task',  color: 'bg-royal-600 hover:bg-royal-700' },
                  { icon: Users,       label: 'View applicants', sub: `${totalApplicants} total`,            href: '/dashboard/ngo/applicants',  color: 'bg-violet-600 hover:bg-violet-700' },
                  { icon: Briefcase,   label: 'My tasks',        sub: `${activeTasks} active`,               href: '/dashboard/ngo/tasks',       color: 'bg-navy-700 hover:bg-navy-800' },
                ].map(a => (
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

              {/* Tasks panel */}
              <div className="rounded-2xl bg-[#161B22] border border-white/8 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                  <div>
                    <h2 className="text-sm font-bold text-white">Your Tasks</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{activeTasks} posted</p>
                  </div>
                  <Link to="/dashboard/ngo/post-task" className="text-xs text-royal-400 hover:text-royal-300 font-medium flex items-center gap-0.5">
                    <PlusCircle size={11} /> Post new
                  </Link>
                </div>

                {loadingTasks ? (
                  <div className="flex items-center gap-2 px-5 py-8 text-slate-500 text-xs">
                    <RefreshCw size={13} className="animate-spin" /> Loading tasks…
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <Briefcase size={24} className="text-white/20 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 mb-3">No tasks posted yet.</p>
                    <Link to="/dashboard/ngo/post-task"
                      className="inline-flex items-center gap-1.5 text-xs bg-royal-600 hover:bg-royal-500 text-white font-semibold px-4 py-2 rounded-xl transition-colors">
                      <PlusCircle size={12} /> Post your first task
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-white/5">
                      {tasks.slice(0, 5).map(task => (
                        <div key={task.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors group">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${task.orgLogoColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md`}>
                            {task.orgLogo}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-500">{task.applicants ?? 0} applicants</span>
                              <span className="text-white/10">·</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1"><Clock size={9} />{task.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${task.type === 'Paid' ? 'bg-royal-500/20 text-royal-300 border-royal-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                              {task.type}
                            </span>
                            <Link to={`/tasks/${task.id}`}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/8 text-slate-400 hover:text-white transition-all">
                              <ChevronRight size={13} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-3 border-t border-white/5">
                      <Link to="/dashboard/ngo/tasks" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 font-medium">
                        View all tasks →
                      </Link>
                    </div>
                  </>
                )}
              </div>

              {/* Recent applicants */}
              <div className="rounded-2xl bg-[#161B22] border border-white/8 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                  <div>
                    <h2 className="text-sm font-bold text-white">Recent Applicants</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{totalApplicants} total across all tasks</p>
                  </div>
                  <Link to="/dashboard/ngo/applicants" className="text-xs text-royal-400 hover:text-royal-300 font-medium flex items-center gap-0.5">
                    View all <ChevronRight size={12} />
                  </Link>
                </div>

                {loadingApps ? (
                  <div className="flex items-center gap-2 px-5 py-8 text-slate-500 text-xs">
                    <RefreshCw size={13} className="animate-spin" /> Loading applicants…
                  </div>
                ) : recentApplicants.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <Users size={24} className="text-white/20 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No applicants yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {recentApplicants.map(a => {
                      const s = STATUS_MAP[a.status] || STATUS_MAP.pending
                      const initials = (a.applicant?.full_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                      return (
                        <div key={a.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-colors group">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{a.applicant?.full_name || 'Applicant'}</p>
                            <p className="text-xs text-slate-500 truncate">{a.applicant?.role} · {a.taskTitle}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
                            <span className="text-[10px] text-slate-600 hidden sm:block">
                              {new Date(a.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )

  return (
    <DashboardLayout navItems={navItems} user={dashUser} pageTitle="NGO Dashboard">
      <div className="min-h-screen bg-[#0D1117]">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-b from-[#0D1117] to-[#111827] border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">

            {/* Org row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-7">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-royal-500 to-royal-700 flex items-center justify-center text-white font-bold text-lg shadow-xl flex-shrink-0">
                  {displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white">{displayName}</h1>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                      <ShieldCheck size={9} /> NGO
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5">Non-Governmental Organisation</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-center">
                <Link
                  to="/profile/ngo"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/8 hover:bg-white/15 border border-white/10 text-white font-semibold rounded-xl transition-all text-sm"
                >
                  <ExternalLink size={14} /> View profile
                </Link>
                <Link
                  to="/dashboard/ngo/post-task"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-royal-600 hover:bg-royal-500 text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-royal-900/40"
                >
                  <PlusCircle size={15} /> Post new task
                </Link>
              </div>
            </div>

            {/* KPIs — real backend data */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard icon={Briefcase}    value={loadingTasks ? '…' : activeTasks}     label="Active tasks"       color="blue" />
              <KpiCard icon={Users}        value={loadingApps  ? '…' : totalApplicants} label="Total applicants"   color="violet" />
              <KpiCard icon={CheckCircle2} value={loadingApps  ? '…' : shortlistedCount}label="Shortlisted"        color="green" />
              <KpiCard icon={Building2}    value={loadingApps  ? '…' : pendingApplicants}label="Pending review"    color="amber" />
            </div>
          </div>
        </div>

        {/* ── MAIN ─────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {currentPath === '/dashboard/ngo/tasks'
                ? renderTasksView()
                : currentPath === '/dashboard/ngo/applicants'
                ? renderApplicantsView()
                : renderOverview()}
            </div>

            {/* Right 1/3 */}
            <div className="space-y-5">

              {/* Org profile summary */}
              <div className="rounded-2xl bg-gradient-to-br from-royal-900/40 via-[#161B22] to-violet-900/20 border border-white/10 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Organisation</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                    <ShieldCheck size={9} /> NGO
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {[
                    { label: 'Location',  value: ngoLocation },
                    { label: 'Email',     value: userEmail || 'Not set' },
                    { label: 'Tasks',     value: activeTasks > 0 ? `${activeTasks} active` : 'None yet' },
                    { label: 'Applicants',value: totalApplicants > 0 ? totalApplicants : 'None yet' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-slate-500">{label}</span>
                      <span className="text-slate-200 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                <Link to="/profile/ngo"
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-white/8 hover:bg-white/15 text-sm font-semibold text-white transition-colors">
                  View public profile <ExternalLink size={13} />
                </Link>
              </div>

              {/* Notifications */}
              <div className="rounded-2xl bg-[#161B22] border border-white/8 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                  <h3 className="text-xs font-bold text-white">Notifications</h3>
                  <Link to="/dashboard/ngo/notifications" className="text-xs text-royal-400 hover:text-royal-300">View all</Link>
                </div>
                <div className="divide-y divide-white/5">
                  {ngoNotifications.slice(0, 4).map(n => (
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

              {/* Post task CTA */}
              <div className="rounded-2xl border border-white/8 bg-white/4 p-5">
                <p className="text-sm font-bold text-white mb-1">Ready to find talent?</p>
                <p className="text-xs text-slate-400 mb-4">Post a volunteer or paid task and connect with skilled contributors in minutes.</p>
                <Link to="/dashboard/ngo/post-task"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-royal-600 hover:bg-royal-500 text-white font-semibold text-sm transition-colors">
                  <PlusCircle size={14} /> Post a task
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
