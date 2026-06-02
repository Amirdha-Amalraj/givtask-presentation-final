import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Users, Briefcase, ShieldCheck, BarChart2, Bell,
  Settings, TrendingUp, TrendingDown, CheckCircle2, XCircle, Eye,
  Search, DollarSign, UserCheck, FileText, Activity, ArrowUpRight,
  ChevronRight, AlertTriangle,
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { adminStats, mockTasks, adminNotifications } from '../../data/index.js'
import { tasksApi } from '../../services/api.js'
import { useRole } from '../../context/RoleContext.jsx'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview',      href: '/admin' },
  { icon: Users,           label: 'Users',         href: '/admin/users' },
  { icon: Briefcase,       label: 'Tasks',         href: '/admin/tasks' },
  { icon: ShieldCheck,     label: 'Verifications', href: '/admin/verifications', badge: adminStats.pendingVerifications },
  { icon: DollarSign,      label: 'Payouts',       href: '/admin/payouts' },
  { icon: BarChart2,       label: 'Analytics',     href: '/admin/analytics' },
  { icon: Bell,            label: 'Notifications', href: '/admin/notifications', badge: 4 },
  { icon: Settings,        label: 'Settings',      href: '/admin/settings' },
]

const activityIcons = {
  ngo_register:   { icon: Users,         color: 'bg-royal-500/20 text-royal-400' },
  task_posted:    { icon: Briefcase,     color: 'bg-violet-500/20 text-violet-400' },
  application:    { icon: FileText,      color: 'bg-emerald-500/20 text-emerald-400' },
  verification:   { icon: ShieldCheck,   color: 'bg-amber-500/20 text-amber-400' },
  payout:         { icon: DollarSign,    color: 'bg-emerald-500/20 text-emerald-400' },
  task_completed: { icon: CheckCircle2,  color: 'bg-royal-500/20 text-royal-400' },
}

const mockUsers = [
  { id: 1, name: 'Arjun Mehta',   initials: 'AM', color: 'from-royal-500 to-violet-600',   role: 'Volunteer',  email: 'arjun@example.com',  joined: '2 days ago',  status: 'active'  },
  { id: 2, name: 'Priya Nair',    initials: 'PN', color: 'from-violet-500 to-violet-700',  role: 'NGO Admin',  email: 'priya@edureach.org', joined: '5 days ago',  status: 'active'  },
  { id: 3, name: 'Kabir Singh',   initials: 'KS', color: 'from-emerald-500 to-emerald-700',role: 'Freelancer', email: 'kabir@example.com',  joined: '1 week ago',  status: 'active'  },
  { id: 4, name: 'Sneha Patel',   initials: 'SP', color: 'from-amber-500 to-orange-500',   role: 'Volunteer',  email: 'sneha@example.com',  joined: '1 week ago',  status: 'pending' },
  { id: 5, name: 'Rahul Verma',   initials: 'RV', color: 'from-sky-500 to-sky-700',        role: 'Freelancer', email: 'rahul@example.com',  joined: '2 weeks ago', status: 'active'  },
]

const pendingVerifications = [
  { id: 1, name: 'HopeHaven NGO',       initials: 'HH', color: 'from-violet-500 to-violet-700',  submitted: '1 hour ago',  docs: 3 },
  { id: 2, name: 'SafeWaters Trust',    initials: 'SW', color: 'from-teal-500 to-teal-700',      submitted: '3 hours ago', docs: 2 },
  { id: 3, name: 'LiteracyFirst India', initials: 'LF', color: 'from-amber-500 to-orange-600',   submitted: '6 hours ago', docs: 4 },
]

const roleColors = {
  Volunteer:  'bg-royal-500/20 text-royal-300 border-royal-500/30',
  Freelancer: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'NGO Admin':'bg-amber-500/20 text-amber-300 border-amber-500/30',
}
const statusColors = {
  active:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  suspended:'bg-red-500/20 text-red-300 border-red-500/30',
}

