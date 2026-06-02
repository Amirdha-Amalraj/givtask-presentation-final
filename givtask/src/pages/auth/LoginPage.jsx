import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Zap } from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout.jsx'
import InputField from '../../components/ui/InputField.jsx'
import Button from '../../components/ui/Button.jsx'
import { useRole } from '../../context/RoleContext.jsx'
import { authApi } from '../../services/api.js'

const DEMO_ACCOUNTS = [
  { email: 'volunteer@demo.com',  password: 'demo1234', roleLabel: 'Volunteer'  },
  { email: 'freelancer@demo.com', password: 'demo1234', roleLabel: 'Freelancer' },
  { email: 'ngo@edureach.com',    password: 'demo1234', roleLabel: 'NGO'        },
  { email: 'admin@givtask.com',   password: 'admin123', roleLabel: 'Admin'      },
]

function AuthAside() {
  return (
    <div className="relative z-10 text-center max-w-sm w-full">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/70 text-xs font-medium mb-8">
        <Zap size={12} className="text-royal-300" />
        Connected to live backend
      </div>
      <h2 className="text-3xl font-bold text-white mb-3" style={{ letterSpacing: '-0.025em' }}>
        Good to have you back.
      </h2>
      <p className="text-navy-200 text-base mb-10 leading-relaxed">
        Sign in to access your role-specific dashboard — NGO, volunteer, freelancer, or admin.
      </p>
      <div className="p-4 bg-white/8 border border-white/10 rounded-2xl text-left">
        <p className="text-white/70 text-xs font-bold mb-3 uppercase tracking-wider">Demo accounts</p>
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map(a => (
            <div key={a.email} className="flex items-center justify-between text-xs gap-2">
              <span className="text-navy-300 truncate">{a.email}</span>
              <span className="text-white/40 flex-shrink-0 font-medium">{a.roleLabel}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 space-y-0.5">
          <p className="text-white/25 text-xs">Volunteer / Freelancer / NGO → demo1234</p>
          <p className="text-white/25 text-xs">Admin → admin123</p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useRole()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [roleHint, setRoleHint] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setApiError('')
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    const match = DEMO_ACCOUNTS.find(a => a.email === value.trim().toLowerCase())
    setRoleHint(match || null)
  }

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setApiError('')

    try {
      const user = await authApi.login(form.email.trim(), form.password)
      login(user.role, user.full_name, user.email, user.id, user.skills)

      const dashMap = {
        volunteer:  '/dashboard/volunteer',
        freelancer: '/dashboard/freelancer',
        ngo:        '/dashboard/ngo',
        admin:      '/admin',
      }
      const from = location.state?.from
      const dest = from && from !== '/login' ? from : (dashMap[user.role] || '/dashboard/volunteer')
      navigate(dest, { replace: true })
    } catch (err) {
      setApiError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (account) => {
    setForm({ email: account.email, password: account.password })
    setRoleHint(account)
    setErrors({})
    setApiError('')
  }

  return (
    <AuthLayout aside={<AuthAside />}>
      <div className="animate-fade-up">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-navy-900 mb-1.5" style={{ letterSpacing: '-0.025em' }}>
            Sign in to GivTask
          </h1>
          <p className="text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-royal-600 font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        {/* Quick demo pills */}
        <div className="mb-5">
          <p className="text-xs text-slate-400 font-medium mb-2">Quick demo login — click to fill:</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map(a => (
              <button
                key={a.email}
                type="button"
                onClick={() => fillDemo(a)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  roleHint?.email === a.email
                    ? 'border-royal-500 bg-royal-50 text-royal-700'
                    : 'border-[#E2E8F0] text-navy-700 hover:border-royal-300 hover:bg-royal-50'
                }`}
              >
                {a.roleLabel}
              </button>
            ))}
          </div>
          {roleHint && (
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Logging in as <strong>{roleHint.roleLabel}</strong>
            </p>
          )}
        </div>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-section space-y-5">
          <InputField
            label="Email address"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            icon={<Mail size={16} />}
            autoComplete="email"
            required
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            icon={<Lock size={16} />}
            autoComplete="current-password"
            required
          />

          <div className="flex justify-end -mt-2">
            <span className="text-sm text-slate-400 cursor-default select-none">Forgot password?</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            icon={<ArrowRight size={16} />}
            iconPosition="right"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
