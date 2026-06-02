import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Clock, Users, Calendar, Bookmark, Share2,
  CheckCircle2, Globe, ShieldCheck, Star, Briefcase, ExternalLink,
  AlertCircle, RefreshCw,
} from 'lucide-react'
import MainLayout from '../../components/layout/MainLayout.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import TaskCard from '../../components/dashboard/TaskCard.jsx'
import { useRole } from '../../context/RoleContext.jsx'
import { tasksApi, applicationsApi } from '../../services/api.js'

export default function TaskDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { userId, role } = useRole()

  const [task,       setTask]     = useState(null)
  const [related,    setRelated]  = useState([])
  const [loading,    setLoading]  = useState(true)
  const [error,      setError]    = useState('')

  const [applied,    setApplied]  = useState(false)
  const [applying,   setApplying] = useState(false)
  const [applyMsg,   setApplyMsg] = useState('')
  const [applyError, setApplyErr] = useState('')

  // Load task from backend
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const t = await tasksApi.get(Number(id))
        if (!cancelled) {
          setTask(t)
          // Also fetch related (same category)
          const all = await tasksApi.list({ category: t.category })
          setRelated(all.filter(r => r.id !== t.id).slice(0, 3))
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Task not found.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  const handleApply = async () => {
    if (!userId) {
      navigate('/login')
      return
    }
    if (!['volunteer', 'freelancer'].includes(role)) {
      setApplyErr('Only volunteers and freelancers can apply to tasks.')
      return
    }
    setApplying(true)
    setApplyErr('')
    try {
      await applicationsApi.apply(task.id, userId)
      setApplied(true)
      setApplyMsg('Application submitted successfully!')
      // Update applicant count locally
      setTask(prev => ({ ...prev, applicants: prev.applicants + 1 }))
    } catch (err) {
      const msg = err.message || 'Failed to submit application.'
      if (msg.toLowerCase().includes('already')) {
        setApplied(true)
        setApplyMsg('You have already applied to this task.')
      } else {
        setApplyErr(msg)
      }
    } finally {
      setApplying(false)
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <MainLayout>
        <div className="pt-32 flex flex-col items-center gap-4">
          <RefreshCw size={24} className="text-royal-500 animate-spin" />
          <p className="text-sm text-slate-500">Loading task details…</p>
        </div>
      </MainLayout>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error || !task) {
    return (
      <MainLayout>
        <div className="pt-32 flex flex-col items-center gap-4 text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertCircle size={22} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-navy-900">Task not found</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <Link to="/tasks" className="text-royal-600 hover:underline text-sm font-semibold">
            ← Back to listings
          </Link>
        </div>
      </MainLayout>
    )
  }

  const typeVariant = task.type === 'Paid' ? 'royal' : 'emerald'
  const locVariant  = task.location === 'Remote' ? 'violet' : 'amber'
  const canApply    = role === 'volunteer' || role === 'freelancer'

  return (
    <MainLayout>
      <div className="pt-20 bg-[#F8FAFC] min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 transition-colors"
          >
            <ArrowLeft size={14} /> Back to listings
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Main content ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Task header card */}
              <div className="card p-6 md:p-8">
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${task.orgLogoColor} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md`}>
                    {task.orgLogo}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl md:text-2xl font-bold text-navy-900 mb-1 leading-snug tracking-tight">
                      {task.title}
                    </h1>
                    <Link to="/profile/ngo" className="text-sm text-royal-600 hover:underline font-medium">{task.org}</Link>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant={typeVariant}>{task.type}</Badge>
                  <Badge variant={locVariant}>{task.location}</Badge>
                  {task.category && <Badge variant="default">{task.category}</Badge>}
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F8FAFC] rounded-2xl mb-6">
                  {[
                    { icon: Users,    label: 'Applicants', value: task.applicants },
                    { icon: Clock,    label: 'Duration',   value: task.duration || 'TBD' },
                    { icon: MapPin,   label: 'Location',   value: task.location },
                    { icon: Briefcase,label: 'Type',       value: task.type },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-1">
                      <Icon size={15} className="text-royal-500" />
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm font-bold text-navy-900">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Budget */}
                {task.budget && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-6">
                    <Briefcase size={15} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-xs text-emerald-700 font-medium">Budget: </span>
                    <span className="text-sm font-bold text-emerald-700">{task.budget}</span>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h2 className="text-base font-bold text-navy-900 mb-3">About this task</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>
                </div>
              </div>

              {/* Required skills */}
              <div className="card p-6">
                <h2 className="text-base font-bold text-navy-900 mb-4">Required Skills</h2>
                {task.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {task.skills.map(skill => (
                      <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-royal-50 text-royal-700 border border-royal-100 rounded-xl text-sm font-medium">
                        <CheckCircle2 size={13} className="text-royal-500" />
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No specific skills listed.</p>
                )}
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                  <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Don't match all skills? NGOs often consider passionate candidates who meet 70%+ requirements.
                  </p>
                </div>
              </div>

              {/* What you'll gain */}
              <div className="card p-6">
                <h2 className="text-base font-bold text-navy-900 mb-4">What you'll gain</h2>
                <ul className="space-y-3">
                  {[
                    'Verified completion certificate from a registered NGO',
                    'Impact score points on your GivTask profile',
                    'Portfolio-ready work and public testimonial',
                    'Direct reference from the NGO team lead',
                    task.type === 'Paid'
                      ? 'Payment on milestone completion'
                      : 'Volunteer recognition badge on your GivTask profile',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-navy-700">
                      <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related tasks */}
              {related.length > 0 && (
                <div>
                  <h2 className="text-base font-bold text-navy-900 mb-4">Similar opportunities</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {related.map(t => <TaskCard key={t.id} task={t} compact />)}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-5">

              {/* Apply card */}
              <div className="card p-6 sticky top-24">
                {applied ? (
                  <div className="text-center py-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 size={24} className="text-emerald-500" />
                    </div>
                    <h3 className="font-bold text-navy-900 mb-1">
                      {applyMsg.includes('already') ? 'Already applied' : 'Application sent!'}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">{applyMsg}</p>
                    <Link to="/tasks">
                      <Button variant="secondary" fullWidth size="sm">Browse more tasks</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <h3 className="text-base font-bold text-navy-900 mb-1">
                      {task.type === 'Paid' ? 'Apply for this project' : 'Volunteer for this task'}
                    </h3>
                    <p className="text-xs text-slate-500 mb-5">
                      {userId
                        ? `Your profile will be sent to ${task.org} for review.`
                        : 'Sign in to apply to this task.'}
                    </p>

                    {applyError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">
                        {applyError}
                      </div>
                    )}

                    {canApply || !userId ? (
                      <Button
                        variant="primary"
                        fullWidth
                        loading={applying}
                        onClick={userId ? handleApply : () => navigate('/login')}
                        className="mb-3"
                      >
                        {applying ? 'Submitting…' : userId
                          ? (task.type === 'Paid' ? 'Apply now' : 'Volunteer for this')
                          : 'Sign in to apply'}
                      </Button>
                    ) : (
                      <div className="mb-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 text-center font-medium">
                        NGOs cannot apply to tasks
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="secondary" fullWidth size="sm" icon={<Bookmark size={14} />}>Save</Button>
                      <Button variant="secondary" fullWidth size="sm" icon={<Share2 size={14} />}>Share</Button>
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-4">
                      {task.applicants} {task.applicants === 1 ? 'person has' : 'people have'} applied
                    </p>
                  </>
                )}
              </div>

              {/* NGO card */}
              <div className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${task.orgLogoColor} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                    {task.orgLogo}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-navy-900">{task.org}</p>
                      <ShieldCheck size={13} className="text-royal-500" />
                    </div>
                    <p className="text-xs text-slate-400">Verified NGO</p>
                  </div>
                </div>
                <Link to="/profile/ngo">
                  <Button variant="secondary" fullWidth size="sm" icon={<ExternalLink size={13} />}>
                    View NGO profile
                  </Button>
                </Link>
              </div>

              {/* Posted info */}
              <div className="card p-4 flex items-center gap-3">
                <Clock size={15} className="text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">
                    {task.created_at
                      ? `Posted ${new Date(task.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`
                      : 'Recently posted'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
