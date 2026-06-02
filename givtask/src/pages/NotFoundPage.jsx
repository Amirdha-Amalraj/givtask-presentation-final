import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import Logo from '../components/ui/Logo.jsx'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen hero-mesh flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <Logo />
      </div>

      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-royal-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-glow-blue">
        <Compass size={36} className="text-white" />
      </div>

      <h1 className="text-5xl font-bold text-navy-900 mb-3 tracking-tight">404</h1>
      <p className="text-lg font-semibold text-navy-700 mb-2">Page not found</p>
      <p className="text-slate-500 text-sm max-w-sm mb-8">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-royal-600 text-white font-semibold rounded-xl hover:bg-royal-700 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} /> Back to home
        </Link>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-navy-700 font-semibold rounded-xl border border-[#E2E8F0] hover:border-royal-300 transition-colors shadow-sm"
        >
          Browse tasks
        </Link>
      </div>
    </div>
  )
}
