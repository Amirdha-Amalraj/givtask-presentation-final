import React from 'react'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

export default function MainLayout({ children, showFooter = true }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  )
}
