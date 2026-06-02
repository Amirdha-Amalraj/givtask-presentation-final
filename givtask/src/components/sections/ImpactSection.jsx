import React from 'react'
import { Link } from 'react-router-dom'
import { Target, Users, Briefcase, Star, Shield, Zap, Globe, ArrowRight } from 'lucide-react'

const platformFeatures = [
  {
    icon: Target,
    title: 'Skill-Based Matching',
    desc: 'Smart matching surfaces the right volunteers and freelancers for every NGO task based on verified skills and availability.',
    color: 'from-royal-500 to-royal-700',
    glow: 'bg-royal-500/10',
  },
  {
    icon: Shield,
    title: 'Verified NGO Profiles',
    desc: 'Every organisation on GivTask goes through a verification process so contributors can give their time with confidence.',
    color: 'from-emerald-500 to-emerald-700',
    glow: 'bg-emerald-500/10',
  },
  {
    icon: Briefcase,
    title: 'Volunteer & Paid Tasks',
    desc: 'NGOs can post both pro-bono volunteer tasks and paid freelance projects — all in one place, reaching the right people.',
    color: 'from-violet-500 to-violet-700',
    glow: 'bg-violet-500/10',
  },
  {
    icon: Star,
    title: 'Impact Score System',
    desc: 'Contributors earn a verifiable impact portfolio with every completed task — showcasing real social good alongside professional work.',
    color: 'from-amber-500 to-orange-600',
    glow: 'bg-amber-500/10',
  },
  {
    icon: Zap,
    title: 'Fast, Simple Workflow',
    desc: 'Post a task, get matched, collaborate, and mark complete — the end-to-end flow is streamlined for busy NGO teams.',
    color: 'from-royal-500 to-violet-600',
    glow: 'bg-royal-500/10',
  },
  {
    icon: Users,
    title: 'Community-Driven',
    desc: 'Built around a growing community of skilled people who believe professional expertise is one of the most powerful forms of giving.',
    color: 'from-violet-500 to-royal-600',
    glow: 'bg-violet-500/10',
  },
]

const pilotOrgs = [
  { name: 'EduReach Foundation',  country: 'India',       initial: 'E', color: 'from-royal-500 to-royal-700' },
  { name: 'GreenEarth Initiative',country: 'Kenya',       initial: 'G', color: 'from-emerald-500 to-emerald-700' },
  { name: 'HopeHaven NGO',        country: 'Philippines', initial: 'H', color: 'from-violet-500 to-violet-700' },
  { name: 'CodeForChange',        country: 'Bangladesh',  initial: 'C', color: 'from-indigo-500 to-indigo-700' },
  { name: 'WomenRise Collective', country: 'Nigeria',     initial: 'W', color: 'from-pink-500 to-rose-600' },
  { name: 'HealthBridge',         country: 'Indonesia',   initial: 'H', color: 'from-sky-500 to-sky-700' },
  { name: 'SafeWaters Trust',     country: 'Ethiopia',    initial: 'S', color: 'from-teal-500 to-teal-700' },
  { name: 'LiteracyFirst',        country: 'Pakistan',    initial: 'L', color: 'from-amber-500 to-orange-600' },
]

export default function ImpactSection() {
  return (
    <section id="impact" className="py-20 md:py-28 dark-mesh relative overflow-hidden">
      {/* Orbs */}
      <div className="absolute top-0 left-1/4 w-80 h-80 bg-royal-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white/80 rounded-full text-xs font-semibold uppercase tracking-widest mb-4">
            <Zap size={12} /> Platform capabilities
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Built for real{' '}
            <span className="display-serif text-royal-400">social impact</span>
          </h2>
          <p className="text-navy-200 text-lg max-w-xl mx-auto">
            GivTask is designed from the ground up to make skill-based volunteering and NGO collaboration effortless.
          </p>
        </div>

        {/* Feature capability cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {platformFeatures.map((f, i) => (
            <div
              key={f.title}
              className="group bg-white/6 backdrop-blur-sm border border-white/10 rounded-2xl p-6
                hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                <f.icon size={18} className="text-white" strokeWidth={1.8} />
              </div>
              <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
              <p className="text-navy-300 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Pilot NGOs */}
        <div className="bg-white/6 border border-white/10 rounded-3xl p-8 md:p-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-royal-400" />
              <h3 className="text-white font-semibold">Pilot organisations</h3>
            </div>
            <span className="text-xs font-semibold text-royal-400 bg-royal-400/10 border border-royal-400/20 px-3 py-1 rounded-full">
              Demo data
            </span>
          </div>
          <p className="text-navy-400 text-xs mb-6">
            Sample organisations shown for demonstration purposes. Actual partners will be listed at launch.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pilotOrgs.map(org => (
              <Link
                key={org.name}
                to="/profile/ngo"
                className="bg-white/8 rounded-xl p-3 border border-white/10 hover:border-royal-400/40 hover:bg-white/12 transition-all duration-200 block group"
              >
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${org.color} mb-2 flex items-center justify-center shadow-md`}>
                  <span className="text-white text-xs font-bold">{org.initial}</span>
                </div>
                <p className="text-white text-xs font-semibold leading-tight mb-0.5 group-hover:text-royal-300 transition-colors">{org.name}</p>
                <p className="text-navy-400 text-xs">{org.country}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-royal-600 hover:bg-royal-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-royal-900/40"
          >
            Get started free <ArrowRight size={15} />
          </Link>
          <p className="text-navy-400 text-xs mt-3">No credit card required</p>
        </div>
      </div>
    </section>
  )
}
