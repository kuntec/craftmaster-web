'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ImageIcon, Video, Globe, LayoutDashboard,
  CreditCard, History, Settings, LogOut,
  Zap, Code2, FolderOpen,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'
import Logo from '@/components/ui/Logo'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard',         icon: LayoutDashboard, exact: true },
  { label: 'Image',     href: '/dashboard/image',   icon: ImageIcon                    },
  { label: 'Video',     href: '/dashboard/video',   icon: Video                        },
  { label: 'Website',   href: '/dashboard/website', icon: Globe                        },
  { label: 'AI Builder',href: '/dashboard/builder', icon: Code2                        },
]

const BOTTOM_ITEMS = [
  { label: 'Credits',  href: '/dashboard/credits',  icon: CreditCard },
  { label: 'History',  href: '/dashboard/history',  icon: History    },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings   },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-56 flex flex-col z-50"
      style={{ background: '#0D0F1A', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >

      {/* Logo */}
      <div
        className="px-4 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Logo size={42} showText={true} />
      </div>

      {/* Credits badge */}
      <div
        className="px-3 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link
          href="/dashboard/credits"
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
          style={{
            background: 'rgba(123,47,190,0.12)',
            border:     '1px solid rgba(123,47,190,0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(123,47,190,0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(123,47,190,0.12)'
          }}
        >
          <Zap className="w-3.5 h-3.5" fill="currentColor" style={{ color: '#C4A8FF' }} />
          <span className="text-xs font-semibold" style={{ color: '#C4A8FF' }}>
            {user?.creditsBalance ?? 0} credits
          </span>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p
          className="text-[10px] font-bold uppercase tracking-wider px-3 mb-2"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          Tools
        </p>

        {NAV_ITEMS.map((item) => {
          const Icon   = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
              style={active ? {
                background:  'rgba(123,47,190,0.15)',
                color:       'white',
                borderLeft:  '2px solid #7B2FBE',
              } : {
                color: 'rgba(255,255,255,0.45)',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'white'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
                }
              }}
            >
              <Icon
                className="w-4 h-4 shrink-0"
                style={active ? {
                  color: '#C4A8FF',
                } : {}}
              />
              {item.label}
            </Link>
          )
        })}

        {/* Account section */}
        <div className="pt-5">
          <p
            className="text-[10px] font-bold uppercase tracking-wider px-3 mb-2"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            Account
          </p>
          {BOTTOM_ITEMS.map((item) => {
            const Icon   = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
                style={active ? {
                  background: 'rgba(123,47,190,0.15)',
                  color:      'white',
                  borderLeft: '2px solid #7B2FBE',
                } : {
                  color: 'rgba(255,255,255,0.45)',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.color = 'white'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
                  }
                }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={active ? { color: '#C4A8FF' } : {}}
                />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User + logout */}
      <div
        className="px-3 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* User info */}
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)' }}
          >
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              {user?.name}
            </p>
            <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm transition-all"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
            e.currentTarget.style.color = '#FCA5A5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
          }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}