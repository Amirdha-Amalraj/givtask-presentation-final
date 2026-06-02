import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin, Globe, Calendar, Users, Briefcase, CheckCircle2,
  Star, ShieldCheck, Share2, Heart, ExternalLink, Award,
  Building2, ChevronRight, RefreshCw, Edit3, Save, X, MapPin as MapPinIcon,
} from 'lucide-react'
import MainLayout from '../../components/layout/MainLayout.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import { useRole } from '../../context/RoleContext.jsx'
import { authApi, tasksApi, applicationsApi } from '../../services/api.js'

const mockReviews = [
  { id: 1, name: 'Arjun Mehta', initials: 'AM', color: 'from-royal-500 to-violet-600', role: 'Full-Stack Developer', rating: 5, comment: 'EduReach is an exceptionally well-run organisation. Clear briefs, prompt feedback, and the mission is genuinely inspiring. Highly recommend volunteering here.', date: 'May 2026' },
  { id: 2, name: 'Priya Sharma', initials: 'PS', color: 'from-violet-500 to-violet-700', role: 'UX Designer', rating: 5, comment: 'Wonderful experience. The team was organised and valued our input. Seeing real children benefit from our design work was incredibly rewarding.', date: 'April 2026' },
  { id: 3, name: 'Kabir Singh', initials: 'KS', color: 'from-emerald-500 to-emerald-700', role: 'Freelancer', rating: 4, comment: 'Payment was on time and the project scope was well defined. Great people to work with.', date: 'March 2026' },
]

