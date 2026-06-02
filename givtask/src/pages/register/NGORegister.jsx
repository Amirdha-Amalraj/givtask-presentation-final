import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, Mail, Lock, MapPin, Globe, Phone, FileText, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout.jsx'
import InputField from '../../components/ui/InputField.jsx'
import TextAreaField from '../../components/ui/TextAreaField.jsx'
import TagSelector from '../../components/ui/TagSelector.jsx'
import SelectField from '../../components/ui/SelectField.jsx'
import StepIndicator from '../../components/ui/StepIndicator.jsx'
import Button from '../../components/ui/Button.jsx'
import { ngoCategories, causesList } from '../../data/index.js'
import { authApi } from '../../services/api.js'
import { useRole } from '../../context/RoleContext.jsx'

const STEPS = [
  { label: 'Account' },
  { label: 'Organisation' },
  { label: 'Mission' },
  { label: 'Done' },
]

const orgSizeOptions = [
  { value: 'micro', label: 'Micro (1–5 members)' },
  { value: 'small', label: 'Small (6–25 members)' },
  { value: 'medium', label: 'Medium (26–100 members)' },
  { value: 'large', label: 'Large (100+ members)' },
]

const foundedOptions = Array.from({ length: 55 }, (_, i) => {
  const year = 2024 - i
  return { value: String(year), label: String(year) }
})

function SuccessStep({ orgName }) {
  const navigate = useNavigate()
  return (
    <div className="text-center py-4 animate-fade-up">
      <div className="w-16 h-16 rounded-full bg-royal-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 size={32} className="text-royal-600" />
      </div>
      <h2 className="text-2xl font-bold text-navy-900 mb-2">
        {orgName ? `${orgName} is on GivTask!` : 'Your NGO is registered!'}
      </h2>
      <p className="text-slate-500 text-sm mb-2 max-w-xs mx-auto">
        Your profile is under review. Once verified, you can start posting tasks and connecting with skilled contributors.
      </p>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700 mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Verification usually takes 24–48 hours
      </div>
      <div className="space-y-3">
        <Button variant="primary" fullWidth icon={<ArrowRight size={16} />} iconPosition="right" onClick={() => navigate('/dashboard/ngo')}>
          Go to dashboard
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate('/tasks')}>
          Explore the platform
        </Button>
      </div>
    </div>
  )
}

