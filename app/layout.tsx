export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import QueryProvider from '@/components/providers/QueryProvider'
import './globals.css'
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title:       'Studio42 — Everything you imagine. Built by AI.',
  description: 'Generate images, videos, websites and complete codebases with AI. Pay as you go. Credits never expire.',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}