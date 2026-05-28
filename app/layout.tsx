import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { QuizUIProvider } from '@/components/providers/QuizUIProvider'
import { Navbar } from '@/components/layout/Navbar'
import { SideDrawer } from '@/components/layout/SideDrawer'
import { Footer } from '@/components/layout/Footer'
import { MainContent } from '@/components/layout/MainContent'
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt'

const inter = Inter({ subsets: ['latin'] })
const appUrl = new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: appUrl,
  title: 'Bom de lição',
  description: 'Bom de lição - aplicativo',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bom de lição',
  },
  icons: {
    icon: [
      {
        url: '/images/logos/logo-bom-de-licao-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/images/logos/logo-bom-de-licao-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/images/logos/logo-bom-de-licao-152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        url: '/images/logos/logo-bom-de-licao-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/images/logos/logo-bom-de-licao-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        url: '/images/logos/logo-bom-de-licao-1024.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    title: 'Bom de lição',
    description: 'Bom de lição - aplicativo',
    url: appUrl,
    siteName: 'Bom de lição',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/images/social/bom-de-licao-share.png',
        width: 1200,
        height: 630,
        alt: 'Bom de lição',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bom de lição',
    description: 'Bom de lição - aplicativo',
    images: ['/images/social/bom-de-licao-share.png'],
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
  themeColor: '#120a14',
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
              <SideDrawer />
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
