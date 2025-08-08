import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppLayoutClient } from '@/components/AppLayoutClient'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Name My Company',
  description: 'Name My Company helps you generate memorable business names and matching domains with AI.',
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AppLayoutClient>
            {children}
          </AppLayoutClient>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
