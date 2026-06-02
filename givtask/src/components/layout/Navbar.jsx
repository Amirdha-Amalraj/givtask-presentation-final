import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, LayoutDashboard, Search, ChevronDown, LogOut } from 'lucide-react'
import Logo from '../ui/Logo.jsx'
import Button from '../ui/Button.jsx'

const landingLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features',     href: '#features' },
  { label: 'For NGOs',     href: '#for-ngos' },
  { label: 'Impact',       href: '#impact' },
]

// Links shown on all non-landing public pages (tasks, profiles, etc.)
const publicLinks = [
  { label: 'Browse tasks',  href: '/tasks' },
  { label: 'For NGOs',      href: '/register/ngo' },
  { label: 'Volunteer',     href: '/register/volunteer' },
  { label: 'Freelancer',    href: '/register/freelancer' },
]

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()

  const isLanding   = location.pathname === '/'
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')
  const isProfile = location.pathname.startsWith('/profile')
  const isAuth      = location.pathname.startsWith('/login') || location.pathname.startsWith('/register')

  // All hooks must be called before any conditional return (React Rules of Hooks)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Don't render Navbar inside dashboard (DashboardLayout has its own topbar)
  if (isDashboard) return null

  const handleAnchor = (e, href) => {
    if (href.startsWith('#') && isLanding) {
      e.preventDefault()
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (href.startsWith('#') && !isLanding) {
      e.preventDefault()
      navigate('/' + href)
    }
  }

  const activeLinks = isLanding ? landingLinks : publicLinks

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300
          ${scrolled || !isLanding || isAuth
            ? 'bg-white/95 backdrop-blur-md shadow-nav'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {activeLinks.map((link) => (
                link.href.startsWith('#') ? (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleAnchor(e, link.href)}
                    className={`nav-link px-3 py-2 rounded-lg hover:bg-navy-50 ${
                      !isLanding && scrolled ? 'text-navy-700' : ''
                    }`}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`nav-link px-3 py-2 rounded-lg hover:bg-navy-50 ${
                      location.pathname === link.href ? 'text-royal-600 font-semibold' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {!isAuth && (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Sign in</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">Get started free</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-navy-700 hover:bg-navy-50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={`absolute top-0 right-0 w-72 h-full bg-white shadow-2xl flex flex-col
            transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex items-center justify-between p-4 border-b border-[#F1F5F9]">
            <Logo size="sm" />
            <button
              className="p-2 rounded-lg text-navy-700 hover:bg-navy-50"
              onClick={() => setMobileOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {activeLinks.map((link) => (
              link.href.startsWith('#') ? (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => { handleAnchor(e, link.href); setMobileOpen(false) }}
                  className="flex items-center px-3 py-2.5 rounded-xl text-navy-700 font-medium hover:bg-navy-50 transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-xl font-medium hover:bg-navy-50 transition-colors ${
                    location.pathname === link.href ? 'text-royal-600 bg-royal-50' : 'text-navy-700'
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}

            {/* Mobile-only extra links */}
            <div className="pt-3 mt-3 border-t border-[#F1F5F9] space-y-1">
              <Link
                to="/tasks"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-navy-700 font-medium hover:bg-navy-50 transition-colors"
              >
                <Search size={16} className="text-slate-400" /> Browse tasks
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-navy-700 font-medium hover:bg-navy-50 transition-colors"
              >
                <LayoutDashboard size={16} className="text-slate-400" /> Sign in to dashboard
              </Link>
            </div>
          </nav>

          <div className="p-4 border-t border-[#F1F5F9] space-y-2">
            <Link to="/login" className="block" onClick={() => setMobileOpen(false)}>
              <Button variant="secondary" fullWidth>Sign in</Button>
            </Link>
            <Link to="/register" className="block" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" fullWidth>Get started free</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
