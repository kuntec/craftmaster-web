export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500 mb-4">
              <span className="text-white font-bold text-lg">CM</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CraftMaster</h1>
            <p className="text-gray-500 text-sm mt-1">
              AI tools without the subscription
            </p>
          </div>
          {children}
        </div>
      </div>
    )
  }