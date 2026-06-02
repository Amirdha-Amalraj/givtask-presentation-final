import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import Button from '../ui/Button.jsx'

export default function HeroSection() {
  return (
    <section className="relative hero-mesh overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      {/* Background grid dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-32 left-1/2 -translate-x-[60%] w-[480px] h-[480px] bg-royal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Announcement chip */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-full text-sm text-navy-700 shadow-sm mb-8 animate-fade-up animate-fill-both">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow" />
            <Sparkles size={13} className="text-royal-500" />
            <span className="font-medium">Launching soon — join the early community</span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold text-navy-900 mb-6 animate-fade-up animate-fill-both animate-delay-100"
            style={{ letterSpacing: '-0.03em', lineHeight: 1.08 }}
          >
            Connect NGOs with{' '}
            <span className="relative inline-block">
              <span className="gradient-text display-serif">skilled talent</span>
              <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" preserveAspectRatio="none">
                <path d="M0 3 Q50 0 100 3 Q150 6 200 3" stroke="url(#u)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="u" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB"/>
                    <stop offset="100%" stopColor="#7C3AED"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>{' '}
            for social good
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up animate-fill-both animate-delay-200">
            GivTask is the platform where purpose-driven NGOs find the developers, designers, writers, and experts they need — as volunteers or paid freelancers.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14 animate-fade-up animate-fill-both animate-delay-300">
            <Link to="/register">
              <Button variant="primary" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
                Join GivTask free
              </Button>
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById('how-it-works')
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="btn-secondary text-base px-7 py-3.5 inline-flex items-center gap-2"
            >
              <Play size={16} className="text-royal-500" />
              See how it works
            </button>
          </div>

          {/* Social proof row */}
          <div className="flex flex-wrap items-center justify-center gap-5 animate-fade-up animate-fill-both animate-delay-400">
            {[
              { label: 'Skill-based matching', color: 'bg-royal-500' },
              { label: 'Verified NGO profiles', color: 'bg-violet-500' },
              { label: 'Impact score system', color: 'bg-emerald-500' },
              { label: 'Free to get started', color: 'bg-amber-500' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-navy-600 font-medium">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Hero mockup card */}
        <div className="mt-16 md:mt-20 max-w-5xl mx-auto animate-fade-up animate-fill-both animate-delay-500">
          <div className="relative">
            {/* Glow under card */}
            <div className="absolute inset-x-8 -bottom-6 h-20 bg-royal-500/15 blur-2xl rounded-full" />

            <div className="relative bg-white rounded-3xl shadow-card border border-[#E8EDF4] overflow-hidden">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#F1F5F9] bg-[#FAFBFD]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FE5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 mx-3 h-6 bg-[#F1F5F9] rounded-md flex items-center px-3">
                  <span className="text-xs text-slate-400 font-mono">givtask.io/tasks</span>
                </div>
              </div>

              {/* Mock content */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: 'Build donation portal', org: 'EduReach Foundation', type: 'Volunteer', badge: 'bg-emerald-100 text-emerald-700', skills: ['React', 'Node.js'] },
                  { title: 'Design campaign materials', org: 'GreenEarth Initiative', type: 'Paid', badge: 'bg-royal-100 text-royal-700', skills: ['Figma', 'Branding'] },
                  { title: 'Write grant proposals', org: 'HopeHaven NGO', type: 'Volunteer', badge: 'bg-violet-100 text-violet-700', skills: ['Writing', 'Research'] },
                ].map((task, i) => (
                  <Link key={i} to="/tasks" className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#F1F5F9] hover:border-royal-200 transition-colors block hover:shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${task.badge}`}>{task.type}</span>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-royal-400 to-violet-500 opacity-80" />
                    </div>
                    <h4 className="text-navy-900 text-sm font-semibold mb-1 leading-tight">{task.title}</h4>
                    <p className="text-slate-400 text-xs mb-3">{task.org}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {task.skills.map(s => (
                        <span key={s} className="text-xs bg-white border border-[#E2E8F0] text-navy-600 px-2 py-0.5 rounded-md">{s}</span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
              {/* Browser mock footer */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-[#F1F5F9] bg-[#FAFBFD]">
                <span className="text-xs text-slate-400">Sample opportunities · Browse all tasks</span>
                <Link to="/tasks" className="text-xs font-semibold text-royal-600 hover:underline flex items-center gap-1">
                  Browse all tasks →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
