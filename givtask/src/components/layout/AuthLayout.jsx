import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../ui/Logo.jsx'

export default function AuthLayout({ children, aside }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — form */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC]">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-5 md:px-10">
          <Logo />
          <Link to="/" className="text-xs text-slate-400 hover:text-navy-700 transition-colors font-medium hidden sm:block">
            ← Back to home
          </Link>
        </header>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md md:max-w-3xl">
            {children}
          </div>
        </div>

        {/* Footer note */}
        <footer className="px-6 py-4 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} GivTask · <Link to="#" className="hover:text-navy-600">Privacy</Link> · <Link to="#" className="hover:text-navy-600">Terms</Link>
          </p>
        </footer>
      </div>

      {/* Right panel — decorative (desktop only) */}
      {aside && (
        <aside className="hidden lg:flex w-[44%] xl:w-[48%] dark-mesh flex-col items-center justify-center p-12 relative overflow-hidden">
          {/* Decorative glow orbs */}
          <div className="absolute top-1/4 -left-16 w-72 h-72 bg-royal-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -right-16 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
          {aside}
        </aside>
      )}
    </div>
  )
}
