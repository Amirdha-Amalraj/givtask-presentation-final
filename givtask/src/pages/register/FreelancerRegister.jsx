import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, MapPin, Briefcase, DollarSign, Globe, CheckCircle2, ArrowLeft, ArrowRight, Plus, X } from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout.jsx'
import InputField from '../../components/ui/InputField.jsx'
import TextAreaField from '../../components/ui/TextAreaField.jsx'
import TagSelector from '../../components/ui/TagSelector.jsx'
import SelectField from '../../components/ui/SelectField.jsx'
import StepIndicator from '../../components/ui/StepIndicator.jsx'
import Button from '../../components/ui/Button.jsx'
import { skillsList } from '../../data/index.js'
import { authApi } from '../../services/api.js'
import { useRole } from '../../context/RoleContext.jsx'

const STEPS = [
  { label: 'Account' },
  { label: 'Profile' },
  { label: 'Work' },
  { label: 'Skills' },
]

const experienceOptions = [
  { value: 'entry', label: 'Entry level (0–1 years)' },
  { value: 'junior', label: 'Junior (1–3 years)' },
  { value: 'mid', label: 'Mid-level (3–5 years)' },
  { value: 'senior', label: 'Senior (5–8 years)' },
  { value: 'expert', label: 'Expert (8+ years)' },
]

const rateOptions = [
  { value: 'under-500', label: 'Under ₹500/hr' },
  { value: '500-1500', label: '₹500 – ₹1,500/hr' },
  { value: '1500-3000', label: '₹1,500 – ₹3,000/hr' },
  { value: '3000-5000', label: '₹3,000 – ₹5,000/hr' },
  { value: 'above-5000', label: 'Above ₹5,000/hr' },
  { value: 'negotiable', label: 'Negotiable per project' },
]

function SuccessStep({ name }) {
  const navigate = useNavigate()
  return (
    <div className="text-center py-4 animate-fade-up">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 size={32} className="text-emerald-500" />
      </div>
      <h2 className="text-2xl font-bold text-navy-900 mb-2">
        Profile created, {name || 'Freelancer'}!
      </h2>
      <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
        Start browsing paid NGO opportunities matched to your skills and experience level.
      </p>
      <div className="space-y-3">
        <Button variant="primary" fullWidth icon={<ArrowRight size={16} />} iconPosition="right" onClick={() => navigate('/dashboard/freelancer')}>
          Go to my dashboard
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate('/tasks')}>
          Browse paid projects
        </Button>
      </div>
    </div>
  )
}

