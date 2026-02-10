import React from "react"
import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'

import './globals.css'

const _quicksand = Quicksand({ subsets: ['latin'], variable: '--font-quicksand' })

export const metadata: Metadata = {
  title: 'Be My Valentine?',
  description: 'A cute interactive Valentine\'s Day proposal',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
