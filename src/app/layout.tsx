import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import AuthSessionProvider from '@/providers/session-provider'
import QueryProvider from '@/providers/QueryProvider'
import { Toaster } from 'sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Bargeldsucher — Operational Cash Engine',
  description:
    'Streamline running errand budgets, track distributed fluid funding, and monitor operational cash outflow.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 min-h-screen`}
      >
        <AuthSessionProvider>
          <QueryProvider>
            {children}
            <Toaster richColors position='bottom-right' />
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
