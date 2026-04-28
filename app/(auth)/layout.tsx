import Logo from '@/components/ui/Logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#0D0F1A' }}
    >
      {/* Background glow — matches landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(123,47,190,0.15) 0%, rgba(79,142,247,0.08) 50%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'rgba(0,194,255,0.04)' }}
        />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size={56} />
          <p className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Everything you imagine. Built by AI.
          </p>
        </div>

        {children}
      </div>
    </div>
  )
}