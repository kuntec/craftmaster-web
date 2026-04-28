import Sidebar from '@/components/layout/Sidebar'
import Topbar  from '@/components/layout/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0D0F1A' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col ml-56 min-h-screen overflow-hidden">
        <Topbar />
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: '#0D0F1A' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}