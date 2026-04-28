import type { Metadata } from 'next'
import QueryProvider from '@/components/providers/QueryProvider'
import './globals.css'

export const metadata: Metadata = {
  title:       'Studio42 — Everything you imagine. Built by AI.',
  description: 'Generate images, videos, websites and complete codebases with AI. Pay as you go. Credits never expire.',
  icons: {
    icon:    '/logo.png',
    apple:   '/logo.png',
    shortcut:'/logo.png',
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>

<head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
       
      <body suppressHydrationWarning>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}