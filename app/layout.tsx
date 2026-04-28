import type { Metadata } from 'next'
import QueryProvider from '@/components/providers/QueryProvider'
import './globals.css'

export const metadata: Metadata = {
  title:       'Studio42 — Everything you imagine. Built by AI.',
  description: 'Generate images, videos, websites and complete codebases with AI. Pay as you go. Credits never expire.',
  icons: {
    icon: [
      { url: '/logo.png',       type: 'image/png' },
      { url: '/favicon.ico',    type: 'image/x-icon' },
    ],
    apple:   '/apple-icon.png',
    shortcut: '/logo.png',
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
       <head>
        <link rel="icon"       href="/logo.png" type="image/png" />
        <link rel="icon"       href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}