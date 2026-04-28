export const dynamic = 'force-dynamic'

import Sidebar from '@/components/layout/Sidebar'
import Topbar  from '@/components/layout/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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