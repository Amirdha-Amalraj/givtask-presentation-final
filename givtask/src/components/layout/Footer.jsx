import React from 'react'
import { Link } from 'react-router-dom'
import { Twitter, Linkedin, Github, Mail, ArrowRight } from 'lucide-react'
import Logo from '../ui/Logo.jsx'

const footerLinks = {
  Platform: [
    { label: 'Browse tasks',    href: '/tasks',              internal: true },
    { label: 'For NGOs',        href: '/register/ngo',       internal: true },
    { label: 'For Volunteers',  href: '/register/volunteer', internal: true },
    { label: 'For Freelancers', href: '/register/freelancer',internal: true },
  ],
  Dashboards: [
    { label: 'Volunteer dashboard', href: '/dashboard/volunteer', internal: true },
    { label: 'Freelancer dashboard',href: '/dashboard/freelancer',internal: true },
    { label: 'NGO dashboard',       href: '/dashboard/ngo',       internal: true },
    { label: 'Admin panel',         href: '/admin',               internal: true },
  ],
  Company: [
    { label: 'About us', href: '#' },
    { label: 'Blog',     href: '#' },
    { label: 'Careers',  href: '#' },
    { label: 'Press kit',href: '#' },
  ],
}

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Mail, href: '#', label: 'Email' },
]

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      {/* Top CTA strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Ready to make an <span className="display-serif text-royal-400">impact?</span>
              </h2>
              <p className="text-navy-200 text-sm">
                Be among the first NGOs and contributors to join the GivTask community.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-royal-600 text-white font-semibold rounded-xl
                hover:bg-royal-500 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-royal-900/40 flex-shrink-0"
            >
              Get started free
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Logo white />
            <p className="mt-3 text-navy-300 text-sm leading-relaxed max-w-xs">
              Connecting NGOs with skilled volunteers and freelancers to drive meaningful, lasting social impact.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-navy-300
                    hover:bg-white/20 hover:text-white transition-all duration-150"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.internal ? (
                      <Link
                        to={link.href}
                        className="text-navy-300 text-sm hover:text-white transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-navy-300 text-sm hover:text-white transition-colors duration-150"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-navy-400 text-xs">
            © {new Date().getFullYear()} GivTask. Built for social good.
          </p>
          <p className="text-navy-400 text-xs">
            Made with ♥ as a final-year project
          </p>
        </div>
      </div>
    </footer>
  )
}
