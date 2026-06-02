import React from 'react'
import MainLayout from '../components/layout/MainLayout.jsx'
import HeroSection from '../components/sections/HeroSection.jsx'
import FeaturesSection from '../components/sections/FeaturesSection.jsx'
import HowItWorksSection from '../components/sections/HowItWorksSection.jsx'
import ImpactSection from '../components/sections/ImpactSection.jsx'
import TestimonialsSection from '../components/sections/TestimonialsSection.jsx'
import CTASection from '../components/sections/CTASection.jsx'

export default function LandingPage() {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ImpactSection />
      <TestimonialsSection />
      <CTASection />
    </MainLayout>
  )
}
