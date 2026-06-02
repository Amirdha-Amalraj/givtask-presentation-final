import React from 'react'
import { testimonials } from '../../data/index.js'
import TestimonialCard from '../ui/TestimonialCard.jsx'

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="section-tag mb-4">What people are saying</span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Built for the people{' '}
            <span className="gradient-text display-serif">driving change</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Here's what NGOs, volunteers, and freelancers are looking for in a platform like GivTask.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-semibold text-amber-700">
            ✦ Sample personas for demonstration
          </div>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.id} {...t} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
