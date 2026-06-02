import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Users, Briefcase, Building2, ArrowRight } from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout.jsx'
import RoleCard from '../../components/ui/RoleCard.jsx'
import Button from '../../components/ui/Button.jsx'
import { useRole } from '../../context/RoleContext.jsx'

const roles = [
  {
    id: 'volunteer',
    icon: Users,
    title: 'Volunteer',
    description: 'Give your skills and time to NGO projects that align with causes you care about.',
    perks: [
      'Browse volunteer-only opportunities',
      'Build an impact portfolio',
      'Earn skill badges & recognition',
      'No payment required',
    ],
    color: 'violet',
    href: '/register/volunteer',
  },
  {
    id: 'freelancer',
    icon: Briefcase,
    title: 'Freelancer',
    description: 'Take on paid NGO projects. Do meaningful work and get fairly compensated for it.',
    perks: [
      'Access paid NGO contracts',
      'Showcase NGO project portfolio',
      'Secure escrow-based payments',
      'Grow your social impact score',
    ],
    color: 'navy',
    href: '/register/freelancer',
  },
  {
    id: 'ngo',
    icon: Building2,
    title: 'NGO / Organisation',
    description: 'Find qualified volunteers and freelancers to power your mission and deliver projects.',
    perks: [
      'Post volunteer & paid tasks',
      'Browse skill-matched candidates',
      'Verified NGO badge on profile',
      'Track project outcomes',
    ],
    color: 'royal',
    href: '/register/ngo',
  },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useRole()
  const [selected, setSelected] = useState(null)

  const handleContinue = () => {
    if (selected) {
      const role = roles.find(r => r.id === selected)
      navigate(role.href)
    }
  }

  return (
    <AuthLayout>
      <div className="animate-fade-up max-w-3xl mx-auto w-full px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-navy-900 mb-2" style={{ letterSpacing: '-0.025em' }}>
            How will you use GivTask?
          </h1>
          <p className="text-slate-500 text-sm">
            Choose your role to get the right experience. You can always change this later.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              icon={role.icon}
              title={role.title}
              description={role.description}
              perks={role.perks}
              color={role.color}
              selected={selected === role.id}
              onClick={() => setSelected(role.id)}
            />
          ))}
        </div>

        {/* Continue button */}
        <div className="flex flex-col items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selected}
            icon={<ArrowRight size={16} />}
            iconPosition="right"
            onClick={handleContinue}
          >
            {selected
              ? `Continue as ${roles.find(r => r.id === selected)?.title} →`
              : 'Select a role above to continue'
            }
          </Button>

          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-royal-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
