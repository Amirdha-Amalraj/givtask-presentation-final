import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin, Edit3, Star, CheckCircle2, Clock,
  Award, Heart, Briefcase, Share2, ShieldCheck,
  RefreshCw, Save, X,
} from 'lucide-react'
import MainLayout from '../../components/layout/MainLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import { useRole } from '../../context/RoleContext.jsx'
import { authApi, applicationsApi } from '../../services/api.js'

/**
 * UserProfilePage — displays real user data from the database.
 * Works for both volunteer and freelancer roles.
 */
export default function UserProfilePage({ role: roleProp = 'volunteer' }) {
  const { userId, userSkills, userName, updateSkills, login, role: sessionRole, userEmail } = useRole()
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', city: '', state: '' })

  const isFreelancer = (sessionRole || roleProp) === 'freelancer'

  const loadUser = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    try {
      const data = await authApi.getUser(userId)
      setUser(data)
      setEditForm({
        full_name: data.full_name || '',
        city:      data.city || '',
        state:     data.state || '',
      })
    } catch { /* show with session data as fallback */ }
    finally  { setLoading(false) }
  }, [userId])

  const loadApplications = useCallback(async () => {
    if (!userId) return
    try {
      const data = await applicationsApi.forUser(userId)
      setApplications(data || [])
    } catch { /* empty */ }
  }, [userId])

  useEffect(() => { loadUser() },       [loadUser])
  useEffect(() => { loadApplications() }, [loadApplications])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await authApi.updateProfile(userId, {
        full_name: editForm.full_name,
        city:      editForm.city,
        state:     editForm.state,
      })
      setUser(updated)
      // Update session name if name changed
      if (updated.full_name !== userName) {
        login(sessionRole, updated.full_name, userEmail, userId, updated.skills || userSkills)
      }
      setEditing(false)
    } catch (err) {
      alert(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // Derived display values
  const displayUser = user || {}
  const fullName    = displayUser.full_name || userName || 'User'
  const initials    = fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const skills      = displayUser.skills?.length ? displayUser.skills : (userSkills || [])
  const location    = [displayUser.city, displayUser.state].filter(Boolean).join(', ') || 'Location not set'
  const createdAt   = displayUser.created_at
    ? new Date(displayUser.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const accepted    = applications.filter(a => a.status === 'accepted').length
  const shortlisted = applications.filter(a => a.status === 'shortlisted').length
  const impactScore = Math.min(accepted * 150 + shortlisted * 50 + applications.length * 20, 1000)

  const tabs = [
    { id: 'overview',        label: 'Overview' },
    { id: 'applications',    label: isFreelancer ? 'Projects' : 'Applications' },
    { id: 'skills',          label: 'Skills' },
  ]

  const STATUS_STYLE = {
    shortlisted: 'bg-royal-50 text-royal-700 border border-royal-200',
    accepted:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
    rejected:    'bg-red-50 text-red-700 border border-red-200',
    pending:     'bg-amber-50 text-amber-700 border border-amber-200',
  }

  return (
    <MainLayout>
      <div className="pt-20 bg-[#F8FAFC] min-h-screen">

        {/* Profile hero */}
        <div className="bg-white border-b border-[#F1F5F9]">
          {/* Cover */}
          <div className="h-32 md:h-44 bg-gradient-to-br from-navy-900 via-navy-800 to-royal-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-pattern opacity-30" />
            <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-royal-500/15 rounded-full blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5 relative z-10">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-royal-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 sm:pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    {editing ? (
                      <input
                        className="text-xl font-bold text-navy-900 border border-royal-300 rounded-lg px-2 py-1 w-full max-w-xs"
                        value={editForm.full_name}
                        onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                        placeholder="Full name"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-navy-900">{fullName}</h1>
                        <ShieldCheck size={16} className="text-royal-500" />
                      </div>
                    )}
                    <p className="text-sm text-slate-500 mt-0.5 capitalize">{sessionRole || roleProp}</p>
                    {editing ? (
                      <div className="flex gap-2 mt-1.5">
                        <input
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1"
                          value={editForm.city}
                          onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))}
                          placeholder="City"
                        />
                        <input
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1"
                          value={editForm.state}
                          onChange={e => setEditForm(p => ({ ...p, state: e.target.value }))}
                          placeholder="State / Country"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><MapPin size={11} /> {location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editing ? (
                      <>
                        <Button variant="primary" size="sm" loading={saving} icon={<Save size={14} />} onClick={handleSave}>Save</Button>
                        <Button variant="secondary" size="sm" icon={<X size={14} />} onClick={() => setEditing(false)}>Cancel</Button>
                      </>
                    ) : (
                      <Button variant="secondary" size="sm" icon={<Edit3 size={14} />} onClick={() => setEditing(true)}>
                        Edit profile
                      </Button>
                    )}
                    <button className="p-2 rounded-xl border border-[#E2E8F0] text-slate-500 hover:text-navy-700 hover:border-navy-300 transition-colors">
                      <Share2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-6 pb-5 overflow-x-auto scrollbar-thin">
              {[
                { icon: Star,         label: 'Impact Score',    value: loading ? '…' : impactScore },
                { icon: CheckCircle2, label: 'Accepted',        value: loading ? '…' : accepted },
                { icon: Clock,        label: 'Applications',    value: loading ? '…' : applications.length },
                { icon: Heart,        label: 'Shortlisted',     value: loading ? '…' : shortlisted },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 text-sm flex-shrink-0">
                  <Icon size={14} className="text-royal-500" />
                  <span className="font-bold text-navy-900">{value}</span>
                  <span className="text-slate-400">{label}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#F1F5F9] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-royal-600 text-royal-600'
                      : 'border-transparent text-slate-500 hover:text-navy-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm py-12 justify-center">
              <RefreshCw size={16} className="animate-spin" /> Loading profile…
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left: main content */}
              <div className="lg:col-span-2 space-y-6">

                {activeTab === 'overview' && (
                  <>
                    {/* Account info */}
                    <div className="card p-6">
                      <h2 className="text-sm font-bold text-navy-900 mb-4">Account Information</h2>
                      <div className="space-y-3">
                        {[
                          { label: 'Full Name',  value: fullName },
                          { label: 'Email',      value: displayUser.email || userEmail || '—' },
                          { label: 'Role',       value: (sessionRole || roleProp).charAt(0).toUpperCase() + (sessionRole || roleProp).slice(1) },
                          { label: 'Location',   value: location },
                          { label: 'Member since', value: createdAt },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between text-sm py-2 border-b border-[#F8FAFC] last:border-0">
                            <span className="text-slate-500">{label}</span>
                            <span className="font-medium text-navy-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills preview */}
                    {skills.length > 0 && (
                      <div className="card p-6">
                        <h2 className="text-sm font-bold text-navy-900 mb-4">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {skills.map(s => (
                            <span key={s} className="px-3 py-1.5 bg-royal-50 text-royal-700 border border-royal-100 rounded-xl text-sm font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'applications' && (
                  <div className="space-y-4">
                    <h2 className="text-sm font-bold text-navy-900">
                      {isFreelancer ? 'My Projects' : 'My Applications'}
                    </h2>
                    {applications.length === 0 ? (
                      <div className="card p-8 text-center">
                        <Briefcase size={24} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No applications yet.</p>
                        <Link to="/tasks" className="mt-2 inline-flex text-sm text-royal-600 hover:underline">
                          Browse tasks →
                        </Link>
                      </div>
                    ) : (
                      applications.map(app => (
                        <div key={app.id} className="card p-4 flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.task?.orgLogoColor || 'from-royal-500 to-violet-600'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {app.task?.orgLogo || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-navy-900 truncate">{app.task?.title || 'Task'}</p>
                            <p className="text-xs text-slate-500">{app.task?.org} · {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[app.status] || STATUS_STYLE.pending}`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                            {app.task?.id && (
                              <Link to={`/tasks/${app.task.id}`} className="text-xs text-royal-600 hover:underline">View</Link>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'skills' && (
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-navy-900">Skills ({skills.length})</h2>
                    </div>
                    {skills.length === 0 ? (
                      <p className="text-sm text-slate-500">No skills added yet. Update your skills through your registration profile.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {skills.map(s => (
                          <span key={s} className="px-3 py-1.5 bg-royal-50 text-royal-700 border border-royal-100 rounded-xl text-sm font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="space-y-5">
                {/* Impact score widget */}
                <div className="card p-5">
                  <h3 className="text-sm font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <Star size={14} className="text-amber-500" /> Impact Score
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="#F1F5F9" strokeWidth="6"/>
                        <circle cx="32" cy="32" r="26" fill="none" stroke="url(#ig)" strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={163.4} strokeDashoffset={163.4 * (1 - impactScore / 1000)} />
                        <defs>
                          <linearGradient id="ig" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#2563EB"/><stop offset="100%" stopColor="#7C3AED"/>
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-navy-900">{Math.round(impactScore / 10)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-navy-900">{impactScore}</p>
                      <p className="text-xs text-slate-400">/ 1000 pts</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Applications', val: applications.length },
                      { label: 'Shortlisted',  val: shortlisted },
                      { label: 'Accepted',     val: accepted },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex justify-between text-xs">
                        <span className="text-slate-500">{label}</span>
                        <span className="font-bold text-navy-900">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="card p-5">
                  <h3 className="text-sm font-bold text-navy-900 mb-3">Status</h3>
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm text-emerald-700 font-semibold">
                      {isFreelancer ? 'Open to projects' : 'Available to volunteer'}
                    </span>
                  </div>
                </div>

                {/* Quick links */}
                <div className="card p-5">
                  <h3 className="text-sm font-bold text-navy-900 mb-3">Quick Links</h3>
                  <div className="space-y-2">
                    <Link to="/tasks" className="flex items-center gap-2 text-sm text-royal-600 hover:underline">
                      → Browse opportunities
                    </Link>
                    <Link
                      to={isFreelancer ? '/dashboard/freelancer' : '/dashboard/volunteer'}
                      className="flex items-center gap-2 text-sm text-royal-600 hover:underline"
                    >
                      → My Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
