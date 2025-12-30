import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Projeto Igreja',
  description: 'Sistema de autenticação para projeto igreja',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Projeto Igreja',
  },
  icons: {
    apple: [
      {
        url: '/images/logos/logo_152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        url: '/images/logos/logo_192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/images/logos/logo_512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        url: '/images/logos/logo_1024.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SessionProvider>
          <QueryProvider>
            <Navbar />
            <main className="pb-0">{children}</main>
            <Footer />
          </QueryProvider>
        </SessionProvider>
        <Script src="/sw-register.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