export default function NGORegister() {
  const navigate  = useNavigate()
  const { login } = useRole()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    contactName: '', email: '', password: '', confirmPassword: '',
    orgName: '', regNumber: '', website: '', phone: '', location: '', founded: '', size: '',
    description: '', mission: '',
    categories: [], causes: [],
  })

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleChange = (e) => update(e.target.name, e.target.value)

  const toggleCategory = (cat) => {
    const curr = form.categories
    update('categories', curr.includes(cat) ? curr.filter(c => c !== cat) : [...curr, cat])
  }

  const toggleCause = (cause) => {
    const curr = form.causes
    update('causes', curr.includes(cause) ? curr.filter(c => c !== cause) : [...curr, cause])
  }

  const validateStep = () => {
    const e = {}
    if (step === 1) {
      if (!form.contactName.trim()) e.contactName = 'Contact name is required'
      if (!form.email) e.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
      if (!form.password) e.password = 'Password is required'
      else if (form.password.length < 8) e.password = 'Min. 8 characters'
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    }
    if (step === 2) {
      if (!form.orgName.trim()) e.orgName = 'Organisation name is required'
      if (!form.location.trim()) e.location = 'Location is required'
      if (!form.size) e.size = 'Select organisation size'
    }
    if (step === 3) {
      if (!form.description.trim()) e.description = 'Please describe your organisation'
      if (!form.mission.trim()) e.mission = 'Please describe your mission'
      if (form.categories.length === 0) e.categories = 'Select at least one category'
    }
    return e
  }

  const next = async () => {
    const e = validateStep()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    if (step === 3) {
      setLoading(true)
      setApiError('')
      try {
        const user = await authApi.register({
          full_name: form.orgName || form.contactName || 'NGO Organisation',
          email:     form.email,
          password:  form.password,
          role:      'ngo',
          city:      (form.location || '').split(',')[0]?.trim() || '',
          state:     (form.location || '').split(',')[1]?.trim() || '',
        })
        login('ngo', user.full_name, user.email, user.id)
        setStep(4)
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
        {step < 4 && (
          <>
            <div className="mb-6">
              <Link to="/register" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 transition-colors mb-4">
                <ArrowLeft size={14} />
                Back to role selection
              </Link>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-royal-600 flex items-center justify-center">
                  <Building2 size={14} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-navy-900" style={{ letterSpacing: '-0.025em' }}>
                  Register your NGO
                </h1>
              </div>
              <p className="text-slate-500 text-sm">Step {step} of 3 · All NGOs are manually verified</p>
            </div>
            <StepIndicator steps={STEPS.slice(0, 3)} currentStep={step} />
          </>
        )}

        {step === 4 && <SuccessStep orgName={form.orgName} />}

        {step === 1 && (
          <div className="form-section space-y-5 animate-fade-up">
            <h2 className="text-base font-semibold text-navy-800 flex items-center gap-2">
              <Mail size={16} className="text-royal-500" /> Primary contact account
            </h2>
            <InputField label="Your full name" name="contactName" placeholder="Priya Nair" value={form.contactName} onChange={handleChange} error={errors.contactName} required />
            <InputField label="Work email" name="email" type="email" placeholder="priya@yourNGO.org" value={form.email} onChange={handleChange} error={errors.email} icon={<Mail size={15} />} hint="Use your organisation email if possible" required />
            <InputField label="Password" name="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} error={errors.password} icon={<Lock size={15} />} required />
            <InputField label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} icon={<Lock size={15} />} required />
          </div>
        )}

        {step === 2 && (
          <div className="form-section space-y-5 animate-fade-up">
            <h2 className="text-base font-semibold text-navy-800 flex items-center gap-2">
              <Building2 size={16} className="text-royal-500" /> Organisation details
            </h2>
            <InputField label="Organisation name" name="orgName" placeholder="EduReach Foundation" value={form.orgName} onChange={handleChange} error={errors.orgName} required />
            <InputField label="Registration number" name="regNumber" placeholder="e.g. 80G / 12A number" value={form.regNumber} onChange={handleChange} error={errors.regNumber} hint="Optional — helps with verification" />
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Founded in" name="founded" value={form.founded} onChange={handleChange} options={foundedOptions} placeholder="Year" />
              <SelectField label="Organisation size" name="size" value={form.size} onChange={handleChange} options={orgSizeOptions} error={errors.size} placeholder="Select size" required />
            </div>
            <InputField label="Headquarters location" name="location" placeholder="Chennai, India" value={form.location} onChange={handleChange} error={errors.location} icon={<MapPin size={15} />} required />
            <InputField label="Website" name="website" type="url" placeholder="https://yourNGO.org" value={form.website} onChange={handleChange} icon={<Globe size={15} />} hint="Optional" />
            <InputField label="Phone number" name="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} icon={<Phone size={15} />} hint="Optional" />
          </div>
        )}

        {step === 3 && (
          <div className="form-section space-y-6 animate-fade-up">
            <h2 className="text-base font-semibold text-navy-800 flex items-center gap-2">
              <FileText size={16} className="text-royal-500" /> Mission &amp; Focus areas
            </h2>
            <TextAreaField
              label="About your organisation"
              name="description"
              placeholder="Describe what your organisation does, its history, and key achievements..."
              value={form.description}
              onChange={handleChange}
              error={errors.description}
              rows={3}
              maxLength={400}
              required
            />
            <TextAreaField
              label="Your mission statement"
              name="mission"
              placeholder="What problem are you solving? What change do you want to see in the world?"
              value={form.mission}
              onChange={handleChange}
              error={errors.mission}
              rows={3}
              maxLength={300}
              required
            />
            <TagSelector
              label="Organisation category"
              options={ngoCategories}
              selected={form.categories}
              onToggle={toggleCategory}
              max={3}
              hint="Select up to 3 categories"
              error={errors.categories}
              required
            />
            <TagSelector
              label="Causes you work on"
              options={causesList}
              selected={form.causes}
              onToggle={toggleCause}
              max={5}
              hint="Select up to 5 causes"
            />
          </div>
        )}

        {step < 4 && (
          <div className={`flex gap-3 mt-5 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
            {step > 1 && (
              <Button variant="secondary" icon={<ArrowLeft size={15} />} onClick={() => setStep(s => s - 1)}>Back</Button>
            )}
            <Button variant="primary" icon={step === 3 ? null : <ArrowRight size={15} />} iconPosition="right" loading={loading} onClick={next} className="flex-1 justify-center">
              {step === 3 ? 'Submit for review' : 'Continue'}
            </Button>
          </div>
        )}

        {step < 4 && (
          <p className="text-center text-xs text-slate-400 mt-4">
            Already registered?{' '}
            <Link to="/login" className="text-royal-600 font-medium hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </AuthLayout>
  )
}
