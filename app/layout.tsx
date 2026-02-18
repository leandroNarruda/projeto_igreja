import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { QuizUIProvider } from '@/components/providers/QuizUIProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MainContent } from '@/components/layout/MainContent'
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bom de lição',
  description: 'Bom de lição - aplicativo',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bom de lição',
  },
  icons: {
    apple: [
      {
        url: '/images/logos/logo_152_opaque.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        url: '/images/logos/logo_192_opaque.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/images/logos/logo_512_opaque.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        url: '/images/logos/logo_1024_opaque.png',
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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SessionProvider>
          <QueryProvider>
            <QuizUIProvider>
              <Navbar />
              <MainContent>{children}</MainContent>
              <Footer />
              <PWAInstallPrompt />
            </QuizUIProvider>
          </QueryProvider>
        </SessionProvider>
        <Script src="/sw-register.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