export default function FreelancerRegister() {
  const { login } = useRole()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [errors, setErrors] = useState({})
  const [portfolioItem, setPortfolioItem] = useState({ title: '', url: '' })

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    location: '', bio: '', experience: '', rate: '', website: '',
    portfolio: [],
    skills: [],
  })

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleChange = (e) => update(e.target.name, e.target.value)

  const toggleSkill = (skill) => {
    const curr = form.skills
    update('skills', curr.includes(skill) ? curr.filter(s => s !== skill) : [...curr, skill])
  }

  const addPortfolioItem = () => {
    if (portfolioItem.title.trim()) {
      update('portfolio', [...form.portfolio, { ...portfolioItem }])
      setPortfolioItem({ title: '', url: '' })
    }
  }

  const removePortfolioItem = (i) => {
    update('portfolio', form.portfolio.filter((_, idx) => idx !== i))
  }

  const validateStep = () => {
    const e = {}
    if (step === 1) {
      if (!form.firstName.trim()) e.firstName = 'First name is required'
      if (!form.lastName.trim()) e.lastName = 'Last name is required'
      if (!form.email) e.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
      if (!form.password) e.password = 'Password is required'
      else if (form.password.length < 8) e.password = 'Min. 8 characters'
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    }
    if (step === 2) {
      if (!form.location.trim()) e.location = 'Location is required'
      if (!form.bio.trim()) e.bio = 'Please add a short bio'
    }
    if (step === 3) {
      if (!form.experience) e.experience = 'Select your experience level'
      if (!form.rate) e.rate = 'Select your rate range'
    }
    if (step === 4) {
      if (form.skills.length === 0) e.skills = 'Select at least one skill'
    }
    return e
  }

  const next = async () => {
    const e = validateStep()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    if (step === 4) {
      setLoading(true)
      setApiError('')
      try {
        const user = await authApi.register({
          full_name: (form.firstName + ' ' + form.lastName).trim(),
          email:     form.email,
          password:  form.password,
          role:      'freelancer',
          city:      (form.location || '').split(',')[0]?.trim() || '',
          state:     (form.location || '').split(',')[1]?.trim() || '',
          skills:    form.skills,
        })
        login('freelancer', user.full_name, user.email, user.id, user.skills)
        setStep(5)
      } catch (err) {
        setApiError(err.message || 'Registration failed. Please try again.')
      } finally {
        setLoading(false)
      }
      return
    }
    setStep(s => s + 1)
    setErrors({})
  }

  return (
    <AuthLayout>
      <div className="animate-fade-up w-full max-w-lg mx-auto">
        {step < 5 && (
          <>
            <div className="mb-6">
              <Link to="/register" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 transition-colors mb-4">
                <ArrowLeft size={14} />
                Back to role selection
              </Link>
              <h1 className="text-2xl font-bold text-navy-900" style={{ letterSpacing: '-0.025em' }}>
                Create your freelancer profile
              </h1>
              <p className="text-slate-500 text-sm mt-1">Step {step} of 4</p>
            </div>
            <StepIndicator steps={STEPS} currentStep={step} />
          </>
        )}

        {step === 5 && <SuccessStep name={form.firstName} />}

        {step === 1 && (
          <div className="form-section space-y-5 animate-fade-up">
            <h2 className="text-base font-semibold text-navy-800 flex items-center gap-2">
              <User size={16} className="text-royal-500" /> Account details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="First name" name="firstName" placeholder="Kabir" value={form.firstName} onChange={handleChange} error={errors.firstName} required />
              <InputField label="Last name" name="lastName" placeholder="Singh" value={form.lastName} onChange={handleChange} error={errors.lastName} required />
            </div>
            <InputField label="Email address" name="email" type="email" placeholder="kabir@example.com" value={form.email} onChange={handleChange} error={errors.email} icon={<Mail size={15} />} required />
            <InputField label="Password" name="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} error={errors.password} icon={<Lock size={15} />} required />
            <InputField label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} icon={<Lock size={15} />} required />
          </div>
        )}

        {step === 2 && (
          <div className="form-section space-y-5 animate-fade-up">
            <h2 className="text-base font-semibold text-navy-800 flex items-center gap-2">
              <User size={16} className="text-royal-500" /> Public profile
            </h2>
            <InputField label="Location" name="location" placeholder="Bangalore, India" value={form.location} onChange={handleChange} error={errors.location} icon={<MapPin size={15} />} required />
            <InputField label="Personal website / portfolio URL" name="website" type="url" placeholder="https://yoursite.com" value={form.website} onChange={handleChange} error={errors.website} icon={<Globe size={15} />} hint="Optional but recommended" />
            <TextAreaField
              label="Professional bio"
              name="bio"
              placeholder="Describe your expertise, the type of projects you love, and why NGO work excites you..."
              value={form.bio}
              onChange={handleChange}
              error={errors.bio}
              rows={4}
              maxLength={350}
              required
            />
          </div>
        )}

        {step === 3 && (
          <div className="form-section space-y-5 animate-fade-up">
            <h2 className="text-base font-semibold text-navy-800 flex items-center gap-2">
              <Briefcase size={16} className="text-royal-500" /> Work details
            </h2>
            <SelectField label="Experience level" name="experience" value={form.experience} onChange={handleChange} options={experienceOptions} error={errors.experience} placeholder="Select experience level" required />
            <SelectField label="Hourly rate range" name="rate" value={form.rate} onChange={handleChange} options={rateOptions} error={errors.rate} placeholder="Select your rate" required />

            {/* Portfolio links */}
            <div>
              <label className="label">Portfolio items <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="space-y-2 mb-3">
                {form.portfolio.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-800 truncate">{item.title}</p>
                      {item.url && <p className="text-xs text-slate-400 truncate">{item.url}</p>}
                    </div>
                    <button type="button" onClick={() => removePortfolioItem(i)} className="text-slate-400 hover:text-red-500 p-1 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Project title"
                  value={portfolioItem.title}
                  onChange={e => setPortfolioItem(p => ({ ...p, title: e.target.value }))}
                  className="input-field flex-1"
                />
                <input
                  type="url"
                  placeholder="URL (optional)"
                  value={portfolioItem.url}
                  onChange={e => setPortfolioItem(p => ({ ...p, url: e.target.value }))}
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={addPortfolioItem}
                  className="px-4 py-2.5 bg-royal-50 text-royal-600 rounded-xl hover:bg-royal-100 transition-colors text-sm font-semibold flex items-center gap-1 flex-shrink-0"
                >
                  <Plus size={15} />
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="form-section space-y-6 animate-fade-up">
            <h2 className="text-base font-semibold text-navy-800">Skills</h2>
            <TagSelector
              label="Your professional skills"
              options={skillsList}
              selected={form.skills}
              onToggle={toggleSkill}
              max={10}
              hint="Select up to 10 skills. NGOs use these to find you."
              error={errors.skills}
              required
            />
          </div>
        )}

        {step < 5 && (
          <div className={`flex gap-3 mt-5 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
            {step > 1 && (
              <Button variant="secondary" icon={<ArrowLeft size={15} />} onClick={() => setStep(s => s - 1)}>Back</Button>
            )}
            <Button variant="primary" icon={step === 4 ? null : <ArrowRight size={15} />} iconPosition="right" loading={loading} onClick={next} className="flex-1 justify-center">
              {step === 4 ? 'Create profile' : 'Continue'}
            </Button>
          </div>
        )}

        {step < 5 && (
          <p className="text-center text-xs text-slate-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-royal-600 font-medium hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </AuthLayout>
  )
}
