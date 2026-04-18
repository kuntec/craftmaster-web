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
}

export default function Topbar() {
  const pathname = usePathname()
  const user     = useAuthStore((s) => s.user)
  const title    = PAGE_TITLES[pathname] ?? 'Dashboard'

  const low = (user?.creditsBalance ?? 0) < 20

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      {/* Page title */}
      <h1 className="text-sm font-semibold text-gray-900">
        {title}
      </h1>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Low credits warning */}
        {low && (
          <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
            Low credits
          </span>
        )}

        {/* Credits button */}
        <Link
          href="/dashboard/credits"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-all"
        >
          <Zap className="w-3.5 h-3.5 text-indigo-500" fill="currentColor" />
          <span className="text-indigo-700 text-xs font-semibold">
            {user?.creditsBalance ?? 0} credits
          </span>
        </Link>
      </div>
    </header>
  )
}