function KpiCard({ icon: Icon, value, label, trend, up, sub, color, href }) {
  const colors = {
    blue:   { bg: 'bg-royal-600/10',   icon: 'text-royal-400' },
    violet: { bg: 'bg-violet-600/10',  icon: 'text-violet-400' },
    green:  { bg: 'bg-emerald-600/10', icon: 'text-emerald-400' },
    amber:  { bg: 'bg-amber-500/10',   icon: 'text-amber-400' },
    red:    { bg: 'bg-red-500/10',     icon: 'text-red-400' },
  }
  const c = colors[color] || colors.blue
  const inner = (
    <div className={`rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/8 transition-all duration-200 ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon size={17} className={c.icon} />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${up !== false ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
            {up !== false ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.03em' }}>{value}</p>
      <p className="text-slate-400 text-xs mt-0.5">{label}</p>
      {sub && <p className="text-xs text-amber-400 font-semibold mt-1">{sub}</p>}
    </div>
  )
  return href ? <Link to={href}>{inner}</Link> : inner
}

export default function AdminDashboard() {
  const { userName, userEmail } = useRole()

  // Build dashUser inside component so hook values are available
  const adminUser = {
    name:        userName || 'Admin User',
    initials:    'AU',
    email:       userEmail || 'admin@givtask.com',
    roleLabel:   'Super Admin',
    avatarColor: 'from-violet-600 to-navy-700',
    profileHref: '/admin',
  }

  // Real task count from backend
  const [realTasks,     setRealTasks]    = React.useState([])
  const [loadingTasks,  setLoadingTasks] = React.useState(true)

  React.useEffect(() => {
    tasksApi.list()
      .then(data => setRealTasks(data || []))
      .catch(() => {})
      .finally(() => setLoadingTasks(false))
  }, [])

  const realTaskCount = realTasks.length
  const realPaidCount = realTasks.filter(t => t.type === 'Paid').length
  const realVolCount  = realTasks.filter(t => t.type === 'Volunteer').length

  const [tab, setTab]           = useState('users')
  const [userSearch, setSearch] = useState('')

  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  return (
    <DashboardLayout navItems={navItems} user={adminUser} pageTitle="Admin Control Centre">
      <div className="min-h-screen bg-[#0D1117]">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-b from-[#0D1117] to-[#111827] border-b border-white/5">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 md:py-10">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-full uppercase tracking-widest">Super Admin</span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full font-semibold">
                    <Activity size={10} className="animate-pulse-slow" /> All systems operational
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">GivTask Control Centre</h1>
                <p className="text-slate-400 text-sm mt-1">
                  {adminStats.totalUsers.toLocaleString()} users · {adminStats.activeTasks.toLocaleString()} active tasks · {adminStats.pendingVerifications} verifications pending
                </p>
              </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <KpiCard icon={Users}         value={adminStats.totalUsers.toLocaleString()}        label="Total users"        trend="+847"   color="blue"   href="/admin/users" />
              <KpiCard icon={Briefcase}     value={adminStats.activeTasks.toLocaleString()}       label="Active tasks"       trend="+64"    color="violet" href="/admin/tasks" />
              <KpiCard icon={ShieldCheck}   value={adminStats.ngos.toLocaleString()}              label="Verified NGOs"      trend="+12"    color="green"  href="/admin/verifications" />
              <KpiCard icon={DollarSign}    value={`₹${(adminStats.totalPayouts/100000).toFixed(1)}L`} label="Total payouts" trend="+₹4.2L" color="amber"  href="/admin/payouts" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard icon={UserCheck}     value={adminStats.volunteers.toLocaleString()}        label="Volunteers"         color="blue" />
              <KpiCard icon={Briefcase}     value={adminStats.freelancers.toLocaleString()}       label="Freelancers"        color="violet" />
              <KpiCard icon={CheckCircle2}  value={loadingTasks ? '…' : realVolCount.toString()}  label="Volunteer tasks"    color="green" />
              <KpiCard icon={AlertTriangle} value={adminStats.pendingVerifications}               label="Pending verifs"     sub="Needs attention" color="amber" href="/admin/verifications" />
            </div>
          </div>
        </div>

        {/* ── MAIN ─────────────────────────────────────────────────── */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left 2/3 */}
            <div className="lg:col-span-2 space-y-6">

              {/* Growth mini-charts */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'User growth',  value: adminStats.totalUsers.toLocaleString(), data: adminStats.monthlyGrowth.map(m => ({ month: m.month, v: m.users })),  color: '#2563EB' },
                  { label: 'Task volume',  value: adminStats.totalTasks.toLocaleString(), data: adminStats.monthlyGrowth.map(m => ({ month: m.month, v: m.tasks })),  color: '#7C3AED' },
                ].map(chart => {
                  const max = Math.max(...chart.data.map(d => d.v))
                  return (
                    <div key={chart.label} className="rounded-2xl bg-[#161B22] border border-white/8 p-5">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{chart.label}</p>
                      <p className="text-2xl font-bold text-white mb-4" style={{ letterSpacing: '-0.03em' }}>{chart.value}</p>
                      <div className="flex items-end gap-1.5 h-12">
                        {chart.data.map((d, i) => {
                          const h = Math.max(8, (d.v / max) * 100)
                          const isLast = i === chart.data.length - 1
                          return (
                            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                              <div className="w-full flex items-end justify-center" style={{ height: '36px' }}>
                                <div
                                  className="w-full rounded-t-md"
                                  style={{
                                    height: `${h}%`, minHeight: '3px',
                                    background: isLast ? chart.color : 'rgba(255,255,255,0.08)',
                                  }}
                                />
                              </div>
                              <span className="text-[9px] text-slate-600">{d.month}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Users / Tasks table */}
              <div className="rounded-2xl bg-[#161B22] border border-white/8 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                  <div className="flex bg-white/5 rounded-lg p-0.5 gap-0.5">
                    {['users','tasks'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${tab === t ? 'bg-white/15 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={userSearch}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-7 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-royal-500 w-36"
                    />
                  </div>
                </div>

                {tab === 'users' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['User','Role','Email','Joined','Status',''].map(h => (
                            <th key={h} className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest px-5 py-3 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-white/3 transition-colors group">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${u.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>{u.initials}</div>
                                <span className="text-sm font-semibold text-white whitespace-nowrap">{u.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleColors[u.role] || 'bg-white/10 text-slate-300 border-white/10'}`}>{u.role}</span>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{u.email}</td>
                            <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">{u.joined}</td>
                            <td className="px-5 py-3.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[u.status] || ''}`}>{u.status}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 rounded-lg bg-white/8 text-slate-400 hover:text-white transition-colors"><Eye size={12} /></button>
                                <button className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"><XCircle size={12} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          {['Task','Organisation','Type','Applicants','Status',''].map(h => (
                            <th key={h} className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest px-5 py-3 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {(realTasks.length > 0 ? realTasks : mockTasks).slice(0, 6).map(t => (
                          <tr key={t.id} className="hover:bg-white/3 transition-colors group">
                            <td className="px-5 py-3.5">
                              <p className="text-sm font-semibold text-white max-w-[180px] truncate">{t.title}</p>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{t.org}</td>
                            <td className="px-5 py-3.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.type === 'Paid' ? 'bg-royal-500/20 text-royal-300 border-royal-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>{t.type}</span>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-400">{t.applicants}</td>
                            <td className="px-5 py-3.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Open</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link to={`/tasks/${t.id}`} className="p-1.5 rounded-lg bg-white/8 text-slate-400 hover:text-white transition-colors"><Eye size={12} /></Link>
                                <button className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"><XCircle size={12} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-600">
                    Showing {tab === 'users' ? filteredUsers.length : 6} of {tab === 'users' ? adminStats.totalUsers.toLocaleString() : (realTasks.length > 0 ? realTaskCount : adminStats.totalTasks).toString()}
                  </span>
                  <Link to={tab === 'users' ? '/admin/users' : '/admin/tasks'} className="text-xs text-royal-400 hover:text-royal-300 font-medium flex items-center gap-0.5">
                    View all <ChevronRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Platform metrics */}
              <div className="rounded-2xl bg-[#161B22] border border-white/8 p-5">
                <h2 className="text-sm font-bold text-white mb-4">Platform metrics</h2>
                <div className="space-y-0">
                  {[
                    { label: 'New registrations this month', value: '847',    trend: '+23%',  up: true },
                    { label: 'Tasks posted this month',      value: '384',    trend: '+18%',  up: true },
                    { label: 'Applications this month',      value: '2,140',  trend: '+31%',  up: true },
                    { label: 'Avg. time-to-match',           value: '1.4 days', trend: '-0.3d', up: true },
                    { label: 'Payment success rate',         value: '99.2%',  trend: '+0.1%', up: true },
                    { label: 'Open support tickets',         value: '14',     trend: '+3',    up: false },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <span className="text-sm text-slate-400">{m.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{m.value}</span>
                        <span className={`flex items-center gap-0.5 text-xs font-semibold ${m.up ? 'text-emerald-400' : 'text-red-400'}`}>
                          {m.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{m.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1/3 */}
            <div className="space-y-5">

              {/* Live activity */}
              <div className="rounded-2xl bg-[#161B22] border border-white/8 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white">Live activity</h3>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />Live
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-white/5">
                  {adminStats.recentActivity.map(a => {
                    const cfg = activityIcons[a.type] || activityIcons.task_posted
                    const Icon = cfg.icon
                    return (
                      <div key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                          <Icon size={12} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 leading-snug">{a.text}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5">{a.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Admin notifications strip */}
                <div className="px-4 py-2 border-t border-white/5">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Notifications</p>
                  {adminNotifications.slice(0, 2).map(n => (
                    <div key={n.id} className={`flex items-start gap-2 py-2 ${!n.read ? 'opacity-100' : 'opacity-60'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-amber-400' : 'bg-white/20'}`} />
                      <p className="text-[10px] text-slate-400 leading-snug">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending verifications */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/15">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={13} className="text-amber-400" />
                    <h3 className="text-xs font-bold text-white">Pending Verifications</h3>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">{adminStats.pendingVerifications}</span>
                </div>
                <div className="divide-y divide-white/5">
                  {pendingVerifications.map(v => (
                    <div key={v.id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {v.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{v.name}</p>
                        <p className="text-[10px] text-slate-500">{v.docs} docs · {v.submitted}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 flex items-center justify-center transition-colors">
                          <CheckCircle2 size={11} />
                        </button>
                        <button className="w-6 h-6 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 flex items-center justify-center transition-colors">
                          <XCircle size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-amber-500/10">
                  <Link to="/admin/verifications" className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1">
                    Review all {adminStats.pendingVerifications} → 
                  </Link>
                </div>
              </div>

              {/* User breakdown */}
              <div className="rounded-2xl bg-[#161B22] border border-white/8 p-5">
                <h3 className="text-xs font-bold text-white mb-4">User breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Volunteers',  value: adminStats.volunteers,  pct: Math.round(adminStats.volunteers / adminStats.totalUsers * 100),  color: 'from-royal-600 to-royal-500',  href: '/admin/users' },
                    { label: 'NGOs',        value: adminStats.ngos,        pct: Math.round(adminStats.ngos / adminStats.totalUsers * 100),        color: 'from-amber-600 to-amber-500',   href: '/admin/users' },
                    { label: 'Freelancers', value: adminStats.freelancers, pct: Math.round(adminStats.freelancers / adminStats.totalUsers * 100), color: 'from-violet-600 to-violet-500', href: '/admin/users' },
                  ].map(row => (
                    <Link key={row.label} to={row.href} className="block group">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400 font-medium group-hover:text-white transition-colors">{row.label}</span>
                        <span className="text-white font-bold">{row.value.toLocaleString()} <span className="text-slate-600 font-normal">({row.pct}%)</span></span>
                      </div>
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${row.color} rounded-full transition-all duration-700`} style={{ width: `${row.pct}%` }} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick admin links */}
              <div className="rounded-2xl bg-[#161B22] border border-white/8 p-4">
                <h3 className="text-xs font-bold text-white mb-3">Quick actions</h3>
                <div className="space-y-1">
                  {[
                    { label: 'Manage users',        href: '/admin/users',         icon: Users },
                    { label: 'Review verifications', href: '/admin/verifications', icon: ShieldCheck },
                    { label: 'Process payouts',     href: '/admin/payouts',       icon: DollarSign },
                    { label: 'View analytics',      href: '/admin/analytics',     icon: BarChart2 },
                    { label: 'Settings',            href: '/admin/settings',      icon: Settings },
                  ].map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      to={href}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/8 transition-colors group"
                    >
                      <span className="flex items-center gap-2.5 text-sm text-slate-400 group-hover:text-white transition-colors">
                        <Icon size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />{label}
                      </span>
                      <ChevronRight size={13} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
                    </Link>
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
