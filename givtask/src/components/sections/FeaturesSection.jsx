import React from 'react'
import { features } from '../../data/index.js'
import FeatureCard from '../ui/FeatureCard.jsx'

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="section-tag mb-4">Platform features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Everything you need to drive{' '}
            <span className="gradient-text display-serif">real impact</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            A complete toolkit for NGOs, volunteers, and freelancers to connect, collaborate, and measure outcomes.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
