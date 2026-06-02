import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle, Users, Bell, Briefcase,
  Building2, CheckCircle2, ArrowLeft, ArrowRight, AlertCircle, RefreshCw
} from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import InputField from '../../components/ui/InputField.jsx'
import TextAreaField from '../../components/ui/TextAreaField.jsx'
import SelectField from '../../components/ui/SelectField.jsx'
import TagSelector from '../../components/ui/TagSelector.jsx'
import Button from '../../components/ui/Button.jsx'
import StepIndicator from '../../components/ui/StepIndicator.jsx'
import { skillsList, ngoCategories } from '../../data/index.js'
import { tasksApi } from '../../services/api.js'
import { useRole } from '../../context/RoleContext.jsx'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview',      href: '/dashboard/ngo' },
  { icon: PlusCircle,      label: 'Post a Task',   href: '/dashboard/ngo/post-task' },
  { icon: Briefcase,       label: 'Active Tasks',  href: '/dashboard/ngo/tasks' },
  { icon: Users,           label: 'Applicants',    href: '/dashboard/ngo/applicants' },
  { icon: Bell,            label: 'Notifications', href: '/dashboard/ngo/notifications', badge: 2 },
  { icon: Building2,       label: 'NGO Profile',   href: '/profile/ngo' },
]

const steps = ['Task basics', 'Requirements', 'Review & publish']

const durationOptions = [
  { value: '1-2 days', label: '1–2 days' },
  { value: '1 week',   label: '1 week' },
  { value: '2 weeks',  label: '2 weeks' },
  { value: '1 month',  label: '1 month' },
  { value: '2 months', label: '2 months' },
  { value: '3 months', label: '3 months' },
  { value: 'ongoing',  label: 'Ongoing / indefinite' },
]

const locationOptions = [
  { value: 'Remote',  label: 'Remote' },
  { value: 'On-site', label: 'On-site' },
  { value: 'Hybrid',  label: 'Hybrid' },
]

const experienceOptions = [
  { value: 'any',      label: 'Any level' },
  { value: 'beginner', label: 'Beginner (0–1 year)' },
  { value: 'mid',      label: 'Mid-level (2–4 years)' },
  { value: 'senior',   label: 'Senior (5+ years)' },
]

