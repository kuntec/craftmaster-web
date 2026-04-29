'use client'

export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'

import Sidebar from '@/components/layout/Sidebar'
import Topbar  from '@/components/layout/Topbar'



export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  },[])
  if (!mounted) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ background: '#0D0F1A' }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#7B2FBE', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col ml-56 min-h-screen overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}