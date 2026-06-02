import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, MapPin, FileText, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout.jsx'
import InputField from '../../components/ui/InputField.jsx'
import TextAreaField from '../../components/ui/TextAreaField.jsx'
import TagSelector from '../../components/ui/TagSelector.jsx'
import SelectField from '../../components/ui/SelectField.jsx'
import StepIndicator from '../../components/ui/StepIndicator.jsx'
import Button from '../../components/ui/Button.jsx'
import { skillsList, causesList } from '../../data/index.js'
import { authApi } from '../../services/api.js'
import { useRole } from '../../context/RoleContext.jsx'

const STEPS = [
  { label: 'Account' },
  { label: 'Profile' },
  { label: 'Skills' },
  { label: 'Done' },
]

const availabilityOptions = [
  { value: 'full-time', label: 'Full-time (40+ hrs/week)' },
  { value: 'part-time', label: 'Part-time (10–20 hrs/week)' },
  { value: 'weekends', label: 'Weekends only' },
  { value: 'flexible', label: 'Flexible / as needed' },
]

function SuccessStep({ name }) {
  const navigate = useNavigate()
  return (
    <div className="text-center py-4 animate-fade-up">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 size={32} className="text-emerald-500" />
      </div>
      <h2 className="text-2xl font-bold text-navy-900 mb-2">
        Welcome to GivTask, {name || 'Volunteer'}!
      </h2>
      <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
        Your volunteer profile is ready. Start exploring NGO opportunities that match your skills.
      </p>
      <div className="space-y-3">
        <Button variant="primary" fullWidth icon={<ArrowRight size={16} />} iconPosition="right" onClick={() => navigate('/dashboard/volunteer')}>
          Go to my dashboard
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate('/tasks')}>
          Browse volunteer tasks
        </Button>
      </div>
    </div>
  )
}

export default function VolunteerRegister() {
  const { login } = useRole()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    location: '', bio: '', availability: '',
    skills: [], causes: [],
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

  const toggleCause = (cause) => {
    const curr = form.causes
    update('causes', curr.includes(cause) ? curr.filter(c => c !== cause) : [...curr, cause])
  }

  const validateStep = () => {
    const e = {}
    if (step === 1) {
      if (!form.firstName.trim()) e.firstName = 'First name is required'
      if (!form.lastName.trim()) e.lastName = 'Last name is required'
      if (!form.email) e.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
      if (!form.password) e.password = 'Password is required'
      else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
      if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password'
      else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    }
    if (step === 2) {
      if (!form.location.trim()) e.location = 'Location is required'
      if (!form.bio.trim()) e.bio = 'Please add a short bio'
      if (!form.availability) e.availability = 'Please select your availability'
    }
    if (step === 3) {
      if (form.skills.length === 0) e.skills = 'Please select at least one skill'
    }
    return e
  }

  const next = async () => {
    const e = validateStep()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    if (step === 3) {
      // handled asynchronously below
      setLoading(true)
      setApiError('')
      try {
        const user = await authApi.register({
          full_name: (form.firstName + ' ' + form.lastName).trim(),
          email:     form.email,
          password:  form.password,
          role:      'volunteer',
          city:      (form.location || '').split(',')[0]?.trim() || '',
          state:     (form.location || '').split(',')[1]?.trim() || '',
          skills:    form.skills,
        })
        login('volunteer', user.full_name, user.email, user.id, user.skills)
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

  const back = () => setStep(s => s - 1)

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
              <h1 className="text-2xl font-bold text-navy-900" style={{ letterSpacing: '-0.025em' }}>
                Create your volunteer profile
              </h1>
              <p className="text-slate-500 text-sm mt-1">Step {step} of 3 — let's get you set up</p>
            </div>

            <StepIndicator steps={STEPS.slice(0, 3)} currentStep={step} />
          </>
        )}

        {step === 4 && <SuccessStep name={form.firstName} />}

        {step === 1 && (
          <div className="form-section space-y-5 animate-fade-up">
            <h2 className="text-base font-semibold text-navy-800 flex items-center gap-2">
              <User size={16} className="text-royal-500" />
              Account details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="First name" name="firstName" placeholder="Arjun" value={form.firstName} onChange={handleChange} error={errors.firstName} required />
              <InputField label="Last name" name="lastName" placeholder="Mehta" value={form.lastName} onChange={handleChange} error={errors.lastName} required />
            </div>
            <InputField label="Email address" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} icon={<Mail size={15} />} required />
            <InputField label="Password" name="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} error={errors.password} icon={<Lock size={15} />} hint="Use a mix of letters, numbers, and symbols" required />
            <InputField label="Confirm password" name="confirmPassword" type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} icon={<Lock size={15} />} required />
          </div>
        )}

        {step === 2 && (
          <div className="form-section space-y-5 animate-fade-up">
            <h2 className="text-base font-semibold text-navy-800 flex items-center gap-2">
              <FileText size={16} className="text-royal-500" />
              Your profile
            </h2>
            <InputField label="Location" name="location" placeholder="Mumbai, India" value={form.location} onChange={handleChange} error={errors.location} icon={<MapPin size={15} />} hint="City and country" required />
            <TextAreaField
              label="About you"
              name="bio"
              placeholder="Tell NGOs about yourself — your background, why you want to volunteer, and what drives you..."
              value={form.bio}
              onChange={handleChange}
              error={errors.bio}
              rows={4}
              maxLength={300}
              required
            />
            <SelectField
              label="Availability"
              name="availability"
              value={form.availability}
              onChange={handleChange}
              options={availabilityOptions}
              error={errors.availability}
              placeholder="How much time can you give?"
              required
            />
          </div>
        )}

        {step === 3 && (
          <div className="form-section space-y-6 animate-fade-up">
            <h2 className="text-base font-semibold text-navy-800">Skills &amp; Causes</h2>
            <TagSelector
              label="Your skills"
              options={skillsList}
              selected={form.skills}
              onToggle={toggleSkill}
              max={8}
              hint="Select up to 8 skills. These help NGOs find you."
              error={errors.skills}
              required
            />
            <TagSelector
              label="Causes you care about"
              options={causesList}
              selected={form.causes}
              onToggle={toggleCause}
              max={5}
              hint="Select up to 5 causes to personalise your feed."
            />
          </div>
        )}

        {step < 4 && (
          <div className={`flex gap-3 mt-5 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
            {step > 1 && (
              <Button variant="secondary" icon={<ArrowLeft size={15} />} onClick={back}>
                Back
              </Button>
            )}
            <Button
              variant="primary"
              icon={step === 3 ? null : <ArrowRight size={15} />}
              iconPosition="right"
              loading={loading}
              onClick={next}
              className="flex-1 justify-center"
            >
              {step === 3 ? 'Create my profile' : 'Continue'}
            </Button>
          </div>
        )}

        {step < 4 && (
          <p className="text-center text-xs text-slate-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-royal-600 font-medium hover:underline">Sign in</Link>
          </p>
        )}
      </div>
    </AuthLayout>
  )
}