export default function PostTaskPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const { userId, userName, userEmail } = useRole()

  // Build user object dynamically from session
  const user = {
    name:        userName || 'NGO Admin',
    initials:    (userName || 'NA').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    email:       userEmail || 'ngo@givtask.com',
    roleLabel:   'NGO Admin',
    avatarColor: 'from-royal-500 to-royal-700',
    profileHref: '/profile/ngo',
  }

  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(isEditing)
  const [apiError,   setApiError]  = useState('')
  const [form, setForm] = useState({
    title: '', type: 'Volunteer', category: '', description: '',
    responsibilities: '', outcomes: '',
    skills: [], experience: 'any', duration: '', location: 'Remote',
    deadline: '', budget: '', budgetMax: '', seats: '1',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEditing) {
      tasksApi.get(id)
        .then(task => {
          if (task.ngo_id !== userId) {
            setApiError('You do not have permission to edit this task.')
          } else {
            setForm({
              title: task.title,
              type: task.type,
              category: task.category || '',
              description: task.description,
              responsibilities: '', // We don't have separate fields in DB, just mapping back to description
              outcomes: '',
              skills: task.skills || [],
              experience: 'any',
              duration: task.duration || '',
              location: task.location || 'Remote',
              deadline: '',
              budget: '',
              budgetMax: '',
              seats: '1',
            })
          }
          setLoading(false)
        })
        .catch(err => {
          setApiError('Failed to load task details.')
          setLoading(false)
        })
    }
  }, [id, isEditing, userId])

  const set = (field) => (e) => {
    const val = e && e.target ? e.target.value : e
    setForm(f => ({ ...f, [field]: val }))
    setErrors(er => ({ ...er, [field]: '' }))
  }

  const validateStep0 = () => {
    const e = {}
    if (!form.title.trim())       e.title       = 'Task title is required'
    if (!form.category)           e.category    = 'Please select a category'
    if (!form.description.trim()) e.description = 'Task description is required'
    return e
  }

  const validateStep1 = () => {
    const e = {}
    if (form.skills.length === 0) e.skills   = 'Add at least one required skill'
    // Relaxed deadline/duration for edits if we don't have them in schema yet
    return e
  }

  const next = () => {
    const errs = step === 0 ? validateStep0() : step === 1 ? validateStep1() : {}
    if (Object.keys(errs).length) { setErrors(errs); return }
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const back = () => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const publish = async () => {
    setApiError('')
    if (!userId) {
      setApiError('You must be logged in as an NGO to post a task.')
      return
    }
    try {
      const payload = {
        ngo_id:          userId,
        title:           form.title,
        description:     [form.description, form.responsibilities, form.outcomes]
                           .filter(Boolean).join('\n\n'),
        category:        form.category || null,
        required_skills: form.skills,
        work_mode:       form.location?.toLowerCase() || 'remote',
        task_type:       form.type?.toLowerCase() || 'volunteer',
      }
      
      if (isEditing) {
        await tasksApi.update(id, payload)
      } else {
        await tasksApi.create(payload)
      }
      
      setSubmitted(true)
      setTimeout(() => navigate('/dashboard/ngo'), 2800)
    } catch (err) {
      setApiError(err.message || 'Failed to save task. Please try again.')
    }
  }

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} user={user} pageTitle={isEditing ? "Edit Task" : "Post a Task"}>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <RefreshCw size={24} className="animate-spin text-royal-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (submitted) {
    return (
      <DashboardLayout navItems={navItems} user={user} pageTitle="Post a Task">
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-navy-900 mb-2">Task published!</h2>
            <p className="text-slate-500 text-sm mb-6">
              <strong className="text-navy-800">"{form.title}"</strong> is now live. Skilled contributors will start applying soon.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/dashboard/ngo"><Button variant="primary">Back to dashboard</Button></Link>
              <Link to="/tasks"><Button variant="secondary">View listing</Button></Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={navItems} user={user} pageTitle="Post a Task">
      <div className="p-4 md:p-6 max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link to="/dashboard/ngo" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 mb-3 transition-colors">
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <h1 className="text-xl font-bold text-navy-900">Post a new task</h1>
          <p className="text-sm text-slate-500 mt-1">Connect with skilled volunteers and freelancers for your mission.</p>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator steps={steps} currentStep={step} />
        </div>

        {/* Step 0 — Basics */}
        {step === 0 && (
          <div className="space-y-5 animate-fade-in animate-fill-both">
            <div className="card p-6 space-y-5">
              <h2 className="text-sm font-bold text-navy-900">Task information</h2>

              <InputField
                label="Task title"
                placeholder="e.g. Build a donor management web app"
                value={form.title}
                onChange={set('title')}
                error={errors.title}
              />

              {/* Type toggle */}
              <div>
                <label className="label">Task type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Volunteer', 'Paid'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('type')(t)}
                      className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
                        form.type === t
                          ? 'border-royal-600 bg-royal-50 text-royal-700'
                          : 'border-[#E2E8F0] text-navy-700 hover:border-royal-200'
                      }`}
                    >
                      <div className="font-bold mb-0.5">{t}</div>
                      <div className="text-xs font-normal text-slate-500">
                        {t === 'Volunteer' ? 'Pro-bono contribution, no payment' : 'Paid project with defined budget'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <SelectField
                label="Category"
                value={form.category}
                onChange={set('category')}
                error={errors.category}
                options={ngoCategories.map(c => ({ value: c, label: c }))}
                placeholder="Select a category"
              />

              <TextAreaField
                label="Task description"
                placeholder="Describe what the task involves, your organisation's context, and what success looks like..."
                value={form.description}
                onChange={set('description')}
                error={errors.description}
                rows={4}
              />

              <TextAreaField
                label="Key responsibilities (optional)"
                placeholder="List the main responsibilities, e.g. — Design 5 key screens in Figma..."
                value={form.responsibilities}
                onChange={set('responsibilities')}
                rows={3}
              />

              <TextAreaField
                label="Deliverables / outcomes"
                placeholder="What will the contributor deliver? e.g. Final Figma file, written report, working web app..."
                value={form.outcomes}
                onChange={set('outcomes')}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 1 — Requirements */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in animate-fill-both">
            <div className="card p-6 space-y-5">
              <h2 className="text-sm font-bold text-navy-900">Skills & requirements</h2>

              <div>
                <label className="label">Required skills</label>
                <TagSelector
                  options={skillsList}
                  selected={form.skills}
                  onToggle={(tag) => {
                    const curr = form.skills
                    set('skills')(curr.includes(tag) ? curr.filter(s => s !== tag) : [...curr, tag])
                  }}
                  placeholder="Search skills..."
                  max={8}
                />
                {errors.skills && <p className="text-xs text-red-500 mt-1">{errors.skills}</p>}
              </div>

              <SelectField
                label="Experience level"
                value={form.experience}
                onChange={set('experience')}
                options={experienceOptions}
              />

              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Duration"
                  value={form.duration}
                  onChange={set('duration')}
                  error={errors.duration}
                  options={durationOptions}
                  placeholder="Select duration"
                />
                <SelectField
                  label="Work location"
                  value={form.location}
                  onChange={set('location')}
                  options={locationOptions}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Application deadline"
                  type="date"
                  value={form.deadline}
                  onChange={set('deadline')}
                  error={errors.deadline}
                />
                <InputField
                  label="No. of positions"
                  type="number"
                  placeholder="1"
                  value={form.seats}
                  onChange={set('seats')}
                  min={1}
                />
              </div>

              {form.type === 'Paid' && (
                <div>
                  <label className="label">Budget range (₹)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField placeholder="Min (e.g. 20000)" value={form.budget} onChange={set('budget')} />
                    <InputField placeholder="Max (e.g. 45000)" value={form.budgetMax} onChange={set('budgetMax')} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Leave blank if negotiable</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2 — Review */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in animate-fill-both">
            <div className="card p-6">
              <h2 className="text-sm font-bold text-navy-900 mb-5">Review your task</h2>
              {apiError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                  {apiError}
                </div>
              )}

              <div className="space-y-4">
                {/* Preview card */}
                <div className="rounded-xl border-2 border-royal-100 bg-royal-50/30 p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-royal-500 to-royal-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">ER</div>
                    <div>
                      <p className="font-bold text-navy-900">{form.title || '(No title)'}</p>
                      <p className="text-xs text-slate-400">EduReach Foundation</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${form.type === 'Paid' ? 'bg-royal-50 text-royal-700' : 'bg-emerald-50 text-emerald-700'}`}>{form.type}</span>
                    {form.location && <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700">{form.location}</span>}
                    {form.category && <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{form.category}</span>}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{form.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.skills.map(s => (
                      <span key={s} className="text-xs bg-white border border-[#E2E8F0] text-navy-600 px-2.5 py-0.5 rounded-lg font-medium">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Summary rows */}
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: 'Duration',    value: form.duration || '—' },
                    { label: 'Deadline',    value: form.deadline ? new Date(form.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                    { label: 'Experience',  value: experienceOptions.find(o => o.value === form.experience)?.label || '—' },
                    { label: 'Positions',   value: form.seats || '1' },
                    ...(form.type === 'Paid' && form.budget ? [{ label: 'Budget', value: `₹${form.budget}${form.budgetMax ? ` – ₹${form.budgetMax}` : '+'}` }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold text-navy-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Once published, your task will be visible to all GivTask users. You can edit or close it from your dashboard at any time.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#F1F5F9]">
          <div>
            {step > 0 && (
              <Button variant="secondary" onClick={back} icon={<ArrowLeft size={15} />}>
                Back
              </Button>
            )}
          </div>
          <div>
            {step < 2 ? (
              <Button variant="primary" onClick={next} icon={<ArrowRight size={15} />} iconPosition="right">
                Continue
              </Button>
            ) : (
              <Button variant="primary" onClick={publish} icon={<PlusCircle size={15} />}>
                {isEditing ? 'Update task' : 'Publish task'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
