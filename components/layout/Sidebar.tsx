'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Code2 } from 'lucide-react'
import { FolderOpen } from 'lucide-react'

import {
  ImageIcon,
  Video,
  Globe,
  LayoutDashboard,
  CreditCard,
  History,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href:  '/dashboard',
    icon:  LayoutDashboard,
    exact: true,
  },
  {
    label: 'Image',
    href:  '/dashboard/image',
    icon:  ImageIcon,
  },
  {
    label: 'Video',
    href:  '/dashboard/video',
    icon:  Video,
  },
  {
    label: 'Website',
    href:  '/dashboard/website',
    icon:  Globe,
  },
  // Add to NAV_ITEMS array
{
  label: 'AI Builder',
  href:  '/dashboard/builder',
  icon:  Code2,
},
]

const BOTTOM_ITEMS = [
  {
    label: 'Credits',
    href:  '/dashboard/credits',
    icon:  CreditCard,
  },
  {
    label: 'History',
    href:  '/dashboard/history',
    icon:  History,
  },
  {
    label: 'Settings',
    href:  '/dashboard/settings',
    icon:  Settings,
  },
  {
    label: 'Projects',
    href:  '/dashboard/projects',
    icon:  FolderOpen,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[#0f0f0f] flex flex-col z-50">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#2a2a2a]">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">CM</span>
        </div>
        <span className="text-white font-semibold text-sm">
          CraftMaster
        </span>
      </div>

      {/* Credits badge */}
      <div className="px-3 py-3 border-b border-[#2a2a2a]">
        <Link
          href="/dashboard/credits"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all"
        >
          <Zap className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" />
          <span className="text-indigo-300 text-xs font-medium">
            {user?.creditsBalance ?? 0} credits
          </span>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[#3a3a3a] text-[10px] font-semibold uppercase tracking-wider px-3 mb-2">
          Tools
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon   = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                active
                  ? 'bg-[#1f1f1f] text-white border-l-2 border-indigo-500'
                  : 'text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white'
              )}
            >
              <Icon className={cn(
                'w-4 h-4 shrink-0',
                active ? 'text-indigo-400' : ''
              )} />
              {item.label}
            </Link>
          )
        })}

        <div className="pt-4">
          <p className="text-[#3a3a3a] text-[10px] font-semibold uppercase tracking-wider px-3 mb-2">
            Account
          </p>
          {BOTTOM_ITEMS.map((item) => {
            const Icon   = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                  active
                    ? 'bg-[#1f1f1f] text-white border-l-2 border-indigo-500'
                    : 'text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white'
                )}
              >
                <Icon className={cn(
                  'w-4 h-4 shrink-0',
                  active ? 'text-indigo-400' : ''
                )} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-2 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {user?.name}
            </p>
            <p className="text-[#a1a1aa] text-[10px] truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}