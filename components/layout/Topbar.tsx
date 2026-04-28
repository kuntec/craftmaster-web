'use client'
import { usePathname } from 'next/navigation'
import { Zap } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':          'Dashboard',
  '/dashboard/image':    'Image Generator',
  '/dashboard/video':    'Video Generator',
  '/dashboard/website':  'Website Builder',
  '/dashboard/credits':  'Credits',
  '/dashboard/history':  'History',
  '/dashboard/settings': 'Settings',
  '/dashboard/builder':  'AI Builder',
  '/dashboard/projects': 'Projects',
}

export default function Topbar() {
  const pathname = usePathname()
  const user     = useAuthStore((s) => s.user)
  const title    = PAGE_TITLES[pathname] ?? 'Dashboard'
  const low      = (user?.creditsBalance ?? 0) < 20

  return (
    <header
      className="h-14 flex items-center justify-between px-6"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background:   'rgba(13,15,26,0.8)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Page title */}
      <h1 className="text-sm font-bold text-white">
        {title}
      </h1>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Low credits warning */}
        {low && (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border:     '1px solid rgba(239,68,68,0.2)',
              color:      '#FCA5A5',
            }}
          >
            Low credits
          </span>
        )}

        {/* Credits button */}
        <Link
          href="/dashboard/credits"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
          style={{
            background: 'rgba(123,47,190,0.12)',
            border:     '1px solid rgba(123,47,190,0.25)',
          }}
        >
          <Zap className="w-3.5 h-3.5" fill="currentColor" style={{ color: '#C4A8FF' }} />
          <span className="text-xs font-bold" style={{ color: '#C4A8FF' }}>
            {user?.creditsBalance ?? 0} credits
          </span>
        </Link>
      </div>
    </header>
  )
}