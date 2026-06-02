import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Search, Bell, ChevronDown, Menu, X, LogOut, Settings, User, ChevronRight } from 'lucide-react'
import Logo from '../ui/Logo.jsx'
import { volunteerNotifications, freelancerNotifications, ngoNotifications, adminNotifications } from '../../data/index.js'
import { useRole } from '../../context/RoleContext.jsx'

function NavItem({ icon: Icon, label, href, badge, active, collapsed, onClick }) {
  return (
    <Link
      to={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
        ${active
          ? 'bg-white/12 text-white shadow-sm border border-white/10'
          : 'text-slate-400 hover:bg-white/8 hover:text-white'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <Icon size={17} strokeWidth={active ? 2 : 1.8} className="flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}

function UserDropdown({ user, logout }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/8 transition-colors"
      >
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.avatarColor || 'from-royal-500 to-violet-600'} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md`}>
          {user.initials}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
          <p className="text-[10px] text-slate-500 leading-tight">{user.roleLabel}</p>
        </div>
        <ChevronDown size={13} className="text-slate-600 hidden md:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-[#1C2128] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-white/8">
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <div className="p-1.5">
            {[
              { icon: User,     label: 'View profile', href: user.profileHref },
              { icon: Settings, label: 'Settings',     href: '#' },
            ].map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                to={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-colors"
              >
                <Icon size={14} />{label}
              </Link>
            ))}
            <button
              onClick={() => { setOpen(false); logout(); navigate('/login') }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={14} />Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardLayout({ children, navItems, user, pageTitle }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, logout } = useRole()
  const [collapsed, setCollapsed]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen]   = useState(false)

  // Pick role-specific notifications
  const roleNotifs = role === 'freelancer' ? freelancerNotifications
    : role === 'ngo'       ? ngoNotifications
    : role === 'admin'     ? adminNotifications
    : volunteerNotifications
  const unread = roleNotifs.filter(n => !n.read).length

  useEffect(() => { setMobileOpen(false) }, [location])
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const SidebarInner = ({ mobile = false }) => (
    <aside className={`
      flex flex-col bg-[#0D1117] border-r border-white/8 transition-all duration-300
      ${mobile ? 'w-64 h-full' : collapsed ? 'w-[60px]' : 'w-60'}
    `}>
      {/* Logo */}
      <div className={`flex items-center h-14 px-4 border-b border-white/8 ${collapsed && !mobile ? 'justify-center' : 'justify-between'}`}>
        {(!collapsed || mobile) && <Logo size="sm" light />}
        {collapsed && !mobile && (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-royal-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold">G</div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/8 transition-colors"
          >
            <ChevronRight size={14} className={`transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg text-slate-500 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map(item => (
          <NavItem
            key={item.href}
            {...item}
            active={location.pathname === item.href}
            collapsed={collapsed && !mobile}
            onClick={mobile ? () => setMobileOpen(false) : undefined}
          />
        ))}
      </nav>

      {/* Bottom user chip (expanded only) */}
      {(!collapsed || mobile) && (
        <div className="p-3 border-t border-white/8">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-default">
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${user.avatarColor || 'from-royal-500 to-violet-600'} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
              {user.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-600 truncate">{user.roleLabel}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )

  return (
    <div className="flex h-screen bg-[#0D1117] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <SidebarInner />
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div className={`absolute left-0 top-0 h-full transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarInner mobile />
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-[#0D1117] border-b border-white/8 flex items-center px-4 md:px-5 gap-4 flex-shrink-0">
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white truncate hidden sm:block">{pageTitle}</h1>
          </div>

          {/* Search */}
          <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2 w-52 hover:border-white/15 transition-colors">
            <Search size={13} className="text-slate-600 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-white placeholder:text-slate-600 outline-none w-full"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="relative p-2 rounded-xl hover:bg-white/8 text-slate-500 hover:text-white transition-colors"
            >
              <Bell size={17} />
              {unread > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#1C2128] rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                  <span className="text-sm font-bold text-white">Notifications</span>
                  {unread > 0 && <span className="text-[10px] font-bold text-royal-400 bg-royal-400/10 px-2 py-0.5 rounded-full">{unread} new</span>}
                </div>
                <div className="max-h-72 overflow-y-auto scrollbar-thin divide-y divide-white/5">
                  {roleNotifs.map(n => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-white/4 transition-colors ${!n.read ? 'bg-royal-500/5' : ''}`}>
                      <p className="text-xs text-slate-300 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-white/5 text-center">
                  <button className="text-xs text-royal-400 hover:text-royal-300 font-semibold">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          <UserDropdown user={user} logout={logout} />
        </header>

        {/* Page scroll area */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  )
}
