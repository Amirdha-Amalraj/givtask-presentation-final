import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, Building2, Briefcase } from 'lucide-react'

export default function CTASection() {
  const roles = [
    {
      icon: Building2,
      title: 'I represent an NGO',
      desc: 'Find skilled people for your mission',
      href: '/register/ngo',
      gradient: 'from-royal-600 to-royal-800',
      pill: 'For NGOs',
      pillColor: 'bg-royal-100 text-royal-700',
    },
    {
      icon: Users,
      title: 'I want to volunteer',
      desc: 'Give your skills, make a difference',
      href: '/register/volunteer',
      gradient: 'from-violet-600 to-violet-800',
      pill: 'Volunteers',
      pillColor: 'bg-violet-100 text-violet-700',
    },
    {
      icon: Briefcase,
      title: 'I\'m a freelancer',
      desc: 'Take paid NGO projects, build impact',
      href: '/register/freelancer',
      gradient: 'from-navy-700 to-navy-900',
      pill: 'Freelancers',
      pillColor: 'bg-navy-100 text-navy-700',
    },
  ]

  return (
    <section className="py-20 md:py-28 bg-white" id="for-ngos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-tag mb-4">Get started</span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Join as{' '}
            <span className="gradient-text display-serif">who you are</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Three paths, one mission — to connect purpose with talent.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map(({ icon: Icon, title, desc, href, gradient, pill, pillColor }) => (
            <Link
              key={href}
              to={href}
              className="group relative overflow-hidden rounded-3xl bg-white border border-[#E8EDF4] p-8
                hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              {/* Background gradient on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              {/* Content */}
              <div className="relative z-10">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5 transition-colors duration-300 ${pillColor} group-hover:bg-white/20 group-hover:text-white`}>
                  {pill}
                </span>

                <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] group-hover:bg-white/20 flex items-center justify-center mb-4 transition-all duration-300">
                  <Icon size={22} className="text-navy-700 group-hover:text-white transition-colors duration-300" />
                </div>

                <h3 className="text-navy-900 group-hover:text-white font-bold text-lg mb-2 transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-slate-500 group-hover:text-white/80 text-sm mb-6 transition-colors duration-300">
                  {desc}
                </p>

                <div className="flex items-center gap-2 text-royal-600 group-hover:text-white font-semibold text-sm transition-colors duration-300">
                  Create account
                  <ArrowRight size={15} className="transform group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