export default function NGOProfilePage() {
  const { userId, userName, userEmail, login, role: sessionRole, userSkills } = useRole()
  const [activeTab, setActiveTab] = useState('about')
  const [followed, setFollowed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ngoProfile, setNgoProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const [allApplicants, setAllApplicants] = useState([])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', city: '', state: '' })

  const loadProfile = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    try {
      const data = await authApi.getUser(userId)
      setNgoProfile(data)
      setEditForm({ full_name: data.full_name || '', city: data.city || '', state: data.state || '' })
    } catch { /* fallback to session data */ }
    finally  { setLoading(false) }
  }, [userId])

  const loadTasks = useCallback(async () => {
    if (!userId) return
    try {
      const data = await tasksApi.list({ ngo_id: userId })
      setTasks(data || [])
      // Load applicants for the tasks
      if (data && data.length > 0) {
        const results = await Promise.all(data.slice(0, 5).map(t => applicationsApi.forTask(t.id).catch(() => [])))
        setAllApplicants(results.flat())
      }
    } catch { /* empty */ }
  }, [userId])

  useEffect(() => { loadProfile() }, [loadProfile])
  useEffect(() => { loadTasks()   }, [loadTasks])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await authApi.updateProfile(userId, {
        full_name: editForm.full_name,
        city:      editForm.city,
        state:     editForm.state,
      })
      setNgoProfile(updated)
      if (updated.full_name !== userName) {
        login(sessionRole, updated.full_name, userEmail, userId, userSkills)
      }
      setEditing(false)
    } catch (err) {
      alert(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  // Display values
  const profile    = ngoProfile || {}
  const orgName    = profile.full_name || userName || 'NGO'
  const orgInitials= orgName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const orgLocation= [profile.city, profile.state].filter(Boolean).join(', ') || 'Location not set'
  const createdAt  = profile.created_at
    ? new Date(profile.created_at).getFullYear()
    : new Date().getFullYear()

  const tabs = [
    { id: 'about',   label: 'About' },
    { id: 'tasks',   label: `Tasks (${tasks.length})` },
    { id: 'reviews', label: 'Reviews' },
    { id: 'impact',  label: 'Impact' },
  ]

  return (
    <MainLayout>
      <div className="pt-20 bg-[#F8FAFC] min-h-screen">

        {/* Hero cover */}
        <div className="bg-white border-b border-[#F1F5F9]">
          <div className="h-40 md:h-52 bg-gradient-to-br from-navy-900 via-royal-900 to-navy-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-pattern opacity-20" />
            <div className="absolute top-1/3 left-1/4 w-56 h-56 bg-royal-500/15 rounded-full blur-3xl" />
            <div className="absolute top-0 right-1/4 w-40 h-40 bg-violet-500/10 rounded-full blur-2xl" />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Logo + name row */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-5 relative z-10">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-royal-500 to-royal-700 flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg flex-shrink-0">
                {orgInitials}
              </div>
              <div className="flex-1 sm:pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {editing ? (
                        <input
                          className="text-xl font-bold text-navy-900 border border-royal-300 rounded-lg px-2 py-1 max-w-xs"
                          value={editForm.full_name}
                          onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                          placeholder="Organisation name"
                        />
                      ) : (
                        <h1 className="text-xl md:text-2xl font-bold text-navy-900">{orgName}</h1>
                      )}
                      <Badge variant="emerald"><ShieldCheck size={10} className="mr-0.5" />Verified</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5 italic">Non-Governmental Organisation</p>
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
                      <div className="flex items-center flex-wrap gap-3 mt-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><MapPin size={11} />{orgLocation}</span>
                        <span className="flex items-center gap-1"><Calendar size={11} />Est. {createdAt}</span>
                        <span className="flex items-center gap-1"><Users size={11} />{profile.email || userEmail || '—'}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {editing ? (
                      <>
                        <Button variant="primary" size="sm" loading={saving} icon={<Save size={14} />} onClick={handleSave}>Save</Button>
                        <Button variant="secondary" size="sm" icon={<X size={14} />} onClick={() => setEditing(false)}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="secondary" size="sm" icon={<Edit3 size={14} />} onClick={() => setEditing(true)}>Edit profile</Button>
                        <button className="p-2 rounded-xl border border-[#E2E8F0] text-slate-500 hover:text-navy-700 transition-colors">
                          <Share2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-6 pb-4 overflow-x-auto scrollbar-thin">
              {[
                { icon: Briefcase,    label: 'Active Tasks',   value: loading ? '…' : tasks.length },
                { icon: Users,        label: 'Applicants',     value: loading ? '…' : allApplicants.length },
                { icon: CheckCircle2, label: 'Accepted',       value: loading ? '…' : allApplicants.filter(a => a.status === 'accepted').length },
                { icon: Star,         label: 'Avg. Rating',    value: '4.9' },
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
                  className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
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

              {/* Main */}
              <div className="lg:col-span-2 space-y-6">

                {activeTab === 'about' && (
                  <>
                    <div className="card p-6">
                      <h2 className="text-sm font-bold text-navy-900 mb-3">About {orgName}</h2>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4">
                        {orgName} is a registered NGO working to create positive change through community engagement, digital empowerment, and skill-building initiatives.
                      </p>
                      <div className="p-4 bg-royal-50 border border-royal-100 rounded-xl">
                        <p className="text-xs font-bold text-royal-800 mb-1 uppercase tracking-wider">Our Mission</p>
                        <p className="text-sm text-royal-900 italic">"Empowering communities through collaboration, education, and purpose-driven action."</p>
                      </div>
                    </div>

                    <div className="card p-6">
                      <h2 className="text-sm font-bold text-navy-900 mb-4">Focus areas</h2>
                      <div className="grid grid-cols-2 gap-3">
                        {['Education', 'Community Development', 'Health & Wellness', 'Digital Empowerment'].map(cat => (
                          <div key={cat} className="flex items-center gap-2.5 p-3 bg-[#F8FAFC] rounded-xl">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-royal-500 to-violet-600 flex-shrink-0" />
                            <span className="text-sm text-navy-700 font-medium">{cat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'tasks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-sm font-bold text-navy-900">Open opportunities</h2>
                      <Badge variant="royal">{tasks.length} active</Badge>
                    </div>
                    {tasks.length === 0 ? (
                      <div className="card p-8 text-center">
                        <Briefcase size={24} className="text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm mb-3">No tasks posted yet.</p>
                        <Link to="/dashboard/ngo/post-task">
                          <Button variant="primary" size="sm">Post a task</Button>
                        </Link>
                      </div>
                    ) : (
                      tasks.map(task => (
                        <Link key={task.id} to={`/tasks/${task.id}`} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow block">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${task.orgLogoColor || 'from-royal-500 to-royal-700'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {task.orgLogo}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-navy-900 truncate">{task.title}</p>
                            <p className="text-xs text-slate-500">{task.category} · {task.type} · {task.location}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${task.type === 'Paid' ? 'bg-royal-50 text-royal-700' : 'bg-emerald-50 text-emerald-700'}`}>{task.type}</span>
                            <span className="text-xs text-slate-400">{task.applicants} applicants</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <div className="card p-5 flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-navy-900 tracking-tight">4.9</p>
                        <div className="flex items-center justify-center gap-0.5 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{mockReviews.length} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map(n => (
                          <div key={n} className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 w-2">{n}</span>
                            <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: n === 5 ? '80%' : n === 4 ? '15%' : '5%' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {mockReviews.map(r => (
                      <div key={r.id} className="card p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {r.initials}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-bold text-navy-900">{r.name}</p>
                              <span className="text-xs text-slate-400">{r.date}</span>
                            </div>
                            <p className="text-xs text-slate-400">{r.role}</p>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">"{r.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'impact' && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { value: tasks.length.toString(),          label: 'Tasks Posted' },
                        { value: allApplicants.length.toString(),  label: 'Total Applicants' },
                        { value: allApplicants.filter(a => a.status === 'accepted').length.toString(), label: 'Accepted' },
                        { value: '4.9',                            label: 'Avg. Rating' },
                      ].map(({ value, label }) => (
                        <div key={label} className="card p-4 text-center">
                          <p className="text-2xl font-bold text-navy-900 tracking-tight">{value}</p>
                          <p className="text-xs text-slate-500 mt-1">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="card p-6">
                      <h2 className="text-sm font-bold text-navy-900 mb-4 flex items-center gap-2">
                        <Award size={15} className="text-amber-500" /> Recognition &amp; awards
                      </h2>
                      <ul className="space-y-3">
                        {[
                          { year: '2024', award: 'Best NGO — Digital Education, Times Social Impact Awards' },
                          { year: '2023', award: 'NASSCOM Foundation Partner NGO of the Year' },
                          { year: '2022', award: 'GovTech Innovation Grant recipient' },
                        ].map(a => (
                          <li key={a.year} className="flex items-start gap-3 text-sm">
                            <span className="text-xs font-bold text-royal-600 bg-royal-50 px-2 py-0.5 rounded-md flex-shrink-0 mt-0.5">{a.year}</span>
                            <span className="text-navy-700">{a.award}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Quick apply CTA */}
                <div className="card p-5 bg-gradient-to-br from-royal-50 to-violet-50 border-royal-100">
                  <h3 className="text-sm font-bold text-navy-900 mb-1">Want to contribute?</h3>
                  <p className="text-xs text-slate-500 mb-4">Browse open tasks from {orgName} and apply with your skills.</p>
                  <Link to="/tasks">
                    <Button variant="primary" fullWidth size="sm" icon={<Briefcase size={14} />}>
                      View open tasks
                    </Button>
                  </Link>
                </div>

                {/* Organisation details */}
                <div className="card p-5">
                  <h3 className="text-sm font-bold text-navy-900 mb-3">Organisation details</h3>
                  <div className="space-y-2.5">
                    {[
                      { icon: Building2, label: 'Type',    value: 'Non-profit / NGO' },
                      { icon: MapPin,    label: 'Location', value: orgLocation },
                      { icon: Calendar,  label: 'Since',   value: createdAt },
                      { icon: Users,     label: 'Tasks',   value: `${tasks.length} posted` },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-2.5 text-xs">
                        <Icon size={13} className="text-slate-400 flex-shrink-0" />
                        <span className="text-slate-500 w-16 flex-shrink-0">{label}</span>
                        <span className="font-medium text-navy-800 flex-1 text-right">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#F8FAFC]">
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl">
                      <ShieldCheck size={14} className="text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-800">Verified organisation</p>
                        <p className="text-[10px] text-emerald-600">Registered &amp; reviewed by GivTask</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent applicants */}
                {allApplicants.length > 0 && (
                  <div className="card p-5">
                    <h3 className="text-sm font-bold text-navy-900 mb-3">Recent applicants</h3>
                    <div className="space-y-2.5">
                      {allApplicants.slice(0, 3).map((a, idx) => {
                        const applicant = a.applicant || {}
                        const initials = (applicant.full_name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                        return (
                          <div key={a.id || idx} className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-navy-900 truncate">{applicant.full_name || 'Applicant'}</p>
                              <p className="text-[10px] text-slate-400 capitalize">{applicant.role || 'Applicant'}</p>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              a.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' :
                              a.status === 'shortlisted' ? 'bg-royal-50 text-royal-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>{a.status}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
