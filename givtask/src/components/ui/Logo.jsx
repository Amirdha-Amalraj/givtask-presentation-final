import React from 'react'
import { Link } from 'react-router-dom'

export default function Logo({ size = 'md', white = false }) {
  const sizes = {
    sm: { icon: 22, text: 'text-lg' },
    md: { icon: 28, text: 'text-xl' },
    lg: { icon: 36, text: 'text-2xl' },
  }
  const { icon, text } = sizes[size] || sizes.md

  return (
    <Link to="/" className="inline-flex items-center gap-2.5 group select-none">
      {/* Icon mark */}
      <div
        className="relative flex-shrink-0 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
        style={{
          width: icon + 10,
          height: icon + 10,
          background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
          boxShadow: '0 2px 12px rgba(37,99,235,0.35)',
        }}
      >
        <svg
          width={icon * 0.65}
          height={icon * 0.65}
          viewBox="0 0 20 20"
          fill="none"
        >
          {/* G shape simplified as handshake / task check */}
          <path d="M3 10 C3 6.13 6.13 3 10 3 C12.5 3 14.7 4.2 16.1 6.1" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <path d="M10 7 L10 13 M7 11 L10 13 L13 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="16" cy="14" r="3" fill="white" fillOpacity="0.9"/>
          <path d="M15 14 L15.8 14.8 L17.2 13.4" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Wordmark */}
      <span
        className={`font-bold ${text} tracking-tight transition-colors duration-200
          ${white ? 'text-white' : 'text-navy-900'}`}
        style={{ letterSpacing: '-0.025em' }}
      >
        Giv<span className="text-royal-600">Task</span>
      </span>
    </Link>
  )
}
