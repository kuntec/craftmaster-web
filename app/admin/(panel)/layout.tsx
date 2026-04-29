'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Users, CreditCard,
  ImageIcon, LogOut, Shield,
  TrendingUp, Activity,
} from 'lucide-react'
import { useAdminStore } from '@/store/adminAuth'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Overview',    href: '/admin',              icon: LayoutDashboard, exact: true },
  { label: 'Users',       href: '/admin/users',        icon: Users                        },
  { label: 'Payments',    href: '/admin/payments',     icon: CreditCard                   },
  { label: 'Generations', href: '/admin/generations',  icon: ImageIcon                    },
]

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router   = useRouter()
  const pathname = usePathname()
  const { admin, logout } = useAdminStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  if (!mounted) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: '#080A12' }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: '#7B2FBE', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }


  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080A12' }}>

      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen w-56 flex flex-col z-50"
        style={{ background: '#0D0F1A', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div
          className="px-4 py-4 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #7B2FBE, #4F8EF7)' }}
          >
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold">Admin Panel</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Studio42</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(item => {
            const Icon   = item.icon
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={active ? {
                  background: 'rgba(123,47,190,0.15)',
                  color:      'white',
                  borderLeft: '2px solid #7B2FBE',
                } : { color: 'rgba(255,255,255,0.45)' }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLAnchorElement).style.color = 'white' } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)' } }}
              >
                <Icon className="w-4 h-4 shrink-0" style={active ? { color: '#C4A8FF' } : {}} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Admin info + logout */}
        <div
          className="px-3 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="px-3 py-2 mb-1">
            <p className="text-white text-xs font-semibold">Superadmin</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {admin?.email || 'admin@studio42.ai'}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm transition-all"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = '#FCA5A5' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)' }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="flex-1 ml-56 overflow-y-auto p-6"
        style={{ background: '#080A12' }}
      >
        {children}
      </main>
    </div>
  )
}