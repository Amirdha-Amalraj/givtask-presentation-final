import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { steps } from '../../data/index.js'
import { Building2, User, ArrowRight } from 'lucide-react'

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState(0)
  const current = steps[activeTab]

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-tag mb-4">How it works</span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Simple process,{' '}
            <span className="gradient-text display-serif">powerful outcomes</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Whether you're an NGO or a skilled contributor, getting started takes minutes.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-[#F1F5F9] rounded-2xl p-1.5 gap-1">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${activeTab === i
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-slate-500 hover:text-navy-700'
                  }`}
              >
                {i === 0 ? <Building2 size={15} /> : <User size={15} />}
                {s.role}
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden xl:block absolute top-10 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-royal-200 via-violet-200 to-royal-200 z-0" />

          {current.steps.map((step, i) => (
            <div
              key={step.number}
              className="relative flex flex-col items-start xl:items-center xl:text-center animate-fade-up animate-fill-both z-10"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Number bubble */}
              <div className="flex xl:justify-center mb-4">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-royal-200 flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-royal-600">{step.number}</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#F1F5F9] hover:border-royal-200 transition-all duration-200 hover:shadow-card w-full">
                <h3 className="text-navy-900 font-semibold text-base mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA row */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
          {activeTab === 0 ? (
            <>
              <Link
                to="/register/ngo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-royal-600 text-white font-semibold rounded-xl hover:bg-royal-700 transition-colors shadow-sm"
              >
                Register your NGO <ArrowRight size={15} />
              </Link>
              <Link
                to="/tasks"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-700 font-semibold rounded-xl border border-[#E2E8F0] hover:border-royal-300 transition-colors"
              >
                See how tasks work
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register/volunteer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors shadow-sm"
              >
                Join as volunteer <ArrowRight size={15} />
              </Link>
              <Link
                to="/register/freelancer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-700 font-semibold rounded-xl border border-[#E2E8F0] hover:border-violet-300 transition-colors"
              >
                Join as freelancer
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
